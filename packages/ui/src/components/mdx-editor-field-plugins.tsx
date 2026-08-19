import { createElement } from "react";
import { calloutJsxDescriptor } from "./mdx-editor-callout";
import type {
  MdxEditorCodeBlockEditorDescriptor,
  MdxEditorDiffModeOptions,
  MdxEditorJsxComponentDescriptor,
  MdxEditorPluginOptions,
} from "./mdx-editor-options";
import { MdxEditorToolbar } from "./MdxEditorToolbar";

type MdxEditorModule = typeof import("@mdxeditor/editor");
type RealmPlugin = ReturnType<MdxEditorModule["headingsPlugin"]>;

const DEFAULT_CODE_BLOCK_LANGUAGES: Record<string, string> = {
  bash: "Bash",
  css: "CSS",
  go: "Go",
  html: "HTML",
  javascript: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  jsx: "JSX",
  markdown: "Markdown",
  python: "Python",
  shell: "Shell",
  sql: "SQL",
  ts: "TypeScript",
  tsx: "TSX",
  typescript: "TypeScript",
  yaml: "YAML",
};

function isEnabled<T extends object>(value: boolean | T | undefined, defaultValue = true): boolean {
  return value === undefined ? defaultValue : value !== false;
}

function optionObject<T extends object>(value: boolean | T | undefined): T | undefined {
  return typeof value === "object" && value !== null ? value : undefined;
}

function diffModeOptions(diffMode: MdxEditorPluginOptions["diffMode"]): MdxEditorDiffModeOptions | undefined {
  if (!diffMode) return undefined;
  if (diffMode === true) return {};
  if (typeof diffMode === "string") return { viewMode: diffMode };
  return diffMode;
}

function createToolbar(mdx: MdxEditorModule, options: MdxEditorPluginOptions) {
  return () => createElement(MdxEditorToolbar, { mdx, options });
}

function codeBlockEditorDescriptors(
  mdx: MdxEditorModule,
  descriptors: readonly MdxEditorCodeBlockEditorDescriptor[] | undefined,
) {
  if (!descriptors?.length) return undefined;

  return descriptors.map((descriptor) => ({
    priority: descriptor.priority,
    match: descriptor.match,
    Editor: (props: {
      code: string;
      language: string;
      meta: string;
      nodeKey: string;
      focusEmitter: {
        subscribe: (callback: () => void) => void;
      };
    }) => {
      const context = mdx.useCodeBlockEditorContext();
      return createElement(descriptor.Editor, {
        ...props,
        context: {
          setCode: context.setCode,
          setLanguage: context.setLanguage,
          setMeta: context.setMeta,
        },
      });
    },
  }));
}

/**
 * The registered JSX blocks: the built-in callout when `callouts` is on, plus
 * whatever the consumer registers. They share one `jsxPlugin` because MDXEditor
 * keeps a single descriptor list — a second call would replace the first.
 */
function jsxComponentDescriptors(mdx: MdxEditorModule, options: MdxEditorPluginOptions) {
  const descriptors: MdxEditorJsxComponentDescriptor[] = [];
  if (isEnabled(options.callouts, false)) {
    descriptors.push(calloutJsxDescriptor(mdx, optionObject(options.callouts) ?? {}));
  }
  if (options.jsxComponents?.length) descriptors.push(...options.jsxComponents);
  return descriptors;
}

export function createMdxEditorPlugins(
  mdx: MdxEditorModule,
  options: MdxEditorPluginOptions = {},
): RealmPlugin[] {
  const plugins: RealmPlugin[] = [];
  if (isEnabled(options.toolbar)) {
    const toolbar = optionObject(options.toolbar);
    plugins.push(
      mdx.toolbarPlugin({
        toolbarContents: createToolbar(mdx, options),
        ...(toolbar?.className ? { toolbarClassName: toolbar.className } : {}),
        ...(toolbar?.position ? { toolbarPosition: toolbar.position } : {}),
      }),
    );
  }
  if (isEnabled(options.headings)) {
    const headings = optionObject(options.headings);
    plugins.push(mdx.headingsPlugin(headings));
  }
  if (isEnabled(options.lists)) plugins.push(mdx.listsPlugin());
  if (isEnabled(options.quote)) plugins.push(mdx.quotePlugin());
  if (isEnabled(options.links)) {
    const links = optionObject(options.links);
    plugins.push(
      mdx.linkPlugin(links?.disableAutoLink !== undefined ? { disableAutoLink: links.disableAutoLink } : undefined),
      mdx.linkDialogPlugin({
        ...(links?.linkAutocompleteSuggestions ? { linkAutocompleteSuggestions: links.linkAutocompleteSuggestions } : {}),
        ...(links?.showLinkTitleField !== undefined ? { showLinkTitleField: links.showLinkTitleField } : {}),
      }),
    );
  }
  if (isEnabled(options.tables)) plugins.push(mdx.tablePlugin());
  if (isEnabled(options.thematicBreak)) plugins.push(mdx.thematicBreakPlugin());
  if (isEnabled(options.codeBlocks)) {
    const codeBlocks = optionObject(options.codeBlocks);
    const codeBlockPluginOptions: Parameters<MdxEditorModule["codeBlockPlugin"]>[0] = {
      defaultCodeBlockLanguage: codeBlocks?.defaultLanguage ?? "txt",
    };
    const descriptors = codeBlockEditorDescriptors(
      mdx,
      codeBlocks?.editorDescriptors,
    );
    if (descriptors) {
      codeBlockPluginOptions.codeBlockEditorDescriptors = descriptors;
    }
    plugins.push(mdx.codeBlockPlugin(codeBlockPluginOptions));
    if (isEnabled(options.codeMirror)) {
      const codeMirror = optionObject(options.codeMirror);
      plugins.push(
        mdx.codeMirrorPlugin({
          codeBlockLanguages: codeMirror?.languages ?? DEFAULT_CODE_BLOCK_LANGUAGES,
          ...(codeMirror?.autoLoadLanguageSupport !== undefined
            ? { autoLoadLanguageSupport: codeMirror.autoLoadLanguageSupport }
            : {}),
        }),
      );
    }
  }
  const jsxDescriptors = jsxComponentDescriptors(mdx, options);
  if (jsxDescriptors.length) {
    plugins.push(mdx.jsxPlugin({ jsxComponentDescriptors: jsxDescriptors as never }));
  }
  if (isEnabled(options.frontmatter)) plugins.push(mdx.frontmatterPlugin());
  if (isEnabled(options.admonitions)) {
    const admonitions = optionObject(options.admonitions);
    plugins.push(
      mdx.directivesPlugin({
        directiveDescriptors: [mdx.AdmonitionDirectiveDescriptor],
        escapeUnknownTextDirectives: admonitions?.escapeUnknownTextDirectives ?? true,
      }),
    );
  }
  if (isEnabled(options.images)) {
    const images = optionObject(options.images);
    plugins.push(
      mdx.imagePlugin({
        ...(images?.imageUploadHandler ? { imageUploadHandler: images.imageUploadHandler } : {}),
        ...(images?.imageAutocompleteSuggestions ? { imageAutocompleteSuggestions: images.imageAutocompleteSuggestions } : {}),
        ...(images?.imagePreviewHandler ? { imagePreviewHandler: images.imagePreviewHandler } : {}),
        ...(images?.disableImageResize !== undefined ? { disableImageResize: images.disableImageResize } : {}),
        ...(images?.disableImageSettingsButton !== undefined
          ? { disableImageSettingsButton: images.disableImageSettingsButton }
          : {}),
        ...(images?.allowSetImageDimensions !== undefined ? { allowSetImageDimensions: images.allowSetImageDimensions } : {}),
      }),
    );
  }
  if (options.diffMode) {
    const diff = diffModeOptions(options.diffMode);
    plugins.push(
      mdx.diffSourcePlugin({
        ...(diff?.viewMode ? { viewMode: diff.viewMode } : {}),
        ...(diff?.diffMarkdown !== undefined ? { diffMarkdown: diff.diffMarkdown } : {}),
        ...(diff?.readOnlyDiff !== undefined ? { readOnlyDiff: diff.readOnlyDiff } : {}),
      }),
    );
  }
  if (isEnabled(options.markdownShortcuts)) plugins.push(mdx.markdownShortcutPlugin());
  if (options.plugins?.length) plugins.push(...(options.plugins as RealmPlugin[]));
  return plugins;
}
