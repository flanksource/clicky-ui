import type { FocusEventHandler, ReactNode } from "react";
import { cn } from "../lib/utils";

export interface FieldProps {
  /** Field label text (or node). */
  label: ReactNode;
  /** Associates the label with a control by id (optional for non-input controls). */
  htmlFor?: string;
  /** Appends a destructive "*" after the label. */
  required?: boolean;
  /**
   * Inline validation message rendered under the control in destructive color.
   * When set it takes the place of `helper`.
   */
  error?: ReactNode;
  /** Muted helper/description text under the control (shown when there's no error). */
  helper?: ReactNode;
  className?: string;
  /** Overrides the label classes (e.g. an uppercase form style). */
  labelClassName?: string;
  /**
   * Fires when focus leaves the field (focusout bubbles), so a form can mark the
   * field touched and reveal its error on blur.
   */
  onBlur?: FocusEventHandler<HTMLDivElement>;
  children: ReactNode;
}

// Field is the generic label-over-control chrome: a label (with an optional
// required "*"), the control, and an inline error or helper line beneath it.
// Pair it with useForm for blur/submit-gated error display, or pass `error`
// directly. The same primitive JsonSchemaForm renders internally, exposed for
// hand-built forms.
export function Field({
  label,
  htmlFor,
  required,
  error,
  helper,
  className,
  labelClassName,
  onBlur,
  children,
}: FieldProps) {
  return (
    <div className={cn("flex w-full flex-col gap-1", className)} onBlur={onBlur}>
      <label
        htmlFor={htmlFor}
        className={cn("flex min-w-0 items-center gap-1 text-sm font-medium", labelClassName)}
      >
        <span className="min-w-0">{label}</span>
        {required && (
          <span className="shrink-0 text-destructive" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : helper ? (
        <p className="text-xs text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  );
}
