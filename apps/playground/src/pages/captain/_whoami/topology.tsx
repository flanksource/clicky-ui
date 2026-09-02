import { useState } from "react";
import { Badge } from "@flanksource/clicky-ui";

import { RUNTIME_ADAPTERS } from "./topology-fixture";
import {
  groupRuntimesByProvider,
  runtimeKey,
  runtimeModelKey,
  type RuntimeAdapter,
  type RuntimeModel,
  type RuntimeProvider,
} from "./topology-model";
import { PageLead } from "./topology-parts";
import { CapabilityTreePicker } from "./topology-picker";
import { ProviderTreeNode, type TreeSelection } from "./topology-tree";

const PROVIDERS = groupRuntimesByProvider(RUNTIME_ADAPTERS);

function firstRuntime(provider: RuntimeProvider): RuntimeAdapter {
  const adapter = provider.adapters[0];
  if (!adapter) throw new Error(`Provider ${provider.id} has no runtimes`);
  return adapter;
}

function initialProviderAvailability(): Record<string, boolean> {
  return Object.fromEntries(
    PROVIDERS.map((provider) => [
      provider.id,
      provider.adapters.some((adapter) => !adapter.disabled),
    ]),
  );
}

function initialRuntimeAvailability(): Record<string, boolean> {
  return Object.fromEntries(
    RUNTIME_ADAPTERS.map((adapter) => [runtimeKey(adapter), !adapter.disabled]),
  );
}

function initialModelAvailability(): Record<string, boolean> {
  return Object.fromEntries(
    RUNTIME_ADAPTERS.flatMap((adapter) =>
      adapter.models.map((model) => [
        runtimeModelKey(adapter, model.id),
        model.enabled,
      ]),
    ),
  );
}

function toggleMember(current: Set<string>, id: string): Set<string> {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

export function CapabilityTopology() {
  const initialProvider = PROVIDERS.find(
    (provider) => provider.id === "openai",
  );
  if (!initialProvider)
    throw new Error("OpenAI provider is missing from fixture");
  const initialRuntime = firstRuntime(initialProvider);
  const [providerId, setProviderId] = useState(initialProvider.id);
  const [runtimeId, setRuntimeId] = useState(runtimeKey(initialRuntime));
  const [modelId, setModelId] = useState(initialRuntime.models[0]?.id ?? "");
  const [selectedNode, setSelectedNode] = useState<TreeSelection>({
    kind: "model",
    id: runtimeModelKey(initialRuntime, modelId),
  });
  const [expandedProviders, setExpandedProviders] = useState(
    () => new Set([initialProvider.id]),
  );
  const [expandedRuntimes, setExpandedRuntimes] = useState(
    () => new Set([runtimeKey(initialRuntime)]),
  );
  const [providerEnabled, setProviderEnabled] = useState(
    initialProviderAvailability,
  );
  const [runtimeEnabled, setRuntimeEnabled] = useState(
    initialRuntimeAvailability,
  );
  const [modelEnabled, setModelEnabled] = useState(initialModelAvailability);
  const provider = PROVIDERS.find((entry) => entry.id === providerId);
  if (!provider) throw new Error(`Unknown provider: ${providerId}`);
  const runtime = provider.adapters.find(
    (entry) => runtimeKey(entry) === runtimeId,
  );
  if (!runtime) throw new Error(`Unknown runtime ${runtimeId}`);
  const model = runtime.models.find((entry) => entry.id === modelId);

  const selectProvider = (next: RuntimeProvider) => {
    const nextRuntime = firstRuntime(next);
    setProviderId(next.id);
    setRuntimeId(runtimeKey(nextRuntime));
    setModelId(nextRuntime.models[0]?.id ?? "");
    setSelectedNode({ kind: "provider", id: next.id });
    setExpandedProviders((current) => new Set(current).add(next.id));
  };

  const selectRuntime = (next: RuntimeAdapter) => {
    const nextRuntimeId = runtimeKey(next);
    setProviderId(next.provider);
    setRuntimeId(nextRuntimeId);
    setModelId(next.models[0]?.id ?? "");
    setSelectedNode({ kind: "runtime", id: nextRuntimeId });
    setExpandedRuntimes((current) => new Set(current).add(nextRuntimeId));
  };

  const selectModel = (nextRuntime: RuntimeAdapter, next: RuntimeModel) => {
    const nextRuntimeId = runtimeKey(nextRuntime);
    setProviderId(nextRuntime.provider);
    setRuntimeId(nextRuntimeId);
    setModelId(next.id);
    setSelectedNode({
      kind: "model",
      id: runtimeModelKey(nextRuntime, next.id),
    });
    setExpandedProviders((current) =>
      new Set(current).add(nextRuntime.provider),
    );
    setExpandedRuntimes((current) => new Set(current).add(nextRuntimeId));
  };

  const providerAvailable = providerEnabled[provider.id] === true;
  const runtimeAvailable = runtimeEnabled[runtimeKey(runtime)] === true;
  const modelAvailable =
    model !== undefined &&
    modelEnabled[runtimeModelKey(runtime, model.id)] === true;

  return (
    <div className="grid gap-density-4">
      <PageLead>
        Expand a provider, runtime, or model in one hierarchy. Select a row to
        inspect its resolved values; use its checkbox to change whether Captain
        may select it.
      </PageLead>
      <AvailabilitySummary
        providerEnabled={providerEnabled}
        runtimeEnabled={runtimeEnabled}
        modelEnabled={modelEnabled}
      />
      <CapabilityTreePicker
        selectedRuntime={runtime}
        selectedModel={model}
        providerEnabled={providerEnabled}
        runtimeEnabled={runtimeEnabled}
        modelEnabled={modelEnabled}
        onSelect={selectModel}
      />
      <div className="grid items-start gap-density-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="overflow-hidden rounded-lg border border-border bg-background">
          <header className="border-b border-border bg-muted/20 px-density-4 py-density-3">
            <h2 className="text-sm font-semibold">Runtime capability tree</h2>
            <p className="mt-density-1 text-xs text-muted-foreground">
              Availability is inherited down the tree without erasing child
              selections.
            </p>
          </header>
          <div
            role="tree"
            aria-label="Capability topology"
            className="grid gap-density-1 p-density-2"
          >
            {PROVIDERS.map((entry) => (
              <ProviderTreeNode
                key={entry.id}
                provider={entry}
                selectedNode={selectedNode}
                expandedProviders={expandedProviders}
                expandedRuntimes={expandedRuntimes}
                providerEnabled={providerEnabled}
                runtimeEnabled={runtimeEnabled}
                modelEnabled={modelEnabled}
                onSelectProvider={selectProvider}
                onSelectRuntime={selectRuntime}
                onSelectModel={selectModel}
                onToggleProvider={(id) =>
                  setExpandedProviders((current) => toggleMember(current, id))
                }
                onToggleRuntime={(id) =>
                  setExpandedRuntimes((current) => toggleMember(current, id))
                }
                onProviderEnabled={(id, enabled) =>
                  setProviderEnabled((current) => ({
                    ...current,
                    [id]: enabled,
                  }))
                }
                onRuntimeEnabled={(id, enabled) =>
                  setRuntimeEnabled((current) => ({
                    ...current,
                    [id]: enabled,
                  }))
                }
                onModelEnabled={(nextRuntime, id, enabled) =>
                  setModelEnabled((current) => ({
                    ...current,
                    [runtimeModelKey(nextRuntime, id)]: enabled,
                  }))
                }
              />
            ))}
          </div>
        </section>
        <TopologyInspector
          runtime={runtime}
          model={model}
          providerAvailable={providerAvailable}
          runtimeAvailable={runtimeAvailable}
          modelAvailable={modelAvailable}
        />
      </div>
    </div>
  );
}

function AvailabilitySummary({
  providerEnabled,
  runtimeEnabled,
  modelEnabled,
}: {
  providerEnabled: Record<string, boolean>;
  runtimeEnabled: Record<string, boolean>;
  modelEnabled: Record<string, boolean>;
}) {
  const providers = PROVIDERS.filter(
    (provider) => providerEnabled[provider.id],
  ).length;
  const runtimes = RUNTIME_ADAPTERS.filter(
    (adapter) =>
      providerEnabled[adapter.provider] && runtimeEnabled[runtimeKey(adapter)],
  ).length;
  const models = Object.values(modelEnabled).filter(Boolean).length;
  return (
    <div
      className="flex flex-wrap gap-density-2"
      aria-label="Enabled catalog summary"
    >
      <Badge variant="outline" tone="info" clickToCopy={false}>
        {providers}/{PROVIDERS.length} providers enabled
      </Badge>
      <Badge variant="outline" tone="success" clickToCopy={false}>
        {runtimes}/{RUNTIME_ADAPTERS.length} runtimes selectable
      </Badge>
      <Badge variant="outline" clickToCopy={false}>
        {models} fixture models enabled
      </Badge>
    </div>
  );
}

function TopologyInspector({
  runtime,
  model,
  providerAvailable,
  runtimeAvailable,
  modelAvailable,
}: {
  runtime: RuntimeAdapter;
  model: RuntimeModel | undefined;
  providerAvailable: boolean;
  runtimeAvailable: boolean;
  modelAvailable: boolean;
}) {
  const status = !providerAvailable
    ? "Excluded by provider policy"
    : !runtimeAvailable
      ? "Excluded by runtime policy"
      : model === undefined
        ? "No model reported"
        : !modelAvailable
          ? "Excluded by model policy"
          : "Available to Captain";
  const pathAvailable = providerAvailable && runtimeAvailable && modelAvailable;
  return (
    <aside className="rounded-lg border border-border bg-background p-density-4 lg:sticky lg:top-4">
      <h2 className="text-sm font-semibold">Resolved values</h2>
      <dl className="mt-density-3 grid gap-density-2 text-xs">
        <ResolvedValue label="Provider" value={runtime.providerLabel} />
        <ResolvedValue label="Mode" value={runtime.mode.toUpperCase()} />
        <ResolvedValue
          label="Model"
          value={model?.label ?? "No model reported"}
        />
        <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-density-2 border-t border-border pt-density-2">
          <dt className="text-muted-foreground">Availability</dt>
          <dd>
            <Badge
              size="xs"
              tone={pathAvailable ? "success" : "warning"}
              clickToCopy={false}
            >
              {status}
            </Badge>
          </dd>
        </div>
        <ResolvedValue label="Authentication" value={runtime.auth} />
        <ResolvedValue
          label="Reported models"
          value={String(runtime.modelCount)}
        />
      </dl>
    </aside>
  );
}

function ResolvedValue({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-density-2 border-t border-border pt-density-2 first:border-t-0 first:pt-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono" : undefined}>{value}</dd>
    </div>
  );
}
