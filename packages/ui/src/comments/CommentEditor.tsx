import { createContext, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createParagraphNode, $createTextNode, $getRoot, $getSelection, $isRangeSelection, $isTextNode, COMMAND_PRIORITY_HIGH, DecoratorNode, KEY_DOWN_COMMAND, PASTE_COMMAND, type LexicalNode, type NodeKey, type SerializedLexicalNode } from "lexical";
import { useFloating, flip, shift, offset, autoUpdate } from "@floating-ui/react";
import { useFloatingZIndex } from "../overlay/modalStack";
import { VocabularyChip } from "./VocabularyChip";
import { vocabularyChoices, vocabularyHref, vocabularyReferences, type CommentVocabulary, type CommentVocabularyItem, type VocabularyChoice } from "./comment-vocabulary";
import type { MentionTextareaProps } from "./MentionTextarea";

type Props = Omit<MentionTextareaProps, "rows"> & { vocabulary?: CommentVocabulary; disabled?: boolean; "aria-describedby"?: string };
type SerializedVocabulary = SerializedLexicalNode & { item: CommentVocabularyItem };

class VocabularyNode extends DecoratorNode<ReactNode> {
  __item: CommentVocabularyItem;
  static override getType() { return "comment-vocabulary"; }
  static override clone(node: VocabularyNode) { return new VocabularyNode(node.__item, node.__key); }
  constructor(item: CommentVocabularyItem, key?: NodeKey) { super(key); this.__item = item; }
  override createDOM() { return document.createElement("span"); }
  override exportDOM() {
    const element = document.createElement("a");
    element.href = vocabularyHref(this.__item);
    element.textContent = this.__item.label;
    return { element };
  }
  override updateDOM() { return false; }
  override isInline() { return true; }
  override getTextContent() { return `[${this.__item.label}](${vocabularyHref(this.__item)})`; }
  override exportJSON(): SerializedVocabulary { return { ...super.exportJSON(), item: this.__item }; }
  static override importJSON(value: SerializedVocabulary) { return new VocabularyNode(value.item); }
  override decorate() { return <VocabularyNodeView item={this.__item} />; }
}

const VocabularyContext = createContext<CommentVocabulary | undefined>(undefined);
function VocabularyNodeView({ item }: { item: CommentVocabularyItem }) {
  const vocabulary = useContext(VocabularyContext);
  return <VocabularyChip item={item} {...(vocabulary ? { vocabulary } : {})} />;
}

function bodyNodes(body: string, vocabulary?: CommentVocabulary): LexicalNode[] {
  if (!vocabulary) return [$createTextNode(body)];
  const nodes: LexicalNode[] = [];
  const selected = vocabularyReferences(body, vocabulary?.items ?? []);
  let last = 0;
  const prose = body.replace(/```[\s\S]*?(?:```|$)|`[^`\n]*`/g, code => " ".repeat(code.length));
  for (const match of prose.matchAll(/\[[^\]\n]+\]\((\/\?vocabulary=[^)\s]+)\)/g)) {
    const item = selected.find(entry => vocabularyHref(entry) === match[1]);
    if (!item) continue;
    nodes.push($createTextNode(body.slice(last, match.index)), new VocabularyNode(item));
    last = match.index + match[0].length;
  }
  nodes.push($createTextNode(body.slice(last)));
  return nodes;
}
function importBody(body: string, vocabulary?: CommentVocabulary) {
  $getRoot().clear().append($createParagraphNode().append(...bodyNodes(body, vocabulary)));
}

function EditorBehavior(props: Props) {
  const [editor] = useLexicalComposerContext();
  const lastValue = useRef(props.value);
  // The highlighted result belongs to its query: a new query starts at the first result.
  const [menu, setMenu] = useState<{ query: string | null; activeIndex: number }>({ query: null, activeIndex: 0 });
  const { query, activeIndex } = menu;
  const setQuery = (next: string | null) => setMenu(previous => (previous.query === next ? previous : { query: next, activeIndex: 0 }));
  const setActiveIndex = (index: number) => setMenu(previous => ({ ...previous, activeIndex: index }));
  const listId = useId();
  const floatingZ = useFloatingZIndex();
  const { refs, floatingStyles } = useFloating({ strategy: "fixed", middleware: [offset(6), flip(), shift({ padding: 8 })], whileElementsMounted: autoUpdate });
  const vocabularyItems = props.vocabulary?.items;
  const { choices, results } = useMemo(() => {
    const choices: VocabularyChoice[] = query === null ? [] : vocabularyChoices(vocabularyItems ?? [], query);
    const people = query === null || query.includes("/") ? [] : props.mentionables.filter(person => person.name.toLowerCase().includes(query.toLowerCase()));
    return { choices, results: [...choices, ...people.map(person => ({ label: `@${person.name}`, person }))] };
  }, [query, vocabularyItems, props.mentionables]);
  const open = query !== null;

  useEffect(() => {
    editor.setEditable(!props.disabled);
  }, [editor, props.disabled]);
  useEffect(() => {
    if (props.value === lastValue.current) return;
    lastValue.current = props.value;
    editor.update(() => importBody(props.value, props.vocabulary));
  }, [editor, props.value, props.vocabulary]);
  useEffect(() => {
    if (!props.autoFocus) return;
    const frame = requestAnimationFrame(() => {
      editor.update(() => $getRoot().selectEnd());
      editor.getRootElement()?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [editor, props.autoFocus]);
  useEffect(() => editor.registerCommand(PASTE_COMMAND, event => {
    if (!(event instanceof ClipboardEvent)) return false;
    const body = event.clipboardData?.getData("text/plain");
    if (!body?.includes("/?vocabulary=")) return false;
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return false;
    selection.insertNodes(bodyNodes(body, props.vocabulary));
    event.preventDefault();
    return true;
  }, COMMAND_PRIORITY_HIGH), [editor, props.vocabulary]);
  useEffect(() => {
    const close = () => setQuery(null);
    const unregister = editor.registerRootListener((root, previous) => {
      previous?.removeEventListener("blur", close);
      root?.addEventListener("blur", close);
    });
    return () => { editor.getRootElement()?.removeEventListener("blur", close); unregister(); };
  }, [editor]);
  useEffect(() => editor.registerUpdateListener(({ editorState }) => {
    editorState.read(() => {
      const value = $getRoot().getTextContent();
      if (value !== lastValue.current) { lastValue.current = value; props.onChange(value); }
      const selection = $getSelection();
      const node = $isRangeSelection(selection) && selection.isCollapsed() ? selection.anchor.getNode() : null;
      const match = $isTextNode(node) && $isRangeSelection(selection) ? node.getTextContent().slice(0, selection.anchor.offset).match(/(?:^|\s)@([\w./-]*)$/) : null;
      const next = match?.[1] ?? null;
      setQuery(next);
      const range = window.getSelection();
      if (next !== null && range?.rangeCount && range.getRangeAt(0).getBoundingClientRect) {
        const rect = range.getRangeAt(0).getBoundingClientRect();
        refs.setPositionReference({ getBoundingClientRect: () => rect });
      }
    });
  }), [editor, props.onChange, refs]);

  function choose(index: number) {
    const choice = results[index];
    if (!choice || query === null) return;
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      const node = selection.anchor.getNode();
      if (!$isTextNode(node)) return;
      const end = selection.anchor.offset;
      const insertion = node.select(end - query.length - 1, end);
      if ("person" in choice) {
        insertion.insertText(`@${choice.person.name} `);
        props.onMentionSelect?.(choice.person);
      } else if (choice.item) {
        insertion.insertNodes([new VocabularyNode(choice.item), $createTextNode(" ")]);
      } else {
        insertion.insertText(`@${choice.query}`);
      }
    });
  }
  useEffect(() => editor.registerCommand(KEY_DOWN_COMMAND, event => {
    if (event.isComposing) return false;
    if (open) {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); setQuery(null); return true; }
      if (["ArrowUp", "ArrowDown", "Enter", "Tab"].includes(event.key)) {
        event.preventDefault(); event.stopPropagation();
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          const step = event.key === "ArrowDown" ? 1 : -1;
          setMenu(previous => ({ ...previous, activeIndex: (previous.activeIndex + step + results.length) % Math.max(1, results.length) }));
        }
        else choose(activeIndex);
        return true;
      }
    }
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); props.onSubmit?.(); return true; }
    if (event.key === "Escape") { event.preventDefault(); props.onCancel?.(); return true; }
    return false;
  }, COMMAND_PRIORITY_HIGH), [editor, open, activeIndex, query, results, props.onSubmit, props.onCancel]);
  useEffect(() => {
    const root = editor.getRootElement();
    root?.setAttribute("aria-expanded", String(open));
    if (open) root?.setAttribute("aria-controls", listId);
    else root?.removeAttribute("aria-controls");
    if (open && results.length) root?.setAttribute("aria-activedescendant", `${listId}-${activeIndex}`);
    else root?.removeAttribute("aria-activedescendant");
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView?.({ block: "nearest" });
  }, [editor, open, activeIndex, listId, results.length]);
  const selected = choices[activeIndex]?.item;
  return open && createPortal(<div ref={refs.setFloating} style={{ ...floatingStyles, zIndex: floatingZ }} className="flex max-h-80 w-[min(36rem,calc(100vw-1rem))] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg" onMouseDown={event => event.preventDefault()}>
    <div role="listbox" aria-label="Vocabulary and mentions" id={listId} className="min-w-0 flex-1 overflow-auto p-1">
      {results.length === 0 && <p role="status" className="p-2 text-xs">No matching items</p>}
      {results.map((choice, index) => <button key={`${choice.label}-${index}`} id={`${listId}-${index}`} role="option" aria-selected={index === activeIndex} type="button" onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(index)} className={`block w-full rounded px-2 py-1.5 text-left text-xs ${index === activeIndex ? "bg-accent text-accent-foreground" : ""}`}>{choice.label}</button>)}
    </div>
    {selected && <div className="w-1/2 overflow-auto border-l border-border p-3 text-xs"><div className="overflow-hidden">{props.vocabulary?.renderPreview(selected)}</div><p className="mt-2">{selected.description}</p></div>}
  </div>, document.body);
}

export function CommentEditor(props: Props) {
  return <VocabularyContext.Provider value={props.vocabulary}><LexicalComposer initialConfig={{ namespace: "comment", nodes: [VocabularyNode], onError: (error: Error) => { throw error; }, editorState: () => importBody(props.value, props.vocabulary) }}>
    <div className="relative"><PlainTextPlugin contentEditable={<ContentEditable role="textbox" aria-label={props.placeholder ?? "Comment"} aria-describedby={props["aria-describedby"]} aria-multiline data-testid={props["data-testid"]} className={`w-full whitespace-pre-wrap bg-transparent text-sm outline-none [@media(pointer:coarse)]:text-base ${props.className ?? ""}`} />} placeholder={<span className="pointer-events-none absolute left-0 top-0 text-sm text-placeholder">{props.placeholder}</span>} ErrorBoundary={LexicalErrorBoundary} /></div>
    <HistoryPlugin /><EditorBehavior {...props} />
  </LexicalComposer></VocabularyContext.Provider>;
}
