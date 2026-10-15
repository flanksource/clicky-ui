import { isValidElement, type HTMLAttributes, type ReactElement } from "react";
import { cn } from "../lib/utils";
import { badgeVariants } from "./badge-variants";
import { CodeLine } from "./CodeLine";
import { Icon, type StaticIconComponent } from "./Icon";

const COLORS = new Map([
  ["neutral", "text-foreground"],
  ["primary", "text-primary"],
  ["blue", "text-blue-700 [[data-theme=dark]_&]:text-blue-300"],
  ["cyan", "text-cyan-700 [[data-theme=dark]_&]:text-cyan-300"],
  ["indigo", "text-indigo-700 [[data-theme=dark]_&]:text-indigo-300"],
  ["sky", "text-sky-700 [[data-theme=dark]_&]:text-sky-300"],
  ["slate", "text-slate-700 [[data-theme=dark]_&]:text-slate-300"],
  ["violet", "text-violet-700 [[data-theme=dark]_&]:text-violet-300"],
]);

export type SymbolBadgeStyle = "badge" | "badge-outline" | "inline";

export type SymbolBadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, "style" | "color" | "children"> & {
  /** Filled badge, colored outline, or an unframed inline symbol. */
  style?: SymbolBadgeStyle;
  /** Named palette hue or CSS color, including CSS custom properties. */
  color?: string;
  /** Imported icon component placed before the symbol. */
  icon?: StaticIconComponent;
  /** Additional glyph classes, including adjustments for fixed-color SVGs. */
  iconClassName?: string;
} & (
  | { /** Literal, nonempty, single-line symbol or expression. */ children: string; language?: string }
  | { /** Content already formatted by the caller, such as MathML. */ children: ReactElement; language?: never }
);

export function SymbolBadge({
  style = "badge",
  color = "indigo",
  icon,
  iconClassName,
  language,
  children,
  className,
  title,
  ...props
}: SymbolBadgeProps) {
  if (typeof children === "string" ? !children.trim() || /[\r\n]/.test(children) : !isValidElement(children)) {
    throw new Error("SymbolBadge requires a nonempty, single-line symbol; use CodeBlock for multiline source.");
  }
  const colorClass = COLORS.get(color);
  return (
    <span
      {...props}
      data-symbol-style={style}
      title={title ?? (typeof children === "string" ? children : undefined)}
      className={cn(
        badgeVariants({ variant: "outline", size: "md" }),
        "max-w-full items-baseline gap-1.5 rounded-md align-baseline text-[12px] leading-4",
        style === "badge" && "border-transparent",
        style === "badge-outline" && "border-current",
        style === "inline" && "rounded-none border-0 p-0",
        colorClass,
        className,
      )}
      style={{
        ...(colorClass === undefined ? { color } : {}),
        ...(style === "badge" ? { backgroundColor: `color-mix(in srgb, ${colorClass === undefined ? color : "currentColor"} 16%, transparent)` } : {}),
      }}
    >
      {icon !== undefined && <span data-symbol-icon aria-hidden className="relative w-[1.25em] shrink-0 before:invisible before:content-['.']">
        <Icon icon={icon} width="1.25em" className={cn("absolute top-1/2 -translate-y-1/2", iconClassName)} />
      </span>}
      {typeof children === "string"
        ? <CodeLine code={children} {...(language !== undefined ? { language } : {})} className="min-w-0 truncate" />
        : <span className="min-w-0 whitespace-normal">{children}</span>}
    </span>
  );
}
