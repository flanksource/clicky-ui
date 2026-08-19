import { JSONPathField } from "../../components/JSONPathField";
import { Button } from "../../components/button";
import {
  UiBraces,
  UiColumns,
  UiEyeClosed,
  UiFileType,
  UiFunctionSquare,
  UiPalette,
  UiScale,
  UiTableProperties,
  UiTag,
} from "../../icons";
import { CelTestButton } from "../cel/celEditor";
import { celFieldAccess } from "../cel/celPath";
import { EditorField, EnumField, inputClassName } from "./profileFieldControls";
import { ProfileFieldFilterEditor } from "./profileFieldFilterEditor";
import {
  profileFormatOptions,
  profileRoleOptions,
  profileTypeIcon,
  profileTypeOptions,
  profileUnitOptions,
} from "./profileFieldIcons";
import type { Patch, ProfileColumn } from "../wizard/profileWizardModel";
import { evaluateJsonPath, useJsonPathSampleRows } from "../query/jsonPathSample";

type FieldActions = {
  selected: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSelectedChange: (selected: boolean) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
};

export const profileFieldEditorEmptyMessage =
  "Add a column or run a sample to discover fields.";

/**
 * The starting points offered before a value is in hand.
 *
 * This header has only the field's name to go on — the sampled value lives in
 * the Test dialog, which is where the examples that fit it are offered. So
 * these stay deliberately generic and lead there.
 */
function celExamples(fieldName: string): Array<{ label: string; expression: string }> {
  const field = celFieldAccess(fieldName);
  return [
    { label: "Use the entire row", expression: "row" },
    { label: `Read ${fieldName}`, expression: field.reference },
    {
      label: `Default ${fieldName} when missing`,
      expression: `${field.presence} ? ${field.reference} : ""`,
    },
    { label: `Convert ${fieldName} to text`, expression: `string(${field.reference})` },
    { label: `Scale ${fieldName} by 1,000`, expression: `${field.reference} / 1000.0` },
  ];
}

/** Ordering, removal and inclusion — the operations that act on the field as a
 *  whole rather than on one of its properties. */
export function ProfileFieldEditorActions({
  canMoveUp,
  canMoveDown,
  selected,
  onSelectedChange,
  onMoveUp,
  onMoveDown,
  onRemove,
}: FieldActions) {
  return (
    <>
      <Button type="button" size="sm" variant="ghost" disabled={!canMoveUp} onClick={onMoveUp}>
        Move up
      </Button>
      <Button type="button" size="sm" variant="ghost" disabled={!canMoveDown} onClick={onMoveDown}>
        Move down
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={onRemove}>
        Remove
      </Button>
      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelectedChange(event.target.checked)}
        />
        Include
      </label>
    </>
  );
}

/**
 * Everything about a column that a grid cell cannot hold: role, format, unit
 * and the CEL expression. `columns` is explicit rather than a `sm:` breakpoint
 * because the wizard mounts this in a ~380px pane on a wide viewport, where
 * viewport-based breakpoints would wrongly go two-up.
 */
export function ProfileFieldEditorForm({
  field,
  columns = 2,
  onChange,
}: {
  field: ProfileColumn;
  columns?: 1 | 2;
  onChange: (patch: Patch<ProfileColumn>) => void;
}) {
  const wide = columns === 2 ? "sm:col-span-2" : "";
  const rows = useJsonPathSampleRows();
  return (
    <div className={`grid gap-4 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      <EditorField label="Output name" icon={profileTypeIcon(field.type)} help="Public field name used by tables, filters, APIs, and every export.">
        <input aria-label="Output name" value={field.name} className={inputClassName} onChange={(event) => onChange({ name: event.target.value })} />
      </EditorField>
      <EditorField label="Display label" icon={<UiTag />} help="Optional table header; blank uses the field name.">
        <input aria-label="Display label" value={field.label ?? ""} className={inputClassName} placeholder={field.name} onChange={(event) => onChange({ label: event.target.value || undefined })} />
      </EditorField>
      <EnumField
        label="Data type"
        icon={<UiFileType />}
        help="Value shape and default formatting; independent of Role."
        value={field.type ?? ""}
        options={profileTypeOptions}
        placeholder="Auto detect"
        onChange={(next) => onChange({ type: next })}
      />
      <EnumField
        label="Role"
        icon={<UiTableProperties />}
        help="Optional table behavior. Timestamp also types the field as datetime, since it is the column the date-range control reads."
        value={field.kind ?? ""}
        options={profileRoleOptions}
        placeholder="Standard field"
        // Naming the time column and leaving it typed as a string is a state
        // nobody wants: the header drives a date range while the cell renders
        // raw. The wizard already couples the two (mapTimestampColumn); doing
        // it here too is what keeps the per-field editor from undoing it.
        onChange={(next) =>
          onChange(next === "timestamp" ? { kind: next, type: "datetime" } : { kind: next })
        }
      />
      <EnumField
        label="Format"
        icon={<UiPalette />}
        help="Optional formatter; Unit takes precedence when both are set."
        value={field.format ?? ""}
        options={profileFormatOptions}
        placeholder="From Type"
        onChange={(next) => onChange({ format: next })}
      />
      <EnumField
        label="Unit"
        icon={<UiScale />}
        help="Numeric scaling for number, duration, or bytes Types."
        value={field.unit ?? ""}
        options={profileUnitOptions}
        placeholder="No unit"
        onChange={(next) => onChange({ unit: next })}
      />
      <EditorField label="Max width (characters)" icon={<UiColumns />} help="Maximum rendered width; blank uses the table default.">
        <input aria-label="Max width (characters)" type="number" min={1} value={field.width ?? ""} className={inputClassName} placeholder="Auto" onChange={(event) => onChange({ width: event.target.value ? Number(event.target.value) : undefined })} />
      </EditorField>
      <div className={wide}>
        <div className="grid gap-1.5 text-sm font-medium">
          <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <UiFunctionSquare className="shrink-0 text-[15px] text-muted-foreground" />
              CEL expression
            </span>
            <span className="flex items-center gap-2">
              <select
                aria-label="CEL examples"
                value=""
                className="h-8 rounded-md border border-input bg-background px-2 text-xs font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                onChange={(event) => onChange({ cel: event.target.value })}
              >
                <option value="">Examples</option>
                {celExamples(field.source ?? field.name).map((example) => (
                  <option key={example.label} value={example.expression}>{example.label}</option>
                ))}
              </select>
              <CelTestButton
                value={field.cel ?? ""}
                scope="row"
                rows={rows}
                title={field.name}
                onChange={(next) => onChange({ cel: next || undefined })}
              />
            </span>
          </div>
          <textarea aria-label="CEL expression" rows={4} value={field.cel ?? ""} className={`${inputClassName} resize-y font-mono text-xs`} placeholder="Optional value transformation" onChange={(event) => onChange({ cel: event.target.value || undefined })} />
          <span className="text-xs font-normal text-muted-foreground">
            Optional expression computing the value from row.
          </span>
        </div>
      </div>
      <div className={wide}>
        <EditorField label="JSONPath" icon={<UiBraces />} fullWidth help="Optional path computing the value, rooted at the row or at Source; an alternative to CEL.">
          <JSONPathField
            aria-label="JSONPath"
            value={field.jsonpath ?? ""}
            onChange={(next) => onChange({ jsonpath: next || undefined })}
            // This editor owns the whole column, so a path picked out of a
            // JSON-encoded column sets the Source it needs in the same edit
            // rather than leaving the author to pair the two by hand. A path
            // picked outside one clears it: alongside a jsonpath, Source is the
            // root, and a stale root re-roots the new path at a column it was
            // never written against.
            onSelectPath={(next, { root }) =>
              onChange({ jsonpath: next || undefined, source: root })
            }
            {...(field.source ? { source: field.source } : {})}
            {...(rows.length === 0 ? {} : { json: rows[0], rows })}
            evaluate={evaluateJsonPath}
          />
        </EditorField>
      </div>
      <label className={`flex items-center gap-2 text-sm font-medium ${wide}`}>
        <input type="checkbox" checked={field.hidden ?? false} onChange={(event) => onChange({ hidden: event.target.checked })} />
        <UiEyeClosed className="text-[15px] text-muted-foreground" />
        Hide this field in the default table
      </label>
      <div className={wide}>
        <ProfileFieldFilterEditor field={field} columns={columns} onChange={onChange} />
      </div>
    </div>
  );
}

/** The wizard's carded inspector: names the field itself, because its field
 *  list has no header to do it. The editor route composes the parts instead,
 *  since its Workspace pane header already carries the name. */
export function ProfileFieldEditor({
  field,
  onChange,
  ...actions
}: FieldActions & {
  field?: ProfileColumn | undefined;
  onChange: (patch: Patch<ProfileColumn>) => void;
}) {
  if (!field) {
    return (
      <section className="grid min-h-64 place-items-center rounded-xl border border-dashed text-sm text-muted-foreground">
        {profileFieldEditorEmptyMessage}
      </section>
    );
  }

  return (
    <section className="overflow-auto rounded-xl border bg-card p-5">
      <div className="mb-5 flex flex-wrap items-start gap-2 border-b pb-4">
        <div className="mr-auto min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Field editor
          </p>
          <h3 className="mt-1 truncate font-mono text-sm font-semibold">
            {field.name}
          </h3>
        </div>
        <ProfileFieldEditorActions {...actions} />
      </div>
      <ProfileFieldEditorForm field={field} onChange={onChange} />
    </section>
  );
}
