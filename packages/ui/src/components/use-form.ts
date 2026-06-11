import { useCallback, useMemo, useState } from "react";

// FieldErrors maps a field key to its current validation message (or undefined
// when the field is valid). validate() returns the full map every call so a form
// can show every problem at once, not just the first.
export type FieldErrors = Record<string, string | undefined>;

export interface UseFormOptions<V> {
  /** The current form values (owned by the caller). */
  values: V;
  /** Pure validator returning all field errors for the given values. */
  validate: (values: V) => FieldErrors;
  /** Called by submit() only when the form is valid. */
  onSubmit?: (values: V) => void;
}

export interface UseFormResult {
  /** Every field's error (independent of touched/submitted). */
  errors: FieldErrors;
  /** True when no field has an error. */
  isValid: boolean;
  /** True once submit() has been called (reveals all errors). */
  submitted: boolean;
  /**
   * The error to display for a field: present only once the field has been
   * touched (blurred) or submit() has run, so a pristine form isn't all red.
   */
  fieldError: (key: string) => string | undefined;
  /** Mark a field touched — wire to a field's onBlur. */
  markTouched: (key: string) => void;
  /** Reveal all errors; run onSubmit only when valid. */
  submit: () => void;
  /** Clear touched + submitted state (e.g. when a dialog reopens). */
  reset: () => void;
}

// useForm centralizes the touched/submitted/error bookkeeping a hand-built form
// needs: it computes per-field errors from the caller's validate(), and gates
// their display so each error surfaces on blur or on submit. The form values
// stay owned by the caller (this hook does not store them), so it composes with
// conditional fields and bespoke layouts.
export function useForm<V>({ values, validate, onSubmit }: UseFormOptions<V>): UseFormResult {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validate(values), [validate, values]);
  const isValid = useMemo(() => !Object.values(errors).some(Boolean), [errors]);

  const fieldError = useCallback(
    (key: string) => (submitted || touched[key] ? errors[key] : undefined),
    [submitted, touched, errors],
  );

  const markTouched = useCallback((key: string) => {
    setTouched((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  const submit = useCallback(() => {
    setSubmitted(true);
    if (isValid) onSubmit?.(values);
  }, [isValid, onSubmit, values]);

  const reset = useCallback(() => {
    setTouched({});
    setSubmitted(false);
  }, []);

  return { errors, isValid, submitted, fieldError, markTouched, submit, reset };
}
