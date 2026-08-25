import { useState, type ReactNode } from "react";

import {
  UiAdd,
  UiBox,
  UiRepeat,
  UiRobotAi,
  UiWarningTriangle,
} from "../../../icons";
import { Icon } from "../../Icon";
import {
  SPEC_RUNTIME_FAMILIES,
  modeForBackend,
  type SpecRuntimeFamily,
} from "../../runtime/runtime-mode";
import type {
  AISpecRuntimeValue,
  SpecSandboxCapability,
} from "../SpecRuntimeEditor.model";
import { SandboxCreateWizard } from "../SandboxCreateWizard";
import type { SpecRuntimeSandboxCreateConfig } from "../SandboxCreateWizard.model";
import { sandboxKindMeta } from "../sandbox-kind-meta";
import {
  CheckboxField,
  Disclosure,
  ListField,
  NumberField,
  SpecButton,
  SpecField,
  SpecSelect,
} from "./fields";
import type {
  SpecRuntimeSandboxBackend,
  SpecRuntimeSandboxCatalog,
} from "./types";
import {
  sandboxRef,
  withConnections,
  withSandbox,
  withSandboxBackend,
  withSandboxPolicy,
} from "./update";

/** One selectable entry, flattened from the catalog's kinds + their backends. */
type SandboxOption = {
  selector: string;
  kind: string;
  label: string;
  description: string;
  capabilities: SpecSandboxCapability[];
  modes: string[];
  agents: string[];
};

function flattenCatalog(
  catalog: SpecRuntimeSandboxCatalog,
  additions: SpecRuntimeSandboxBackend[],
): SandboxOption[] {
  // A configured backend shadows a bare kind of the same name, because captain's
  // SandboxDefaults.Resolve looks in Backends before adapter kinds. Both entries
  // would write the identical selector, so emitting the kind too offers one
  // choice twice — and the roster-less kind entry wins the `selected` lookup
  // below, hiding the backend's enrolled agents.
  const shadowed = new Set<string>();
  for (const kind of catalog.kinds ?? []) {
    for (const backend of kind.backends ?? []) shadowed.add(backend.name);
  }
  for (const backend of additions) shadowed.add(backend.name);

  const options: SandboxOption[] = [];
  for (const kind of catalog.kinds ?? []) {
    const meta = sandboxKindMeta(kind.kind);
    if (!shadowed.has(kind.kind)) {
      options.push({
        selector: kind.kind,
        kind: kind.kind,
        label: meta.label,
        description: kind.description ?? "",
        capabilities: kind.capabilities ?? [],
        modes: kind.modes ?? [],
        agents: [],
      });
    }
    for (const backend of kind.backends ?? []) {
      options.push({
        selector: backend.name,
        kind: kind.kind,
        // A configured backend is only meaningful next to the adapter it selects.
        label: `${backend.name} (${meta.label})`,
        description: kind.description ?? "",
        capabilities: kind.capabilities ?? [],
        modes: kind.modes ?? [],
        agents: (backend.agents ?? [])
          .filter((agent) => agent.status === "enrolled" && agent.dispatchable)
          .map((agent) => agent.name),
      });
    }
  }
  const selectors = new Set(options.map((option) => option.selector));
  for (const backend of additions) {
    if (selectors.has(backend.name)) continue;
    const kind = catalog.kinds?.find((item) => item.kind === backend.kind);
    if (!kind) continue;
    options.push({
      selector: backend.name,
      kind: kind.kind,
      label: `${backend.name} (${sandboxKindMeta(kind.kind).label})`,
      description: kind.description ?? "",
      capabilities: kind.capabilities ?? [],
      modes: kind.modes ?? [],
      agents: (backend.agents ?? [])
        .filter((agent) => agent.status === "enrolled" && agent.dispatchable)
        .map((agent) => agent.name),
    });
  }
  return options;
}

function has(
  option: SandboxOption | undefined,
  capability: SpecSandboxCapability,
) {
  return option?.capabilities.includes(capability) ?? false;
}

/**
 * True when the Workspace section already establishes a working tree. A sandbox
 * declaring `isolate-workspace` materializes its own, and captain refuses to
 * register two isolators for one run.
 */
function workspaceIsolates(value: AISpecRuntimeValue) {
  const checkout = value.setup?.checkout;
  if (!checkout) return false;
  const worktree = checkout.worktree?.mode;
  return (
    (checkout.mode != null && checkout.mode !== "none") ||
    (worktree != null && worktree !== "none")
  );
}

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
  catalog,
  createConfig,
  // Same fallback as ModelSection: without it a host that does not pass a
  // catalog cannot resolve the runtime mode, and the pairing check goes silent.
  families = SPEC_RUNTIME_FAMILIES,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  catalog: SpecRuntimeSandboxCatalog;
  createConfig?: SpecRuntimeSandboxCreateConfig | undefined;
  families?: SpecRuntimeFamily[] | undefined;
}) {
  const [creating, setCreating] = useState(false);
  const [createdBackends, setCreatedBackends] = useState<
    SpecRuntimeSandboxBackend[]
  >([]);
  const options = flattenCatalog(catalog, createdBackends);
  const ref = sandboxRef(value);
  const selected = options.find((option) => option.selector === ref.backend);
  // The spec carries no runtime mode of its own — the Model section's two-axis
  // picker writes a concrete `backend`, and the mode is the axis it came from.
  const mode = modeForBackend(families, value.backend)?.id ?? "";

  // The descriptor table declares which runtime modes an adapter can serve, and
  // captain rejects a pairing outside it before the run starts. Surfacing it
  // here turns a dispatch-time failure into a visible one.
  const modeUnsupported =
    selected != null &&
    mode !== "" &&
    selected.modes.length > 0 &&
    !selected.modes.includes(mode);

  const remote = has(selected, "remote-exec");
  const isolates = has(selected, "isolate-workspace");

  return (
    <div className="grid gap-density-3">
      <div className="flex flex-wrap items-end gap-density-3">
        <div className="min-w-56 flex-1">
          <SpecField
            label="Sandbox"
            hint={catalog.default ? `default: ${catalog.default}` : undefined}
            composite
          >
            <SpecSelect
              ariaLabel="Sandbox"
              value={ref.backend ?? ""}
              onChange={(backend) =>
                onChange(withSandboxBackend(value, backend))
              }
              options={[
                {
                  value: "",
                  label: `Inherit (${catalog.default || "none"})`,
                  icon: <UiBox />,
                },
                ...options.map((option) => {
                  const KindIcon = sandboxKindMeta(option.kind).icon;
                  return {
                    value: option.selector,
                    label: option.label,
                    ...(option.description
                      ? { description: option.description }
                      : {}),
                    icon: <KindIcon />,
                  };
                }),
              ]}
            />
          </SpecField>
        </div>
        {createConfig && (
          <SpecButton
            ariaLabel="Create sandbox"
            onClick={() => setCreating(true)}
          >
            <Icon icon={UiAdd} className="size-3.5" />
            Create sandbox
          </SpecButton>
        )}
        {remote && (
          <div className="min-w-48 flex-1">
            <SpecField
              label="Agent"
              hint={selected?.agents.length ? undefined : "none dispatchable"}
              composite
            >
              <SpecSelect
                ariaLabel="Pinned agent"
                icon={UiRobotAi}
                value={ref.agent ?? ""}
                onChange={(agent) => onChange(withSandbox(value, { agent }))}
                options={[
                  { value: "", label: "Any dispatchable agent" },
                  ...(selected?.agents ?? []).map((agent) => ({
                    value: agent,
                    label: agent,
                  })),
                ]}
              />
            </SpecField>
          </div>
        )}
      </div>

      {selected?.description && (
        <p className="text-xs text-muted-foreground">{selected.description}</p>
      )}

      {selected && selected.capabilities.length > 0 && (
        <ul className="flex flex-wrap gap-1" aria-label="Sandbox capabilities">
          {selected.capabilities.map((capability) => (
            <li
              key={capability}
              className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              {capability}
            </li>
          ))}
        </ul>
      )}

      {modeUnsupported && (
        <SandboxWarning>
          Sandbox <code>{ref.backend}</code> does not support runtime mode{" "}
          <code>{mode}</code>; it supports {selected?.modes.join(", ")}.
        </SandboxWarning>
      )}

      {isolates && workspaceIsolates(value) && (
        <SandboxWarning>
          <code>{ref.backend}</code> materializes its own working tree, so it
          cannot be combined with the checkout or worktree set in Workspace.
          Register exactly one isolator.
        </SandboxWarning>
      )}

      <Disclosure label="Execution identity" hint="service accounts">
        <div className="grid gap-density-2 sm:grid-cols-2">
          <CheckboxField
            label="Kubernetes service account"
            checked={value.setup?.connections?.serviceAccount}
            onChange={(serviceAccount) =>
              onChange(withConnections(value, { serviceAccount }))
            }
          />
          <CheckboxField
            label="EKS pod identity"
            checked={value.setup?.connections?.eksPodIdentity}
            onChange={(eksPodIdentity) =>
              onChange(withConnections(value, { eksPodIdentity }))
            }
          />
        </div>
      </Disclosure>

      {selected && (
        <Disclosure label="Policy" hint="paths, attempts">
          <div className="grid gap-density-3">
            <ListField
              label="Paths"
              value={ref.policy?.paths}
              onChange={(paths) =>
                onChange(withSandboxPolicy(value, { paths }))
              }
              placeholder={"pkg/**\n!**/*.pem"}
            />
            <div className="w-40">
              <NumberField
                label="Max attempts"
                value={ref.policy?.maxAttempts}
                onChange={(maxAttempts) =>
                  onChange(
                    withSandboxPolicy(value, { maxAttempts: maxAttempts ?? 0 }),
                  )
                }
                icon={UiRepeat}
                min={0}
                step={1}
                integer
              />
            </div>
          </div>
        </Disclosure>
      )}
      {createConfig && (
        <SandboxCreateWizard
          open={creating}
          catalog={catalog}
          config={createConfig}
          onClose={() => setCreating(false)}
          onCreated={(backend, input) => {
            const created = { ...backend, kind: backend.kind ?? input.kind };
            setCreatedBackends((current) => [
              ...current.filter((item) => item.name !== created.name),
              created,
            ]);
            onChange(withSandboxBackend(value, created.name));
          }}
        />
      )}
    </div>
  );
}
