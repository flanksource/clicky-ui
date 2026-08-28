import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { expect, userEvent, within } from "storybook/test";
import type {
  PromptSpecDetail,
  PromptSpecSavePayload,
} from "../PromptPicker/types";
import { PromptCatalogTable } from "./PromptCatalogTable";
import { PromptPage } from "./PromptPage";
import type {
  PromptCatalogEntry,
  PromptCatalogFilterState,
  PromptCatalogLayer,
  PromptPageAdapter,
  PromptRenderInput,
} from "./types";

const EMPTY_FILTER_STATE: PromptCatalogFilterState = {
  query: "",
  commands: [],
  sources: [],
  models: [],
  owners: [],
  overriddenOnly: false,
};

const HOME: PromptCatalogLayer = {
  origin: "user-home",
  path: "/Users/dev/.gavel.yaml",
  scope: "scope=global",
  editable: true,
  source: "none",
};
const GIT_ROOT: PromptCatalogLayer = {
  origin: "git-root",
  path: "/work/acme/.gavel.yaml",
  editable: false,
  source: "none",
};
const PROJECT: PromptCatalogLayer = {
  origin: "target-directory",
  path: "/work/acme/api/.gavel.yaml",
  scope: "project=api",
  editable: true,
  source: "none",
};

const COMMIT_DEFAULT = `---
model: claude-sonnet-4-6
output:
  schema:
    type: object
    properties:
      subject: { type: string }
      body: { type: string }
---
{{role "system"}}
You write Conventional Commits.

{{role "user"}}
Summarise this diff as a commit message:

{{{diff}}}
`;

const COMMIT_HOME = COMMIT_DEFAULT.replace(
  "claude-sonnet-4-6",
  "claude-haiku-4-5",
);

const TODOS_RUN_DEFAULT = `---
model: claude-opus-4-6
permissions:
  mode: bypass
---
Implement the following TODO{{#if multiple}}s{{/if}}:

{{{body}}}
`;

const TODOS_RUN_FILE = `---
model: claude-opus-4-6
effort: high
---
Implement the following TODO{{#if multiple}}s{{/if}}, running the tests first:

{{{body}}}

{{#if existingPlan}}Follow this plan:
{{{existingPlan}}}{{/if}}
`;

const LINT_DEFAULT = `---
model: claude-sonnet-4-6
---
Fix these lint violations without changing behaviour:

{{{violations}}}
`;

const SECURITY_INLINE = `Audit {{{body}}} for leaked secrets and report each finding.
`;

const STATUS_BROKEN = `---
model: [broken
---
Summarise {{{details}}}.
`;

const ENTRIES: PromptCatalogEntry[] = [
  {
    id: "commit.message",
    title: "Commit message",
    description: "Subject and body for a staged change set",
    configPath: "commit.message",
    owner: "gavel",
    usedBy: ["gavel commit"],
    source: "inline",
    raw: COMMIT_HOME,
    version: "0c9f6601ed6035f3",
    body: COMMIT_DEFAULT.split("---\n")[2] ?? "",
    variables: ["diff"],
    defaultRaw: COMMIT_DEFAULT,
    effective: {
      model: "claude-haiku-4-5",
      backend: "claude-agent",
      modelSource: "operation",
    },
    provenance: {
      model: "user-home",
      body: "prompt default",
      backend: "ai base",
    },
    layers: [
      { ...HOME, source: "inline", fields: ["model"] },
      GIT_ROOT,
      PROJECT,
    ],
  },
  {
    id: "todos.run",
    title: "Run a TODO",
    description: "Implements a todo end to end",
    configPath: "todos.run",
    owner: "gavel",
    usedBy: ["gavel todos run"],
    source: "file",
    path: "/work/acme/api/.gavel/prompts/todos-run.prompt",
    raw: TODOS_RUN_FILE,
    version: "f35cb1bdce2f9738",
    body: TODOS_RUN_FILE.split("---\n")[2] ?? "",
    variables: ["body", "existingPlan", "multiple"],
    defaultRaw: TODOS_RUN_DEFAULT,
    effective: {
      model: "claude-opus-4-6",
      backend: "claude-agent",
      effort: "high",
      modelSource: "operation",
    },
    provenance: {
      model: "target-directory",
      body: "target-directory",
      effort: "target-directory",
    },
    layers: [
      HOME,
      GIT_ROOT,
      {
        ...PROJECT,
        source: "file",
        filePath: "/work/acme/api/.gavel/prompts/todos-run.prompt",
        fields: ["file"],
      },
    ],
  },
  {
    id: "lint.fix",
    title: "Lint fix",
    description: "Fixes linter findings in place",
    configPath: "lint.fix",
    owner: "gavel",
    usedBy: ["gavel lint --ai-fix", "gavel commit (lint gate)"],
    source: "builtin",
    raw: LINT_DEFAULT,
    version: "9a1b2c3d4e5f6a7b",
    body: LINT_DEFAULT.split("---\n")[2] ?? "",
    variables: ["violations"],
    defaultRaw: LINT_DEFAULT,
    effective: {
      model: "claude-sonnet-4-6",
      backend: "claude-agent",
      modelSource: "prompt default",
    },
    provenance: { model: "prompt default", body: "prompt default" },
    layers: [HOME, GIT_ROOT, PROJECT],
  },
  {
    id: "todos.prompts.security",
    title: "Security audit",
    description: "A named todos prompt declared under todos.prompts",
    configPath: "todos.prompts.security",
    owner: "gavel",
    usedBy: ["gavel todos run --prompt security"],
    source: "inline",
    raw: SECURITY_INLINE,
    version: "1122334455667788",
    body: SECURITY_INLINE,
    variables: ["body"],
    effective: { model: "gpt-5", backend: "openai", modelSource: "ai base" },
    provenance: { body: "git-root", model: "ai base" },
    layers: [
      { ...HOME, editable: false, scope: undefined },
      { ...GIT_ROOT, source: "inline", fields: ["prompt.user"] },
      { ...PROJECT, editable: false, scope: undefined },
    ],
  },
  {
    id: "status.summary",
    title: "Status summary",
    configPath: "status.summary",
    owner: "gavel",
    usedBy: ["gavel status --ai"],
    source: "file",
    path: "/work/acme/api/status.prompt",
    parseError: "yaml: line 2: did not find expected ',' or ']'",
    effective: { modelSource: "runtime" },
    layers: [
      HOME,
      GIT_ROOT,
      {
        ...PROJECT,
        source: "file",
        filePath: "/work/acme/api/status.prompt",
        fields: ["file"],
      },
    ],
  },
];

const HOME_DETAILS: Record<string, PromptSpecDetail> = {
  "commit.message": {
    id: "commit.message",
    scope: "global",
    source: "inline",
    raw: COMMIT_HOME,
    spec: {
      model: "claude-haiku-4-5",
      prompt: { schemaJSON: { type: "object" } },
    },
    body: COMMIT_DEFAULT.split("---\n")[2] ?? "",
  },
};

function splitDocument(raw: string): {
  spec: Record<string, unknown>;
  body: string;
} {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!match) return { spec: {}, body: raw };
  const spec: Record<string, unknown> = {};
  for (const line of (match[1] ?? "").split("\n")) {
    const [key, ...rest] = line.split(":");
    if (key && rest.length && !line.startsWith(" "))
      spec[key.trim()] = rest.join(":").trim();
  }
  return { spec, body: match[2] ?? "" };
}

function renderVariables(
  template: string,
  variables: Record<string, unknown>,
): string {
  return template.replace(/\{\{\{?\s*([\w.]+)\s*\}?\}\}/g, (_, name: string) =>
    String(variables[name] ?? ""),
  );
}

function renderMessages(body: string, variables: Record<string, unknown>) {
  const systemMarker = '{{role "system"}}';
  const userMarker = '{{role "user"}}';
  const systemStart = body.indexOf(systemMarker);
  const userStart = body.indexOf(userMarker);
  if (systemStart >= 0 && userStart > systemStart) {
    return {
      system: renderVariables(
        body.slice(systemStart + systemMarker.length, userStart).trim(),
        variables,
      ),
      user: renderVariables(
        body.slice(userStart + userMarker.length).trim(),
        variables,
      ),
    };
  }
  return { user: renderVariables(body, variables) };
}

// An in-memory host: details keyed by prompt + layer, a stale-base check like
// gavel's, and the role-aware template rendering needed by the preview.
function memoryAdapter(): PromptPageAdapter {
  const store = new Map<string, PromptSpecDetail>();
  const key = (entry: PromptCatalogEntry, layer: PromptCatalogLayer) =>
    `${entry.id}|${layer.origin}`;
  const defaultDetail = (
    entry: PromptCatalogEntry,
    layer: PromptCatalogLayer,
  ): PromptSpecDetail => {
    if (layer.origin === "user-home" && HOME_DETAILS[entry.id])
      return HOME_DETAILS[entry.id] as PromptSpecDetail;
    const raw = entry.defaultRaw ?? entry.raw ?? "";
    if (entry.parseError && layer.source !== "none") {
      return {
        id: entry.id,
        scope: layer.scope,
        source: "file",
        path: entry.path,
        raw: STATUS_BROKEN,
        parseError: entry.parseError,
      };
    }
    return {
      id: entry.id,
      scope: layer.scope,
      source: layer.source === "none" ? "default" : layer.source,
      raw,
      ...splitDocument(raw),
    };
  };
  return {
    loadDetail: async (entry, layer) =>
      store.get(key(entry, layer)) ?? defaultDetail(entry, layer),
    saveDetail: async (entry, layer, payload: PromptSpecSavePayload) => {
      const current =
        store.get(key(entry, layer)) ?? defaultDetail(entry, layer);
      if (payload.baseRaw !== undefined && payload.baseRaw !== current.raw) {
        throw new Error(
          `prompt ${entry.id} changed since it was loaded; reload before saving`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (payload.source === "default") {
        store.delete(key(entry, layer));
        return defaultDetail(entry, { ...layer, source: "none" });
      }
      const raw =
        "raw" in payload ? payload.raw : composeRaw(payload.spec, payload.body);
      const next: PromptSpecDetail = {
        id: entry.id,
        scope: layer.scope,
        source: payload.source,
        path: payload.path,
        raw,
        ...splitDocument(raw),
      };
      store.set(key(entry, layer), next);
      return next;
    },
    render: async (entry, input: PromptRenderInput) => {
      const raw =
        input.raw ?? store.get(`${entry.id}|user-home`)?.raw ?? entry.raw ?? "";
      const { spec, body } = splitDocument(raw);
      return {
        ...renderMessages(body, input.variables),
        model: typeof spec.model === "string" ? spec.model : undefined,
      };
    },
  };
}

function composeRaw(spec: Record<string, unknown>, body: string): string {
  const lines = Object.entries(spec).map(
    ([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`,
  );
  return lines.length ? `---\n${lines.join("\n")}\n---\n${body}` : body;
}

function Workbench({ initialId }: { initialId?: string | undefined }) {
  const [adapter] = useState(memoryAdapter);
  const [selectedId, setSelectedId] = useState<string | undefined>(initialId);
  const [filterState, setFilterState] = useState<PromptCatalogFilterState>(
    () => ({
      ...EMPTY_FILTER_STATE,
    }),
  );
  const selected = ENTRIES.find((entry) => entry.id === selectedId);
  return (
    <div className="flex h-screen flex-col">
      {selected ? (
        <PromptPage
          entry={selected}
          adapter={adapter}
          onBack={() => setSelectedId(undefined)}
        />
      ) : (
        <PromptCatalogTable
          entries={ENTRIES}
          filterState={filterState}
          onFilterStateChange={setFilterState}
          onSelect={(entry) => setSelectedId(entry.id)}
        />
      )}
    </div>
  );
}

const meta = {
  title: "AI/PromptCatalog",
  component: PromptCatalogTable,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PromptCatalogTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Table: Story = {
  render: () => <Workbench />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText("Commit message")).toBeInTheDocument();
    await expect(
      canvas.getByText("model ← Home (~/.gavel.yaml)"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Parse error")).toBeInTheDocument();
  },
};

export const PageInlineOverride: Story = {
  render: () => <Workbench initialId="commit.message" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByLabelText("Prompt document body"),
    ).toBeInTheDocument();
    await expect(canvas.getByText("effective")).toBeInTheDocument();
  },
};

export const PageFileOverride: Story = {
  render: () => <Workbench initialId="todos.run" />,
};

export const PageBuiltIn: Story = {
  render: () => <Workbench initialId="lint.fix" />,
};

export const PageReadOnlyNamedPrompt: Story = {
  render: () => <Workbench initialId="todos.prompts.security" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      await canvas.findByRole("button", { name: /Project directory/ }),
    );
    await expect(await canvas.findByRole("note")).toHaveTextContent(
      "read-only",
    );
    await expect(
      await canvas.findByLabelText("Prompt document body"),
    ).toBeDisabled();
  },
};

export const PageParseError: Story = {
  render: () => <Workbench initialId="status.summary" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "could not be parsed",
    );
  },
};
