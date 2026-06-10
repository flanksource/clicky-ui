import { useEffect, useMemo, useState } from "react";
import { cn } from "../lib/utils";
import { Combobox } from "./Combobox";
import {
  ALL_WORKLOAD_KINDS,
  WORKLOAD_META,
  buildWorkloadOptions,
  kindForValue,
  loadedWorkloads,
  type WorkloadKind,
  type WorkloadResource,
} from "./workload-picker-utils";

// WorkloadPicker selects a backing Kubernetes workload (Service / Ingress /
// Deployment / StatefulSet) for an endpoint. Options from every kind are merged
// into one Combobox, grouped by kind via the Combobox group-header support and
// labelled with the kind's icon.
//
// The emitted value is a `[namespace/]kind/name` key (see workloadKey /
// parseWorkloadKey in workload-picker-utils) so two workloads of different
// kinds that share a name don't collide. An ingress's name-part is its first
// host (the routable address), labelled with the ingress name for context;
// every other kind uses its name.
//
// The component is presentational: the kind→group/icon mapping and the key
// encoding live in workload-picker-utils; it fetches nothing — the consumer
// supplies an async `loadWorkloads` getter.

export type WorkloadPickerProps = {
  /**
   * Controlled selected value — a `[namespace/]kind/name` key (see
   * {@link workloadKey} / {@link parseWorkloadKey}).
   */
  value: string;
  /** Called with the chosen `[namespace/]kind/name` key (or "" when cleared). */
  onChange: (value: string) => void;
  /**
   * Async getter the component calls to load the requested kinds' workloads.
   * Returns a map keyed by kind. The consumer owns fetching/caching.
   */
  loadWorkloads: (kinds: WorkloadKind[]) => Promise<Record<WorkloadKind, WorkloadResource[]>>;
  /**
   * Namespace the workloads live in. When set it prefixes the emitted key
   * (`namespace/kind/name`), so values stay distinct across namespaces.
   */
  namespace?: string;
  /** Kinds to offer, in display order. Defaults to all four. */
  kinds?: WorkloadKind[];
  /**
   * When true, a non-empty value that does not match any loaded workload (once
   * loading settles) is flagged invalid — the picked workload doesn't exist in
   * the namespace. The value is still shown (pinned) so the user can see and
   * fix it; freeform entry is not rejected, only marked.
   */
  strict?: boolean;
  placeholder?: string;
  className?: string;
};

export function WorkloadPicker({
  value,
  onChange,
  loadWorkloads,
  namespace,
  kinds = ALL_WORKLOAD_KINDS,
  strict = false,
  placeholder = "Select workload / service…",
  className,
}: WorkloadPickerProps) {
  const [byKind, setByKind] = useState<Partial<Record<WorkloadKind, WorkloadResource[]>>>({});
  const [loading, setLoading] = useState(false);

  const kindsKey = kinds.join(",");
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadWorkloads(kinds)
      .then((res) => {
        if (!cancelled) setByKind(res);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // loadWorkloads is expected to be stable (memoized by the consumer); kindsKey
    // is the joined `kinds` so a changed selection reloads without depending on
    // the array's identity.
  }, [loadWorkloads, kindsKey]);

  const options = useMemo(
    () => buildWorkloadOptions(namespace, byKind, kinds, value),
    [namespace, byKind, kinds, value],
  );

  // In strict mode a non-empty value is invalid once loading settles unless it
  // matches a loaded workload — either by its full `[namespace/]kind/name` key
  // (what the picker emits) or by its bare name-part (what consumers that
  // persist only the resolved name, e.g. a Service name or ingress host, feed
  // back in). buildWorkloadOptions pins an unmatched value first, so test
  // membership against the loaded set, not `options`.
  const invalid = useMemo(() => {
    if (!strict || !value || loading) return false;
    const { keys, names } = loadedWorkloads(namespace, byKind, kinds);
    return !keys.has(value) && !names.has(value);
  }, [strict, value, loading, namespace, byKind, kinds]);

  // The lead icon reflects the selected workload's kind (read from the value's
  // key), falling back to the first offered kind when nothing is selected or the
  // value carries no recognised kind (e.g. freeform input).
  const selectedKind = kindForValue(kinds, value);
  const leadMeta = WORKLOAD_META[selectedKind];
  const LeadIcon = leadMeta.Icon;
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LeadIcon
        className="h-4 w-4 shrink-0 text-muted-foreground"
        title={leadMeta.label}
        aria-label={leadMeta.label}
      />
      <div className="min-w-0 flex-1">
        <Combobox
          options={options}
          value={value}
          onChange={onChange}
          allowCustomValue
          loading={loading}
          invalid={invalid}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

