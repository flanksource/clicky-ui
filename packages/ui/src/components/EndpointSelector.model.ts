import type { SecretKeySelectorProps, SecretKeyValue } from "./SecretKeySelector";
import type {
  WorkloadKind,
  WorkloadResource,
} from "./workload-picker-utils";
import type { WorkloadPickerProps } from "./WorkloadPicker";

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
