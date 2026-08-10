import type { SecretKeySelectorProps, SecretKeyValue } from "./SecretKeySelector";
import type {
  WorkloadKind,
  WorkloadResource,
} from "./workload-picker-utils";
import type { WorkloadPickerProps } from "./WorkloadPicker";
import {
  parseSecretRef,
  serializeSecretRef,
} from "./SecretKeySelector.model";

export type EndpointMode =
  | "url"
  | "service"
  | "cluster-ip"
  | "api-proxy"
  | "ingress"
  | "port-forward";

export type EndpointWorkloadMode = Exclude<EndpointMode, "url">;

export type EndpointTarget =
  | {
      kind: "ingress";
      name: string;
      host?: string;
      namespace?: string;
    }
  | {
      kind: Exclude<WorkloadKind, "ingress">;
      name: string;
      namespace?: string;
    };

export type EndpointWorkloadValue = {
  mode: EndpointWorkloadMode;
  target: EndpointTarget;
  scheme?: string;
  port?: string;
  path?: string;
};

export type EndpointSelectorValue =
  | {
      mode: "url";
      source: SecretKeyValue;
    }
  | EndpointWorkloadValue;

export type EndpointSelectorDefaults = {
  scheme?: string;
  path?: string;
};

export type EndpointUrlSelectorProps = Omit<
  SecretKeySelectorProps,
  "value" | "onChange"
>;

export type EndpointSelectorProps = {
  value: EndpointSelectorValue | undefined;
  onChange: (value: EndpointSelectorValue | undefined) => void;
  namespace?: string;
  modes: EndpointMode[];
  defaultMode?: EndpointMode;
  loadWorkloads: WorkloadPickerProps["loadWorkloads"];
  urlSelector?: EndpointUrlSelectorProps;
  modeKinds?: Partial<Record<EndpointWorkloadMode, WorkloadKind[]>>;
  defaults?: EndpointSelectorDefaults;
  preferredPorts?: readonly number[];
  schemes?: string[];
  allowCustomScheme?: boolean;
  allowCustomPort?: boolean;
  showScheme?: boolean;
  showPath?: boolean;
  showIngressPort?: boolean;
  className?: string;
};

export type EndpointResources = Partial<
  Record<WorkloadKind, WorkloadResource[]>
>;

const SCHEME_TO_MODE = {
  svc: "service",
  ip: "cluster-ip",
  proxy: "api-proxy",
  host: "ingress",
  portforward: "port-forward",
} as const satisfies Record<string, EndpointMode>;

const MODE_TO_SCHEME = Object.fromEntries(
  Object.entries(SCHEME_TO_MODE).map(([scheme, mode]) => [mode, scheme]),
) as Record<EndpointWorkloadMode, keyof typeof SCHEME_TO_MODE>;

const WORKLOAD_URL =
  /^([a-z]+):\/\/([^/:?#]*)(?::(\d+))?([^?#]*)(?:\?(.+))?$/;

function validPort(port: string) {
  return /^\d+$/.test(port) && Number(port) >= 1 && Number(port) <= 65535;
}

function parseTarget(
  mode: EndpointWorkloadMode,
  host: string,
  query: string,
): EndpointTarget | undefined {
  const dot = host.indexOf(".");
  const name = dot >= 0 ? host.slice(0, dot) : host;
  const namespace = dot >= 0 ? host.slice(dot + 1) : "";
  if (!name) return undefined;

  const kind =
    mode === "ingress"
      ? "ingress"
      : mode === "port-forward" &&
          new URLSearchParams(query).get("kind") === "deployment"
        ? "deployment"
        : "service";
  return {
    kind,
    name,
    ...(namespace ? { namespace } : {}),
  };
}

function parseWorkloadValue(raw: string): EndpointWorkloadValue | undefined {
  const match = WORKLOAD_URL.exec(raw);
  if (!match) return undefined;
  const [, scheme = "", host = "", port = "", path = "", query = ""] =
    match;
  const mode = SCHEME_TO_MODE[scheme as keyof typeof SCHEME_TO_MODE];
  if (!mode || (port && !validPort(port))) return undefined;
  if (
    mode === "port-forward" &&
    (new URLSearchParams(query).has("selector") ||
      !["", "service", "deployment"].includes(
        new URLSearchParams(query).get("kind") ?? "",
      ))
  ) {
    return undefined;
  }

  const target = parseTarget(mode, host, query);
  if (!target) return undefined;
  return {
    mode,
    target,
    ...(port ? { port } : {}),
    ...(path ? { path } : {}),
  };
}

export function parseEndpointValue(
  raw: unknown,
): EndpointSelectorValue | undefined {
  if (typeof raw !== "string" || raw === "") return undefined;
  return (
    parseWorkloadValue(raw) ?? {
      mode: "url",
      source: parseSecretRef(raw)!,
    }
  );
}

function workloadHost(target: EndpointTarget) {
  if (!target.name) {
    throw new Error("Endpoint workload mode requires a workload name");
  }
  return target.namespace
    ? `${target.name}.${target.namespace}`
    : target.name;
}

function validateWorkloadValue(value: EndpointWorkloadValue) {
  if (value.mode === "ingress" && value.target.kind !== "ingress") {
    throw new Error("Ingress endpoint mode requires an ingress target");
  }
  if (
    value.mode !== "ingress" &&
    value.mode !== "port-forward" &&
    value.target.kind !== "service"
  ) {
    throw new Error(`${value.mode} endpoint mode requires a service target`);
  }
  if (
    value.mode === "port-forward" &&
    !["service", "deployment"].includes(value.target.kind)
  ) {
    throw new Error(
      "Port-forward endpoint mode requires a service or deployment target",
    );
  }
  if (value.port && !validPort(value.port)) {
    throw new Error(
      `Endpoint port "${value.port}" must be between 1 and 65535`,
    );
  }
  if (value.path && !value.path.startsWith("/")) {
    throw new Error(`Endpoint path "${value.path}" must start with /`);
  }
}

export function serializeEndpointValue(
  value: EndpointSelectorValue | undefined,
): string {
  if (!value) return "";
  if (value.mode === "url") return serializeSecretRef(value.source);
  validateWorkloadValue(value);
  const scheme = MODE_TO_SCHEME[value.mode];
  const port = value.port ? `:${value.port}` : "";
  const path = value.path ?? "";
  const kind =
    value.mode === "port-forward" && value.target.kind === "deployment"
      ? "?kind=deployment"
      : "";
  return `${scheme}://${workloadHost(value.target)}${port}${path}${kind}`;
}
