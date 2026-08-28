import { useState, type ReactNode } from "react";

import { JsonSchemaForm, SegmentedControl } from "../../../components";
import type { JsonSchemaObject } from "../../../components/json-schema-form-types";
import { UiAdd, UiRepeat, UiRobotAi, UiWarningTriangle } from "../../../icons";
import { Icon } from "../../Icon";
import {
  SPEC_RUNTIME_FAMILIES,
  type RuntimeSpecSchema,
  type SpecRuntimeFamily,
} from "../../runtime/runtime-mode";
import { runtimeSchemaPropertyAtPath } from "../../runtime/runtime-field-support";
import {
  SPEC_PERMISSION_MODES,
  SPEC_SANDBOX_MODES,
  type AISpecRuntimeSandboxPolicy,
  type AISpecRuntimeValue,
  type SpecPermissionMode,
  type SpecSandboxMode,
} from "../SpecRuntimeEditor.model";
import { SandboxCreateWizard } from "../SandboxCreateWizard";
import type { SpecRuntimeSandboxCreateConfig } from "../SandboxCreateWizard.model";
import { sandboxKindMeta } from "../sandbox-kind-meta";
import {
  ListField,
  NumberField,
  SpecButton,
  SpecField,
  SpecSelect,
} from "./fields";
import { PermissionModeField } from "./PermissionModeField";
import type {
  SpecRuntimeSandboxBackend,
  SpecRuntimeSandboxCatalog,
} from "./types";
import {
  sandboxRef,
  withSandbox,
  withSandboxAgent,
  withSandboxBackend,
  withSandboxDispatch,
  withSandboxMode,
} from "./update";

function SandboxWarning({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="flex items-start gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-density-2 py-1.5 text-xs text-amber-700 dark:text-amber-300"
    >
      <Icon icon={UiWarningTriangle} className="mt-0.5 size-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function SandboxSection({
  value,
  onChange,
  schema,
  catalog,
  createConfig,
  families = SPEC_RUNTIME_FAMILIES,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  schema: RuntimeSpecSchema;
  catalog?: SpecRuntimeSandboxCatalog | undefined;
  createConfig?: SpecRuntimeSandboxCreateConfig | undefined;
  families?: SpecRuntimeFamily[] | undefined;
}) {
  const [creating, setCreating] = useState(false);
  const [createdBackends, setCreatedBackends] = useState<
    SpecRuntimeSandboxBackend[]
  >([]);
  const ref = sandboxRef(value);
  const modes = sandboxModes(schema);
  const mode = ref.mode ?? modes[0];
  if (!mode) throw new Error("the selected backend published no sandbox modes");
  const approvalModes = sandboxApprovalModes(schema);
  const backends = sandboxBackends(catalog, createdBackends, mode);
  const selectedBackend = backends.find(
    (backend) => backend.name === ref.backend,
  );
  const dispatchableAgents = (selectedBackend?.agents ?? []).filter(
    (agent) => agent.status === "enrolled" && agent.dispatchable,
  );

  return (
    <div className="grid gap-density-3">
      <SpecField label="Sandbox mode" composite>
        <SegmentedControl
          aria-label="Sandbox mode"
          value={mode}
          onChange={(next: SpecSandboxMode) =>
            onChange(withSandboxMode(value, next))
          }
          options={modes.map((item) => {
            const meta = sandboxKindMeta(item);
            return {
              id: item,
              label: meta.label,
              icon: meta.icon,
              ...(meta.description ? { description: meta.description } : {}),
              ...(meta.iconClassName
                ? { iconClassName: meta.iconClassName }
                : {}),
              ...(meta.activeClassName
                ? { activeClassName: meta.activeClassName }
                : {}),
            };
          })}
          size="lg"
          wrap
          className="w-full"
        />
      </SpecField>

      {mode !== "off" && approvalModes.length > 0 && (
        <PermissionModeField
          value={value}
          onChange={onChange}
          families={families}
          availableModes={approvalModes}
        />
      )}

      {mode === "native" && (
        <NativeSandboxSettings
          value={value}
          onChange={onChange}
          schema={schema}
        />
      )}

      {(mode === "docker" || mode === "git-agent") && (
        <ConfiguredBackendFields
          value={value}
          onChange={onChange}
          mode={mode}
          backends={backends}
          dispatchableAgents={dispatchableAgents.map((agent) => agent.name)}
          createConfig={createConfig}
          onCreate={() => setCreating(true)}
        />
      )}

      {mode === "git-agent" && workspaceIsolates(value) && (
        <SandboxWarning>
          Git Agent materializes its own working tree, so it cannot be combined
          with the checkout or worktree set in Workspace. Register exactly one
          isolator.
        </SandboxWarning>
      )}

      {createConfig && catalog && (
        <SandboxCreateWizard
          open={creating}
          catalog={catalog}
          config={createConfig}
          onClose={() => setCreating(false)}
          onCreated={(backend, input) => {
            const created = { ...backend, kind: backend.kind ?? input.kind };
            if (created.kind !== "docker" && created.kind !== "git-agent") {
              throw new Error(
                `created sandbox kind ${JSON.stringify(created.kind)} is not public`,
              );
            }
            setCreatedBackends((current) => [
              ...current.filter((item) => item.name !== created.name),
              created,
            ]);
            onChange(
              withSandboxBackend(
                withSandboxMode(value, created.kind),
                created.name,
              ),
            );
          }}
        />
      )}
    </div>
  );
}

function NativeSandboxSettings({
  value,
  onChange,
  schema,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  schema: RuntimeSpecSchema;
}) {
  const policySchema = runtimeSchemaPropertyAtPath(schema, "sandbox.policy");
  if (!policySchema) {
    throw new Error(
      "sandbox.mode native requires a published sandbox.policy schema",
    );
  }
  return (
    <JsonSchemaForm
      idPrefix="runtime-native-sandbox"
      schema={policySchema as JsonSchemaObject}
      value={(sandboxRef(value).policy ?? {}) as Record<string, unknown>}
      onChange={(policy) =>
        onChange(
          withSandbox(value, { policy: policy as AISpecRuntimeSandboxPolicy }),
        )
      }
      size="sm"
      showPreferencesMenu={false}
      persistPreferences={false}
    />
  );
}

function ConfiguredBackendFields({
  value,
  onChange,
  mode,
  backends,
  dispatchableAgents,
  createConfig,
  onCreate,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  mode: "docker" | "git-agent";
  backends: SpecRuntimeSandboxBackend[];
  dispatchableAgents: string[];
  createConfig?: SpecRuntimeSandboxCreateConfig | undefined;
  onCreate: () => void;
}) {
  const ref = sandboxRef(value);
  return (
    <div className="grid gap-density-3">
      <div className="flex flex-wrap items-end gap-density-3">
        <div className="min-w-56 flex-1">
          <SpecField label="Backend" composite>
            <SpecSelect
              ariaLabel="Sandbox backend"
              value={ref.backend ?? ""}
              onChange={(backend) =>
                onChange(withSandboxBackend(value, backend))
              }
              options={[
                { value: "", label: "Configured default" },
                ...backends.map((backend) => ({
                  value: backend.name,
                  label: backend.name,
                })),
              ]}
            />
          </SpecField>
        </div>
        {createConfig && (
          <SpecButton ariaLabel="Create sandbox" onClick={onCreate}>
            <Icon icon={UiAdd} className="size-3.5" />
            Create sandbox
          </SpecButton>
        )}
        {mode === "git-agent" && (
          <div className="min-w-48 flex-1">
            <SpecField
              label="Agent"
              hint={
                ref.backend && dispatchableAgents.length === 0
                  ? "none dispatchable"
                  : undefined
              }
              composite
            >
              <SpecSelect
                ariaLabel="Pinned agent"
                icon={UiRobotAi}
                value={ref.agent ?? ""}
                onChange={(agent) => onChange(withSandboxAgent(value, agent))}
                options={[
                  { value: "", label: "Any dispatchable agent" },
                  ...dispatchableAgents.map((agent) => ({
                    value: agent,
                    label: agent,
                  })),
                ]}
              />
            </SpecField>
          </div>
        )}
      </div>
      {mode === "git-agent" && (
        <div className="grid gap-density-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
          <ListField
            label="Included paths"
            value={ref.dispatch?.paths}
            onChange={(paths) =>
              onChange(withSandboxDispatch(value, { paths }))
            }
            placeholder={"pkg/**\n!**/*.pem"}
          />
          <NumberField
            label="Max attempts"
            value={ref.dispatch?.maxAttempts}
            onChange={(maxAttempts) =>
              onChange(
                withSandboxDispatch(value, { maxAttempts: maxAttempts ?? 0 }),
              )
            }
            icon={UiRepeat}
            min={0}
            step={1}
            integer
          />
        </div>
      )}
    </div>
  );
}

function sandboxModes(schema: RuntimeSpecSchema): SpecSandboxMode[] {
  const values = runtimeSchemaPropertyAtPath(schema, "sandbox.mode")?.enum;
  if (!Array.isArray(values))
    throw new Error("sandbox.mode must publish an enum");
  return values.map((value) => {
    if (
      typeof value !== "string" ||
      !SPEC_SANDBOX_MODES.includes(value as SpecSandboxMode)
    ) {
      throw new Error(
        `sandbox.mode published unsupported value ${JSON.stringify(value)}`,
      );
    }
    return value as SpecSandboxMode;
  });
}

function sandboxApprovalModes(schema: RuntimeSpecSchema): SpecPermissionMode[] {
  const values = runtimeSchemaPropertyAtPath(schema, "sandbox.approval")?.enum;
  if (values == null) return [];
  if (!Array.isArray(values))
    throw new Error("sandbox.approval must publish an enum");
  return values.map((value) => {
    if (
      typeof value !== "string" ||
      !SPEC_PERMISSION_MODES.includes(value as SpecPermissionMode)
    ) {
      throw new Error(
        `sandbox.approval published unsupported value ${JSON.stringify(value)}`,
      );
    }
    return value as SpecPermissionMode;
  });
}

function sandboxBackends(
  catalog: SpecRuntimeSandboxCatalog | undefined,
  additions: SpecRuntimeSandboxBackend[],
  mode: SpecSandboxMode,
) {
  const configured =
    catalog?.kinds?.find((kind) => kind.kind === mode)?.backends ?? [];
  return [...configured, ...additions].filter(
    (backend) => backend.kind === mode,
  );
}

function workspaceIsolates(value: AISpecRuntimeValue) {
  const checkout = value.setup?.checkout;
  if (!checkout) return false;
  return (
    (checkout.mode != null && checkout.mode !== "none") ||
    (checkout.worktree?.mode != null && checkout.worktree.mode !== "none")
  );
}
