import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-control-h px-control-px py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-control-h w-control-h",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
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

export { buttonVariants };
