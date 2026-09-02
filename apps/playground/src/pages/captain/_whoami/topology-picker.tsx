import { ResourceIcon as ProviderIcon } from "@flanksource/icons/icon";
import { Badge, TreePickerField, cn } from "@flanksource/clicky-ui";
import {
  AGENT_RUNTIME_ICONS,
  SESSION_TONES,
  WORKFLOW_PHASES,
  type AgentRuntime,
} from "@flanksource/clicky-ui/ai";
import { UiBrain } from "@flanksource/clicky-ui/icons";

import { RUNTIME_ADAPTERS } from "./topology-fixture";
import {
  groupRuntimesByProvider,
  providerIconName,
  runtimeKey,
  runtimeLabel,
  runtimeModelKey,
  type RuntimeAdapter,
  type RuntimeMode,
  type RuntimeModel,
} from "./topology-model";

type CapabilityPickerNode = {
  key: string;
  kind: "provider" | "runtime" | "model";
  label: string;
  providerId: string;
  adapter?: RuntimeAdapter;
  model?: RuntimeModel;
  children: CapabilityPickerNode[];
};

const RUNTIME_CLASS: Record<RuntimeMode, AgentRuntime> = {
  api: "api",
  agent: "sdk",
  cli: "terminal",
  cmux: "terminal",
};

const PICKER_ROOTS: CapabilityPickerNode[] = groupRuntimesByProvider(
  RUNTIME_ADAPTERS,
).map((provider) => ({
  key: `provider:${provider.id}`,
  kind: "provider",
  label: provider.label,
  providerId: provider.id,
  children: provider.adapters.map((adapter) => ({
    key: `runtime:${runtimeKey(adapter)}`,
    kind: "runtime",
    label: runtimeLabel(adapter),
    providerId: provider.id,
    adapter,
    children: adapter.models.map((model) => ({
      key: `model:${runtimeModelKey(adapter, model.id)}`,
      kind: "model",
      label: model.label,
      providerId: provider.id,
      adapter,
      model,
      children: [],
    })),
  })),
}));

function findNode(key: string): CapabilityPickerNode {
  const pending = [...PICKER_ROOTS];
  while (pending.length > 0) {
    const node = pending.pop();
    if (!node) throw new Error("Capability picker traversal lost a node");
    if (node.key === key) return node;
    pending.push(...node.children);
  }
  throw new Error(`Capability picker node not found: ${key}`);
}

function adapterFor(node: CapabilityPickerNode): RuntimeAdapter {
  if (!node.adapter) {
    throw new Error(`Capability picker ${node.key} has no runtime adapter`);
  }
  return node.adapter;
}

function modelFor(node: CapabilityPickerNode): RuntimeModel {
  if (!node.model) {
    throw new Error(`Capability picker ${node.key} has no model`);
  }
  return node.model;
}

export function CapabilityTreePicker({
  selectedRuntime,
  selectedModel,
  providerEnabled,
  runtimeEnabled,
  modelEnabled,
  onSelect,
}: {
  selectedRuntime: RuntimeAdapter;
  selectedModel: RuntimeModel | undefined;
  providerEnabled: Record<string, boolean>;
  runtimeEnabled: Record<string, boolean>;
  modelEnabled: Record<string, boolean>;
  onSelect: (adapter: RuntimeAdapter, model: RuntimeModel) => void;
}) {
  const selectedNode = selectedModel
    ? findNode(`model:${runtimeModelKey(selectedRuntime, selectedModel.id)}`)
    : null;
  const RunIcon = WORKFLOW_PHASES.run.icon;
  const selectedRuntimeMeta =
    AGENT_RUNTIME_ICONS[RUNTIME_CLASS[selectedRuntime.mode]];
  const SelectedRuntimeIcon = selectedRuntimeMeta.icon;

  const available = (node: CapabilityPickerNode): boolean => {
    if (node.kind !== "model") return false;
    const adapter = adapterFor(node);
    const model = modelFor(node);
    return (
      providerEnabled[node.providerId] === true &&
      runtimeEnabled[runtimeKey(adapter)] === true &&
      modelEnabled[runtimeModelKey(adapter, model.id)] === true
    );
  };

  return (
    <section className="flex flex-wrap items-end gap-density-4 rounded-lg border border-border bg-muted/20 p-density-3">
      <div className="min-w-64 flex-1 sm:max-w-md">
        <div className="mb-density-1 text-xs font-medium">Run model</div>
        <TreePickerField<CapabilityPickerNode>
          roots={PICKER_ROOTS}
          getKey={(node) => node.key}
          getChildren={(node) => node.children}
          defaultOpen={() => false}
          getSearchText={(node) =>
            `${node.label} ${node.providerId} ${node.adapter?.mode ?? ""} ${node.model?.id ?? ""}`
          }
          isSelectable={available}
          onSelect={(node) => onSelect(adapterFor(node), modelFor(node))}
          selected={selectedNode}
          revealSelected
          showControls
          ariaLabel="Run model"
          label={
            <span className="flex min-w-0 items-center gap-density-2">
              <RunIcon
                className={cn(
                  "size-4 shrink-0",
                  SESSION_TONES[WORKFLOW_PHASES.run.tone].text,
                )}
              />
              <span className="shrink-0">Run model</span>
              <span
                data-provider-icon={selectedRuntime.provider}
                className="grid size-5 shrink-0 place-items-center"
                aria-hidden="true"
              >
                <ProviderIcon
                  primary={providerIconName(selectedRuntime.provider)}
                  className="size-4"
                  alt=""
                />
              </span>
              <span
                data-agent-type-icon={RUNTIME_CLASS[selectedRuntime.mode]}
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full",
                  SESSION_TONES[selectedRuntimeMeta.tone].disc,
                )}
                aria-hidden="true"
              >
                <SelectedRuntimeIcon className="size-3.5" />
              </span>
              <span className="min-w-0 truncate font-semibold">
                {selectedModel?.label ?? "No model reported"}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                via {runtimeLabel(selectedRuntime)}
              </span>
            </span>
          }
          renderRow={(context) => (
            <CapabilityPickerRow
              {...context}
              available={available(context.node)}
            />
          )}
        />
      </div>
      <p className="max-w-xl text-xs text-muted-foreground">
        Browse provider → runtime → model in a form field. Only models that
        remain enabled across all three levels can be selected.
      </p>
    </section>
  );
}

function CapabilityPickerRow({
  node,
  selected,
  available,
}: {
  node: CapabilityPickerNode;
  selected: boolean;
  available: boolean;
}) {
  if (node.kind === "provider") {
    return (
      <span className="flex min-w-0 flex-1 items-center gap-density-2">
        <ProviderIcon
          primary={providerIconName(node.providerId)}
          className="size-4 shrink-0"
          alt=""
        />
        <span className="min-w-0 flex-1 truncate font-semibold">
          {node.label}
        </span>
        <span className="text-[11px] text-muted-foreground">
          {node.children.length} runtimes
        </span>
      </span>
    );
  }

  if (node.kind === "runtime") {
    const adapter = adapterFor(node);
    const meta = AGENT_RUNTIME_ICONS[RUNTIME_CLASS[adapter.mode]];
    const RuntimeIcon = meta.icon;
    return (
      <span className="flex min-w-0 flex-1 items-center gap-density-2">
        <span
          className={cn(
            "grid size-6 shrink-0 place-items-center rounded-full",
            SESSION_TONES[meta.tone].disc,
          )}
        >
          <RuntimeIcon className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-xs font-semibold">
          {adapter.mode.toUpperCase()} runtime
        </span>
      </span>
    );
  }

  const adapter = adapterFor(node);
  const model = modelFor(node);
  return (
    <span
      className={cn(
        "flex min-w-0 flex-1 items-center gap-density-2",
        !available && "opacity-50",
      )}
    >
      <UiBrain
        className={cn(
          "size-4 shrink-0",
          selected ? "text-primary" : "text-muted-foreground",
        )}
      />
      <span className="min-w-0 flex-1 truncate">{model.label}</span>
      <span className="truncate font-mono text-[11px] text-muted-foreground">
        {model.id}
      </span>
      {!available && (
        <Badge size="xxs" tone="warning" clickToCopy={false}>
          Disabled
        </Badge>
      )}
      <span className="sr-only">via {runtimeLabel(adapter)}</span>
    </span>
  );
}
