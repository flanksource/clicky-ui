import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { buttonVariants } from "./button-variants";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Render the button styles onto the child element via Radix Slot. */
    asChild?: boolean;
    /** Show a spinner and disable the button while an action is pending. */
    loading?: boolean;
    /** Label to render while loading; defaults to the normal children. */
    loadingLabel?: ReactNode;
  };

function ButtonSpinner() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
    >
      <circle cx="4" cy="12" r="3" fill="#151515">
        <animate
          id="SVG7x14Dcom"
          fill="freeze"
          attributeName="opacity"
          begin="0;SVGqSjG0dUp.end-0.25s"
          dur="0.75s"
          values="1;0.2"
        />
      </circle>
      <circle cx="12" cy="12" r="3" fill="#151515" opacity="0.4">
        <animate
          fill="freeze"
          attributeName="opacity"
          begin="SVG7x14Dcom.begin+0.15s"
          dur="0.75s"
          values="1;0.2"
        />
      </circle>
      <circle cx="20" cy="12" r="3" fill="#151515" opacity="0.3">
        <animate
          id="SVGqSjG0dUp"
          fill="freeze"
          attributeName="opacity"
          begin="SVG7x14Dcom.begin+0.3s"
          dur="0.75s"
          values="1;0.2"
        />
      </circle>
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      loading = false,
      loadingLabel,
      variant,
      size,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const content = loadingLabel !== undefined ? loadingLabel : children;

    if (asChild) {
      return (
        <Comp
          ref={ref}
          aria-busy={loading || undefined}
          className={cn(buttonVariants({ variant, size }), className)}
          disabled={disabled || loading}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        aria-busy={loading || undefined}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <ButtonSpinner />}
        {content}
      </Comp>
    );
  },
);
Button.displayName = "Button";
