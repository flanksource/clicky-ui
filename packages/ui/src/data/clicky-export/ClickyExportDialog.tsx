import { useEffect, useState } from "react";
import { Button } from "../../components/button";
import { Modal } from "../../overlay/Modal";
import { Icon, type StaticIconComponent } from "../Icon";
import { cn } from "../../lib/utils";

/** One format the endpoint advertises, already resolved for display. */
export type ClickyExportFormatOption = {
  /** Value handed back to `onDownload`. */
  format: string;
  label: string;
  /** What the format is for. */
  description?: string | undefined;
  icon?: StaticIconComponent | undefined;
  iconClassName?: string | undefined;
};

/** One result range the endpoint advertises. */
export type ClickyExportScopeOption = {
  /** Value handed back to `onDownload`; undefined for a legacy endpoint. */
  scope: string | undefined;
  label: string;
  /**
   * What this range costs or caps — "Limited to 1,000 rows", "Streams rows as
   * they are read". Per format, because a PDF's ceiling is not a CSV's.
   */
  note?: ((format: string) => string | undefined) | undefined;
};

export type ClickyExportDialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  formats: ClickyExportFormatOption[];
  scopes: ClickyExportScopeOption[];
  /** Runs the export. Rejecting shows the reason without closing the dialog. */
  onDownload: (request: {
    format: string;
    scope: string | undefined;
  }) => Promise<void> | void;
};

/**
 * ClickyExportDialog picks a format and a range, then downloads.
 *
 * It exists because the same choice as a menu was 16 rows — every format times
 * every range — which pushed everything else in that menu out of reach and
 * still truncated the one thing worth reading: what each range costs.
 */
export function ClickyExportDialog({
  open,
  onClose,
  title = "Export",
  formats,
  scopes,
  onDownload,
}: ClickyExportDialogProps) {
  const [format, setFormat] = useState(formats[0]?.format);
  const [scope, setScope] = useState(scopes[0]?.scope);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  // Reopening starts from a clean slate: the error belongs to the attempt that
  // produced it, not to the next one.
  useEffect(() => {
    if (open) setError("");
  }, [open]);

  const activeScope = scopes.find((option) => option.scope === scope);

  const download = async () => {
    if (!format) return;
    setPending(true);
    setError("");
    try {
      await onDownload({ format, scope });
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The export failed");
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="lg"
      closeOnEsc
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            onClick={() => void download()}
            loading={pending}
            disabled={!format}
          >
            Download
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {scopes.length > 1 ? (
          <fieldset>
            <legend className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Rows
            </legend>
            <div className="flex flex-wrap gap-2">
              {scopes.map((option) => (
                <label
                  key={option.scope ?? "default"}
                  className={cn(
                    "cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors",
                    option.scope === scope
                      ? "border-foreground/20 bg-accent text-accent-foreground"
                      : "border-input hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <input
                    type="radio"
                    name="clicky-export-scope"
                    // Named explicitly: the input is visually hidden behind its
                    // own styled label, so nothing else gives it a name.
                    aria-label={option.label}
                    className="sr-only"
                    checked={option.scope === scope}
                    onChange={() => setScope(option.scope)}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          scopes[0]?.label && (
            <p className="text-sm text-muted-foreground">{scopes[0].label}</p>
          )
        )}

        <fieldset>
          <legend className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Format
          </legend>
          <div className="grid gap-1 sm:grid-cols-2">
            {formats.map((option) => {
              const note = activeScope?.note?.(option.format);
              return (
                <label
                  key={option.format}
                  className={cn(
                    "flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-left transition-colors",
                    option.format === format
                      ? "border-foreground/20 bg-accent text-accent-foreground"
                      : "border-transparent hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <input
                    type="radio"
                    name="clicky-export-format"
                    aria-label={option.label}
                    className="sr-only"
                    checked={option.format === format}
                    onChange={() => setFormat(option.format)}
                  />
                  {option.icon && (
                    <Icon
                      icon={option.icon}
                      className={cn(
                        "mt-0.5 shrink-0 text-sm",
                        option.iconClassName ?? "text-muted-foreground",
                      )}
                    />
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {option.label}
                    </span>
                    {option.description && (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {option.description}
                      </span>
                    )}
                    {note && (
                      <span className="mt-0.5 block text-xs text-amber-700 [[data-theme=dark]_&]:text-amber-400">
                        {note}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

      </div>
    </Modal>
  );
}
