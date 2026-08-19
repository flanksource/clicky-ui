import type { ConditionalContentsOption, EditorInFocus, FallbackOption, ViewMode } from "@mdxeditor/editor";
import { calloutToolbarButton } from "./mdx-editor-callout";
import type { MdxEditorPluginOptions } from "./mdx-editor-options";

type MdxEditorModule = typeof import("@mdxeditor/editor");

function isEnabled<T extends object>(value: boolean | T | undefined, defaultValue = true): boolean {
  return value === undefined ? defaultValue : value !== false;
}

function optionObject<T extends object>(value: boolean | T | undefined): T | undefined {
  return typeof value === "object" && value !== null ? value : undefined;
}

function diffViewOptions(diffMode: MdxEditorPluginOptions["diffMode"]): ViewMode[] | undefined {
  if (!diffMode) return undefined;
  if (typeof diffMode === "object" && diffMode.viewModes?.length) {
    return [...diffMode.viewModes];
  }
  return ["rich-text", "source", "diff"];
}

export function MdxEditorToolbar({
  mdx,
  options,
}: {
  mdx: MdxEditorModule;
  options: MdxEditorPluginOptions;
}) {
  const { ConditionalContents, ChangeCodeMirrorLanguage } = mdx;
  const toolbarOptions: Array<ConditionalContentsOption | FallbackOption> = [
    ...(isEnabled(options.codeBlocks) && isEnabled(options.codeMirror)
      ? [
          {
            when: (editor: EditorInFocus | null) => editor?.editorType === "codeblock",
            contents: () => <ChangeCodeMirrorLanguage />,
          },
        ]
      : []),
    {
      fallback: () => <DefaultToolbarContents mdx={mdx} options={options} />,
    },
  ];
  return <ConditionalContents options={toolbarOptions} />;
}

function DefaultToolbarContents({
  mdx,
  options,
}: {
  mdx: MdxEditorModule;
  options: MdxEditorPluginOptions;
}) {
  const {
    BlockTypeSelect,
    BoldItalicUnderlineToggles,
    CodeToggle,
    CreateLink,
    DiffSourceToggleWrapper,
    InsertAdmonition,
    InsertCodeBlock,
    InsertFrontmatter,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    ListsToggle,
    Separator,
    UndoRedo,
  } = mdx;
  const InsertCallout = calloutToolbarButton(mdx, optionObject(options.callouts) ?? {});
  const extra = typeof options.toolbar === "object" ? options.toolbar.extra : undefined;
  const controls = (
    <>
      <UndoRedo />
      <Separator />
      <BoldItalicUnderlineToggles />
      <CodeToggle />
      {isEnabled(options.headings) && (
        <>
          <Separator />
          <BlockTypeSelect />
        </>
      )}
      {isEnabled(options.lists) && <ListsToggle />}
      {isEnabled(options.links) && (
        <>
          <Separator />
          <CreateLink />
        </>
      )}
      {isEnabled(options.images) && <InsertImage />}
      {(isEnabled(options.tables) || isEnabled(options.thematicBreak) || isEnabled(options.codeBlocks)) && <Separator />}
      {isEnabled(options.tables) && <InsertTable />}
      {isEnabled(options.thematicBreak) && <InsertThematicBreak />}
      {isEnabled(options.codeBlocks) && <InsertCodeBlock />}
      {(isEnabled(options.frontmatter) || isEnabled(options.admonitions) || isEnabled(options.callouts, false)) && (
        <Separator />
      )}
      {isEnabled(options.frontmatter) && <InsertFrontmatter />}
      {isEnabled(options.admonitions) && <InsertAdmonition />}
      {isEnabled(options.callouts, false) && <InsertCallout />}
      {extra}
    </>
  );

  const viewOptions = diffViewOptions(options.diffMode);
  if (!viewOptions) return controls;
  return <DiffSourceToggleWrapper options={viewOptions}>{controls}</DiffSourceToggleWrapper>;
}
