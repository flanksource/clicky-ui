import {
  UiDatabase,
  UiListChecks,
  UiListDashes,
  UiListOrdered,
  UiMagicWand,
  UiProhibit,
} from "../../icons";
import { EditorField, inputClassName } from "./profileFieldControls";
import { profileFilterKindIcon } from "./profileFieldIcons";
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

type FilterState = "auto" | "off" | string;

const FILTER_SEGMENTS = [
  { value: "auto", label: "Auto", icon: <UiMagicWand /> },
  { value: "off", label: "Off", icon: <UiProhibit /> },
  ...PROFILE_FILTER_KIND_OPTIONS.filter(
    (option) => option.value !== "none",
  ).map((option) => ({
    ...option,
    icon: profileFilterKindIcon(option.value),
  })),
] as const;

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
  const state: FilterState =
    filter.disabled || filter.kind === "none" ? "off" : filter.kind || "auto";
  const effectiveKind = state === "auto" ? inferredFilterKind(field) : state;
  const enabled = state !== "off" && effectiveKind !== "none";
  const picksFromAList = effectiveKind === "terms";
  const supportsMultiple = picksFromAList || effectiveKind === "exact";
  const enumerated = (filter.options?.length ?? 0) > 0;
  const looksUp = picksFromAList && !enumerated && (filter.lookup ?? true);
  const wide = columns === 2 ? "sm:col-span-2" : "";

  const set = (patch: Patch<ProfileColumnFilter>) =>
    onChange({ filter: patchColumnFilter(field.filter, patch) });
  const selectState = (next: FilterState) => {
    if (next === "off") {
      set({
        disabled: true,
        kind: filter.kind === "none" ? undefined : filter.kind,
      });
      return;
    }
    const kind = next === "auto" ? inferredFilterKind(field) : next;
    const selected = patchColumnFilter(filter, {
      disabled: undefined,
      kind: next === "auto" ? undefined : next,
    });
    onChange({ filter: filterForKind(selected, kind) });
  };

  return (
    <section className={`grid gap-4 ${wide}`} aria-label="Filtering">
      <div className="grid gap-1.5">
        <span className="text-sm font-medium">Filter type</span>
        <div
          role="radiogroup"
          aria-label="Filter type"
          className="flex flex-wrap gap-1 rounded-md border bg-muted/30 p-1"
        >
          {FILTER_SEGMENTS.map((segment) => {
            const selected = state === segment.value;
            return (
              <label
                key={segment.value}
                title={segment.label}
                className={`flex h-9 cursor-pointer items-center gap-1.5 rounded px-2 text-xs transition-colors focus-within:ring-2 focus-within:ring-primary/30 ${
                  selected
                    ? "bg-background font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-background/70 hover:text-foreground"
                }`}
              >
                <input
                  type="radio"
                  name={`filter-type-${field.name}`}
                  value={segment.value}
                  checked={selected}
                  aria-label={segment.label}
                  className="sr-only"
                  onChange={() => selectState(segment.value)}
                />
                <span className="text-[15px]">{segment.icon}</span>
                <span>{segment.label}</span>
              </label>
            );
          })}
        </div>
        <span className="text-xs text-muted-foreground">
          Auto derives the control from the data type; choose a type to override it.
        </span>
      </div>

      {enabled ? (
        <div className={`grid gap-4 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
          <EditorField
            label="Backend field"
            icon={<UiDatabase />}
            help="The indexed field for a document store, or the result column for SQL; blank infers it from the column."
          >
            <input
              aria-label="Backend field"
              value={filter.field ?? ""}
              className={inputClassName}
              placeholder={field.source || field.name}
              onChange={(event) =>
                set({ field: event.target.value || undefined })
              }
            />
          </EditorField>
          {picksFromAList ? (
            <>
              <div className={wide}>
                <EditorField
                  label="Values"
                  icon={<UiListDashes />}
                  help="Comma-separated values to offer instead of asking the backend; leave blank to enumerate from the data."
                >
                  <input
                    aria-label="Values"
                    value={(filter.options ?? []).join(", ")}
                    className={inputClassName}
                    placeholder="Ask the backend"
                    onChange={(event) =>
                      set({ options: parseFilterOptions(event.target.value) })
                    }
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
                <span
                  className={enumerated ? "text-muted-foreground" : undefined}
                >
                  {enumerated
                    ? "Values are listed above"
                    : "Look values up from the data"}
                </span>
              </label>
              <EditorField
                label="Values offered"
                icon={<UiListOrdered />}
                help={`How many distinct values the control lists before the rest have to be typed. Blank uses ${PROFILE_FILTER_DEFAULT_LIMIT}.`}
              >
                <input
                  aria-label="Values offered"
                  type="number"
                  min={1}
                  max={PROFILE_FILTER_MAX_LIMIT}
                  value={filter.limit ?? ""}
                  disabled={!looksUp}
                  className={inputClassName}
                  placeholder={String(PROFILE_FILTER_DEFAULT_LIMIT)}
                  onChange={(event) =>
                    set({
                      limit: event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    })
                  }
                />
              </EditorField>
            </>
          ) : null}
          {supportsMultiple ? (
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={filter.multi ?? true}
                onChange={(event) => set({ multi: event.target.checked })}
              />
              <UiListChecks className="text-[15px] text-muted-foreground" />
              Allow several values at once
            </label>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function filterForKind(
  filter: ProfileColumnFilter | undefined,
  kind: string,
): ProfileColumnFilter | undefined {
  if (kind === "terms") return filter;
  if (kind === "exact") {
    return patchColumnFilter(filter, {
      options: undefined,
      lookup: undefined,
      limit: undefined,
    });
  }
  return patchColumnFilter(filter, {
    options: undefined,
    lookup: undefined,
    limit: undefined,
    multi: undefined,
  });
}

function parseFilterOptions(raw: string): string[] | undefined {
  const values = raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return values.length ? values : undefined;
}
