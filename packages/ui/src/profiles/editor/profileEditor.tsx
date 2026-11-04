import { Button } from "../../components/button";
import { Workspace } from "../../layout/Workspace";
import type { WorkspacePaneSpec } from "../../layout/Workspace";
import { Modal } from "../../overlay/Modal";
import { useOperationLookupFetcher } from "../../rpc/operationLookupFetcher";
import type { ResolvedOperation } from "../../rpc/types";
import type { OperationsApiClient } from "../../rpc/useOperations";
import { UiListTree, UiTable } from "../../icons";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  cloneProfileDraft,
  mergeSampledProfileColumns,
  profileColumnResetState,
  profileEditorSectionStatus,
  profileEditorSections,
  profileGeneralOptionKeys,
  profileSampleSignature,
  profileUpdateConflictTarget,
  resetProfileColumns,
  validateProfileEditorDraft,
  type ProfileEditorSection,
} from "./profileEditorModel";
import { ProfileEditorPreview } from "./profileEditorPreview";
import { ProfileEditorRail } from "./profileEditorRail";
import {
  ProfileGeneralSection,
  ProfileSchemaSection,
  ProfileSourceSection,
} from "./profileEditorSections";
import { ProfileFieldSidebarList } from "../fields/profileFieldList";
import {
  ProfileFieldEditorForm,
  profileFieldEditorEmptyMessage,
} from "../fields/profileFieldEditor";
import { useProfileFieldState } from "../fields/profileFieldState";
import type { ProfileSample } from "../wizard/profileWizardQueryStep";
import type {
  ProfileColumn,
  ProfileWizardDraft,
} from "../wizard/profileWizardModel";
import { resolveProfileUpdatePath } from "./profileEditorRoutes";
import {
  ProfileParameterDetail,
  ProfileParameterSidebar,
} from "./profileParameterEditor";
import { ProcessorPipeline } from "../processor/processorPipeline";
import type {
  ProcessorPreset,
  ProcessorSpec,
} from "../processor/processorConfig";
import { profileSchema } from "../profileApi";
import { profileApiPath } from "../profileApi";
import { sampleRequestProfile, JsonPathSampleRowsContext } from "../query/jsonPathSample";
import { defaultSpanColumns, obsoleteSpanColumns } from "./spanColumns";
import { ProfileSpansSection } from "./profileSpansSection";
import { useQuery } from "@tanstack/react-query";

const ProfileEditorRaw = lazy(() =>
  import("./profileEditorRaw").then((module) => ({
    default: module.ProfileEditorRaw,
  })),
);

/**
 * The profile editor as a route rather than a dialog.
 *
 * Six sections, ~130 discoverable fields and a CEL editor per column outgrew a
 * modal: the layout is a clicky-ui Workspace, so the section rail, the column
 * grid and the sampled preview are panes the user can resize, collapse and keep
 * across visits. Collection fields stay in the rail while the selected item is
 * edited in the center, keeping names and icons visible throughout the edit.
 */
export function ProfileEditor({
  client,
  action,
  surfaceKey,
  initialValue,
  onClose,
  onSuccess,
}: {
  client: OperationsApiClient;
  action: ResolvedOperation;
  surfaceKey: string;
  initialValue: Record<string, unknown>;
  onClose: () => void;
  onSuccess: (name: string) => void | Promise<void>;
}) {
  const lookupFetcher = useOperationLookupFetcher(client);
  const initialDraft = useMemo(
    () => cloneProfileDraft(initialValue),
    [initialValue],
  );
  const initialSerialized = useMemo(
    () => JSON.stringify(initialDraft),
    [initialDraft],
  );
  const [draft, setDraft] = useState<ProfileWizardDraft>(initialDraft);
  const [section, setSection] = useState<ProfileEditorSection>(initialDraft.render === "traces" ? "spans" : "general");
  const [discovered, setDiscovered] = useState<ProfileColumn[]>(
    initialDraft.render === "traces" ? defaultSpanColumns() : initialDraft.columns ?? [],
  );
  const [sampledColumns, setSampledColumns] = useState<ProfileColumn[]>([]);
  const [sampleRows, setSampleRows] = useState<Record<string, unknown>[]>([]);
  const [mappingRows, setMappingRows] = useState<Record<string, unknown>[]>([]);
  const [activeField, setActiveField] = useState(
    initialDraft.columns?.[0]?.name ?? "",
  );
  const [activeParameter, setActiveParameter] = useState(0);
  const [activeProcessor, setActiveProcessor] = useState(0);
  const [lastSampleSignature, setLastSampleSignature] = useState(() =>
    profileSampleSignature(initialDraft),
  );
  const [rawValid, setRawValid] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [replaceTarget, setReplaceTarget] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmResetColumns, setConfirmResetColumns] = useState(false);
  const dirty = JSON.stringify(draft) !== initialSerialized;
  const [normalizedRows, setNormalizedRows] = useState<Record<string, unknown>[]>([]);
  const traces = draft.render === "traces";
  const obsolete = traces ? obsoleteSpanColumns(draft.columns ?? [], discovered) : [];
  const validationError = validateProfileEditorDraft(draft) ?? (obsolete.length ? `Columns require normalized sources: ${obsolete.join(", ")}. Reset to default or remove them.` : null);
  const sampleStale = profileSampleSignature(draft) !== lastSampleSignature;
  const resetState = traces ? {visible:true, disabled:false, title:"Reset to default"} : profileColumnResetState({
    providerType: draft.provider?.type ?? "",
    sampledColumnCount: sampledColumns.length,
    sampleStale,
  });

  const fields = useProfileFieldState({
    normalizedOnly: traces,
    discovered,
    configured: draft.columns ?? [],
    activeName: activeField,
    onConfiguredChange: (columns) =>
      setDraft((current) => ({ ...current, columns })),
    onActiveNameChange: setActiveField,
  });
  const processors = Array.isArray(draft.processors)
    ? (draft.processors as ProcessorSpec[])
    : [];
  const processorPresets = useMemo(() => {
    const processorSchema = profileSchema().properties?.processors;
    return (
      (processorSchema?.["x-clicky-presets"] as
        | Record<string, ProcessorPreset>
        | undefined) ?? {}
    );
  }, []);
  const setProcessors = useCallback(
    (next: ProcessorSpec[]) =>
      setDraft((current) => ({ ...current, processors: next })),
    [],
  );

  // A route can be refreshed or navigated away from; the dialog used to guard
  // unsaved edits with confirmClose, so the route has to guard them too.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = async (replaceExisting = false) => {
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!client.submitForm) {
      setError("Profile updates are unavailable");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = {
        ...draft,
        id: surfaceKey,
        ...(replaceExisting ? { replaceExisting: true } : {}),
      };
      const response = await client.submitForm(
        resolveProfileUpdatePath(action.path, surfaceKey),
        action.method,
        body,
      );
      if (!response.success) {
        const message =
          response.error || response.message || "Profile update failed";
        const target = profileUpdateConflictTarget(message);
        if (target && !replaceExisting) {
          setReplaceTarget(target);
          return;
        }
        throw new Error(message);
      }
      await onSuccess(draft.profile!.trim());
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Profile update failed",
      );
    } finally {
      setSaving(false);
    }
  };

  const acceptSample = useCallback(({ columns, rows, sourceDraft, mappingInputRows }: ProfileSample) => {
    if (!mappingInputRows) throw new Error("Sample response is missing mappingInputRows");
    setMappingRows(mappingInputRows);
    setSampledColumns(structuredClone(columns));
    if (sourceDraft.render !== "traces") setDiscovered(columns);
    setSampleRows(rows);
    setDraft((current) => ({
      ...current,
      columns: current.render === "traces" ? current.columns ?? defaultSpanColumns() : mergeSampledProfileColumns(current.columns ?? [], columns),
    }));
    setActiveField((current) => current || columns[0]?.name || "");
    setLastSampleSignature(profileSampleSignature(sourceDraft));
  }, []);

  const sourceSample = useQuery({
    queryKey:["profile-editor-source", profileSampleSignature(initialDraft)],
    enabled:initialDraft.render === "traces", staleTime:Infinity, retry:false, refetchOnWindowFocus:false,
    queryFn:async () => {
      const response = await fetch(profileApiPath("profile/sample"), {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({profile:sampleRequestProfile(initialDraft),params:{},previewProcessors:true})});
      if (!response.ok) throw new Error(await response.text());
      return await response.json() as Omit<ProfileSample,"sourceDraft">;
    },
  });
  useEffect(() => {
    if (sourceSample.data) acceptSample({...sourceSample.data,sourceDraft:initialDraft});
    if (sourceSample.error) setError(sourceSample.error.message);
  }, [sourceSample.data,sourceSample.error,initialDraft,acceptSample]);

  const acceptNormalized = useCallback((rows: Record<string, unknown>[], columns: ProfileColumn[]) => {
    setNormalizedRows(rows);
    setDiscovered(columns);
  }, []);

  const resetColumns = () => {
    const defaults = traces ? defaultSpanColumns() : sampledColumns;
    const first = defaults[0];
    if (!first) throw new Error("cannot reset columns without a sample");
    setDraft((current) => resetProfileColumns(current, defaults));
    setActiveField(first.name);
    setConfirmResetColumns(false);
  };

  const sectionContent = (
    <div className="@container h-full overflow-auto p-5">
      {traces && (section === "spans" || section === "columns") ? <div className="mb-4 flex items-center gap-3">
        <Button type="button" variant="outline" onClick={() => setConfirmResetColumns(true)}>Reset to default</Button>
        {validationError ? <p role="alert" className="text-sm text-destructive">{validationError}</p> : null}
      </div> : null}
      {section === "general" ? (
        <div className="space-y-4">
          <ProfileGeneralSection draft={draft} onChange={setDraft} />
          <ProfileSchemaSection
            draft={draft}
            keys={profileGeneralOptionKeys}
            title="General options"
            description="Compose profiles with imports and aliases, choose the output fields, and ignore values that should not be retained."
            idPrefix="profile-general-options"
            {...(lookupFetcher ? { lookupFetcher } : {})}
            onChange={setDraft}
          />
        </div>
      ) : null}
      {section === "source" ? (
        <ProfileSourceSection
          draft={draft}
          discovered={discovered}
          sampleStale={sampleStale}
          {...(lookupFetcher ? { lookupFetcher } : {})}
          onChange={setDraft}
          onSample={acceptSample}
        />
      ) : null}
      {section === "spans" && traces ? <>
        <ProfileSpansSection draft={draft} rows={mappingRows} normalizedRows={normalizedRows} onChange={setDraft} />
        <details className="mt-4"><summary>Source sample</summary><pre className="overflow-auto text-xs">{JSON.stringify(mappingRows[0] ?? {}, null, 2)}</pre></details>
      </> : null}
      {section === "columns" ? (
        fields.activeField ? (
          <section className="rounded-xl border bg-card p-5">
            <div className="max-w-6xl">
              <ProfileFieldEditorForm
                field={fields.activeField}
                onChange={fields.updateActiveField}
              />
            </div>
          </section>
        ) : (
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            {profileFieldEditorEmptyMessage}
          </div>
        )
      ) : null}
      {section === "parameters" ? (
        <ProfileParameterDetail
          draft={draft}
          activeIndex={activeParameter}
          onChange={setDraft}
        />
      ) : null}
      {section === "processors" ? (
        <div className="max-w-5xl">
          <ProcessorPipeline
            steps={processors}
            presets={processorPresets}
            profile={draft}
            selectedIndex={activeProcessor}
            showSteps={false}
            onSelectedIndexChange={setActiveProcessor}
            onChange={setProcessors}
          />
        </div>
      ) : null}
      {section === "raw" ? (
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">
              Loading YAML editor…
            </p>
          }
        >
          <ProfileEditorRaw
            draft={draft}
            onChange={setDraft}
            onValidityChange={setRawValid}
          />
        </Suspense>
      ) : null}
    </div>
  );

  const panes = useMemo<WorkspacePaneSpec[]>(() => {
    const rail: WorkspacePaneSpec = {
      id: "sections",
      label: "Profile",
      icon: <UiListTree />,
      location: "left",
      width: 340,
      minWidth: 280,
      maxWidth: 480,
      content: (
        <ProfileEditorRail
          traces={traces}
          value={section}
          status={profileEditorSectionStatus({
            draft,
            availableColumns: fields.available.length,
            sampleStale,
          })}
          collections={{
            columns: (
              <ProfileFieldSidebarList
                state={fields}
                onFieldSelect={(name) => {
                  fields.setActiveName(name);
                  setSection("columns");
                }}
                onAdd={() => setSection("columns")}
                {...(resetState.visible
                  ? {
                      reset: {
                        disabled: resetState.disabled,
                        title: resetState.title,
                        onReset: () => setConfirmResetColumns(true),
                      },
                    }
                  : {})}
              />
            ),
            parameters: (
              <ProfileParameterSidebar
                draft={draft}
                activeIndex={activeParameter}
                onActiveIndexChange={(index) => {
                  setActiveParameter(index);
                  setSection("parameters");
                }}
                onChange={setDraft}
              />
            ),
            processors: (
              <ProcessorPipeline
                steps={processors}
                presets={processorPresets}
                profile={draft}
                selectedIndex={activeProcessor}
                showEditor={false}
                tree
                onSelectedIndexChange={(index) => {
                  setActiveProcessor(index);
                  setSection("processors");
                }}
                onChange={setProcessors}
              />
            ),
          }}
          onChange={setSection}
        />
      ),
    };

    const result: WorkspacePaneSpec[] = [
      rail,
      {
        id: "section",
        label: sectionLabel(section),
        location: "center",
        collapsible: false,
        showHeader: false,
        contentClassName: "p-0",
        content: sectionContent,
      },
    ];
    if (section === "columns" || section === "spans" || (section === "source" && draft.search)) {
      result.push({
        id: "preview",
        label: "Preview",
        icon: <UiTable />,
        location: "bottom",
        height: 400,
        minHeight: 120,
        slots: {
          headerTrailing: (
            <span className="text-[11px] text-muted-foreground">
              {sampleRows.length
                ? `${sampleRows.length} sampled rows · updates as you edit`
                : "No sample yet"}
            </span>
          ),
        },
        content: (
          <ProfileEditorPreview
            profile={draft}
            columns={draft.columns ?? []}
            rows={draft.render === "traces" ? mappingRows : sampleRows}
            stale={sampleStale}
            onNormalized={acceptNormalized}
          />
        ),
      });
    }
    return result;
  }, [
    activeParameter,
    activeProcessor,
    draft,
    fields,
    resetState,
    sampleRows,
    mappingRows,
    sampleStale,
    section,
    sectionContent,
    processorPresets,
    processors,
    setProcessors,
    traces,
    acceptNormalized,
  ]);

  const leave = () => (dirty ? setConfirmDiscard(true) : onClose());

  return (
    <JsonPathSampleRowsContext.Provider value={section === "spans" ? mappingRows : normalizedRows.length ? normalizedRows : sampleRows}>
      <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] bg-background">
        <header className="flex items-center gap-3 border-b border-border px-4 py-2.5">
          <nav className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
            <button
              type="button"
              className="hover:text-foreground"
              onClick={leave}
            >
              Profiles
            </button>
            <span>/</span>
            <button
              type="button"
              className="min-w-0 truncate hover:text-foreground"
              onClick={leave}
            >
              {initialDraft.profile ?? surfaceKey}
            </button>
            <span>/</span>
            <span className="font-medium text-foreground">Edit</span>
          </nav>
          {error ? (
            <span className="truncate text-sm text-destructive">{error}</span>
          ) : null}
          <span className="ml-auto hidden shrink-0 text-xs text-muted-foreground md:block">
            {dirty ? "Unsaved changes" : "No changes"}
          </span>
          <Button type="button" size="sm" variant="ghost" onClick={leave}>
            Discard
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={
              saving ||
              Boolean(validationError) ||
              (section === "raw" && !rawValid)
            }
            title={validationError ?? undefined}
            onClick={() => void save()}
          >
            {saving ? "Saving…" : "Save profile"}
          </Button>
        </header>

        <Workspace panes={panes} storageKey="profile-editor-v2" />
      </div>

      {confirmDiscard ? (
        <Modal
          open
          onClose={() => setConfirmDiscard(false)}
          title="Discard profile changes?"
          size="sm"
          footer={
            <div className="flex w-full justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmDiscard(false)}
              >
                Keep editing
              </Button>
              <Button type="button" variant="destructive" onClick={onClose}>
                Discard changes
              </Button>
            </div>
          }
        >
          <p className="text-sm text-muted-foreground">
            Your unsaved profile changes will be lost.
          </p>
        </Modal>
      ) : null}

      {confirmResetColumns ? (
        <Modal
          open
          onClose={() => setConfirmResetColumns(false)}
          title={traces ? "Reset to default?" : "Reset columns from latest sample?"}
          size="sm"
          footer={
            <div className="flex w-full justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirmResetColumns(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={resetState.disabled}
                onClick={resetColumns}
              >
                {traces ? "Reset to default" : "Reset columns"}
              </Button>
            </div>
          }
        >
          <p className="text-sm text-muted-foreground">
            Replace {fields.configuredCount} configured column
            {fields.configuredCount === 1 ? "" : "s"} with{" "}
            {traces ? "the canonical default columns" : `${sampledColumns.length} columns from the latest sample`}.
            Custom labels, expressions, formatting, filtering, ordering, and
            manually added columns will be removed. The profile will remain
            unsaved until you save it.
          </p>
        </Modal>
      ) : null}

      {replaceTarget ? (
        <Modal
          open
          onClose={() => setReplaceTarget("")}
          title={`Replace ${replaceTarget}?`}
          size="sm"
          footer={
            <div className="flex w-full justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setReplaceTarget("")}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={saving}
                onClick={() => {
                  setReplaceTarget("");
                  void save(true);
                }}
              >
                Replace profile
              </Button>
            </div>
          }
        >
          <p className="text-sm text-muted-foreground">
            A profile named {replaceTarget} already exists. Its definition will
            be overwritten, the current profile will be renamed, and dependent
            imports will be updated atomically.
          </p>
        </Modal>
      ) : null}
    </JsonPathSampleRowsContext.Provider>
  );
}

function sectionLabel(section: ProfileEditorSection): string {
  return profileEditorSections.find((entry) => entry.id === section)!.label;
}
