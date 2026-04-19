import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "",
        success: "",
        danger: "",
        warning: "",
        info: "",
      },
      variant: {
        soft: "",
        solid: "",
        outline: "border bg-transparent",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0 h-4",
        md: "text-xs px-2 py-0.5",
        lg: "text-sm px-2.5 py-1",
      },
    },
    compoundVariants: [
      { tone: "neutral", variant: "soft", class: "bg-muted text-foreground" },
      { tone: "neutral", variant: "solid", class: "bg-foreground text-background" },
      { tone: "neutral", variant: "outline", class: "border-border text-foreground" },

      {
        tone: "success",
        variant: "soft",
        class: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300",
      },
      { tone: "success", variant: "solid", class: "bg-green-500 text-white" },
      {
        tone: "success",
        variant: "outline",
        class: "border-green-500 text-green-700 dark:text-green-400",
      },

      {
        tone: "danger",
        variant: "soft",
        class: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300",
      },
      { tone: "danger", variant: "solid", class: "bg-red-500 text-white" },
      {
        tone: "danger",
        variant: "outline",
        class: "border-red-500 text-red-700 dark:text-red-400",
      },

      {
        tone: "warning",
        variant: "soft",
        class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300",
      },
      { tone: "warning", variant: "solid", class: "bg-yellow-400 text-yellow-950" },
      {
        tone: "warning",
        variant: "outline",
        class: "border-yellow-500 text-yellow-700 dark:text-yellow-400",
      },

      {
        tone: "info",
        variant: "soft",
        class: "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300",
      },
      { tone: "info", variant: "solid", class: "bg-blue-500 text-white" },
      {
        tone: "info",
        variant: "outline",
        class: "border-blue-500 text-blue-700 dark:text-blue-400",
      },
    ],
    defaultVariants: {
      tone: "neutral",
      variant: "soft",
      size: "md",
    },
  },
);

export type BadgeProps = VariantProps<typeof badgeVariants> & {
  children?: ReactNode;
  icon?: string;
  count?: number;
  className?: string;
};

export function Badge({ tone, variant, size, icon, count, children, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, variant, size }), className)}>
      {icon && <Icon name={icon} className="text-[1em]" />}
      {count !== undefined && <span>{count}</span>}
      {children}
    </span>
  );
}
