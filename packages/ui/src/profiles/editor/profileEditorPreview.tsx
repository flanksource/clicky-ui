import type { ProfileColumn } from "../wizard/profileWizardModel";
import type { ProfileWizardDraft } from "../wizard/profileWizardModel";
import { ProfileMappingPreview } from "./profileMappingPreview";

/**
 * The configured columns applied to the rows returned by the last sample, so
 * the effect of including a field, relabelling it or hiding it is visible
 * without leaving the editor. Rows only exist after a sample runs — there is no
 * placeholder data, because a fabricated preview is worse than none.
 */
export function ProfileEditorPreview({
  columns,
  rows,
  profile,
  stale = false,
  onNormalized,
}: {
  columns: ProfileColumn[];
  rows: Record<string, unknown>[];
  profile?: ProfileWizardDraft;
  stale?: boolean;
  onNormalized?: (rows: Record<string, unknown>[], columns: ProfileColumn[]) => void;
}) {
  if (stale)
    return (
      <p role="status">
        Source or query settings changed. Run a new sample to refresh the
        mapping preview.
      </p>
    );
  if (profile?.render === "traces")
    return <ProfileMappingPreview profile={profile} rows={rows} {...(onNormalized ? {onNormalized} : {})} />;
  const shown = columns.filter((column) => !column.hidden);

  if (rows.length === 0 || shown.length === 0) {
    return (
      <p className="grid h-full place-items-center px-6 text-center text-xs text-muted-foreground">
        {shown.length === 0
          ? "No columns included yet."
          : "Run a sample in Source & Query to preview rows."}
      </p>
    );
  }

  return (
    <div className="min-h-0 overflow-auto">
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 bg-muted/60 backdrop-blur">
          <tr>
            {shown.map((column) => (
              <th
                key={column.name}
                className="whitespace-nowrap border-b border-border px-3 py-1 text-[11px] font-medium text-muted-foreground"
              >
                {column.label ?? column.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="hover:bg-muted/40">
              {shown.map((column) => (
                <td
                  key={column.name}
                  className="max-w-[24rem] truncate border-b border-border px-3 py-1 font-mono text-[11px]"
                >
                  {formatPreviewCell(
                    Object.prototype.hasOwnProperty.call(row, column.name)
                      ? row[column.name]
                      : column.source
                        ? row[column.source]
                        : undefined,
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatPreviewCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}
