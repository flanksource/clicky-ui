import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { DatePicker } from "./DatePicker";
import { DateTimePicker } from "./DateTimePicker";

export type DateFieldMode = "date" | "datetime";

export type DateFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  // `prefix` is a global HTML attribute typed as string; omit it so our
  // ReactNode adornment prop below is not intersected down to `string & ReactNode`.
  "type" | "value" | "onChange" | "prefix"
> & {
  /** Selects native date input or date-time input behavior. */
  mode?: DateFieldMode;
  /** ISO date or datetime-local string shown in the input. */
  value?: string;
  /** Called with the next ISO-like value whenever the input changes. */
  onChange?: (value: string) => void;
  /** Classes applied to the outer picker wrapper. */
  className?: string;
  /** Classes applied to the text input. */
  inputClassName?: string;
  /** Classes applied to the calendar/open button. */
  buttonClassName?: string;
  /** Accessible label for the calendar/open button. */
  openButtonLabel?: string;
  /** Trailing in-field adornment, rendered left of the calendar button. */
  suffix?: ReactNode;
  /** Leading in-field adornment, rendered at the left edge of the input. */
  prefix?: ReactNode;
};

export const DateField = forwardRef<HTMLInputElement, DateFieldProps>(
  ({ mode = "date", ...props }, ref) => {
    if (mode === "datetime") {
      return <DateTimePicker ref={ref} {...props} />;
    }

    return <DatePicker ref={ref} {...props} />;
  },
);

DateField.displayName = "DateField";
