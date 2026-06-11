import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { buttonVariants } from "./button-variants";
import { LoadingDots } from "./loading";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Render the button styles onto the child element via Radix Slot. */
    asChild?: boolean;
    /** Show a spinner and disable the button while an action is pending. */
    loading?: boolean;
    /** Label to render while loading; defaults to the normal children. */
    loadingLabel?: ReactNode;
  };

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
        {loading && <LoadingDots className="size-4" />}
        {content}
      </Comp>
    );
  },
);
Button.displayName = "Button";
