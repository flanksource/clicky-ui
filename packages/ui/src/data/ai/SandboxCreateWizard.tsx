import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "../../components/button";
import { Combobox } from "../../components/Combobox";
import { InputField } from "../../components/InputField";
import { JsonSchemaForm } from "../../components/JsonSchemaForm";
import { Switch } from "../../components/Switch";
import { Modal } from "../../overlay/Modal";
import { SandboxConnectionsSection } from "./SandboxConnectionsSection";
import type { SpecRuntimeSandboxBackend } from "./SpecRuntimeEditor/types";
import type { SpecRuntimeSandboxCatalog } from "./SpecRuntimeEditor/types";
import {
  buildSandboxCreateInput,
  emptySandboxCreateDraft,
  toggleSandboxCredential,
  type SpecRuntimeSandboxCreateConfig,
  type SpecRuntimeSandboxCreateDraft,
  type SpecRuntimeSandboxCreateInput,
  type SpecRuntimeSandboxCredential,
} from "./SandboxCreateWizard.model";
import { sandboxKindMeta } from "./sandbox-kind-meta";

export type SandboxCreateWizardProps = {
  open: boolean;
  catalog: SpecRuntimeSandboxCatalog;
  config: SpecRuntimeSandboxCreateConfig;
  onClose: () => void;
  onCreated?:
    | ((
        backend: SpecRuntimeSandboxBackend,
        input: SpecRuntimeSandboxCreateInput,
      ) => void)
    | undefined;
};

const STEPS = ["Configure", "Connections", "Review"] as const;

export function SandboxCreateWizard({
  open,
  catalog,
  config,
  onClose,
  onCreated,
}: SandboxCreateWizardProps) {
  const [draft, setDraft] = useState(() => emptySandboxCreateDraft(catalog));
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const wasOpen = useRef(open);
  const credentials = config.credentials ?? [];

  useEffect(() => {
    if (open && !wasOpen.current) {
      setDraft(emptySandboxCreateDraft(catalog));
      setStep(0);
      setSaving(false);
      setError("");
    }
    wasOpen.current = open;
  }, [catalog, open]);

  const kinds = useMemo(
    () => (catalog.kinds ?? []).filter((item) => item.kind !== "none"),
    [catalog.kinds],
  );
  const existingNames = new Set([
    ...(catalog.kinds ?? []).flatMap((kind) =>
      (kind.backends ?? []).map((backend) => backend.name),
    ),
    ...(catalog.invalid ?? []).map((backend) => backend.name),
  ]);
  const duplicateName = existingNames.has(draft.name.trim());
  const configureReady =
    draft.name.trim() !== "" && draft.kind.trim() !== "" && !duplicateName;
  const dirty =
    draft.name !== "" ||
    Object.keys(draft.parameters).length > 0 ||
    draft.credentialIds.length > 0 ||
    draft.setDefault;

  const create = async () => {
    setSaving(true);
    setError("");
    try {
      const input = buildSandboxCreateInput(draft, credentials);
      const backend = await config.onCreate(input);
      if (!backend.name?.trim()) {
        throw new Error("sandbox create returned a backend without a name");
      }
      onCreated?.(backend, input);
      onClose();
    } catch (cause) {
      setError(errorMessage(cause));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      confirmClose={dirty && !saving}
      title="Create sandbox"
      size="lg"
      expandable={false}
      footer={
        <div className="flex items-center justify-between gap-density-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={step === 0 || saving}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            Back
          </Button>
          <div className="flex items-center gap-density-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={onClose}
            >
              Cancel
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                type="button"
                size="sm"
                disabled={(step === 0 && !configureReady) || saving}
                onClick={() => setStep((current) => current + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                loading={saving}
                onClick={() => void create()}
              >
                {saving ? "Creating sandbox" : "Create sandbox"}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <ol
        className="mb-density-4 grid grid-cols-3 gap-density-2"
        aria-label="Sandbox creation progress"
      >
        {STEPS.map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? "step" : undefined}
            className={
              step === index
                ? "rounded-md bg-primary/10 px-density-2 py-1.5 text-xs font-medium text-foreground"
                : "rounded-md bg-muted/50 px-density-2 py-1.5 text-xs text-muted-foreground"
            }
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>

      {error && (
        <p
          role="alert"
          className="mb-density-3 rounded-md border border-destructive/30 bg-destructive/10 p-density-2 text-sm text-destructive"
        >
          {error}
        </p>
      )}

      {step === 0 && (
        <ConfigureStep
          draft={draft}
          kinds={kinds}
          duplicateName={duplicateName}
          onChange={setDraft}
        />
      )}
      {step === 1 && (
        <SandboxConnectionsSection
          connections={credentials}
          selectedIds={draft.credentialIds}
          onToggle={(id) =>
            setDraft((current) =>
              toggleSandboxCredential(current, id, credentials),
            )
          }
        />
      )}
      {step === 2 && <ReviewStep draft={draft} credentials={credentials} />}
    </Modal>
  );
}

function ConfigureStep({
  draft,
  kinds,
  duplicateName,
  onChange,
}: {
  draft: SpecRuntimeSandboxCreateDraft;
  kinds: NonNullable<SpecRuntimeSandboxCatalog["kinds"]>;
  duplicateName: boolean;
  onChange: (draft: SpecRuntimeSandboxCreateDraft) => void;
}) {
  const selected = kinds.find((kind) => kind.kind === draft.kind);
  return (
    <div className="space-y-density-4">
      <div className="grid gap-density-3 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          <span>Sandbox name</span>
          <InputField
            aria-label="Sandbox name"
            value={draft.name}
            onChange={(name) => onChange({ ...draft, name })}
            autoFocus
          />
          {duplicateName && (
            <span className="block text-xs font-normal text-destructive">
              A sandbox with this name already exists.
            </span>
          )}
        </label>
        <div className="space-y-1 text-sm font-medium">
          <span>Sandbox type</span>
          <Combobox
            ariaLabel="Sandbox type"
            value={draft.kind}
            options={kinds.map((kind) => {
              const meta = sandboxKindMeta(kind.kind);
              const KindIcon = meta.icon;
              return {
                value: kind.kind,
                label: meta.label,
                ...(kind.description ? { description: kind.description } : {}),
                icon: <KindIcon />,
              };
            })}
            allowCustomValue={false}
            required
            size="sm"
            onChange={(kind) =>
              onChange({
                ...draft,
                kind,
                parameters: {},
              })
            }
          />
        </div>
      </div>
      {selected?.description && (
        <p className="text-sm text-muted-foreground">{selected.description}</p>
      )}
      <Switch
        checked={draft.setDefault}
        onChange={(setDefault) => onChange({ ...draft, setDefault })}
        label="Use as the default sandbox"
      />
      {selected?.configSchema && (
        <section className="space-y-density-2 border-t border-border pt-density-4">
          <h3 className="text-sm font-semibold">Adapter parameters</h3>
          <JsonSchemaForm
            schema={selected.configSchema}
            value={draft.parameters}
            onChange={(parameters) => onChange({ ...draft, parameters })}
            idPrefix="sandbox-create"
            size="sm"
            showPreferencesMenu={false}
          />
        </section>
      )}
    </div>
  );
}

function ReviewStep({
  draft,
  credentials,
}: {
  draft: SpecRuntimeSandboxCreateDraft;
  credentials: SpecRuntimeSandboxCredential[];
}) {
  const selected = draft.credentialIds.map((id) => {
    const credential = credentials.find((item) => item.id === id);
    if (!credential)
      throw new Error(`unknown sandbox credential ${JSON.stringify(id)}`);
    return credential.label;
  });
  return (
    <div className="grid gap-density-4 md:grid-cols-2">
      <section className="rounded-md border border-border bg-card p-density-3">
        <h3 className="text-sm font-semibold">Backend</h3>
        <dl className="mt-density-3 grid grid-cols-[7rem_1fr] gap-density-2 text-sm">
          <dt className="text-muted-foreground">Name</dt>
          <dd className="font-mono">{draft.name.trim()}</dd>
          <dt className="text-muted-foreground">Type</dt>
          <dd className="font-mono">{draft.kind}</dd>
          <dt className="text-muted-foreground">Default</dt>
          <dd>{draft.setDefault ? "Yes" : "No"}</dd>
        </dl>
      </section>
      <section className="rounded-md border border-border bg-card p-density-3">
        <h3 className="text-sm font-semibold">Exposed connections</h3>
        <p className="mt-density-3 text-sm text-muted-foreground">
          {selected.length > 0 ? selected.join(", ") : "None"}
        </p>
      </section>
      <section className="md:col-span-2">
        <h3 className="mb-density-2 text-sm font-semibold">Parameters</h3>
        <pre className="overflow-auto rounded-md border border-border bg-muted/40 p-density-3 text-xs">
          {JSON.stringify(draft.parameters, null, 2)}
        </pre>
      </section>
    </div>
  );
}

function errorMessage(cause: unknown): string {
  if (cause instanceof Error && cause.message.trim()) return cause.message;
  return "Sandbox creation failed";
}
