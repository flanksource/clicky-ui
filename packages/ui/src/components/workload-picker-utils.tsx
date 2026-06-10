import { type ComponentType } from "react";
import {
  K8SService,
  K8SIngress,
  K8SDeployment,
  K8SStatefulset,
} from "@flanksource/icons/mi";
import type { ComboboxOption } from "./Combobox";

// Key encoding and option-building for WorkloadPicker: the emitted value is a
// `[namespace/]kind/name` composite (see workloadKey / parseWorkloadKey) so two
// workloads of different kinds that share a name don't collide.

export type WorkloadKind = "service" | "ingress" | "deployment" | "statefulset";

/** One workload returned by the loader. Ingresses may carry rule hostnames. */
export type WorkloadResource = { name: string; hosts?: string[] };

type KindIconProps = { className?: string; title?: string; "aria-label"?: string };
type KindMeta = { label: string; Icon: ComponentType<KindIconProps> };

// WORKLOAD_META maps each kind to its group header label and icon, in display
// order. The order of the keys drives the order options/groups appear in.
export const WORKLOAD_META: Record<WorkloadKind, KindMeta> = {
  service: { label: "Service", Icon: K8SService },
  ingress: { label: "Ingress", Icon: K8SIngress },
  deployment: { label: "Deployment", Icon: K8SDeployment },
  statefulset: { label: "StatefulSet", Icon: K8SStatefulset },
};

export const ALL_WORKLOAD_KINDS: WorkloadKind[] = [
  "service",
  "ingress",
  "deployment",
  "statefulset",
];

// ingressHost is the first host an ingress routes, or undefined for non-ingress
// kinds and host-less ingresses. An ingress's name-part is its host.
function ingressHost(kind: WorkloadKind, r: WorkloadResource): string | undefined {
  return kind === "ingress" ? r.hosts?.[0] : undefined;
}

// workloadName is the name-part of a resource's key: an ingress's first host
// (the routable address callers want), else the resource's own name.
function workloadName(kind: WorkloadKind, r: WorkloadResource): string {
  return ingressHost(kind, r) ?? r.name;
}

// ParsedWorkloadKey is the structured form of a `[namespace/]kind/name` value.
export type ParsedWorkloadKey = { namespace?: string; kind?: WorkloadKind; name: string };

const KNOWN_KINDS = new Set<string>(["service", "ingress", "deployment", "statefulset"]);

// workloadKey is the value a resource contributes (what onChange emits): a
// `[namespace/]kind/name` composite so two workloads of different kinds sharing
// a name don't collide. namespace is omitted when not supplied.
export function workloadKey(
  namespace: string | undefined,
  kind: WorkloadKind,
  r: WorkloadResource,
): string {
  const name = workloadName(kind, r);
  return namespace ? `${namespace}/${kind}/${name}` : `${kind}/${name}`;
}

// parseWorkloadKey splits a `[namespace/]kind/name` value back into its parts.
// The trailing segment is always the name (a host may itself contain no slash);
// the segment before it is the kind when it is a known workload kind, and any
// remaining leading segment is the namespace. A bare value (no recognised
// kind/name shape) is returned as just its name so freeform input survives.
export function parseWorkloadKey(value: string): ParsedWorkloadKey {
  const parts = value.split("/");
  const name = parts.at(-1);
  const maybeKind = parts.at(-2);
  if (name != null && maybeKind != null && KNOWN_KINDS.has(maybeKind)) {
    const namespace = parts.slice(0, -2).join("/");
    const parsed: ParsedWorkloadKey = { kind: maybeKind as WorkloadKind, name };
    if (namespace) parsed.namespace = namespace;
    return parsed;
  }
  return { name: value };
}

// loadedWorkloads collapses the loaded resources into the two membership sets a
// strict picker validates a value against: `keys` are the full
// `[namespace/]kind/name` keys the picker emits, `names` are the bare name-parts
// (service name / ingress host) a consumer may persist instead. A value in
// neither set names a workload that doesn't exist in the namespace.
export function loadedWorkloads(
  namespace: string | undefined,
  byKind: Partial<Record<WorkloadKind, WorkloadResource[]>>,
  kinds: WorkloadKind[],
): { keys: Set<string>; names: Set<string> } {
  const keys = new Set<string>();
  const names = new Set<string>();
  for (const kind of kinds) {
    for (const r of byKind[kind] ?? []) {
      keys.add(workloadKey(namespace, kind, r));
      names.add(workloadName(kind, r));
    }
  }
  return { keys, names };
}

// kindForValue returns the kind encoded in the selected value, so the lead icon
// can mirror it without consulting the loaded resources. Falls back to the first
// offered kind when nothing is selected or the value carries no recognised kind.
export function kindForValue(kinds: WorkloadKind[], value: string): WorkloadKind {
  const kind = value ? parseWorkloadKey(value).kind : undefined;
  return kind ?? kinds[0] ?? "service";
}

// buildWorkloadOptions flattens the per-kind resources into grouped Combobox
// options in kind order. Each option's value is its `[namespace/]kind/name` key
// and its label the human name; a current value not present in any kind is
// pinned first (labelled with just its name-part) so the selection stays visible.
export function buildWorkloadOptions(
  namespace: string | undefined,
  byKind: Partial<Record<WorkloadKind, WorkloadResource[]>>,
  kinds: WorkloadKind[],
  value: string,
): ComboboxOption[] {
  const opts: ComboboxOption[] = [];
  for (const kind of kinds) {
    const meta = WORKLOAD_META[kind];
    const Icon = meta.Icon;
    for (const r of byKind[kind] ?? []) {
      const host = ingressHost(kind, r);
      opts.push({
        value: workloadKey(namespace, kind, r),
        // The label is the human name; an ingress pairs its host with the
        // ingress name for context.
        label: host ? `${host} (${r.name})` : r.name,
        group: meta.label,
        icon: <Icon className="h-4 w-4" />,
      });
    }
  }
  if (value && !opts.some((o) => o.value === value)) {
    const parsed = parseWorkloadKey(value);
    const Icon = WORKLOAD_META[parsed.kind ?? kinds[0] ?? "service"].Icon;
    return [{ value, label: parsed.name, icon: <Icon className="h-4 w-4" /> }, ...opts];
  }
  return opts;
}
