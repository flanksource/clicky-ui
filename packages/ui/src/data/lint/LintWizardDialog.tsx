import { useEffect, useRef, useState } from "react";

import { Button } from "../../components/button";
import { Combobox } from "../../components/Combobox";
import { InputField } from "../../components/InputField";
import { MultiSelect } from "../../components/MultiSelect";
import { Switch } from "../../components/Switch";
import { Icon } from "../Icon";
import { UiListChecks, UiRobotAi } from "../../icons";
import { cn } from "../../lib/utils";
import { Modal } from "../../overlay/Modal";
import {
  LINT_WIZARD_STEPS,
  buildLintWizardRequest,
  emptyLintWizardDraft,
  lintWizardCommand,
  lintWizardStepReady,
  type LintWizardDraft,
  type LintWizardMethod,
  type LintWizardRequest,
} from "./LintWizardDialog.model";

/** A linter, prompt or model the dialog offers. */
export type LintWizardOption = { value: string; label?: string; description?: string };

export type LintWizardDialogProps = {
  open: boolean;
  onClose: () => void;
  /** What is being linted, named in the title, e.g. a folder path. */
  target: string;
  /** The paths the run covers. */
  paths: string[];
  /** Linters detected for the paths; all are selected by default. */
  linters: LintWizardOption[];
  /** Review prompts from the prompt library; a typed name or file path is accepted too. */
  prompts: LintWizardOption[];
  /** Models for the AI review; empty uses the model saved by `captain configure`. */
  models: LintWizardOption[];
  /** Starts the run; a rejection is shown in the dialog, which stays open. */
  onRun: (request: LintWizardRequest) => Promise<void> | void;
};

const STEP_LABELS = { method: "Method", configure: "Configure", review: "Review" } as const;

const METHODS: { method: LintWizardMethod; title: string; description: string; icon: typeof UiListChecks }[] = [
  {
    method: "linters",
    title: "Linters",
    description: "Run the project's configured linters (gavel lint) over the files.",
    icon: UiListChecks,
  },
  {
    method: "ai",
    title: "AI review",
    description: "A review prompt reads the files and reports violations (gavel lint prompt).",
    icon: UiRobotAi,
  },
];

/**
 * A step-by-step lint dialog: pick the linters or an AI review, configure that
 * path, then review the equivalent `gavel` command before running it.
 */
export function LintWizardDialog({ open, onClose, target, paths, linters, prompts, models, onRun }: LintWizardDialogProps) {
  const detected = linters.map((linter) => linter.value);
  const [draft, setDraft] = useState<LintWizardDraft>(() => emptyLintWizardDraft(detected));
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open && !wasOpen.current) {
      setDraft(emptyLintWizardDraft(detected));
      setStep(0);
      setRunning(false);
      setError("");
    }
    wasOpen.current = open;
  }, [open]);

  const current = LINT_WIZARD_STEPS[step]!;
  const ready = lintWizardStepReady(current, draft);
  const request = current === "review" ? buildLintWizardRequest(draft, paths, detected) : null;
  const patch = (next: Partial<LintWizardDraft>) => setDraft((value) => ({ ...value, ...next }));

  const run = async () => {
    setRunning(true);
    setError("");
    try {
      await onRun(request!);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error && cause.message ? cause.message : String(cause));
    } finally {
      setRunning(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      confirmClose={draft.method !== null && !running}
      title={`Lint ${target}`}
      size="lg"
      expandable={false}
      footer={
        <div className="flex items-center justify-between gap-density-2">
          <Button type="button" variant="ghost" size="sm" disabled={step === 0 || running} onClick={() => setStep((value) => value - 1)}>
            Back
          </Button>
          <div className="flex items-center gap-density-2">
            <Button type="button" variant="ghost" size="sm" disabled={running} onClick={onClose}>
              Cancel
            </Button>
            {current === "review" ? (
              <Button type="button" size="sm" loading={running} onClick={() => void run()}>
                {draft.method === "ai" ? "Start review" : "Run linters"}
              </Button>
            ) : (
              <Button type="button" size="sm" disabled={!ready} onClick={() => setStep((value) => value + 1)}>
                Next
              </Button>
            )}
          </div>
        </div>
      }
    >
      <ol className="mb-density-4 grid grid-cols-3 gap-density-2" aria-label="Lint progress">
        {LINT_WIZARD_STEPS.map((id, index) => (
          <li
            key={id}
            aria-current={step === index ? "step" : undefined}
            className={
              step === index
                ? "rounded-md bg-primary/10 px-density-2 py-1.5 text-xs font-medium text-foreground"
                : "rounded-md bg-muted/50 px-density-2 py-1.5 text-xs text-muted-foreground"
            }
          >
            {index + 1}. {STEP_LABELS[id]}
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="mb-density-3 rounded-md border border-destructive/30 bg-destructive/10 p-density-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {current === "method" && (
        <div role="radiogroup" aria-label="How to lint" className="grid gap-density-3 md:grid-cols-2">
          {METHODS.map(({ method, title, description, icon }) => (
            <button
              key={method}
              type="button"
              role="radio"
              aria-checked={draft.method === method}
              onClick={() => patch({ method })}
              className={cn(
                "flex items-start gap-density-3 rounded-md border p-density-3 text-left transition-colors",
                draft.method === method ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50",
              )}
            >
              <Icon icon={icon} className="mt-0.5 text-lg text-muted-foreground" />
              <span className="space-y-1">
                <span className="block text-sm font-semibold">{title}</span>
                <span className="block text-xs text-muted-foreground">{description}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {current === "configure" && draft.method === "linters" && (
        <div className="space-y-density-4">
          <Field label="Linters" hint="Every detected linter runs unless you narrow the list.">
            <MultiSelect
              ariaLabel="Linters"
              placeholder="Choose linters"
              options={linters.map((linter) => ({ value: linter.value, label: linter.label ?? linter.value }))}
              value={draft.linters}
              onChange={(next) => patch({ linters: next })}
            />
          </Field>
          <Field label="Exclude rules" hint="Rule IDs or source:rule patterns, comma separated.">
            <InputField aria-label="Exclude rules" placeholder="MD013, eslint:no-console" value={draft.exclude} onChange={(exclude) => patch({ exclude })} />
          </Field>
          <Switch checked={draft.fix} onChange={(fix) => patch({ fix })} label="Auto-fix: apply each linter's own fixes" />
          <Switch checked={draft.changed} onChange={(changed) => patch({ changed })} label="Changed files only" />
        </div>
      )}

      {current === "configure" && draft.method === "ai" && (
        <div className="space-y-density-4">
          <Field label="Review prompt" hint="From the prompt library, or type a prompt name or .prompt file.">
            <Combobox
              ariaLabel="Review prompt"
              placeholder="Choose a prompt"
              value={draft.prompt}
              options={prompts.map((prompt) => ({
                value: prompt.value,
                label: prompt.label ?? prompt.value,
                ...(prompt.description ? { description: prompt.description } : {}),
              }))}
              allowCustomValue
              size="sm"
              onChange={(prompt) => patch({ prompt })}
            />
          </Field>
          <Field label="Model" hint="Leave empty to use the model saved by captain configure.">
            <Combobox
              ariaLabel="Model"
              placeholder="Saved default"
              value={draft.model}
              options={models.map((model) => ({
                value: model.value,
                label: model.label ?? model.value,
                ...(model.description ? { description: model.description } : {}),
              }))}
              allowCustomValue
              size="sm"
              onChange={(model) => patch({ model })}
            />
          </Field>
          <Switch checked={draft.aiFix} onChange={(aiFix) => patch({ aiFix })} label="AI fix: repair findings with lint.fix and re-review until clean" />
          <Switch checked={draft.changed} onChange={(changed) => patch({ changed })} label="Changed files only" />
        </div>
      )}

      {current === "review" && request && <ReviewStep request={request} />}
    </Modal>
  );
}

function Field({ label, hint, children }: { label: string; hint: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 text-sm">
      <div className="font-medium">{label}</div>
      {children}
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

function ReviewStep({ request }: { request: LintWizardRequest }) {
  const rows: [string, string][] =
    request.method === "linters"
      ? [
          ["Method", "Linters"],
          ["Linters", request.linters?.join(", ") ?? "Every detected linter"],
          ["Exclude", request.exclude.join(", ") || "None"],
          ["Auto-fix", request.fix ? "Yes" : "No"],
          ["Changed only", request.changed ? "Yes" : "No"],
        ]
      : [
          ["Method", "AI review"],
          ["Prompt", request.prompt],
          ["Model", request.model ?? "Saved default"],
          ["AI fix", request.aiFix ? "Yes" : "No"],
          ["Changed only", request.changed ? "Yes" : "No"],
        ];
  return (
    <div className="space-y-density-4">
      <dl className="grid grid-cols-[8rem_1fr] gap-density-2 text-sm">
        {rows.map(([term, value]) => (
          <div key={term} className="contents">
            <dt className="text-muted-foreground">{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
        <dt className="text-muted-foreground">Paths</dt>
        <dd className="font-mono text-xs">{request.paths.join(", ")}</dd>
      </dl>
      <section>
        <h3 className="mb-density-2 text-sm font-semibold">Equivalent command</h3>
        <pre data-lint-command="" className="overflow-auto rounded-md border border-border bg-muted/40 p-density-3 font-mono text-xs">
          {lintWizardCommand(request)}
        </pre>
      </section>
    </div>
  );
}
