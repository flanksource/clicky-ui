import { forwardRef, type InputHTMLAttributes } from "react";
import { DatePicker } from "./DatePicker";
import { DateTimePicker } from "./DateTimePicker";

export type DateFieldMode = "date" | "datetime";

export type DateFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  mode?: DateFieldMode;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
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
