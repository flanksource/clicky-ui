import { forwardRef, type InputHTMLAttributes } from "react";
import { DatePicker } from "./DatePicker";
import { DateTimePicker } from "./DateTimePicker";

export type DateFieldMode = "date" | "datetime";

export type DateFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
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
