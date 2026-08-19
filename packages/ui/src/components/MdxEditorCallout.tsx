import type { ComponentType, ReactNode } from "react";
import { Callout } from "../data/Callout";
import type { CalloutTone, CalloutVariant } from "../data/callout-tones";
import { UiSpeaker } from "../icons";
import { cn } from "../lib/utils";
import {
  CALLOUT_ATTRIBUTE_OPTIONS,
  CALLOUT_ATTRIBUTES,
  readCalloutAttributes,
  type CalloutAttribute,
} from "./mdx-editor-callout-model";
import { writeJsxAttribute } from "./mdx-editor-jsx-attributes";
import type {
  MdxEditorInsertJsx,
  MdxEditorJsxAttribute,
  MdxEditorJsxNode,
  MdxEditorRuntime,
} from "./mdx-editor-options";

/**
 * `NestedLexicalEditor` narrowed to what a callout body needs. The library types
 * it over the full mdast `RootContent` union; a callout only ever hands its own
 * children straight back, so the narrower shape says the same thing without
 * pulling mdast types into this entry point.
 */
type NestedEditor = ComponentType<{
  block?: boolean;
  getContent: (node: MdxEditorJsxNode) => unknown[];
  getUpdatedMdastNode: (node: MdxEditorJsxNode, children: unknown[]) => MdxEditorJsxNode;
}>;

// The five members `MdxEditorRuntime` declares, at the types this file uses
// them. They are cast rather than declared on the interface so a consumer's own
// @mdxeditor/editor install stays assignable — see MdxEditorRuntime.
type NodeUpdater = () => (node: { attributes?: MdxEditorJsxAttribute[] }) => void;
type JsxInserter = (signal: unknown) => (value: MdxEditorInsertJsx) => void;
type TooltipButton = ComponentType<{ title: string; onClick: () => void; children?: ReactNode }>;

const SELECT_CLASS =
  "h-6 rounded border border-border bg-background px-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring";
const INPUT_CLASS = cn(SELECT_CLASS, "w-24 placeholder:text-placeholder");
// The title is a sentence, not a token, so it gets room the other text fields do not.
const WIDE_INPUT_CLASS = cn(SELECT_CLASS, "w-56 placeholder:text-placeholder");

/** `variant` and `icon` are enumerations, `emphasis` is a flag, the rest are free text. */
function AttributeControl({
  attribute,
  value,
  onChange,
}: {
  attribute: CalloutAttribute;
  value: string;
  onChange: (next: string) => void;
}) {
  if (attribute === "emphasis") {
    return (
      <label className="flex items-center gap-1 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={value !== "" && value !== "false"}
          onChange={(event) => onChange(event.target.checked ? "true" : "")}
        />
        emphasis
      </label>
    );
  }

  const options = CALLOUT_ATTRIBUTE_OPTIONS[attribute];
  return (
    <label className="flex items-center gap-1 text-xs text-muted-foreground">
      {attribute}
      {options ? (
        <select className={SELECT_CLASS} value={value} onChange={(event) => onChange(event.target.value)}>
          <option value="">—</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={attribute === "title" ? WIDE_INPUT_CLASS : INPUT_CLASS}
          value={value}
          placeholder="—"
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

/**
 * The callout as the author sees it while editing: the rendered box, with the
 * attributes that decide its tone on a control strip above it.
 *
 * MDXEditor's `GenericJsxEditor` draws a bare form of text inputs instead, so
 * the author cannot see which of the six variants they picked and a tone typo
 * only surfaces at render time. Drawing the real `Callout` around the nested
 * editor is the reason to register a descriptor of our own.
 *
 * `useLexicalComposerContext` must not be called anywhere under here — MDXEditor
 * mounts node editors under its own composer and that hook throws. The nested
 * editor primitive and the mdast updater are the supported access points.
 *
 * The MDXEditor module arrives as a prop because it is an optional peer
 * dependency; `calloutJsxDescriptor` binds it before handing the descriptor over.
 */
export function CalloutJsxEditor({
  mdx,
  mdastNode,
}: {
  mdx: MdxEditorRuntime;
  mdastNode: MdxEditorJsxNode;
}) {
  const NestedLexicalEditor = mdx.NestedLexicalEditor as NestedEditor;
  const updateNode = (mdx.useMdastNodeUpdater as NodeUpdater)();
  const attributes = readCalloutAttributes(mdastNode.attributes);
  const setAttribute = (attribute: CalloutAttribute) => (next: string) => {
    updateNode({ attributes: writeJsxAttribute(mdastNode.attributes, attribute, next) });
  };

  return (
    <div className="my-2" data-callout-editor={attributes.variant ?? "default"}>
      <div className="mb-1 flex flex-wrap items-center gap-3 rounded-t border border-border bg-muted/40 px-2 py-1">
        {CALLOUT_ATTRIBUTES.map((attribute) => (
          <AttributeControl
            key={attribute}
            attribute={attribute}
            value={attributes[attribute] ?? ""}
            onChange={setAttribute(attribute)}
          />
        ))}
      </div>
      <Callout
        badge={attributes.badge}
        emphasis={attributes.emphasis}
        icon={attributes.icon as CalloutTone | undefined}
        label={attributes.label}
        source={attributes.source}
        title={attributes.title}
        variant={(attributes.variant as CalloutVariant | undefined) ?? "default"}
      >
        <NestedLexicalEditor
          block
          getContent={(node) => node.children ?? []}
          getUpdatedMdastNode={(node, children) => ({ ...node, children })}
        />
      </Callout>
    </div>
  );
}

/** A toolbar button inserting an empty note callout at the cursor. */
export function InsertCalloutButton({ mdx, name }: { mdx: MdxEditorRuntime; name: string }) {
  const ButtonWithTooltip = mdx.ButtonWithTooltip as TooltipButton;
  const insertJsx = (mdx.usePublisher as JsxInserter)(mdx.insertJsx$);
  return (
    <ButtonWithTooltip
      title="Insert callout"
      onClick={() =>
        insertJsx({
          name,
          kind: "flow",
          props: { variant: "note" },
          children: [{ type: "paragraph", children: [] }],
        })
      }
    >
      <UiSpeaker size="1em" />
    </ButtonWithTooltip>
  );
}
