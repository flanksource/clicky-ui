import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  Combobox,
  ErrorDetails,
  Field,
  Icon,
  InputField,
  JsonSchemaForm,
  Modal,
  type JsonSchemaObject,
  type PostExtension,
} from "@flanksource/clicky-ui";
import {
  SEGMENT_CAPTION_CLASS,
  SEGMENT_KEY_CLASS,
  SegmentItemLabel,
  SpecRuntimeBar,
  compactAISpecRuntime,
  familiesFromRuntimeCatalog,
  type AISpecRuntimeValue,
  type RuntimeBarAction,
  type SpecRuntimeFamily,
} from "@flanksource/clicky-ui/ai";
import type { ChatModel } from "@flanksource/clicky-ui/chat";
import { UiRefresh, UiStack } from "@flanksource/clicky-ui/icons";

import type { CommentElementCaptureContext } from "../../plugins/comments-model";
import { ApiError } from "../comments/useComments";
import {
  availableRuntimeCatalog,
  fetchModelCatalog,
  fetchRuntimeCatalog,
} from "../agent-runs/runtime-catalog";
import {
  fetchPrompt,
  fetchPrompts,
  fetchWorkspaceFiles,
  startPromptRun,
  type CaptainPromptDetail,
  type CaptainPromptSummary,
  type PromptRun,
} from "./prompt-runs-api";
import { FilePickerField } from "./FilePickerField";
import { joinFileValue, splitFileValue } from "./file-picker-model";
import {
  missingRequired,
  seedPromptForm,
  seedRuntime,
  sourceFile,
} from "./seed";

function describeError(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/** The element a prompt runs against, captured when the menu action fired. */
export type PromptTarget = {
  page: string;
  anchor: string;
  element: Promise<CommentElementCaptureContext>;
  /** The files the prompt targets; defaults to the element's source file. */
  files?: string[];
  promptId?: string;
};

/** The captain calls the dialog makes; the playground page swaps in stubs. */
export type PromptRunsApi = {
  fetchPrompts: typeof fetchPrompts;
  fetchPrompt: typeof fetchPrompt;
  startPromptRun: typeof startPromptRun;
  fetchRuntimeCatalog: typeof fetchRuntimeCatalog;
  fetchModelCatalog: typeof fetchModelCatalog;
  fetchWorkspaceFiles: typeof fetchWorkspaceFiles;
};

const LIVE_API: PromptRunsApi = {
  fetchPrompts,
  fetchPrompt,
  startPromptRun,
  fetchRuntimeCatalog,
  fetchModelCatalog,
  fetchWorkspaceFiles,
};

/** Captain's available runtimes, every mode included: a one-shot run needs no live session. */
type RuntimeCatalog = { families: SpecRuntimeFamily[]; models: ChatModel[] };

async function loadRuntimeCatalog(api: PromptRunsApi): Promise<RuntimeCatalog> {
  const [runtimes, models] = await Promise.all([
    api.fetchRuntimeCatalog(),
    api.fetchModelCatalog(),
  ]);
  const available = availableRuntimeCatalog(runtimes, {});
  // familiesFromRuntimeCatalog falls back to built-in families for an empty list; none must stay none.
  return {
    families: available.length ? familiesFromRuntimeCatalog(available) : [],
    models,
  };
}

/** Default `lint` so lint-style prompts return their violations as structured output. */
const DEFAULT_PRESETS = "lint";

/** The presets the prompt's frontmatter selects, else the lint default. */
function promptPresets(prompt: CaptainPromptDetail): string {
  const declared = prompt.run?.presets ?? prompt.presets ?? [];
  return declared.length > 0 ? declared.join(", ") : DEFAULT_PRESETS;
}

/** The run's presets as a runtime-bar segment: free-form names, with a reset to the prompt's default. */
function presetsField({
  value,
  defaultValue,
  onChange,
}: {
  value: string;
  defaultValue: string;
  onChange: (next: string) => void;
}): RuntimeBarAction {
  const label = value.trim() || "None";
  return {
    id: "presets",
    label: "Presets",
    title: `Presets — ${label}`,
    icon: UiStack,
    isSet: true,
    caption: (
      <>
        <span className={SEGMENT_KEY_CLASS}>Presets</span>
        <Icon
          icon={UiStack}
          className="size-4 shrink-0 text-muted-foreground"
        />
        <span className={SEGMENT_CAPTION_CLASS}>{label}</span>
      </>
    ),
    header: (
      <div className="grid gap-1">
        <span className={SEGMENT_KEY_CLASS}>Presets, comma separated</span>
        <InputField
          id="prompt-run-presets"
          aria-label="Presets"
          value={value}
          onChange={onChange}
          inputClassName="font-mono text-xs"
        />
      </div>
    ),
    items: [
      {
        label: (
          <SegmentItemLabel
            text={`Default (${defaultValue})`}
            selected={value === defaultValue}
          />
        ),
        onSelect: () => onChange(defaultValue),
      },
      {
        label: <SegmentItemLabel text="None" selected={!value.trim()} />,
        onSelect: () => onChange(""),
      },
    ],
  };
}

function PromptError({
  title,
  error,
  context = [],
  onRetry,
}: {
  title: string;
  error: unknown;
  context?: Array<[string, string]>;
  onRetry?: () => void;
}) {
  // A server envelope's hint says what to do next, so it stays in view instead of behind "More details".
  const reported =
    error instanceof ApiError
      ? error.diagnostics
      : { message: describeError(error), context: [] };
  const hint = reported.context.find(([label]) => label === "Hint")?.[1];
  return (
    <div className="space-y-2">
      <ErrorDetails
        title={title}
        diagnostics={{
          ...reported,
          context: [
            ...context,
            ...reported.context.filter(([label]) => label !== "Hint"),
          ],
        }}
        actions={
          onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              <Icon icon={UiRefresh} />
              Retry
            </Button>
          )
        }
      />
      {hint && (
        <p role="note" className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="flex justify-end gap-2">{children}</div>;
}

type PromptDetail =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; schema: JsonSchemaObject }
  | { status: "failed"; stage: Stage; error: unknown };

type Stage = "prompts" | "runtimes" | "prompt" | "element";

class StageError extends Error {
  constructor(
    readonly stage: Stage,
    readonly reason: unknown,
  ) {
    super(describeError(reason));
  }
}

const atStage = <T,>(stage: Stage, promise: Promise<T>) =>
  promise.catch((cause: unknown) =>
    Promise.reject(new StageError(stage, cause)),
  );

function PromptForm({
  api,
  target,
  prompts,
  runtimes,
  defaultPromptId,
  onStarted,
  onCancel,
}: {
  api: PromptRunsApi;
  target: PromptTarget;
  prompts: CaptainPromptSummary[];
  runtimes: RuntimeCatalog;
  defaultPromptId: string;
  onStarted: (run: PromptRun) => void;
  onCancel: () => void;
}) {
  const [promptId, setPromptId] = useState(defaultPromptId);
  const [promptVersion, setPromptVersion] = useState("");
  const [preparationId, setPreparationId] = useState("");
  const [admission, setAdmission] = useState({
    fingerprint: "",
    id: crypto.randomUUID(),
  });
  const [runtime, setRuntime] = useState<AISpecRuntimeValue>(() =>
    seedRuntime(undefined, runtimes.families),
  );
  const [detail, setDetail] = useState<PromptDetail>({ status: "idle" });
  const [attempt, setAttempt] = useState(0);
  const [variables, setVariables] = useState<Record<string, unknown>>({});
  const [presets, setPresets] = useState(DEFAULT_PRESETS);
  const [defaultPresets, setDefaultPresets] = useState(DEFAULT_PRESETS);
  const [runError, setRunError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [elementFile, setElementFile] = useState<string[]>([]);
  const [directory, setDirectory] = useState<string>();
  const [folderFiles, setFolderFiles] = useState<string[]>();
  // `files` gets the Browse… picker; a string argument holds space-separated paths, an array one per item.
  const filesPost = useMemo<PostExtension>(
    () => (field, nodes) => {
      if (field.key !== "files") return nodes;
      const paths = Array.isArray(field.value)
        ? field.value.filter((path): path is string => typeof path === "string")
        : splitFileValue(typeof field.value === "string" ? field.value : "");
      return {
        ...nodes,
        value: (
          <FilePickerField
            id="prompt-run-files"
            value={paths}
            multiple
            suggested={elementFile}
            loadFiles={() => api.fetchWorkspaceFiles(target.page, directory)}
            disabled={busy}
            onChange={(next) =>
              field.onChange(
                field.schema.type === "array" ? next : joinFileValue(next),
              )
            }
          />
        ),
      };
    },
    [api.fetchWorkspaceFiles, busy, elementFile, target.page, directory],
  );

  useEffect(() => {
    if (!promptId) return;
    let cancelled = false;
    setDetail({ status: "loading" });
    setRunError(null);
    Promise.all([
      atStage("prompt", api.fetchPrompt(promptId, target.page)),
      atStage("element", target.element),
    ]).then(
      ([next, element]) => {
        if (cancelled) return;
        if (!next.prompt.version || !next.preparationId) {
          setDetail({
            status: "failed",
            stage: "prompt",
            error: new Error(
              "Prompt discovery returned no version or workspace preparation",
            ),
          });
          return;
        }
        setPromptVersion(next.prompt.version);
        setPreparationId(next.preparationId);
        setDirectory(next.directory);
        const files =
          next.files ?? next.defaultFiles ?? target.files ?? [sourceFile(element.source)].filter(Boolean);
        const seeded = seedPromptForm({
          schema: next.variablesSchema,
          element,
          page: target.page,
          files,
        });
        if (next.files) {
          const properties = seeded.schema["properties"] as Record<string, unknown> | undefined;
          seeded.schema = {
            ...seeded.schema,
            properties: Object.fromEntries(Object.entries(properties ?? {}).filter(([key]) => key !== "files")),
            required: Array.isArray(seeded.schema["required"]) ? seeded.schema["required"].filter((key: unknown) => key !== "files") : [],
          };
          delete seeded.variables["files"];
        }
        setFolderFiles(next.files);
        setDetail({
          status: "ready",
          schema: seeded.schema as JsonSchemaObject,
        });
        setVariables(seeded.variables);
        setElementFile(files);
        setRuntime(
          seedRuntime(next.prompt.run?.spec ?? undefined, runtimes.families),
        );
        const declared = promptPresets(next.prompt);
        setDefaultPresets(declared);
        setPresets(declared);
      },
      (cause: unknown) => {
        if (cancelled) return;
        const stage = cause instanceof StageError ? cause.stage : "prompt";
        setDetail({
          status: "failed",
          stage,
          error: cause instanceof StageError ? cause.reason : cause,
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [api, promptId, target.element, target.files, attempt, runtimes.families]);

  const missing =
    detail.status === "ready" ? missingRequired(detail.schema, variables) : [];
  const spec = compactAISpecRuntime(runtime);
  const model = spec.model;
  const blockers = [
    ...(missing.length > 0 ? [`fill in ${missing.join(", ")}`] : []),
    ...(model ? [] : ["choose a model"]),
  ];

  const run = async (model: string) => {
    setBusy(true);
    setRunError(null);
    try {
      const fingerprint = JSON.stringify({
        promptId,
        promptVersion,
        preparationId,
        variables,
        presets,
        spec,
        model,
        page: target.page,
        anchor: target.anchor,
      });
      const associationId =
        admission.fingerprint === fingerprint
          ? admission.id
          : crypto.randomUUID();
      setAdmission({ fingerprint, id: associationId });
      onStarted(
        await api.startPromptRun({
          promptId,
          promptVersion,
          preparationId,
          associationId,
          variables,
          presets: presets
            .split(",")
            .map((preset) => preset.trim())
            .filter(Boolean),
          spec: { ...spec, model },
          page: target.page,
          anchor: target.anchor,
          element: await target.element,
        }),
      );
    } catch (cause) {
      setRunError(cause);
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4 text-sm">
      {folderFiles && (
        <details className="rounded border border-border p-3">
          <summary>{folderFiles.length} Markdown files in this folder and its subfolders</summary>
          <ul className="mt-2 max-h-48 overflow-auto font-mono text-xs">
            {folderFiles.map((file) => <li key={file}>{file}</li>)}
          </ul>
        </details>
      )}
      <div className="grid grid-cols-1 gap-3">
        <Field label="Prompt" htmlFor="prompt-run-prompt">
          <Combobox
            id="prompt-run-prompt"
            ariaLabel="Prompt"
            value={promptId}
            onChange={setPromptId}
            allowCustomValue={false}
            disabled={busy}
            options={prompts.map((prompt) => ({
              value: prompt.id,
              label: prompt.name,
              ...(prompt.description
                ? { description: prompt.description }
                : {}),
            }))}
          />
        </Field>
        <Field label="Runtime">
          {/* Seeded from the prompt's frontmatter; read-only until that prompt has loaded. A one-shot run takes
              permissions, workspace and commits from captain's defaults, so only the model row and the run's
              presets (default lint) are offered. */}
          <SpecRuntimeBar
            value={runtime}
            onChange={setRuntime}
            models={runtimes.models}
            families={runtimes.families}
            sections={["model"]}
            fields={[
              presetsField({
                value: presets,
                defaultValue: defaultPresets,
                onChange: setPresets,
              }),
            ]}
            readOnly={busy || detail.status !== "ready"}
            ariaLabel="Prompt runtime"
          />
        </Field>
      </div>
      {detail.status === "loading" && (
        <p role="status" className="text-muted-foreground">
          Loading the prompt…
        </p>
      )}
      {detail.status === "failed" &&
        (detail.stage === "element" ? (
          // The capture is a one-shot promise, so retrying here would replay the same failure.
          <div className="space-y-2">
            <PromptError
              title="Couldn't capture the element"
              error={detail.error}
            />
            <p className="text-xs text-muted-foreground">
              Close this dialog and choose Prompt… on the element again to
              capture it afresh.
            </p>
          </div>
        ) : (
          <PromptError
            title="Couldn't load the prompt"
            error={detail.error}
            context={[["Prompt", promptId]]}
            onRetry={() => setAttempt((count) => count + 1)}
          />
        ))}
      {detail.status === "ready" && (
        <>
          {Object.keys(detail.schema.properties ?? {}).length > 0 ? (
            <JsonSchemaForm
              schema={detail.schema}
              value={variables}
              onChange={setVariables}
              size="sm"
              post={[filesPost]}
            />
          ) : (
            <p className="text-muted-foreground">
              This prompt takes no arguments.
            </p>
          )}
        </>
      )}
      {runError !== null && (
        <PromptError
          title="Couldn't start the run"
          error={runError}
          context={[["Prompt", promptId]]}
        />
      )}
      {detail.status === "ready" && blockers.length > 0 && (
        <p
          role="status"
          className="text-xs text-muted-foreground first-letter:uppercase"
        >
          {blockers.join(" and ")} to run.
        </p>
      )}
      <Actions>
        <Button variant="outline" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          disabled={busy || detail.status !== "ready" || blockers.length > 0}
          onClick={() => model && void run(model)}
        >
          {busy ? "Starting…" : runError !== null ? "Try again" : "Run prompt"}
        </Button>
      </Actions>
    </div>
  );
}

type PromptList =
  | { status: "loading" }
  | {
      status: "ready";
      prompts: CaptainPromptSummary[];
      runtimes: RuntimeCatalog;
    }
  | { status: "failed"; stage: ListStage; error: unknown };

type ListStage = Extract<Stage, "prompts" | "runtimes">;

const LIST_FAILURES: Record<ListStage, string> = {
  prompts: "Couldn't load prompts from captain",
  runtimes: "Couldn't load runtimes from captain",
};

/** Why the dialog cannot offer a run yet, or undefined once it can. */
function emptyCatalogMessage(
  list: Extract<PromptList, { status: "ready" }>,
): ReactNode {
  if (list.prompts.length === 0) {
    return (
      <>
        Captain has no saved prompts yet. Add a <code>.prompt</code> file to
        captain, then reload the list.
      </>
    );
  }
  if (list.runtimes.families.length === 0) {
    return "Captain reports no available runtime. Configure a model provider in captain, then reload.";
  }
  return undefined;
}

/**
 * The dialog's body: loads captain's saved prompts, then the form for the one
 * picked. Every failure says what broke and, where a retry can help, offers one.
 */
export function RunPromptPanel({
  target,
  api = LIVE_API,
  defaultPromptId = "",
  onStarted,
  onClose,
}: {
  target: PromptTarget;
  api?: PromptRunsApi;
  defaultPromptId?: string;
  onStarted: (run: PromptRun) => void;
  onClose: () => void;
}) {
  const [list, setList] = useState<PromptList>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const retry = () => setAttempt((count) => count + 1);

  useEffect(() => {
    let cancelled = false;
    setList({ status: "loading" });
    Promise.all([
      atStage("prompts", api.fetchPrompts(target.page)),
      atStage("runtimes", loadRuntimeCatalog(api)),
    ]).then(
      ([prompts, runtimes]) =>
        !cancelled && setList({ status: "ready", prompts, runtimes }),
      (cause: unknown) => {
        if (cancelled) return;
        // Both loads are wrapped by atStage, so anything else is a bug worth surfacing.
        if (!(cause instanceof StageError)) throw cause;
        setList({
          status: "failed",
          stage: cause.stage === "runtimes" ? "runtimes" : "prompts",
          error: cause.reason,
        });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [api, attempt]);

  if (list.status === "loading") {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        Loading prompts and runtimes from captain…
      </p>
    );
  }
  const empty = list.status === "ready" ? emptyCatalogMessage(list) : undefined;
  if (list.status === "failed" || empty) {
    return (
      <div className="space-y-4 text-sm">
        {list.status === "failed" ? (
          <PromptError
            title={LIST_FAILURES[list.stage]}
            error={list.error}
            onRetry={retry}
          />
        ) : (
          <p role="status" className="text-muted-foreground">
            {empty}
          </p>
        )}
        <Actions>
          {list.status === "ready" && (
            <Button variant="outline" onClick={retry}>
              Reload
            </Button>
          )}
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </Actions>
      </div>
    );
  }
  return (
    <PromptForm
      api={api}
      target={target}
      prompts={list.prompts}
      runtimes={list.runtimes}
      defaultPromptId={defaultPromptId}
      onStarted={onStarted}
      onCancel={onClose}
    />
  );
}

/**
 * Picks a saved captain prompt, fills in its arguments (seeded from the
 * element) and starts it; the result arrives later as a comment on the element.
 */
export function RunPromptDialog({
  target,
  api,
  onStarted,
  onClose,
}: {
  target: PromptTarget | null;
  api?: PromptRunsApi;
  onStarted: (run: PromptRun) => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      title="Run prompt"
      size="lg"
    >
      {target && (
        <RunPromptPanel
          key={target.anchor}
          target={target}
          defaultPromptId={target.promptId ?? ""}
          {...(api ? { api } : {})}
          onStarted={onStarted}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}
