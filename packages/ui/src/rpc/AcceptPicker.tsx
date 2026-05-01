import { useEffect, useRef, useState } from "react";
import { Button } from "../components/button";
import { Icon } from "../data/Icon";
import { cn } from "../lib/utils";

export const ACCEPT_OPTIONS = [
  { value: "application/json", label: "JSON" },
  { value: "application/clicky+json", label: "Clicky" },
  { value: "text/markdown", label: "Markdown" },
  { value: "text/html", label: "HTML" },
  { value: "application/x-yaml", label: "YAML" },
  { value: "text/csv", label: "CSV" },
  { value: "application/pdf", label: "PDF" },
  { value: "text/plain", label: "Pretty" },
] as const;

export const VIEW_OPTIONS = [
  { value: "application/json", label: "JSON" },
  { value: "application/clicky+json", label: "Clicky" },
  { value: "application/pdf", label: "PDF" },
] as const;

export type AcceptOption = { value: string; label: string };
export type AcceptValue = (typeof ACCEPT_OPTIONS)[number]["value"];
export type OperationPreviewMode = "hidden" | "curl" | "cli";

export type AcceptPickerProps = {
  value: string;
  onChange: (value: string) => void;
  size?: "sm" | "md";
  options?: readonly AcceptOption[];
  previewMode?: OperationPreviewMode;
  onPreviewModeChange?: (mode: OperationPreviewMode) => void;
  className?: string;
};

const PREVIEW_OPTIONS: Array<{ value: OperationPreviewMode; label: string }> = [
  { value: "curl", label: "Show cURL preview" },
  { value: "cli", label: "Show CLI preview" },
  { value: "hidden", label: "Hide preview" },
];

export function AcceptPicker({
  value,
  onChange,
  size = "md",
  options = ACCEPT_OPTIONS,
  previewMode = "hidden",
  onPreviewModeChange,
  className,
}: AcceptPickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const pad = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative flex flex-wrap gap-1", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md border text-xs transition-colors",
            pad,
            value === opt.value
              ? "border-emerald-500 bg-emerald-50 font-medium text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
              : "text-muted-foreground hover:border-foreground/20 hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
      {onPreviewModeChange && (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label="Open preview menu"
            aria-haspopup="menu"
            aria-expanded={open}
            className={cn("h-auto", pad)}
            onClick={() => setOpen((current) => !current)}
          >
            <Icon name="codicon:ellipsis" />
          </Button>
          {open && (
            <div
              role="menu"
              aria-label="Preview options"
              className="absolute right-0 top-[calc(100%+0.375rem)] z-50 min-w-[12rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5"
            >
              {PREVIEW_OPTIONS.map((option) => {
                const active = option.value === previewMode;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    )}
                    onClick={() => {
                      onPreviewModeChange(option.value);
                      setOpen(false);
                    }}
                  >
                    <span className="min-w-0 flex-1">{option.label}</span>
                    {active ? <Icon name="ph:check" className="shrink-0" /> : null}
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
