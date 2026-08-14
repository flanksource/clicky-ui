import { Button } from "../../components/button";
import { Workspace } from "../../layout/Workspace";
import type { WorkspacePaneSpec } from "../../layout/Workspace";
import { Modal } from "../../overlay/Modal";
import { useOperationLookupFetcher } from "../../rpc/operationLookupFetcher";
import type { ResolvedOperation } from "../../rpc/types";
import type { OperationsApiClient } from "../../rpc/useOperations";
import { UiColumns, UiListTree, UiTable } from "../../icons";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  cloneProfileDraft,
  mergeSampledProfileColumns,
  profileColumnResetState,
  profileEditorSectionStatus,
  profileEditorSections,
  profileGeneralOptionKeys,
  profileProcessorKeys,
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
import {
  ProfileFieldFilters,
  ProfileFieldList,
} from "../fields/profileFieldList";
import { useProfileFieldState } from "../fields/profileFieldState";
import type { ProfileSample } from "../wizard/profileWizardQueryStep";
import { JsonPathProfileProvider } from "../query/jsonPathSampleRow";
import type {
  ProfileColumn,
  ProfileWizardDraft,
} from "../wizard/profileWizardModel";
import { resolveProfileUpdatePath } from "./profileEditorRoutes";

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
 * across visits. A column's own properties open inside its grid row rather than
 * as a fourth pane, so editing one never moves the eye off the list.
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
  const [section, setSection] = useState<ProfileEditorSection>("general");
  const [discovered, setDiscovered] = useState<ProfileColumn[]>(
    initialDraft.columns ?? [],
  );
  const [sampledColumns, setSampledColumns] = useState<ProfileColumn[]>([]);
  const [sampleRows, setSampleRows] = useState<Record<string, unknown>[]>([]);
  const [activeField, setActiveField] = useState(
    initialDraft.columns?.[0]?.name ?? "",
  );
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
  const validationError = validateProfileEditorDraft(draft);
  const sampleStale = profileSampleSignature(draft) !== lastSampleSignature;
  const resetState = profileColumnResetState({
    providerType: draft.provider?.type ?? "",
    sampledColumnCount: sampledColumns.length,
    sampleStale,
  });

  const fields = useProfileFieldState({
    discovered,
    configured: draft.columns ?? [],
    activeName: activeField,
    onConfiguredChange: (columns) =>
      setDraft((current) => ({ ...current, columns })),
    onActiveNameChange: setActiveField,
  });

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

  const acceptSample = ({ columns, rows, sourceDraft }: ProfileSample) => {
    setSampledColumns(structuredClone(columns));
    setDiscovered(columns);
    setSampleRows(rows);
    setDraft((current) => ({
      ...current,
      columns: mergeSampledProfileColumns(current.columns ?? [], columns),
    }));
    setActiveField((current) => current || columns[0]?.name || "");
    setLastSampleSignature(profileSampleSignature(sourceDraft));
  };

  const resetColumns = () => {
    const first = sampledColumns[0];
    if (!first) throw new Error("cannot reset columns without a sample");
    setDraft((current) => resetProfileColumns(current, sampledColumns));
    setActiveField(first.name);
    setConfirmResetColumns(false);
  };

  const sectionContent = (
    <div className="h-full overflow-auto p-5">
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
      {section === "parameters" ? (
        <ProfileSchemaSection
          draft={draft}
          keys={["params"]}
          title="Parameters"
          // The zero-item explanation lives on the schema now (it is the add
          // row's own copy), so this stays a one-liner rather than repeating it.
          description="Named values the profile query and filters accept at run time."
          idPrefix="profile-parameters"
          // The accordion needs the full pane for its auto-fill grid — the
          // default 600px stack would cap it at two columns — and its help
          // belongs on the label, not stacked under every control.
          layout={{ mode: "stacked", valueMaxWidth: "none", help: "hover" }}
          onChange={setDraft}
        />
      ) : null}
      {section === "processors" ? (
        <ProfileSchemaSection
          draft={draft}
          keys={profileProcessorKeys}
          title="Processors"
          description="Add and configure ordered post-query transformations, then preview the selected stage."
          idPrefix="profile-processors"
          onChange={setDraft}
        />
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
      width: 240,
      minWidth: 180,
      maxWidth: 340,
      content: (
        <ProfileEditorRail
          value={section}
          status={profileEditorSectionStatus({
            draft,
            availableColumns: fields.available.length,
            sampleStale,
          })}
          onChange={setSection}
        />
      ),
    };

    if (section !== "columns") {
      return [
        rail,
        {
          id: "section",
          label: sectionLabel(section),
          location: "center",
          collapsible: false,
          contentClassName: "p-0",
          content: sectionContent,
        },
      ];
    }

    return [
      rail,
      {
        id: "columns",
        label: "Columns",
        icon: <UiColumns />,
        location: "center",
        collapsible: false,
        contentClassName: "flex flex-col overflow-hidden",
        slots: {
          headerTrailing: (
            <>
              <span className="text-[11px] text-muted-foreground">
                {fields.configuredCount} of {fields.available.length} included
              </span>
              {resetState.visible ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={resetState.disabled}
                  title={resetState.title}
                  onClick={() => setConfirmResetColumns(true)}
                >
                  Reset columns
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={fields.addField}
              >
                Add column
              </Button>
            </>
          ),
        },
        content: (
          <>
            <div className="shrink-0 border-b border-border p-2">
              <ProfileFieldFilters state={fields} compact />
            </div>
            <ProfileFieldList state={fields} />
          </>
        ),
      },
      {
        id: "preview",
        label: "Preview",
        icon: <UiTable />,
        location: "bottom",
        height: 220,
        minHeight: 120,
        maxHeight: 520,
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
            columns={draft.columns ?? []}
            rows={sampleRows}
          />
        ),
      },
    ];
  }, [
    draft,
    fields,
    resetState,
    sampleRows,
    sampleStale,
    section,
    sectionContent,
  ]);

  const leave = () => (dirty ? setConfirmDiscard(true) : onClose());

  return (
    <JsonPathProfileProvider profile={draft}>
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
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
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

        <Workspace panes={panes} storageKey="profile-editor" />
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
          title="Reset columns from latest sample?"
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
                Reset columns
              </Button>
            </div>
          }
        >
          <p className="text-sm text-muted-foreground">
            Replace {fields.configuredCount} configured column
            {fields.configuredCount === 1 ? "" : "s"} with{" "}
            {sampledColumns.length} column
            {sampledColumns.length === 1 ? "" : "s"} from the latest sample.
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
    </JsonPathProfileProvider>
  );
}

function sectionLabel(section: ProfileEditorSection): string {
  return profileEditorSections.find((entry) => entry.id === section)!.label;
}
