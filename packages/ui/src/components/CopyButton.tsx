import { useCallback, type MouseEvent } from "react";
import { UiCheck, UiCopy } from "../icons";
import { cn } from "../lib/utils";
import { IconButton } from "./IconButton";
import { useCopyFlash } from "./clipboard";

export type CopyButtonProps = {
  /**
   * Text to copy, or a thunk producing it. Use the thunk form when the payload
   * is expensive to build and only needed on click.
   */
  value: string | (() => string);
  /** Accessible name; drives both aria-label and the tooltip. */
  label?: string;
  /** Extra classes for the button. */
  className?: string;
  /** Extra classes for the glyph. */
  iconClassName?: string;
};

/**
 * A borderless copy-to-clipboard icon button. The glyph flips to a check for
 * 1.5s on success and reports a rejected copy through its label, so a silent
 * no-op is never mistaken for a successful copy.
 */
export function CopyButton({ value, label = "Copy", className, iconClassName }: CopyButtonProps) {
  const { state, copy } = useCopyFlash();

  const onClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      // Cards and rows routinely make their whole surface clickable; copying
      // must never also toggle the container it sits in.
      event.stopPropagation();
      copy(typeof value === "function" ? value() : value);
    },
    [copy, value],
  );

  return (
    <IconButton
      icon={state === "copied" ? UiCheck : UiCopy}
      label={state === "copied" ? "Copied" : state === "error" ? "Copy failed" : label}
      onClick={onClick}
      className={className}
      iconClassName={cn(
        state === "copied" && "text-emerald-600",
        state === "error" && "text-red-600",
        iconClassName,
      )}
    />
  );
}
