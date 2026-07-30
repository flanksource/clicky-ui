import type { WorkloadPort } from "./workload-picker-utils";

export const DEFAULT_PREFERRED_ENDPOINT_PORTS = [80, 443, 8080] as const;

export function preferredEndpointPort(
  ports: readonly WorkloadPort[] | undefined,
  preferredPorts: readonly number[] = DEFAULT_PREFERRED_ENDPOINT_PORTS,
): string | undefined {
  if (!ports?.length) return undefined;
  const exposed = new Set(ports.map((port) => port.number));
  const preferred = preferredPorts.find((port) => exposed.has(port));
  return String(preferred ?? ports[0]!.number);
}
