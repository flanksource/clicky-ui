import { useMemo, useState, type ReactNode } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/button";
import { Loading } from "../../components/loading";
import { Workspace, type WorkspacePaneSpec } from "../../layout/Workspace";
import { InlineError } from "../../rpc/InlineError";
import { UiFileCode, UiFolder } from "../../icons";
import { ClassBrowser } from "../classes/ClassBrowser";
import { ClassDownloads } from "../classes/ClassDownloads";
import { includePlatformFromState, updateClassesState, type ClassesSurfaceState } from "../classes/classes-state";
import { CompileDiagnosticsList } from "../classes/CompileDiagnosticsList";
import { DecompiledSourceView } from "../classes/DecompiledSourceView";
import { MethodPicker } from "../classes/MethodPicker";
import { PatchActions, type PatchBusy } from "../classes/PatchActions";
import { PatchedClassList } from "../classes/PatchedClassList";
import { DEFAULT_LEASE_SECONDS, leaseLabel } from "../classes/patch-leases";
import { diagnosticMarkers } from "../classes/source-markers";
import { classFocus, methodKey, selectMethod } from "../model/class-fold";
import { lineForRow } from "../model/source-lines";
import type { JvmClassQuery, JvmClassRef, JvmClassSource, JvmClassTarget, JvmCompilation } from "../protocol/types";
import { MutationGate } from "../safety/MutationGate";
import { mutationAllowed } from "../safety/mutation-allowed";
import { useJvm, useJvmStatus } from "./jvm-context";

export type { ClassesSurfaceState } from "../classes/classes-state";

/** Classes requested per page of the browser. */
const PAGE_SIZE = 200;

export type ClassesSurfaceProps = {
  state: ClassesSurfaceState;
  /** `replace` marks a refinement of the same view (a filter, a method, a clicked line) rather than a navigation. */
  onStateChange: (next: ClassesSurfaceState, options?: { replace: boolean }) => void;
  /** The host lets this operator replace class bytecode. Default true. */
  canMutate?: boolean;
  /** Ask the operator to opt in before replacing or restoring bytecode. Default true. */
  requireConsent?: boolean;
  /** Host decoration after a class's name in the tree, e.g. a "generated" badge. */
  renderClassBadge?: (ref: JvmClassRef) => ReactNode;
  /** Adds a "Trace method" action; receives the class, its loader and the picked method's name and descriptor. */
  onTraceMethod?: (target: Required<JvmClassTarget>) => void;
  /** Host actions in the source toolbar, e.g. links to related views. */
  sourceActions?: (source: JvmClassSource) => ReactNode;
  /** Host panes added beside the browser and the source. */
  extraPanes?: WorkspacePaneSpec[];
  storageKey?: string;
  className?: string;
};

type SourcePaneProps = Pick<ClassesSurfaceProps, "state" | "onStateChange" | "canMutate" | "requireConsent" | "onTraceMethod" | "sourceActions"> & {
  qualifiedName: string;
};

type Failure = { title: string; error: unknown };

function parseLine(raw: string | undefined): number {
  const line = Number(raw);
  return Number.isInteger(line) && line > 0 ? line : 0;
}

function ClassSourcePane({ qualifiedName, state, onStateChange, canMutate, requireConsent, onTraceMethod, sourceActions }: SourcePaneProps) {
  const { client, keys } = useJvm();
  const queryClient = useQueryClient();
  const status = useJvmStatus();
  const loaders = useQuery({ queryKey: keys.classLoaders, queryFn: ({ signal }) => client.classLoaders({ signal }), staleTime: 60_000 });
  const patches = useQuery({ queryKey: keys.patches, queryFn: ({ signal }) => client.patches({ signal }) });
  const loader = state.loader ?? "";
  const decompiled = useQuery({
    queryKey: keys.classSource(qualifiedName, loader || undefined),
    queryFn: ({ signal }) => client.classSource({ class: qualifiedName, ...(loader ? { loader } : {}) }, { signal }),
  });

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [compiled, setCompiled] = useState<{ source: string; result: JvmCompilation } | null>(null);
  const [leaseSeconds, setLeaseSeconds] = useState(DEFAULT_LEASE_SECONDS);
  const [consent, setConsent] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [reveal, setReveal] = useState<{ row: number } | undefined>(undefined);

  const data = decompiled.data;
  // The decompiled class's own loader is authoritative; the state's may be a group or empty.
  const targetLoader = data?.loader ?? loader;
  const target: JvmClassTarget = { class: qualifiedName, ...(targetLoader ? { loader: targetLoader } : {}) };
  const patched = (patches.data ?? []).some((patch) => patch.class === qualifiedName && patch.loader === targetLoader && patch.patched);
  const gate = { runtime: status.data?.allowMutation, permitted: canMutate ?? true, consent, requireConsent: requireConsent ?? true };
  const allowed = mutationAllowed(gate);

  const resetEditing = () => {
    setEditing(false);
    setCompiled(null);
    setFailure(null);
  };
  const refreshAfterWrite = () => Promise.all([queryClient.invalidateQueries({ queryKey: keys.classSources }), queryClient.invalidateQueries({ queryKey: keys.patches })]);

  const compile = useMutation({
    mutationFn: (source: string) => client.compileClass({ ...target, source }),
    onMutate: () => setFailure(null),
    onSuccess: (result, source) => setCompiled({ source, result }),
    onError: (error) => setFailure({ title: "Compile failed", error }),
  });
  const apply = useMutation({
    mutationFn: async (source: string) => {
      const result = await client.patchClass({ ...target, source, leaseSeconds });
      if (result.success && result.applied === false) throw new Error("The agent compiled the class but did not apply it.");
      return result;
    },
    onMutate: () => setFailure(null),
    onSuccess: async (result, source) => {
      if (!result.success) {
        setCompiled({ source, result });
        return;
      }
      setCompiled({ source, result: { ...result, applied: true } });
      setEditing(false);
      await refreshAfterWrite();
    },
    onError: (error) => setFailure({ title: "Patch failed", error }),
  });
  const restore = useMutation({
    mutationFn: () => client.restoreClass(target),
    onMutate: () => setFailure(null),
    onSuccess: async () => {
      resetEditing();
      await refreshAfterWrite();
    },
    onError: (error) => setFailure({ title: "Restore failed", error }),
  });
  const busy: PatchBusy = compile.isPending ? "compile" : apply.isPending ? "patch" : restore.isPending ? "restore" : null;

  const source = data?.source ?? "";
  const rows = useMemo(() => source.split("\n").length, [source]);
  const focus = useMemo(
    () =>
      classFocus({
        className: qualifiedName,
        method: state.method ?? "",
        line: parseLine(state.line),
        methods: data?.methods ?? [],
        sourceLineCount: rows,
        sourceLineNumbers: data?.sourceLineNumbers ?? [],
      }),
    [qualifiedName, state.method, state.line, data, rows],
  );
  const method = selectMethod(data?.methods ?? [], state.method ?? "");

  const compiledDraft = compiled && compiled.source === draft ? compiled.result : null;
  const compiledCurrent = compiledDraft?.success === true;
  const markers = useMemo(() => diagnosticMarkers(compiledDraft?.diagnostics ?? []), [compiledDraft]);

  const virtual = (loaders.data ?? []).some((candidate) => candidate.virtual && (candidate.hash === loader || candidate.hash === data?.loader));
  const editBlocker = virtual
    ? "This is a group of loaders; pick the loader that defines the class."
    : status.data?.instrumentation === false
      ? "This JVM has no instrumentation attached, so classes cannot be replaced."
      : undefined;

  let body: ReactNode;
  if (decompiled.isPending) body = <Loading />;
  else if (decompiled.error) body = <InlineError title="Decompiling failed" error={decompiled.error} />;
  else if (data) {
    body = (
      <DecompiledSourceView
        qualifiedName={qualifiedName}
        source={data.source}
        sourceLineNumbers={data.sourceLineNumbers}
        mode={editing ? "edit" : "read"}
        draft={draft}
        onDraftChange={setDraft}
        focusRange={focus.range}
        highlightRow={focus.highlightRow}
        markers={markers}
        reveal={reveal}
        onSelectRow={(row) => {
          const line = lineForRow(data.sourceLineNumbers, row);
          onStateChange(updateClassesState(state, { line: line > 0 ? String(line) : "" }), { replace: true });
        }}
      />
    );
  }

  return (
    <div className="flex h-full min-w-0 flex-col gap-2 p-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex min-w-[12rem] max-w-xs flex-1 flex-col gap-1 text-xs">
          Jump to method
          <MethodPicker
            forClass={qualifiedName}
            methods={data?.methods ?? []}
            value={state.method ?? ""}
            disabled={editing}
            onChange={(next) => onStateChange(updateClassesState(state, { method: next, line: "" }), { replace: true })}
          />
        </label>
        {onTraceMethod ? (
          <Button
            size="sm"
            variant="outline"
            disabled={!method}
            title={method ? undefined : "Pick a method first."}
            onClick={() => data && method && onTraceMethod({ class: qualifiedName, loader: data.loader, method: methodKey(method) })}
          >
            Trace method
          </Button>
        ) : null}
        <span className="min-w-0 flex-1 truncate pb-1 text-right font-mono text-xs text-muted-foreground" title={qualifiedName}>
          {qualifiedName}
          {patched ? " · patched" : ""}
          {data ? ` · ${data.decompiler}` : ""}
        </span>
        <ClassDownloads
          qualifiedName={qualifiedName}
          source={editing ? draft : data?.source}
          loadBytecode={() => client.classBytecode(target)}
        />
        {data ? sourceActions?.(data) : null}
        <PatchActions
          editing={editing}
          dirty={editing && draft !== source}
          compiledCurrent={compiledCurrent}
          patched={patched}
          busy={busy}
          leaseSeconds={leaseSeconds}
          onLeaseSecondsChange={setLeaseSeconds}
          canEdit={data !== undefined && editBlocker === undefined}
          editDisabledReason={editBlocker}
          mutationAllowed={allowed}
          onEdit={() => {
            setDraft(source);
            setCompiled(null);
            setFailure(null);
            setEditing(true);
          }}
          onCancel={resetEditing}
          onCompile={() => compile.mutate(draft)}
          onApply={() => apply.mutate(draft)}
          onRestore={() => restore.mutate()}
        />
      </div>
      {editing || patched ? <MutationGate {...gate} label="Allow replacing class bytecode" onConsentChange={setConsent} /> : null}
      {focus.note && !editing ? <p className="text-xs text-muted-foreground">{focus.note}</p> : null}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border bg-muted/10">
        <div className="min-h-0 flex-1">{body}</div>
        <CompileDiagnosticsList
          compilation={compiledDraft}
          appliedMessage={`Patch applied. The original bytecode is restored in ${leaseLabel(leaseSeconds)}.`}
          onSelectDiagnostic={(diagnostic) => setReveal({ row: diagnostic.line - 1 })}
        />
        {failure ? <InlineError title={failure.title} error={failure.error} /> : null}
      </div>
    </div>
  );
}

/**
 * Browse the loaded classes of the JVM in scope, read a class decompiled, and
 * (when allowed) edit it, compile a preview, replace it under a restore lease
 * and restore it. Replacing bytecode goes through the mutation gate.
 */
export function ClassesSurface({ extraPanes = [], storageKey, className, renderClassBadge, ...props }: ClassesSurfaceProps) {
  const { client, keys } = useJvm();
  const { state, onStateChange } = props;
  const loaders = useQuery({ queryKey: keys.classLoaders, queryFn: ({ signal }) => client.classLoaders({ signal }), staleTime: 60_000 });
  const patches = useQuery({ queryKey: keys.patches, queryFn: ({ signal }) => client.patches({ signal }) });

  const loader = state.loader ?? "";
  const query: JvmClassQuery = {
    query: state.q ?? "",
    ...(loader ? { loader } : {}),
    includePlatform: includePlatformFromState(state),
    limit: PAGE_SIZE,
  };
  const classes = useInfiniteQuery({
    queryKey: [...keys.classes(query), "pages"],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => client.classes({ ...query, offset: pageParam }, { signal }),
    getNextPageParam: (last) => {
      const next = last.offset + last.classes.length;
      return last.classes.length > 0 && next < last.total ? next : undefined;
    },
  });
  const refs = useMemo(() => classes.data?.pages.flatMap((page) => page.classes) ?? [], [classes.data]);
  const total = classes.data?.pages[classes.data.pages.length - 1]?.total ?? 0;

  const selected = state.class ? { name: state.class, loader: state.loader ?? refs.find((ref) => ref.name === state.class)?.loader ?? "" } : undefined;
  const panes: WorkspacePaneSpec[] = [
    {
      id: "classes",
      label: "Classes",
      icon: <UiFolder className="size-4" />,
      location: "left",
      width: 340,
      minWidth: 260,
      maxWidth: 640,
      contentClassName: "overflow-hidden",
      content: (
        <div className="flex h-full min-h-0 flex-col gap-2 p-3">
          <ClassBrowser
            className="min-h-0 flex-1"
            loaders={loaders.data ?? []}
            loader={loader}
            onLoaderChange={(next) => onStateChange(updateClassesState(state, { loader: next }))}
            query={state.q ?? ""}
            onQueryChange={(q) => onStateChange(updateClassesState(state, { q }), { replace: true })}
            includePlatform={query.includePlatform ?? false}
            onIncludePlatformChange={(include) => onStateChange(updateClassesState(state, { platform: include ? "true" : "" }), { replace: true })}
            classes={refs}
            total={total}
            loading={classes.isPending || loaders.isPending}
            error={
              classes.error ? (
                <InlineError title="Class listing failed" error={classes.error} />
              ) : loaders.error ? (
                <InlineError title="Class loaders unavailable" error={loaders.error} />
              ) : undefined
            }
            onLoadMore={classes.hasNextPage ? () => void classes.fetchNextPage() : undefined}
            loadingMore={classes.isFetchingNextPage}
            selected={selected}
            onSelectClass={(ref) => onStateChange(updateClassesState(state, { class: ref.name, loader: ref.loader, method: "", line: "" }))}
            renderClassBadge={renderClassBadge}
          />
          <PatchedClassList
            patches={patches.data ?? []}
            selected={selected}
            onSelect={(ref) => onStateChange(updateClassesState(state, { class: ref.name, loader: ref.loader, method: "", line: "" }))}
          />
        </div>
      ),
    },
    {
      id: "source",
      label: state.class || "Source",
      icon: <UiFileCode className="size-4" />,
      location: "center",
      collapsible: false,
      contentClassName: "overflow-hidden",
      content: state.class ? (
        <ClassSourcePane key={`${state.class}:${loader}`} qualifiedName={state.class} {...props} />
      ) : (
        <p className="p-3 text-sm text-muted-foreground">Browse or filter the tree and pick a class to read its decompiled source, then edit and patch it.</p>
      ),
    },
    ...extraPanes,
  ];
  return <Workspace panes={panes} {...(storageKey ? { storageKey } : {})} className={className ?? "h-full rounded border border-border"} />;
}
