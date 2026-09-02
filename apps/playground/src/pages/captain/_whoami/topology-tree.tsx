import type { ReactNode } from "react";
import { Badge, Button, cn } from "@flanksource/clicky-ui";

import {
  runtimeKey,
  runtimeLabel,
  runtimeModelKey,
  type RuntimeAdapter,
  type RuntimeModel,
  type RuntimeProvider,
} from "./topology-model";
import { ProviderLogo } from "./provider-logo";
import { RuntimeGlyph, RuntimeStatus } from "./topology-parts";

export type TreeSelection = {
  kind: "provider" | "runtime" | "model";
  id: string;
};

type TreeState = {
  selectedNode: TreeSelection;
  expandedProviders: Set<string>;
  expandedRuntimes: Set<string>;
  providerEnabled: Record<string, boolean>;
  runtimeEnabled: Record<string, boolean>;
  modelEnabled: Record<string, boolean>;
  onSelectProvider: (provider: RuntimeProvider) => void;
  onSelectRuntime: (adapter: RuntimeAdapter) => void;
  onSelectModel: (adapter: RuntimeAdapter, model: RuntimeModel) => void;
  onToggleProvider: (id: string) => void;
  onToggleRuntime: (id: string) => void;
  onProviderEnabled: (id: string, enabled: boolean) => void;
  onRuntimeEnabled: (id: string, enabled: boolean) => void;
  onModelEnabled: (
    adapter: RuntimeAdapter,
    id: string,
    enabled: boolean,
  ) => void;
};

export function ProviderTreeNode({
  provider,
  ...state
}: TreeState & { provider: RuntimeProvider }) {
  const expanded = state.expandedProviders.has(provider.id);
  const enabled = state.providerEnabled[provider.id] === true;
  const selected =
    state.selectedNode.kind === "provider" &&
    state.selectedNode.id === provider.id;
  return (
    <div role="treeitem" aria-expanded={expanded} aria-selected={selected}>
      <TreeRow active={selected} enabled={enabled}>
        <DisclosureButton
          expanded={expanded}
          label={`${provider.label} provider`}
          onClick={() => state.onToggleProvider(provider.id)}
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => state.onSelectProvider(provider)}
          className="h-8 min-w-0 flex-1 justify-start px-density-2 text-left"
        >
          <ProviderLogo provider={provider} />
          <span className="min-w-0 flex-1 truncate text-xs font-semibold">
            {provider.label}
          </span>
          <span className="shrink-0 text-[11px] font-normal text-muted-foreground">
            {provider.adapters.length} runtimes · {provider.modelCount} models
          </span>
        </Button>
        <AvailabilityCheckbox
          label={`Enable ${provider.label} provider`}
          checked={enabled}
          onChange={(checked) => state.onProviderEnabled(provider.id, checked)}
        />
      </TreeRow>
      {expanded && (
        <div
          role="group"
          className="ml-density-5 border-l border-border pl-density-2"
        >
          {provider.adapters.map((adapter) => (
            <RuntimeTreeNode
              key={runtimeKey(adapter)}
              adapter={adapter}
              {...state}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RuntimeTreeNode({
  adapter,
  ...state
}: TreeState & { adapter: RuntimeAdapter }) {
  const adapterId = runtimeKey(adapter);
  const label = runtimeLabel(adapter);
  const expanded = state.expandedRuntimes.has(adapterId);
  const enabled = state.runtimeEnabled[adapterId] === true;
  const hasModels = adapter.models.length > 0;
  const selected =
    state.selectedNode.kind === "runtime" &&
    state.selectedNode.id === adapterId;
  return (
    <div
      role="treeitem"
      aria-expanded={hasModels ? expanded : undefined}
      aria-selected={selected}
    >
      <TreeRow active={selected} enabled={enabled}>
        {hasModels ? (
          <DisclosureButton
            expanded={expanded}
            label={`${label} runtime`}
            onClick={() => state.onToggleRuntime(adapterId)}
          />
        ) : (
          <span className="size-7 shrink-0" />
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => state.onSelectRuntime(adapter)}
          className="h-8 min-w-0 flex-1 justify-start px-density-2 text-left"
        >
          <RuntimeGlyph adapter={adapter} />
          <span className="min-w-0 flex-1 truncate text-xs font-semibold">
            {adapter.mode.toUpperCase()} runtime
          </span>
          <RuntimeStatus adapter={adapter} enabled={enabled} />
        </Button>
        <AvailabilityCheckbox
          label={`Enable ${label} runtime`}
          checked={enabled}
          onChange={(checked) => state.onRuntimeEnabled(adapterId, checked)}
        />
      </TreeRow>
      {hasModels && expanded && (
        <div
          role="group"
          className="ml-density-5 border-l border-border pl-density-2"
        >
          {adapter.models.map((model) => (
            <ModelTreeNode
              key={model.id}
              adapter={adapter}
              model={model}
              {...state}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ModelTreeNode({
  adapter,
  model,
  ...state
}: TreeState & { adapter: RuntimeAdapter; model: RuntimeModel }) {
  const enabled =
    state.modelEnabled[runtimeModelKey(adapter, model.id)] === true;
  const selected =
    state.selectedNode.kind === "model" &&
    state.selectedNode.id === runtimeModelKey(adapter, model.id);
  return (
    <div role="treeitem" aria-selected={selected}>
      <TreeRow active={selected} enabled={enabled}>
        <span className="size-7 shrink-0" />
        <Button
          type="button"
          variant="ghost"
          onClick={() => state.onSelectModel(adapter, model)}
          className="h-8 min-w-0 flex-1 justify-start overflow-hidden px-density-2 text-left"
        >
          <span className="min-w-0 flex-1 truncate text-xs font-semibold">
            {model.label}
          </span>
          <span className="min-w-0 truncate font-mono text-[11px] font-normal text-muted-foreground">
            {model.id}
          </span>
          {model.capabilities?.map((capability) => (
            <Badge
              key={capability}
              size="xxs"
              variant="outline"
              clickToCopy={false}
            >
              {capability}
            </Badge>
          ))}
        </Button>
        <AvailabilityCheckbox
          label={`Enable ${model.id} model`}
          checked={enabled}
          onChange={(checked) =>
            state.onModelEnabled(adapter, model.id, checked)
          }
        />
      </TreeRow>
    </div>
  );
}

function TreeRow({
  active,
  enabled,
  children,
}: {
  active: boolean;
  enabled: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-9 min-w-0 items-center rounded-md border pr-density-2",
        active ? "border-primary/50 bg-primary/10" : "border-transparent",
        !enabled && "border-dashed opacity-60",
      )}
    >
      {children}
    </div>
  );
}

function DisclosureButton({
  expanded,
  label,
  onClick,
}: {
  expanded: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label={`${expanded ? "Collapse" : "Expand"} ${label}`}
      aria-expanded={expanded}
      onClick={onClick}
      className="size-7 shrink-0"
    >
      {expanded ? "−" : "+"}
    </Button>
  );
}

function AvailabilityCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      title={label}
      className="size-4 shrink-0 accent-primary"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
    />
  );
}
