import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { UiClose } from "../../icons";
import type { ChatContextItem, ContextTypeConfig, ContextTypeStyle } from "./context";

const DEFAULT_STYLE: ContextTypeStyle = {
  className: "text-muted-foreground bg-muted",
};

function styleFor(type: string, config?: ContextTypeConfig): ContextTypeStyle {
  return config?.[type] ?? DEFAULT_STYLE;
}

function detail(item: ChatContextItem): string {
  const fields = item.fields;
  if (!fields) return "";
  return Object.entries(fields)
    .filter(([, v]) => v != null && v !== "")
    .map(([, v]) => v)
    .join(" ");
}

export type ContextBadgesProps = {
  items: ChatContextItem[];
  /** Removes the badge with the given id. When omitted the badges are read-only. */
  onRemove?: (id: string) => void;
  /** Maps each item `type` to an icon/colour; falls back to a neutral style. */
  typeConfig?: ContextTypeConfig;
  className?: string;
};

/** A wrapping row of context chips. Interactive (each removable) when `onRemove`
 *  is supplied, otherwise static. The financial type→colour map lives entirely
 *  in the caller-supplied `typeConfig`, so this is domain-agnostic. */
export function ContextBadges({ items, onRemove, typeConfig, className }: ContextBadgesProps) {
  if (items.length === 0) return null;
  const readonly = !onRemove;
  return (
    <div
      className={cn(
        readonly ? "flex flex-wrap gap-1" : "flex flex-wrap gap-1.5 px-2 py-1.5",
        className,
      )}
    >
      {items.map((item) => {
        const style = styleFor(item.type, typeConfig);
        const d = detail(item);
        return (
          <span
            key={item.id}
            data-testid={`context-badge-${item.type}`}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border",
              readonly ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs",
              style.className,
            )}
          >
            {style.icon && (
              <Icon
                {...(typeof style.icon === "string" ? { name: style.icon } : { icon: style.icon })}
                className="size-3.5 shrink-0"
              />
            )}
            <span className="font-medium truncate max-w-[180px]">{item.label}</span>
            {d && <span className="opacity-70 truncate max-w-[100px]">{d}</span>}
            {onRemove && (
              <button
                type="button"
                data-testid="context-badge-remove"
                aria-label={`Remove ${item.label}`}
                onClick={() => onRemove(item.id)}
                className="ml-0.5 opacity-60 hover:opacity-100"
              >
                <Icon icon={UiClose} className="size-3" />
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}

/** Convenience alias for static context chips (no remove control). */
export function ContextBadgesReadonly(props: Omit<ContextBadgesProps, "onRemove">) {
  return <ContextBadges {...props} />;
}
