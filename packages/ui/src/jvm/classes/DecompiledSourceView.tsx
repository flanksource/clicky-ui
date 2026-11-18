import { Callout } from "../../data/Callout";
import { hasLineMap } from "../model/source-lines";
import type { LineRange } from "../model/class-fold";
import { DecompiledSourceReader } from "./DecompiledSourceReader";
import { SourceEditor } from "./SourceEditor";
import type { SourceMarker } from "./source-markers";

export type DecompiledSourceViewProps = {
  /** Fully qualified class name; names the editor's model. */
  qualifiedName: string;
  /** The decompiled text. */
  source: string;
  /** Original bytecode line per row (index = row), 0 where unmapped. */
  sourceLineNumbers: number[];
  mode: "read" | "edit";
  /** Edit mode: the text being edited. */
  draft?: string | undefined;
  onDraftChange?: ((draft: string) => void) | undefined;
  /** Read mode: fold the class down to these 1-based lines. */
  focusRange: LineRange | null;
  /** Read mode: 0-based row to highlight and scroll to, -1 for none. */
  highlightRow: number;
  /** Edit mode: compiler diagnostics for the current draft. */
  markers: SourceMarker[];
  /** Edit mode: scroll to and focus a row; pass a new object to repeat the same row. */
  reveal?: { row: number } | undefined;
  /** Read mode: receives the clicked 0-based row. */
  onSelectRow?: ((row: number) => void) | undefined;
  /** Shown above the source, e.g. a decompiler warning. */
  warning?: string | undefined;
  /** Height of the editor in edit mode. Default "60vh". */
  editorHeight?: string | number | undefined;
};

const EDITING_WARNING =
  "Editing decompiled source. A redefinition may change method bodies only — adding or removing a method or field, or changing a signature, is refused by the JVM. Compile a preview first to see what javac makes of it.";
const UNMAPPED_WARNING = "The decompiler supplied no source-line markers, so the gutter shows row numbers, not bytecode line numbers.";

/**
 * One decompiled class. Reading shows the original bytecode line numbers and can
 * fold to a method; editing swaps in the (lazily loaded) Monaco editor with
 * plain row numbers, because once the text changes the decompiler's mapping no
 * longer describes it.
 */
export function DecompiledSourceView({
  qualifiedName,
  source,
  sourceLineNumbers,
  mode,
  draft,
  onDraftChange,
  focusRange,
  highlightRow,
  markers,
  reveal,
  onSelectRow,
  warning,
  editorHeight,
}: DecompiledSourceViewProps) {
  const editing = mode === "edit";
  if (editing && (draft === undefined || !onDraftChange)) throw new Error("DecompiledSourceView edit mode needs a draft and onDraftChange");
  const banner = editing ? EDITING_WARNING : (warning ?? (hasLineMap(sourceLineNumbers) ? undefined : UNMAPPED_WARNING));
  return (
    <div className="flex h-full min-h-0 flex-col">
      {banner ? (
        <Callout variant="warning" className="my-0 shrink-0 rounded-none">
          {banner}
        </Callout>
      ) : null}
      {editing ? (
        <SourceEditor
          value={draft ?? ""}
          onChange={onDraftChange!}
          path={`jvm-decompiled/${qualifiedName.replace(/[^A-Za-z0-9_.$-]/g, "_")}.java`}
          markers={markers}
          reveal={reveal}
          height={editorHeight}
        />
      ) : (
        <DecompiledSourceReader source={source} sourceLineNumbers={sourceLineNumbers} focusRange={focusRange} highlightRow={highlightRow} onSelectRow={onSelectRow} />
      )}
    </div>
  );
}
