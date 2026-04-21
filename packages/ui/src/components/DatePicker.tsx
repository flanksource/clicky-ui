import { forwardRef, useRef, type InputHTMLAttributes } from "react";
import { Icon } from "../data/Icon";
import { cn } from "../lib/utils";

export type DatePickerProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange"
> & {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  openButtonLabel?: string;
};

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      value = "",
      onChange,
      className,
      inputClassName,
      buttonClassName,
      openButtonLabel = "Open date picker",
      ...props
    },
    ref,
  ) => {
    const localRef = useRef<HTMLInputElement | null>(null);

    function assignRef(node: HTMLInputElement | null) {
      localRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    }

    return (
      <div className={cn("relative", className)}>
        <input
          {...props}
          ref={assignRef}
          type="date"
          value={value}
          className={cn(
            "h-8 w-full rounded-md border border-input bg-background px-2 pr-8 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
            inputClassName,
          )}
          onChange={(event) => onChange?.(event.target.value)}
        />
        <button
          type="button"
          aria-label={openButtonLabel}
          className={cn(
            "absolute inset-y-0 right-1 inline-flex items-center text-muted-foreground",
            buttonClassName,
          )}
          onClick={() => {
            localRef.current?.focus();
            localRef.current?.showPicker?.();
          }}
        >
          <Icon name="codicon:calendar" className="text-sm" />
        </button>
      </div>
    );
  },
);

DatePicker.displayName = "DatePicker";
