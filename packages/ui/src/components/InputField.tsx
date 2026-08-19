import {
  forwardRef,
  useImperativeHandle,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "../lib/utils";
import { useHotkey } from "../hooks/use-hotkey";

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "prefix" | "size" | "type" | "value"
>;

type NativeTextareaProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "onChange" | "prefix" | "size" | "value"
>;

type InputFieldSharedProps<
  TElement extends HTMLInputElement | HTMLTextAreaElement,
> = {
  /** Controlled input value. */
  value?: string | undefined;
  /** Native input type. Ignored when `as="textarea"`. */
  type?: InputHTMLAttributes<HTMLInputElement>["type"] | undefined;
  /** Called with the next text value. */
  onChange?:
    | ((value: string, event: ChangeEvent<TElement>) => void)
    | undefined;
  /** Leading adornment rendered before the input. */
  prefix?: ReactNode | undefined;
  /** Trailing adornment rendered after the input and before the shortcut. */
  suffix?: ReactNode | undefined;
  /** Keyboard-shortcut hint rendered as a trailing `<kbd>`. Pass `null` to hide it. */
  shortcut?: string | null | undefined;
  /** Override the key matched for cmd/ctrl shortcuts. Defaults to the shortcut's last character. */
  shortcutKey?: string | undefined;
  /**
   * Shortcut to bind, in `useHotkey` combo syntax (`"mod+k"`, `"mod+shift+p"`),
   * where `mod` is ⌘ on macOS and Ctrl elsewhere. Preferred over `shortcutKey`:
   * it matches modifiers exactly, whereas a key derived from the `shortcut`
   * badge cannot express them.
   */
  hotkey?: string | undefined;
  /** Called before the field is focused when the shortcut is pressed. */
  onShortcut?: (() => void) | undefined;
  /**
   * Marks the control as invalid: renders a destructive border and sets
   * aria-invalid on the native element. Purely presentational — the consumer
   * decides what invalid means, exactly as `Combobox`'s own `invalid` does.
   */
  invalid?: boolean | undefined;
  /** Classes applied to the outer control. */
  className?: string | undefined;
  /** Classes applied to the native input. */
  inputClassName?: string | undefined;
  /** Classes applied to the shortcut badge. */
  shortcutClassName?: string | undefined;
};

export type InputFieldInputProps = NativeInputProps &
  InputFieldSharedProps<HTMLInputElement> & {
    as?: "input" | undefined;
  };

export type InputFieldTextareaProps = NativeTextareaProps &
  InputFieldSharedProps<HTMLTextAreaElement> & {
    as: "textarea";
  };

export type InputFieldProps = InputFieldInputProps | InputFieldTextareaProps;

/**
 * Shared single-line input chrome with optional prefix/suffix adornments and a
 * global cmd/ctrl keyboard shortcut. Consumers keep native input semantics while
 * sharing the clicky border, focus ring, and density tokens.
 */
export const InputField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  InputFieldProps
>(function InputField(
  {
    as = "input",
    value,
    onChange,
    prefix,
    suffix,
    shortcut,
    shortcutKey,
    hotkey,
    onShortcut,
    invalid,
    className,
    inputClassName,
    shortcutClassName,
    type = "text",
    ...rest
  },
  forwardedRef,
) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  useImperativeHandle(
    forwardedRef,
    () => inputRef.current as HTMLInputElement | HTMLTextAreaElement,
    [],
  );

  // `hotkey` is the precise form; `shortcut`/`shortcutKey` keep working by
  // deriving a cmd/ctrl combo from the badge's last character.
  const effectiveShortcutKey =
    shortcutKey ?? (shortcut ? shortcut.slice(-1).toLowerCase() : undefined);
  const combo = hotkey ?? (effectiveShortcutKey ? `mod+${effectiveShortcutKey}` : null);

  useHotkey(
    combo,
    () => {
      onShortcut?.();
      inputRef.current?.focus();
    },
    { enabled: Boolean(onShortcut) },
  );

  return (
    <div
      className={cn(
        "flex w-full gap-density-2 rounded-md border border-border bg-background px-density-2",
        "focus-within:ring-2 focus-within:ring-ring",
        as === "textarea"
          ? "min-h-control-h items-start py-density-1"
          : "h-control-h items-center",
        // Same pair ComboboxControl uses, so an invalid text field and an
        // invalid combobox read identically in the same form.
        invalid && "border-destructive focus-within:ring-destructive",
        // The border lives out here while `disabled` lands on the inner
        // element, so the chrome can only see it through :has(). Without this
        // a disabled field is indistinguishable from an editable one.
        "has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        className,
      )}
    >
      {prefix && (
        <span className="inline-flex shrink-0 items-center">{prefix}</span>
      )}
      {as === "textarea" ? (
        <textarea
          ref={inputRef as Ref<HTMLTextAreaElement>}
          value={value}
          onChange={(event) =>
            (
              onChange as
                | ((
                    value: string,
                    event: ChangeEvent<HTMLTextAreaElement>,
                  ) => void)
                | undefined
            )?.(event.target.value, event)
          }
          className={cn(
            "min-w-0 flex-1 resize-y border-none bg-transparent text-sm text-foreground outline-none",
            "placeholder:text-placeholder",
            "disabled:cursor-not-allowed",
            inputClassName,
          )}
          {...(invalid ? { "aria-invalid": true } : {})}
          {...(rest as NativeTextareaProps)}
        />
      ) : (
        <input
          ref={inputRef as Ref<HTMLInputElement>}
          type={type}
          value={value}
          onChange={(event) =>
            (
              onChange as
                | ((
                    value: string,
                    event: ChangeEvent<HTMLInputElement>,
                  ) => void)
                | undefined
            )?.(event.target.value, event)
          }
          className={cn(
            "min-w-0 flex-1 border-none bg-transparent text-sm text-foreground outline-none",
            "placeholder:text-placeholder",
            "disabled:cursor-not-allowed",
            type === "search" &&
              "[&::-webkit-search-cancel-button]:appearance-none",
            inputClassName,
          )}
          // Spread last so a caller passing its own aria-invalid still wins.
          {...(invalid ? { "aria-invalid": true } : {})}
          {...(rest as NativeInputProps)}
        />
      )}
      {suffix && (
        <span className="inline-flex shrink-0 items-center">{suffix}</span>
      )}
      {shortcut && (
        <kbd
          className={cn(
            "shrink-0 rounded border border-border px-1 font-mono text-[10px] text-muted-foreground",
            shortcutClassName,
          )}
        >
          {shortcut}
        </kbd>
      )}
    </div>
  );
});
