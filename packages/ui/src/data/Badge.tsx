import {
  Children,
  isValidElement,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ReactNode,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border border-transparent font-medium whitespace-nowrap align-middle",
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
        outline: "bg-transparent",
      },
      size: {
        xxs: "min-h-4 px-1.5 py-0.5 text-[9px] leading-none",
        xs: "min-h-[18px] px-1.5 py-0.5 text-[10px] leading-none",
        sm: "h-4 px-1.5 py-0 text-[10px] leading-none",
        md: "px-2 py-0.5 text-xs",
        lg: "px-2.5 py-1 text-sm",
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

type LegacyBadgeVariantProps = VariantProps<typeof badgeVariants>;

export type BadgeTone = NonNullable<LegacyBadgeVariantProps["tone"]>;
export type LegacyBadgeVariant = NonNullable<LegacyBadgeVariantProps["variant"]>;
export type BadgeSize = NonNullable<LegacyBadgeVariantProps["size"]>;
export type BadgeStatus = "success" | "error" | "warning" | "info";
export type BadgeShape = "pill" | "rounded" | "square";
export type BadgeTruncate = "prefix" | "suffix" | "arn" | "image" | "path" | "url" | "auto";
export type RichBadgeVariant = "status" | "metric" | "custom" | "outlined" | "label";
export type BadgeVariant = LegacyBadgeVariant | RichBadgeVariant;

const LEGACY_VARIANTS = new Set<LegacyBadgeVariant>(["soft", "solid", "outline"]);
const RICH_VARIANTS = new Set<RichBadgeVariant>(["status", "metric", "custom", "outlined", "label"]);

type RichSizeClasses = {
  frame: string;
  segment: string;
  text: string;
  icon: string;
  gap: string;
};

const RICH_SIZE_CLASSES: Record<BadgeSize, RichSizeClasses> = {
  xxs: {
    frame: "min-h-4",
    segment: "px-1.5 py-0.5",
    text: "text-[10px] leading-4",
    icon: "h-3 w-3",
    gap: "gap-1",
  },
  xs: {
    frame: "min-h-[18px]",
    segment: "px-2 py-0.5",
    text: "text-[11px] leading-4",
    icon: "h-3.5 w-3.5",
    gap: "gap-1",
  },
  sm: {
    frame: "min-h-5",
    segment: "px-2 py-0.5",
    text: "text-xs leading-4",
    icon: "h-3.5 w-3.5",
    gap: "gap-1.5",
  },
  md: {
    frame: "min-h-6",
    segment: "px-2.5 py-1",
    text: "text-sm leading-4",
    icon: "h-4 w-4",
    gap: "gap-1.5",
  },
  lg: {
    frame: "min-h-7",
    segment: "px-3 py-1.5",
    text: "text-base leading-5",
    icon: "h-5 w-5",
    gap: "gap-2",
  },
};

type ToneStyle = {
  soft: string;
  outlined: string;
};

const STATUS_STYLES: Record<BadgeStatus, ToneStyle> = {
  success: {
    soft: "bg-emerald-500/12 text-emerald-700 border-emerald-200",
    outlined: "bg-background text-emerald-700 border-emerald-300",
  },
  error: {
    soft: "bg-rose-500/12 text-rose-700 border-rose-200",
    outlined: "bg-background text-rose-700 border-rose-300",
  },
  warning: {
    soft: "bg-amber-400/15 text-amber-800 border-amber-200",
    outlined: "bg-background text-amber-800 border-amber-300",
  },
  info: {
    soft: "bg-sky-500/12 text-sky-700 border-sky-200",
    outlined: "bg-background text-sky-700 border-sky-300",
  },
};

export type BadgeProps = {
  tone?: BadgeTone;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: string;
  count?: number;
  children?: ReactNode;
  className?: string;
  status?: BadgeStatus;
  label?: ReactNode;
  value?: ReactNode;
  color?: string;
  textColor?: string;
  borderColor?: string;
  shape?: BadgeShape;
  href?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: string;
  wrap?: boolean;
  maxWidth?: string | number;
  truncate?: BadgeTruncate;
  clickToCopy?: boolean;
  labelClassName?: string;
  valueClassName?: string;
};

function isLegacyVariant(variant: BadgeVariant | undefined): variant is LegacyBadgeVariant {
  return variant != null && LEGACY_VARIANTS.has(variant as LegacyBadgeVariant);
}

function isCssColor(value: string | undefined): value is string {
  return value != null && /^(#|rgb|hsl|oklch|var\(|color\()/i.test(value);
}

function toneToStatus(tone: BadgeTone | undefined): BadgeStatus | undefined {
  switch (tone) {
    case "success":
      return "success";
    case "danger":
      return "error";
    case "warning":
      return "warning";
    case "info":
      return "info";
    default:
      return undefined;
  }
}

function getShapeClasses(shape: BadgeShape): string {
  switch (shape) {
    case "rounded":
      return "rounded-md";
    case "square":
      return "rounded-sm";
    default:
      return "rounded-full";
  }
}

function isRichVariant(variant: BadgeVariant | undefined): variant is RichBadgeVariant {
  return variant != null && RICH_VARIANTS.has(variant as RichBadgeVariant);
}

function applyColorValue(
  value: string | undefined,
  property: "backgroundColor" | "borderColor" | "color",
  style: CSSProperties,
  classes: string[],
) {
  if (value == null) return;
  if (isCssColor(value)) {
    (style as Record<"backgroundColor" | "borderColor" | "color", string | undefined>)[property] = value;
    return;
  }
  classes.push(value);
}

function normalizeMaxWidth(maxWidth: BadgeProps["maxWidth"]): string | undefined {
  if (maxWidth == null) return undefined;
  if (typeof maxWidth === "number") {
    return `${Math.max(1, Math.floor(maxWidth))}ch`;
  }
  return maxWidth;
}

function deriveCharacterBudget(maxWidth: BadgeProps["maxWidth"], fallback = 24): number {
  if (typeof maxWidth === "number" && Number.isFinite(maxWidth) && maxWidth > 0) {
    return Math.max(4, Math.floor(maxWidth));
  }

  if (typeof maxWidth === "string") {
    const trimmed = maxWidth.trim();
    const chMatch = trimmed.match(/^(\d+(?:\.\d+)?)ch$/i);
    if (chMatch) return Math.max(4, Math.floor(Number(chMatch[1])));
    const numericMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/);
    if (numericMatch) return Math.max(4, Math.floor(Number(numericMatch[1])));
  }

  return fallback;
}

function shouldExposeFullTextTitle({
  maxWidth,
  truncate,
  wrap,
}: Pick<BadgeProps, "maxWidth" | "truncate" | "wrap">) {
  return maxWidth != null || truncate != null || wrap;
}

function toPlainText(node: ReactNode): string | null {
  if (node == null || typeof node === "boolean") return null;
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    const pieces = Children.toArray(node).map(toPlainText);
    return pieces.every((piece) => piece != null) ? pieces.join("") : null;
  }
  if (isValidElement(node)) {
    return toPlainText((node.props as { children?: ReactNode }).children);
  }
  return null;
}

function truncateSuffix(text: string, budget: number): string {
  if (text.length <= budget) return text;
  if (budget <= 1) return "…";
  return `${text.slice(0, budget - 1)}…`;
}

function truncatePrefix(text: string, budget: number): string {
  if (text.length <= budget) return text;
  if (budget <= 1) return "…";
  return `…${text.slice(-(budget - 1))}`;
}

function truncateMiddle(text: string, budget: number): string {
  if (text.length <= budget) return text;
  if (budget <= 3) return truncateSuffix(text, budget);
  const available = budget - 1;
  const head = Math.max(1, Math.ceil(available / 2));
  const tail = Math.max(1, available - head);
  return `${text.slice(0, head)}…${text.slice(-tail)}`;
}

function truncateSegmentStart(text: string, budget: number): string {
  if (text.length <= budget) return text;
  if (budget <= 2) return truncateSuffix(text, budget);
  return `${text.slice(0, budget - 1)}…`;
}

function truncateSegmentEnd(text: string, budget: number): string {
  if (text.length <= budget) return text;
  if (budget <= 2) return truncatePrefix(text, budget);
  return `…${text.slice(-(budget - 1))}`;
}

function summarizeMiddlePathSegment(segment: string | undefined): string {
  if (segment == null || segment.length === 0) return "…";
  if (segment.length <= 2) return `${segment}…`;
  return `${segment[0]}…`;
}

function compressStructuredText(
  head: string,
  middle: string | undefined,
  tail: string,
  budget: number,
  separator: string,
) {
  const pieces = [head];
  if (middle) pieces.push(middle);
  pieces.push(tail);

  const preferred = pieces.join(separator);
  if (preferred.length <= budget) return preferred;

  const separatorCount = pieces.length - 1;
  const reserved = separator.length * separatorCount + (middle ? middle.length : 0);
  const available = Math.max(4, budget - reserved);
  const headBudget = Math.max(3, Math.min(head.length, Math.floor(available * 0.4)));
  const tailBudget = Math.max(4, available - headBudget);
  const compactHead = truncateSegmentStart(head, headBudget);
  const compactTail = truncateSegmentEnd(tail, tailBudget);
  const compactPieces = [compactHead];
  if (middle) compactPieces.push(middle);
  compactPieces.push(compactTail);
  const compact = compactPieces.join(separator);
  return compact.length <= budget ? compact : truncateMiddle(preferred, budget);
}

function compactTrailingSegments(text: string, separator: "/" | ":"): string {
  const segments = text.split(separator).filter(Boolean);
  if (segments.length <= 2) return text;
  return segments.slice(-2).join(separator);
}

function getStructuredBudget(budget: number): number {
  return Math.max(budget, 32);
}

function truncatePath(text: string, budget: number): string {
  const smartBudget = getStructuredBudget(budget);
  const hasLeadingSlash = text.startsWith("/");
  const segments = text.split("/").filter(Boolean);
  if (segments.length < 2) return truncateMiddle(text, smartBudget);
  const head = `${hasLeadingSlash ? "/" : ""}${segments[0]}`;
  const tail = segments[segments.length - 1] ?? text;
  const middle =
    segments.length > 2 ? summarizeMiddlePathSegment(segments.slice(1, -1).join("/")) : undefined;
  return compressStructuredText(head, middle, tail, smartBudget, "/");
}

function truncateUrl(text: string, budget: number): string {
  const smartBudget = getStructuredBudget(budget);
  try {
    const url = new URL(text);
    const host = url.host;
    const pathSegments = url.pathname.split("/").filter(Boolean);
    if (pathSegments.length === 0) {
      if (host.length <= smartBudget) return host;
      return truncateMiddle(`${host}${url.search}${url.hash}`, smartBudget);
    }
    if (pathSegments.length === 1) {
      const singlePath = `${host}/${pathSegments[0] ?? host}`;
      if (singlePath.length <= smartBudget) return singlePath;
      const hostOnly = `${host}/…`;
      return hostOnly.length <= smartBudget ? hostOnly : truncateMiddle(singlePath, smartBudget);
    }
    const tail = pathSegments[pathSegments.length - 1] ?? host;
    const firstSegment = pathSegments[0] ?? "";
    const summarizedMiddle =
      pathSegments.length > 2 ? summarizeMiddlePathSegment(pathSegments.slice(1, -1).join("/")) : undefined;
    const candidates = [
      [host, firstSegment, summarizedMiddle, tail].filter(Boolean).join("/"),
      `${host}/…/${tail}`,
      `${host}/…`,
    ];
    const candidate = candidates.find((entry) => entry.length <= smartBudget);
    return candidate ?? truncateMiddle(`${host}/${tail}`, smartBudget);
  } catch {
    return truncateMiddle(text, smartBudget);
  }
}

function isLikelyUrl(text: string): boolean {
  return /^[a-z][a-z\d+\-.]*:\/\//i.test(text) || text.startsWith("//");
}

function isLikelyImage(text: string): boolean {
  if (/\s/.test(text) || isLikelyUrl(text) || text.startsWith("/")) return false;
  if (!text.includes("/")) return false;
  const tail = text.slice(text.lastIndexOf("/") + 1);
  return tail.includes(":") || tail.includes("@sha256:");
}

function splitImageTail(segment: string) {
  const digestIndex = segment.indexOf("@sha256:");
  if (digestIndex >= 0) {
    return {
      name: segment.slice(0, digestIndex),
      suffix: segment.slice(digestIndex),
    };
  }

  const tagIndex = segment.lastIndexOf(":");
  if (tagIndex > 0) {
    return {
      name: segment.slice(0, tagIndex),
      suffix: segment.slice(tagIndex),
    };
  }

  return { name: segment, suffix: "" };
}

function truncateImage(text: string, budget: number): string {
  const smartBudget = getStructuredBudget(budget);
  const segments = text.split("/").filter(Boolean);
  if (segments.length < 2) return truncateMiddle(text, smartBudget);
  const tailSegment = segments[segments.length - 1] ?? text;
  const tailParts = splitImageTail(tailSegment);
  const tailNameOnly = `…${tailParts.name}`;

  if (tailNameOnly.length <= smartBudget) return tailNameOnly;

  if (segments.length === 2) {
    return compressStructuredText(
      segments[0] ?? text,
      undefined,
      tailParts.name || tailSegment,
      smartBudget,
      "/",
    );
  }
  const head = `${segments[0]}/${segments[1] ?? ""}`.replace(/\/$/, "");
  const tail =
    tailParts.suffix.length > 0 && smartBudget >= tailSegment.length ? tailSegment : tailParts.name || tailSegment;
  const middle =
    segments.length > 3 ? summarizeMiddlePathSegment(segments.slice(2, -1).join("/")) : segments.length === 3 ? "…" : undefined;
  return compressStructuredText(head, middle, tail, smartBudget, "/");
}

function truncateArn(text: string, budget: number): string {
  const smartBudget = getStructuredBudget(budget);
  const parts = text.split(":");
  if (parts.length < 6) return truncateMiddle(text, smartBudget);
  const service = parts[2] ?? parts[1] ?? "arn";
  const resource = parts.slice(5).join(":");
  const resourceSegments = resource.split(/[/:]/).filter(Boolean);
  const resourceType = resourceSegments.length > 1 ? resourceSegments[0] : undefined;
  const resourceName = resourceSegments[resourceSegments.length - 1] ?? resource;
  const resourceNameTail =
    resourceName.includes("-") && resourceName.split("-").length > 2
      ? resourceName.split("-").slice(-2).join("-")
      : resourceName;
  const typedTail =
    resourceType != null && resourceType !== resourceNameTail
      ? `${resourceType}/${resourceNameTail}`
      : resourceNameTail;
  const preferred = `${service}:…${typedTail}`;

  if (preferred.length <= smartBudget) return preferred;

  const separatorBudget = 2;
  const resourceBudget = Math.max(4, Math.min(resourceNameTail.length, smartBudget - separatorBudget - 2));
  const serviceBudget = Math.max(2, smartBudget - resourceBudget - separatorBudget);

  return `${truncateSegmentStart(service, serviceBudget)}:…${truncateMiddle(resourceNameTail, resourceBudget)}`;
}

function detectTruncateStyle(text: string): Exclude<BadgeTruncate, "auto"> {
  if (text.startsWith("arn:")) return "arn";
  if (isLikelyUrl(text)) return "url";
  if (isLikelyImage(text)) return "image";
  if (text.includes("/")) return "path";
  return "suffix";
}

function truncateText(text: string, truncate: BadgeTruncate, maxWidth: BadgeProps["maxWidth"]): string {
  const budget = deriveCharacterBudget(maxWidth);
  const mode = truncate === "auto" ? detectTruncateStyle(text) : truncate;

  switch (mode) {
    case "prefix":
      return truncatePrefix(text, budget);
    case "suffix":
      return truncateSuffix(text, budget);
    case "arn":
      return truncateArn(text, budget);
    case "image":
      return truncateImage(text, budget);
    case "path":
      return truncatePath(text, budget);
    case "url":
      return truncateUrl(text, budget);
    default:
      return truncateSuffix(text, budget);
  }
}

function resolveDisplayNode(
  node: ReactNode,
  truncate: BadgeTruncate | undefined,
  maxWidth: BadgeProps["maxWidth"],
  alwaysTitle = false,
) {
  const fullText = toPlainText(node);
  if (fullText == null || truncate == null) {
    return {
      content: node,
      fullText,
      title: alwaysTitle ? fullText ?? undefined : undefined,
    };
  }

  const content = truncateText(fullText, truncate, maxWidth);
  return {
    content,
    fullText,
    title: alwaysTitle || content !== fullText ? fullText : undefined,
  };
}

function copyTextToClipboard(text: string) {
  const clipboard = globalThis.navigator?.clipboard;
  if (clipboard?.writeText == null) return;
  void clipboard.writeText(text).catch(() => undefined);
}

function renderRoot({
  href,
  target,
  rel,
  className,
  style,
  content,
  canCopy,
  copyText,
}: {
  href: string | undefined;
  target: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel: string | undefined;
  className: string;
  style: CSSProperties | undefined;
  content: ReactNode;
  canCopy: boolean;
  copyText: string | undefined;
}) {
  if (href != null) {
    return (
      <a
        href={href}
        target={target}
        rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
        className={className}
        style={style}
      >
        {content}
      </a>
    );
  }

  if (canCopy && copyText != null) {
    return (
      <button
        type="button"
        className={className}
        style={style}
        onClick={() => copyTextToClipboard(copyText)}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={className} style={style}>
      {content}
    </span>
  );
}

export function Badge({
  tone,
  variant,
  size = "md",
  icon,
  count,
  children,
  className,
  status,
  label,
  value,
  color,
  textColor,
  borderColor,
  shape,
  href,
  target = "_self",
  rel,
  wrap = false,
  maxWidth,
  truncate,
  clickToCopy,
  labelClassName,
  valueClassName,
}: BadgeProps) {
  const richSignals =
    label != null ||
    value != null ||
    status != null ||
    shape != null ||
    href != null ||
    wrap === true ||
    color != null ||
    textColor != null ||
    borderColor != null ||
    labelClassName != null ||
    valueClassName != null;
  const resolvedVariant = variant ?? (richSignals ? "metric" : "soft");
  const normalizedMaxWidth = normalizeMaxWidth(maxWidth);
  const shouldWrapText = wrap && truncate == null;
  const showFullTextTitle = shouldExposeFullTextTitle({ maxWidth, truncate, wrap });
  const textBehaviorClasses = shouldWrapText
    ? "min-w-0 whitespace-normal break-words [overflow-wrap:anywhere]"
    : normalizedMaxWidth != null || truncate != null
      ? "min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
      : "whitespace-nowrap";

  if (isLegacyVariant(resolvedVariant)) {
    const legacyStyle: CSSProperties = {};
    if (normalizedMaxWidth != null) {
      legacyStyle.maxWidth = normalizedMaxWidth;
    }
    const legacyChildren = resolveDisplayNode(children, truncate, maxWidth, showFullTextTitle);
    const legacyCopyText =
      legacyChildren.fullText ?? (count !== undefined ? String(count) : undefined);
    const canCopy = href == null && (clickToCopy ?? true) && legacyCopyText != null;

    return renderRoot({
      href,
      target,
      rel,
      canCopy,
      copyText: legacyCopyText,
      className: cn(
          badgeVariants({ tone, variant: resolvedVariant, size }),
          (normalizedMaxWidth != null || shouldWrapText || truncate != null) && "min-w-0 max-w-full",
          shouldWrapText && "whitespace-normal",
          canCopy && "cursor-copy text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          className,
      ),
      style: legacyStyle,
      content: (
        <>
        {icon && <Icon name={icon} className="text-[1em]" />}
        {count !== undefined && <span>{count}</span>}
        {children != null && (
          <span className={textBehaviorClasses} title={legacyChildren.title}>
            {legacyChildren.content}
          </span>
        )}
        </>
      ),
    });
  }

  if (!isRichVariant(resolvedVariant)) {
    return null;
  }

  const semanticStatus = status ?? toneToStatus(tone) ?? "info";
  const sizeClasses = RICH_SIZE_CLASSES[size];
  const richLabel = label ?? children;
  const richValue = value ?? (richLabel == null && count !== undefined ? count : undefined);
  const resolvedLabel =
    richValue == null
      ? resolveDisplayNode(richLabel, truncate, maxWidth, showFullTextTitle)
      : {
          content: richLabel,
          fullText: toPlainText(richLabel),
          title: showFullTextTitle ? toPlainText(richLabel) ?? undefined : undefined,
        };
  const resolvedValue =
    richValue != null
      ? resolveDisplayNode(richValue, truncate, maxWidth, showFullTextTitle)
      : { content: richValue, fullText: undefined, title: undefined as string | undefined };
  const copyText = resolvedValue.fullText ?? resolvedLabel.fullText ?? (count !== undefined ? String(count) : undefined);
  const canCopy = href == null && (clickToCopy ?? true) && copyText != null;
  const shapeClass = getShapeClasses(shape ?? "pill");
  const wrapperStyle: CSSProperties = {};
  const wrapperClasses = [
    "inline-flex align-middle items-stretch border font-medium shadow-none",
    sizeClasses.frame,
    sizeClasses.text,
    (normalizedMaxWidth != null || shouldWrapText || truncate != null) && "min-w-0 max-w-full",
    shapeClass,
    shouldWrapText ? "whitespace-normal" : "whitespace-nowrap",
    href ? "transition-opacity hover:opacity-80" : "",
    canCopy ? "cursor-copy text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1" : "",
  ];

  if (normalizedMaxWidth != null) {
    wrapperStyle.maxWidth = normalizedMaxWidth;
  }

  if (resolvedVariant === "status") {
    wrapperClasses.push(STATUS_STYLES[semanticStatus].soft);
  } else if (resolvedVariant === "metric") {
    wrapperClasses.push("bg-muted/60 text-foreground border-border");
  } else if (resolvedVariant === "outlined") {
    if (status != null || toneToStatus(tone) != null) {
      wrapperClasses.push(STATUS_STYLES[semanticStatus].outlined);
    } else {
      wrapperClasses.push("bg-background text-foreground border-border");
    }
  } else if (resolvedVariant === "custom") {
    wrapperClasses.push("border-transparent bg-accent text-accent-foreground");
  } else {
    wrapperClasses.push("border-border bg-background text-foreground");
  }

  if (resolvedVariant === "custom" || (resolvedVariant === "outlined" && status == null && toneToStatus(tone) == null)) {
    applyColorValue(color, "backgroundColor", wrapperStyle, wrapperClasses);
    applyColorValue(textColor, "color", wrapperStyle, wrapperClasses);
    applyColorValue(borderColor, "borderColor", wrapperStyle, wrapperClasses);
  }

  if (resolvedVariant !== "label" && borderColor != null && status == null && toneToStatus(tone) == null) {
    applyColorValue(borderColor, "borderColor", wrapperStyle, wrapperClasses);
  }

  const iconEl = icon ? <Icon name={icon} className={cn("shrink-0", sizeClasses.icon)} /> : null;

  if (resolvedVariant === "label") {
    const labelClasses = [
      "inline-flex items-center self-stretch",
      richValue != null ? "shrink-0" : "min-w-0",
      sizeClasses.segment,
      sizeClasses.gap,
      richValue != null ? "border-r border-border/70" : "",
    ];
    const valueClasses = [
      "inline-flex min-w-0 items-center self-stretch text-foreground",
      richLabel != null || iconEl != null ? "flex-1" : "",
      sizeClasses.segment,
    ];
    const labelStyle: CSSProperties = {};

    if (richLabel != null || iconEl != null) {
      labelClasses.push("bg-secondary text-secondary-foreground");
      applyColorValue(color, "backgroundColor", labelStyle, labelClasses);
      applyColorValue(textColor, "color", labelStyle, labelClasses);
    }

    applyColorValue(borderColor, "borderColor", wrapperStyle, wrapperClasses);

    return renderRoot({
      href,
      target,
      rel,
      canCopy,
      copyText,
      className: cn(wrapperClasses, className),
      style: wrapperStyle,
      content: (
        <>
        {(richLabel != null || iconEl != null) && (
          <span className={cn(labelClasses, labelClassName)} style={labelStyle}>
            {iconEl}
            {richLabel != null && (
              <span className={textBehaviorClasses} title={resolvedLabel.title}>
                {resolvedLabel.content}
              </span>
            )}
          </span>
        )}
        {richValue != null && (
          <span className={cn(valueClasses, valueClassName)}>
            <span className={textBehaviorClasses} title={resolvedValue.title}>
              {resolvedValue.content}
            </span>
          </span>
        )}
        </>
      ),
    });
  }

  const labelClasses = [
    "inline-flex items-center",
    richValue != null ? "shrink-0" : "min-w-0",
    sizeClasses.segment,
    sizeClasses.gap,
    richValue != null ? "border-r border-current/10" : "",
  ];
  const valueClasses = [
    "inline-flex min-w-0 items-center font-semibold",
    richLabel != null || iconEl != null ? "flex-1" : "",
    sizeClasses.segment,
  ];

  if (resolvedVariant === "metric") {
    labelClasses.push("text-muted-foreground");
    valueClasses.push("text-foreground");
  }

  return renderRoot({
    href,
    target,
    rel,
    canCopy,
    copyText,
    className: cn(wrapperClasses, className),
    style: wrapperStyle,
    content: (
      <>
      {(richLabel != null || iconEl != null) && (
        <span className={cn(labelClasses, labelClassName)}>
          {iconEl}
          {richLabel != null && (
            <span className={textBehaviorClasses} title={resolvedLabel.title}>
              {resolvedLabel.content}
            </span>
          )}
        </span>
      )}
      {richValue != null && (
        <span className={cn(valueClasses, valueClassName)}>
          <span className={textBehaviorClasses} title={resolvedValue.title}>
            {resolvedValue.content}
          </span>
        </span>
      )}
      </>
    ),
  });
}
