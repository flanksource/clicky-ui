import { useEffect, useRef, useState } from "react";
import { Button } from "../components/button";
import { Icon } from "../data/Icon";
import { UiEllipsis, UiCheck } from "../icons";
import { cn } from "../lib/utils";
import {
  ACCEPT_OPTIONS,
  type AcceptOption,
  type OperationPreviewMode,
} from "./accept-options";

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
  const activeLabel = options.find((opt) => opt.value === value)?.label ?? value;

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
    <div ref={rootRef} className={cn("relative flex", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        aria-label="Open format menu"
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn("h-auto gap-1.5", pad)}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="text-xs font-medium">{activeLabel}</span>
        <Icon icon={UiEllipsis} className="text-muted-foreground" />
      </Button>
      {open && (
        <div
          role="menu"
          aria-label="Format and preview options"
          className="absolute right-0 top-[calc(100%+0.375rem)] z-50 min-w-[12rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5"
        >
          <MenuSectionLabel>Format</MenuSectionLabel>
          {options.map((opt) => (
            <MenuRadioItem
              key={opt.value}
              label={opt.label}
              active={opt.value === value}
              onSelect={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            />
          ))}
          {onPreviewModeChange && (
            <>
              <div role="separator" className="my-1 h-px bg-border" />
              <MenuSectionLabel>Preview</MenuSectionLabel>
              {PREVIEW_OPTIONS.map((option) => (
                <MenuRadioItem
                  key={option.value}
                  label={option.label}
                  active={option.value === previewMode}
                  onSelect={() => {
                    onPreviewModeChange(option.value);
                    setOpen(false);
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuSectionLabel({ children }: { children: string }) {
  return (
    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function MenuRadioItem({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={active}
      className={cn(
        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm transition-colors",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none",
        active && "font-medium",
      )}
      onClick={onSelect}
    >
      <span className="min-w-0 flex-1">{label}</span>
      {active ? <Icon icon={UiCheck} className="shrink-0" /> : null}
    </button>
  );
}
