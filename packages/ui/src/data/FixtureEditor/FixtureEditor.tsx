import { lazy, Suspense, useMemo, useState } from "react";
import { Button } from "../../components/button";
import { MdxEditorField } from "../../components/MdxEditorField";
import type { MdxEditorCodeBlockEditorDescriptor } from "../../components/mdx-editor-options";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import { cn } from "../../lib/utils";
import {
  UiAdd,
  UiBug,
  UiFileCode,
  UiFileText,
  UiListDashes,
  UiRobotAi,
  UiTerminal,
  UiTest,
} from "../../icons";
import { Icon, type StaticIconComponent } from "../Icon";
import {
  createChecklistMarkdown,
  createFenceMarkdown,
  fixtureFenceKind,
  fixtureFenceSnippetInfo,
  schemaKeys,
  splitFixtureFenceInfo,
} from "./fixture-blocks";
import { fixtureCodeBlockMatches } from "./fixture-code-block-model";
import { FixtureFenceCodeBlockEditor } from "./FixtureFenceCodeBlockEditor";
import type {
  FixtureEditorProps,
  FixtureFenceOption,
  FixtureFenceSchemas,
  FixtureFrontmatterEditorOptions,
} from "./types";

// Loaded lazily because FixtureFrontmatterDialog embeds SpecRuntimeEditor,
// which in turn embeds FixtureEditor (VerifySection edits a verify fixture) —
// a static import here would close that cycle.
const LazyFixtureFrontmatterDialog = lazy(async () => {
  const mod = await import("./FixtureFrontmatterDialog");
  return { default: mod.FixtureFrontmatterDialog };
});

const FIXTURE_MDX_LANGUAGES: Record<string, string> = {
  ai: "AI",
  bash: "Bash",
  exec: "Exec",
  json: "JSON",
  lint: "YAML",
  markdown: "Markdown",
  prompt: "Prompt",
  shell: "Shell",
  sh: "Shell",
  test: "YAML",
  yaml: "YAML",
  yml: "YAML",
};

export function FixtureEditor({
  value,
  onChange,
  schemas = {},
  allowedFences,
  frontmatterEditor,
  readOnly = false,
  size = "md",
  placeholder = "Write fixture markdown...",
  className,
}: FixtureEditorProps) {
  const [frontmatterOpen, setFrontmatterOpen] = useState(false);
  const frontmatterOptions = normalizeFrontmatterOptions(frontmatterEditor);
  const fenceOptions = useMemo(
    () => normalizeFenceOptions(allowedFences, schemas),
    [allowedFences, schemas],
  );
  const fixtureCodeBlockDescriptor = useMemo(
    () =>
      createFixtureCodeBlockDescriptor({
        schemas,
        readOnly,
        size,
      }),
    [schemas, readOnly, size],
  );

  const appendMarkdown = (markdown: string) => {
    const prefix = value === "" || value.endsWith("\n") ? "" : "\n\n";
    onChange(`${value}${prefix}${markdown}`);
  };

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <FixtureEditorToolbar
        readOnly={readOnly}
        fenceOptions={fenceOptions}
        onEditFrontmatter={
          frontmatterOptions ? () => setFrontmatterOpen(true) : undefined
        }
        onAddFence={(info) => appendMarkdown(createFenceMarkdown(info, schemas))}
        onAddChecklist={() => appendMarkdown(createChecklistMarkdown())}
      />
      <MdxEditorField
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        size={size}
        placeholder={placeholder}
        aria-label="Fixture markdown"
        headings
        lists
        quote
        links
        tables
        thematicBreak
        codeBlocks={{
          defaultLanguage: "yaml",
          editorDescriptors: [fixtureCodeBlockDescriptor],
        }}
        codeMirror={{ languages: FIXTURE_MDX_LANGUAGES }}
        markdownShortcuts
        diffMode={{ viewMode: "rich-text", viewModes: ["rich-text", "source"] }}
        className="border-0 shadow-none"
        contentClassName="min-h-96 px-4 py-3"
        textareaClassName="min-h-96 rounded-none border-0 shadow-none"
      />
      {frontmatterOptions && (
        <Suspense fallback={null}>
          <LazyFixtureFrontmatterDialog
            open={frontmatterOpen}
            markdown={value}
            onChange={onChange}
            onClose={() => setFrontmatterOpen(false)}
            size={size}
            options={frontmatterOptions}
          />
        </Suspense>
      )}
    </div>
  );
}

type NormalizedFenceOption = {
  info: string;
  label: string;
  description?: string;
};

function FixtureEditorToolbar({
  readOnly,
  fenceOptions,
  onEditFrontmatter,
  onAddFence,
  onAddChecklist,
}: {
  readOnly: boolean;
  fenceOptions: readonly NormalizedFenceOption[];
  onEditFrontmatter?: (() => void) | undefined;
  onAddFence: (info: string) => void;
  onAddChecklist: () => void;
}) {
  if (readOnly) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu
        label="Add fence"
        icon={UiAdd}
        size="sm"
        variant="outline"
        menuLabel="Add fixture fence"
        items={fenceOptions.map((option) => ({
          label: option.label,
          icon: iconForFence(option.info),
          onSelect: () => onAddFence(option.info),
          ...(option.description ? { title: option.description } : {}),
        }))}
      />
      <Button type="button" variant="outline" size="sm" onClick={onAddChecklist}>
        <Icon icon={UiListDashes} />
        Add checklist
      </Button>
      {onEditFrontmatter && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onEditFrontmatter}
        >
          <Icon icon={UiFileText} />
          Frontmatter
        </Button>
      )}
    </div>
  );
}

function createFixtureCodeBlockDescriptor({
  schemas,
  readOnly,
  size,
}: {
  schemas: FixtureFenceSchemas;
  readOnly: boolean;
  size: NonNullable<FixtureEditorProps["size"]>;
}): MdxEditorCodeBlockEditorDescriptor {
  return {
    priority: 100,
    match: (language, meta) => fixtureCodeBlockMatches(language, meta, schemas),
    Editor: (props) => (
      <FixtureFenceCodeBlockEditor
        {...props}
        schemas={schemas}
        readOnly={readOnly}
        size={size}
      />
    ),
  };
}

function normalizeFenceOptions(
  allowedFences: readonly FixtureFenceOption[] | undefined,
  schemas: FixtureFenceSchemas,
): NormalizedFenceOption[] {
  const raw = allowedFences ?? defaultFenceSchemaKeys(schemas);
  const seen = new Set<string>();
  const normalized: NormalizedFenceOption[] = [];

  for (const option of raw) {
    const rawInfo = typeof option === "string" ? option : option.info;
    const info = fixtureFenceSnippetInfo(rawInfo);
    if (!info || seen.has(info)) continue;
    seen.add(info);
    const label =
      typeof option === "string"
        ? defaultFenceLabel(rawInfo)
        : String(option.label ?? defaultFenceLabel(rawInfo));
    const description =
      typeof option === "string" || option.description == null
        ? undefined
        : String(option.description);
    normalized.push({
      info,
      label,
      ...(description ? { description } : {}),
    });
  }

  return normalized;
}

function iconForFence(info: string): StaticIconComponent {
  const { language, meta } = splitFixtureFenceInfo(info);
  switch (fixtureFenceKind(language, meta)) {
    case "ai":
    case "prompt":
      return UiRobotAi;
    case "test":
      return UiTest;
    case "lint":
      return UiBug;
    case "exec":
    case "shell":
      return UiTerminal;
    case "yaml":
    case "code":
      return UiFileCode;
  }
}

function defaultFenceLabel(info: string): string {
  const { language, meta } = splitFixtureFenceInfo(info);
  const kind = fixtureFenceKind(language, meta);
  return kind === "test" || kind === "lint" || kind === "ai" || kind === "prompt"
    ? kind
    : fixtureFenceSnippetInfo(info);
}

function defaultFenceSchemaKeys(schemas: FixtureFenceSchemas): string[] {
  return schemaKeys(schemas).filter((key) => {
    const { language, meta } = splitFixtureFenceInfo(key);
    const kind = fixtureFenceKind(language, meta);
    return (
      kind === "test" ||
      kind === "lint" ||
      (kind === "yaml" && meta.trim() !== "")
    );
  });
}

function normalizeFrontmatterOptions(
  options: FixtureEditorProps["frontmatterEditor"],
): FixtureFrontmatterEditorOptions | undefined {
  if (options === false) return undefined;
  return typeof options === "object" ? options : {};
}
