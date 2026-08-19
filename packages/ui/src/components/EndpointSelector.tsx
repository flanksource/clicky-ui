import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { UiWarningTriangle } from "../icons";
import { Combobox, type ComboboxOption } from "./Combobox";
import {
  DEFAULT_PREFERRED_ENDPOINT_PORTS,
  preferredEndpointPort,
} from "./endpoint-port";
import { Field } from "./Field";
import { InputField } from "./InputField";
import { SecretKeySelector } from "./SecretKeySelector";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl";
import { WorkloadPicker } from "./WorkloadPicker";
import {
  parseWorkloadKey,
  workloadKey,
  type WorkloadKind,
  type WorkloadResource,
} from "./workload-picker-utils";
import type {
  EndpointMode,
  EndpointResources,
  EndpointSelectorProps,
  EndpointSelectorValue,
  EndpointTarget,
  EndpointWorkloadValue,
  EndpointWorkloadMode,
} from "./EndpointSelector.model";
const MODE_LABELS: Record<EndpointMode, string> = {
  url: "URL",
  service: "Service",
  "cluster-ip": "Cluster IP",
  "api-proxy": "API proxy",
  ingress: "Ingress",
  "port-forward": "Port-forward",
};
const DEFAULT_MODE_KINDS: Record<EndpointWorkloadMode, WorkloadKind[]> = {
  service: ["service"],
  "cluster-ip": ["service"],
  "api-proxy": ["service"],
  ingress: ["ingress"],
  "port-forward": ["service", "deployment"],
};
const WORKLOAD_FIELD =
  "max-w-full min-w-0 basis-56 shrink grow";
const SCHEME_FIELD =
  "max-w-full min-w-0 basis-32 shrink grow-0";
const PORT_FIELD =
  "max-w-full min-w-0 basis-36 shrink grow-0";
const PATH_FIELD =
  "max-w-full min-w-0 basis-56 shrink grow";
function isWorkloadValue(
  value: EndpointSelectorValue | undefined,
): value is EndpointWorkloadValue {
  return value !== undefined && value.mode !== "url";
}

function sameTarget(left: EndpointTarget, right: EndpointTarget) {
  if (left.kind !== right.kind || left.namespace !== right.namespace)
    return false;
  if (left.kind === "ingress" && right.kind === "ingress") {
    return left.name === right.name && left.host === right.host;
  }
  return left.name === right.name;
}

function targetKey(
  target: EndpointTarget,
  namespace: string | undefined,
  resource: WorkloadResource | undefined,
) {
  if (target.kind === "ingress") {
    return workloadKey(target.namespace ?? namespace, target.kind, {
      name: target.name,
      hosts: [target.host ?? resource?.hosts?.[0] ?? target.name],
    });
  }
  return workloadKey(target.namespace ?? namespace, target.kind, {
    name: target.name,
  });
}

function findResource(
  resources: EndpointResources,
  kind: WorkloadKind,
  selectedName: string,
) {
  return resources[kind]?.find((resource) =>
    kind === "ingress"
      ? resource.hosts?.[0] === selectedName
      : resource.name === selectedName,
  );
}

function portOptions(resource: WorkloadResource | undefined): ComboboxOption[] {
  return (resource?.ports ?? []).map((port) => ({
    value: String(port.number),
    label: port.name ? `${port.name} (${port.number})` : String(port.number),
  }));
}

function validPort(port: string) {
  if (!/^\d+$/.test(port)) return false;
  const number = Number(port);
  return number >= 1 && number <= 65535;
}

export function EndpointSelector({
  value,
  onChange,
  namespace,
  modes,
  defaultMode,
  loadWorkloads,
  allowNamespaceSelection = false,
  loadNamespaces,
  onNamespaceChange,
  urlSelector,
  modeKinds,
  defaults,
  preferredPorts = DEFAULT_PREFERRED_ENDPOINT_PORTS,
  schemes,
  allowCustomScheme = true,
  allowCustomPort = false,
  showScheme = false,
  showPath = false,
  showIngressPort = false,
  className,
}: EndpointSelectorProps) {
  const fallbackMode = defaultMode ?? modes[0];
  if (!fallbackMode || !modes.includes(fallbackMode)) {
    throw new Error(
      "EndpointSelector requires a default mode included in modes",
    );
  }
  if (value && !modes.includes(value.mode)) {
    throw new Error(`EndpointSelector value mode "${value.mode}" is disabled`);
  }
  if (allowNamespaceSelection && !loadNamespaces) {
    throw new Error(
      "EndpointSelector namespace selection requires loadNamespaces",
    );
  }

  const [activeMode, setActiveMode] = useState<EndpointMode>(
    value?.mode ?? fallbackMode,
  );
  const [resources, setResources] = useState<EndpointResources>({});
  const resourcesRef = useRef<EndpointResources>({});
  const resourcesNamespaceRef = useRef(namespace);
  const modesKey = modes.join(",");

  useEffect(() => {
    setActiveMode(
      (current) =>
        value?.mode ?? (modes.includes(current) ? current : fallbackMode),
    );
  }, [value, fallbackMode, modesKey]);

  const enabledKinds = useMemo(
    () =>
      activeMode === "url"
        ? []
        : (modeKinds?.[activeMode] ?? DEFAULT_MODE_KINDS[activeMode]),
    [activeMode, modeKinds],
  );

  const rememberingLoader = useCallback(
    async (kinds: WorkloadKind[], selectedNamespace?: string) => {
      const workloadNamespace = selectedNamespace ?? namespace;
      if (resourcesNamespaceRef.current !== workloadNamespace) {
        resourcesNamespaceRef.current = workloadNamespace;
        resourcesRef.current = {};
        setResources({});
      }
      const loaded = workloadNamespace
        ? await loadWorkloads(kinds, workloadNamespace)
        : await loadWorkloads(kinds);
      const filtered = { ...loaded };
      if (kinds.includes("ingress")) {
        filtered.ingress = (loaded.ingress ?? []).filter(
          (resource) => resource.hosts?.[0],
        );
      }
      if (resourcesNamespaceRef.current === workloadNamespace) {
        resourcesRef.current = { ...resourcesRef.current, ...filtered };
        setResources(resourcesRef.current);
      }
      return filtered;
    },
    [loadWorkloads, namespace],
  );

  const selectedResource = useMemo(() => {
    if (!isWorkloadValue(value)) return undefined;
    const target = value.target;
    return resources[target.kind]?.find((resource) => {
      if (target.kind === "ingress") {
        return (
          resource.name === target.name || resource.hosts?.[0] === target.host
        );
      }
      return resource.name === target.name;
    });
  }, [resources, value]);

  const options = useMemo(
    () => portOptions(selectedResource),
    [selectedResource],
  );
  const selectedPort = isWorkloadValue(value) ? value.port : undefined;
  const selectedPortWarning =
    selectedPort &&
    selectedResource &&
    options.length > 0 &&
    !options.some((option) => option.value === selectedPort)
      ? `Port ${selectedPort} is not exposed by workload "${selectedResource.name}"`
      : undefined;
  useEffect(() => {
    if (
      !isWorkloadValue(value) ||
      value.port ||
      !selectedResource
    ) {
      return;
    }
    const port = preferredEndpointPort(
      selectedResource.ports,
      preferredPorts,
    );
    if (port) onChange({ ...value, port });
  }, [
    onChange,
    preferredPorts,
    selectedResource,
    value,
  ]);

  const modeOptions = useMemo<SegmentedOption<EndpointMode>[]>(
    () => modes.map((mode) => ({ id: mode, label: MODE_LABELS[mode] })),
    [modes],
  );

  const selectMode = (nextMode: EndpointMode) => {
    setActiveMode(nextMode);
    if (nextMode === "url") {
      onNamespaceChange?.(undefined);
      if (value?.mode !== "url") onChange(undefined);
      return;
    }
    if (
      isWorkloadValue(value) &&
      (modeKinds?.[nextMode] ?? DEFAULT_MODE_KINDS[nextMode]).includes(
        value.target.kind,
      )
    ) {
      onChange({ ...value, mode: nextMode });
      return;
    }
    onChange(undefined);
  };

  const selectWorkload = (key: string) => {
    const parsed = key ? parseWorkloadKey(key) : undefined;
    // A namespace-only key (empty name) means a namespace is in scope with no
    // workload picked in it. An endpoint needs a workload to address, so there
    // is nothing to report yet — the namespace reaches the consumer through
    // onNamespaceChange instead.
    if (!parsed || !parsed.name) {
      onChange(undefined);
      return;
    }
    const kind = parsed.kind;
    if (!kind || !enabledKinds.includes(kind)) {
      throw new Error(
        `EndpointSelector received unsupported workload key "${key}"`,
      );
    }
    const resource = findResource(resourcesRef.current, kind, parsed.name);
    if (!resource) {
      throw new Error(`EndpointSelector workload "${key}" was not loaded`);
    }

    const selectedNamespace = parsed.namespace ?? namespace;
    let target: EndpointTarget;
    if (kind === "ingress") {
      const host = resource.hosts?.[0];
      if (!host) {
        throw new Error(`Ingress "${resource.name}" has no routable host`);
      }
      target = {
        kind,
        name: resource.name,
        host,
        ...(selectedNamespace ? { namespace: selectedNamespace } : {}),
      };
    } else {
      target = {
        kind,
        name: resource.name,
        ...(selectedNamespace ? { namespace: selectedNamespace } : {}),
      };
    }

    const previous = isWorkloadValue(value) ? value : undefined;
    const exposed = portOptions(resource).map((option) => option.value);
    const currentPort = previous?.port ?? "";
    const port = currentPort &&
      (previous && sameTarget(previous.target, target) ||
        exposed.includes(currentPort))
      ? currentPort
      : (preferredEndpointPort(resource.ports, preferredPorts) ?? defaults?.port);
    const next: EndpointWorkloadValue = {
      mode: activeMode as EndpointWorkloadMode,
      target,
    };
    const scheme = previous?.scheme ?? defaults?.scheme;
    const path = previous?.path ?? defaults?.path;
    if (scheme) next.scheme = scheme;
    if (port) next.port = port;
    if (path) next.path = path;
    onChange(next);
  };

  const patchValue = (
    field: "scheme" | "port" | "path",
    fieldValue: string,
  ) => {
    if (!isWorkloadValue(value)) return;
    const next = { ...value };
    if (fieldValue) {
      next[field] = fieldValue;
    } else {
      delete next[field];
    }
    onChange(next);
  };

  const workloadValue =
    isWorkloadValue(value) && value.mode === activeMode
      ? targetKey(value.target, namespace, selectedResource)
      : "";
  const showPort =
    activeMode !== "url" && (activeMode !== "ingress" || showIngressPort);

  return (
    <div className={cn("space-y-density-2", className)}>
      <SegmentedControl
        value={activeMode}
        options={modeOptions}
        onChange={selectMode}
        wrap
        aria-label="Endpoint access mode"
      />

      {activeMode === "url" ? (
        (() => {
          if (!urlSelector) {
            throw new Error("EndpointSelector url mode requires urlSelector");
          }
          return (
            <SecretKeySelector
              {...urlSelector}
              value={value?.mode === "url" ? value.source : undefined}
              onChange={(source) =>
                onChange(source ? { mode: "url", source } : undefined)
              }
            />
          );
        })()
      ) : (
        <div className="space-y-density-2">
          <div
            className="flex w-full max-w-full min-w-0 flex-nowrap items-end gap-density-2"
            data-slot="endpoint-fields"
          >
            <div
              className={WORKLOAD_FIELD}
              data-slot="endpoint-workload-field"
            >
              <Field label="Workload">
                <WorkloadPicker
                  value={workloadValue}
                  onChange={selectWorkload}
                  loadWorkloads={rememberingLoader}
                  {...(namespace ? { namespace } : {})}
                  {...(allowNamespaceSelection
                    ? { allowNamespaceSelection: true }
                    : {})}
                  {...(loadNamespaces ? { loadNamespaces } : {})}
                  {...(onNamespaceChange ? { onNamespaceChange } : {})}
                  kinds={enabledKinds}
                  strict
                  allowCustomValue={false}
                  placeholder="Select workload…"
                />
              </Field>
            </div>
            {showScheme && (
              <div
                className={SCHEME_FIELD}
                data-slot="endpoint-scheme-field"
              >
                <Field label="Scheme">
                  {schemes?.length && !allowCustomScheme ? (
                    <SegmentedControl
                      value={isWorkloadValue(value) ? (value.scheme ?? "") : ""}
                      options={schemes.map((scheme) => ({
                        id: scheme,
                        label: scheme,
                      }))}
                      onChange={(scheme) => patchValue("scheme", scheme)}
                      aria-label="Scheme"
                    />
                  ) : schemes?.length ? (
                    <Combobox
                      options={schemes.map((scheme) => ({
                        value: scheme,
                        label: scheme,
                      }))}
                      value={isWorkloadValue(value) ? (value.scheme ?? "") : ""}
                      onChange={(scheme) => patchValue("scheme", scheme)}
                      allowCustomValue={allowCustomScheme}
                      ariaLabel="Scheme"
                    />
                  ) : (
                    <InputField
                      value={isWorkloadValue(value) ? (value.scheme ?? "") : ""}
                      onChange={(scheme) => patchValue("scheme", scheme)}
                      aria-label="Scheme"
                    />
                  )}
                </Field>
              </div>
            )}
            {showPort && (
              <div
                className={PORT_FIELD}
                data-slot="endpoint-port-field"
              >
                <Field label="Port">
                  <Combobox
                    options={options}
                    value={isWorkloadValue(value) ? (value.port ?? "") : ""}
                    onChange={(port) => patchValue("port", port)}
                    onNew={(port) => {
                      if (!validPort(port)) return null;
                      if (!options.length || !selectedResource) {
                        return { value: port, label: port };
                      }
                      const warning = `Port ${port} is not exposed by workload "${selectedResource.name}"`;
                      return {
                        value: port,
                        label: `Use ${port} — not exposed by ${selectedResource.name}`,
                        selectedLabel: port,
                        icon: (
                          <UiWarningTriangle
                            className="size-4 shrink-0 text-amber-600"
                            title={warning}
                          />
                        ),
                        title: warning,
                      };
                    }}
                    onCreate={(option) =>
                      validPort(option.value) ? option.value : null
                    }
                    prefix={
                      selectedPortWarning ? (
                        <UiWarningTriangle
                          className="size-4 shrink-0 text-amber-600"
                          title={selectedPortWarning}
                        />
                      ) : undefined
                    }
                    allowCustomValue={allowCustomPort}
                    ariaLabel="Port"
                  />
                </Field>
              </div>
            )}
            {showPath && (
              <div
                className={PATH_FIELD}
                data-slot="endpoint-path-field"
              >
                <Field label="Path">
                  <InputField
                    value={isWorkloadValue(value) ? (value.path ?? "") : ""}
                    onChange={(path) => patchValue("path", path)}
                    aria-label="Path"
                    {...(isWorkloadValue(value) && value.path
                      ? { title: value.path }
                      : {})}
                  />
                </Field>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
