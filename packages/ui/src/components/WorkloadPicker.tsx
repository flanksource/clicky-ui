import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../lib/utils";
import { Combobox } from "./Combobox";
import { NamespacePicker, type NamespacePickerProps } from "./NamespacePicker";
import {
  ALL_WORKLOAD_KINDS,
  WORKLOAD_META,
  buildWorkloadOptions,
  kindForValue,
  loadedWorkloads,
  namespaceKey,
  parseWorkloadKey,
  type WorkloadKind,
  type WorkloadResource,
} from "./workload-picker-utils";

// WorkloadPicker selects a backing Kubernetes workload for an endpoint or
// query. Options from every requested kind are merged into one Combobox,
// grouped by kind via the Combobox group-header support and labelled with the
// kind's icon.
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
   * {@link workloadKey} / {@link parseWorkloadKey}), or a `namespace/` key when
   * a namespace is in scope with no workload picked in it yet.
   */
  value: string;
  /**
   * Called with the chosen `[namespace/]kind/name` key. When namespace
   * selection is on and no workload is picked it receives the `namespace/` key
   * (see {@link namespaceKey}) rather than "", so a consumer persisting the
   * value keeps the namespace; "" means nothing at all is selected.
   */
  onChange: (value: string) => void;
  /**
   * Async getter the component calls to load the requested kinds' workloads.
   * Returns a map keyed by kind. The consumer owns fetching/caching.
   */
  loadWorkloads: (
    kinds: WorkloadKind[],
    namespace?: string,
  ) => Promise<Partial<Record<WorkloadKind, WorkloadResource[]>>>;
  /**
   * Namespace the workloads live in. When set it prefixes the emitted key
   * (`namespace/kind/name`), so values stay distinct across namespaces.
   */
  namespace?: string;
  /** Lets the user choose the namespace used to load and key workloads. */
  allowNamespaceSelection?: boolean;
  /** Required when namespace selection is enabled. */
  loadNamespaces?: NamespacePickerProps["loadNamespaces"];
  /** Reports the namespace independently of workload selection. */
  onNamespaceChange?: (namespace: string | undefined) => void;
  /** Kinds to offer, in display order. Defaults to every supported kind. */
  kinds?: WorkloadKind[];
  /**
   * When true, a non-empty value that does not match any loaded workload (once
   * loading settles) is flagged invalid — the picked workload doesn't exist in
   * the namespace. The value is still shown (pinned) so the user can see and
   * fix it; freeform entry is not rejected, only marked.
   */
  strict?: boolean;
  /**
   * Whether a typed name absent from the loaded resources may be committed.
   * Defaults to true for the existing free-form workload picker behavior.
   */
  allowCustomValue?: boolean;
  /**
   * Render the sole loaded workload as plain text instead of a picker.
   *
   * A dropdown whose only entry is the one already in effect asks a question
   * with one answer. This is for a scope that leaves nothing to choose — a
   * Deployment with a single pod — where the workload is a fact to state rather
   * than a selection to make. No value is emitted: the caller is already scoped
   * to it, so writing it back would only add a filter that changes nothing.
   */
  collapseSingleOption?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

export function WorkloadPicker({
  value,
  onChange,
  loadWorkloads,
  namespace,
  allowNamespaceSelection = false,
  loadNamespaces,
  onNamespaceChange,
  kinds = ALL_WORKLOAD_KINDS,
  strict = false,
  allowCustomValue = true,
  collapseSingleOption = false,
  disabled = false,
  placeholder = "Select workload / service…",
  className,
}: WorkloadPickerProps) {
  const initialNamespace = value
    ? parseWorkloadKey(value).namespace
    : undefined;
  const [selectedNamespace, setSelectedNamespace] = useState(
    initialNamespace ?? namespace ?? "",
  );
  const [byKind, setByKind] = useState<Partial<Record<WorkloadKind, WorkloadResource[]>>>({});
  const [loading, setLoading] = useState(false);
  const defaultNamespaceRef = useRef(namespace);
  const effectiveNamespace = allowNamespaceSelection
    ? selectedNamespace || undefined
    : namespace;

  useEffect(() => {
    if (!allowNamespaceSelection || !value) return;
    const valueNamespace = parseWorkloadKey(value).namespace;
    if (valueNamespace) setSelectedNamespace(valueNamespace);
  }, [allowNamespaceSelection, value]);

  useEffect(() => {
    if (
      !allowNamespaceSelection ||
      defaultNamespaceRef.current === namespace
    ) {
      return;
    }
    defaultNamespaceRef.current = namespace;
    if (!value) setSelectedNamespace(namespace ?? "");
  }, [allowNamespaceSelection, namespace, value]);

  const kindsKey = kinds.join(",");
  useEffect(() => {
    if (allowNamespaceSelection && !effectiveNamespace) {
      setByKind({});
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const request = effectiveNamespace
      ? loadWorkloads(kinds, effectiveNamespace)
      : loadWorkloads(kinds);
    request
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
  }, [allowNamespaceSelection, effectiveNamespace, loadWorkloads, kindsKey]);

  // The workload half of the value. A `namespace/` key names a namespace with
  // nothing picked in it, so every question the workload combobox asks of the
  // selection — which option is current, is it valid, which kind's icon leads —
  // reads it as no workload rather than as a workload called "namespace/".
  const workloadValue = value && parseWorkloadKey(value).name ? value : "";

  const options = useMemo(
    () => buildWorkloadOptions(effectiveNamespace, byKind, kinds, workloadValue),
    [effectiveNamespace, byKind, kinds, workloadValue],
  );

  // In strict mode a non-empty value is invalid once loading settles unless it
  // matches a loaded workload — either by its full `[namespace/]kind/name` key
  // (what the picker emits) or by its bare name-part (what consumers that
  // persist only the resolved name, e.g. a Service name or ingress host, feed
  // back in). buildWorkloadOptions pins an unmatched value first, so test
  // membership against the loaded set, not `options`.
  const invalid = useMemo(() => {
    if (!strict || !workloadValue || loading) return false;
    const { keys, names } = loadedWorkloads(effectiveNamespace, byKind, kinds);
    return !keys.has(workloadValue) && !names.has(workloadValue);
  }, [strict, workloadValue, loading, effectiveNamespace, byKind, kinds]);

  // The lead icon reflects the selected workload's kind (read from the value's
  // key), falling back to the first offered kind when nothing is selected or the
  // value carries no recognised kind (e.g. freeform input).
  const selectedKind = kindForValue(kinds, workloadValue);
  const leadMeta = WORKLOAD_META[selectedKind];
  const LeadIcon = leadMeta.Icon;
  // Only once loading settles, and only while the sole option is not contested
  // by a selection that named something else — a value the load did not return
  // is exactly the case `strict` exists to surface, and hiding the control
  // would hide it too.
  const soleOption =
    collapseSingleOption && !loading && options.length === 1 && (!workloadValue || workloadValue === options[0]!.value)
      ? options[0]!
      : undefined;
  const control = (
    <div
      className={cn(
        "flex items-center gap-2",
        allowNamespaceSelection ? "min-w-0 flex-1" : className,
      )}
    >
      <LeadIcon
        className="h-4 w-4 shrink-0 text-muted-foreground"
        title={leadMeta.label}
        aria-label={leadMeta.label}
      />
      <div className="min-w-0 flex-1">
        {soleOption ? (
          <span
            className="block truncate text-sm text-foreground"
            title={soleOption.label}
            aria-label="Workload"
          >
            {soleOption.label}
          </span>
        ) : (
          <Combobox
            options={options}
            value={workloadValue}
            // Clearing the workload falls back to the namespace still in scope
            // rather than to nothing, so the namespace survives the clear. Only
            // when this picker owns the namespace — a consumer that fixed the
            // namespace itself already knows it and expects a bare "".
            onChange={(next) =>
              onChange(
                next ||
                  (allowNamespaceSelection
                    ? namespaceKey(effectiveNamespace)
                    : ""),
              )
            }
            ariaLabel="Workload"
            allowCustomValue={allowCustomValue}
            loading={loading}
            invalid={invalid}
            disabled={disabled}
            placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
  if (!allowNamespaceSelection) return control;
  if (!loadNamespaces) {
    throw new Error(
      "WorkloadPicker namespace selection requires loadNamespaces",
    );
  }

  // Namespace and workload read as one address, so they share a row. The
  // namespace is the shorter half: it gets a compact basis that shrinks but
  // never grows, leaving the rest to the workload, whose `[kind/]name` labels
  // are what need the width — this lives in a ~28% split pane. Its placeholder
  // and aria-label carry the naming the stacked <Field label> used to.
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-nowrap items-center gap-density-2",
        className,
      )}
    >
      <NamespacePicker
        className="min-w-0 shrink grow-0 basis-28"
        value={selectedNamespace}
        onChange={(nextNamespace) => {
          setSelectedNamespace(nextNamespace);
          setByKind({});
          onNamespaceChange?.(nextNamespace || undefined);
          // The workload the old namespace named cannot survive the move, but
          // the new namespace is itself a selection worth reporting — emitting
          // "" here is what used to drop it before it could be persisted.
          onChange(namespaceKey(nextNamespace));
        }}
        loadNamespaces={loadNamespaces}
        strict
      />
      {control}
    </div>
  );
}
