import { UiDatabase, UiFilter, UiFunnelData, UiListChecks, UiListDashes, UiListOrdered } from "../../icons";
import { EditorField, EnumField, inputClassName } from "./profileFieldControls";
import { profileFilterKindOptions } from "./profileFieldIcons";
import {
  inferredFilterKind,
  patchColumnFilter,
  PROFILE_FILTER_DEFAULT_LIMIT,
  PROFILE_FILTER_KIND_OPTIONS,
  PROFILE_FILTER_MAX_LIMIT,
  type Patch,
  type ProfileColumn,
  type ProfileColumnFilter,
} from "../wizard/profileWizardModel";

/**
 * How this column is filtered. Collapsed by default: every field here overrides
 * an inference the server already makes correctly for most columns, so opening
 * it should be a deliberate act rather than the price of editing a label.
 *
 * The Filter toggle leads and gates the rest: a column that offers no filter has
 * nothing to say about its control, its backend field or its values, so those
 * are hidden rather than left editable and inert.
 */
export function ProfileFieldFilterEditor({
  field,
  columns,
  onChange,
}: {
  field: ProfileColumn;
  columns: 1 | 2;
  onChange: (patch: Patch<ProfileColumn>) => void;
}) {
  const filter = field.filter ?? {};
  const set = (patch: Patch<ProfileColumnFilter>) =>
    onChange({ filter: patchColumnFilter(field.filter, patch) });

  // A value selection is the only kind with a list to enumerate; a range, a
  // toggle and a substring are typed rather than picked.
  const kind = filter.kind ?? inferredFilterKind(field);
  const picksFromAList = kind === "terms";
  const enumerated = (filter.options?.length ?? 0) > 0;
  // Declaring the values IS the answer the lookup would go and fetch, so the two
  // are mutually exclusive — the server enforces this and the form mirrors it.
  const looksUp = picksFromAList && !enumerated && (filter.lookup ?? true);
  const enabled = !filter.disabled;
  const wide = columns === 2 ? "sm:col-span-2" : "";

  return (
    <details className="rounded-md border px-3 py-2">
      <summary className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <UiFilter className="shrink-0 text-[15px] text-muted-foreground" />
        Filtering
        <span className="text-xs font-normal text-muted-foreground">
          {enabled ? summarizeFilter(kind, enumerated, looksUp, filter.limit) : "off"}
        </span>
      </summary>
      <div className={`mt-3 grid gap-4 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        <label className={`flex items-center gap-2 text-sm font-medium ${wide}`}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => set({ disabled: event.target.checked ? undefined : true })}
          />
          Filter
          <span className="text-xs font-normal text-muted-foreground">
            Offer a filter for this column
          </span>
        </label>
        {enabled ? (
          <>
            <EnumField
              label="Filter type"
              icon={<UiFunnelData />}
              help="Overrides the control derived from Type; set it where the rendered type and the backend storage disagree."
              value={filter.kind ?? ""}
              options={profileFilterKindOptions}
              placeholder={`From Type (${filterKindLabel(kind)})`}
              onChange={(next) => set({ kind: next })}
            />
            <EditorField label="Backend field" icon={<UiDatabase />} help="The indexed field for a document store, the result column for SQL; blank infers it from the column.">
              <input aria-label="Backend field" value={filter.field ?? ""} className={inputClassName} placeholder={field.source || field.name} onChange={(event) => set({ field: event.target.value || undefined })} />
            </EditorField>
            {picksFromAList ? (
              <>
                <div className={wide}>
                  <EditorField label="Values" icon={<UiListDashes />} help="Comma-separated values to offer instead of asking the backend; leave blank to enumerate from the data.">
                    <input
                      aria-label="Values"
                      value={(filter.options ?? []).join(", ")}
                      className={inputClassName}
                      placeholder="Ask the backend"
                      onChange={(event) => set({ options: parseFilterOptions(event.target.value) })}
                    />
                  </EditorField>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={looksUp}
                    disabled={enumerated}
                    onChange={(event) => set({ lookup: event.target.checked })}
                  />
                  <span className={enumerated ? "text-muted-foreground" : undefined}>
                    {enumerated ? "Values are listed above" : "Look values up from the data"}
                  </span>
                </label>
                <EditorField label="Values offered" icon={<UiListOrdered />} help={`How many distinct values the control lists before the rest have to be typed for. Blank uses ${PROFILE_FILTER_DEFAULT_LIMIT}.`}>
                  <input
                    aria-label="Values offered"
                    type="number"
                    min={1}
                    max={PROFILE_FILTER_MAX_LIMIT}
                    value={filter.limit ?? ""}
                    disabled={!looksUp}
                    className={inputClassName}
                    placeholder={String(PROFILE_FILTER_DEFAULT_LIMIT)}
                    onChange={(event) => set({ limit: event.target.value ? Number(event.target.value) : undefined })}
                  />
                </EditorField>
              </>
            ) : null}
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={filter.multi ?? true} onChange={(event) => set({ multi: event.target.checked })} />
              <UiListChecks className="text-[15px] text-muted-foreground" />
              Allow several values at once
            </label>
          </>
        ) : null}
      </div>
    </details>
  );
}

function parseFilterOptions(raw: string): string[] | undefined {
  const values = raw.split(",").map((value) => value.trim()).filter(Boolean);
  return values.length ? values : undefined;
}

function filterKindLabel(kind: string): string {
  return PROFILE_FILTER_KIND_OPTIONS.find((option) => option.value === kind)?.label ?? kind;
}

function summarizeFilter(kind: string, enumerated: boolean, looksUp: boolean, limit?: number) {
  const control = filterKindLabel(kind);
  if (enumerated) return `${control}, listed`;
  if (!looksUp) return control;
  return `${control}, top ${limit ?? PROFILE_FILTER_DEFAULT_LIMIT}`;
}
