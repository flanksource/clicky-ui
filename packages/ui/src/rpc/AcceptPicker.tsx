import { useState, type Ref } from "react";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingPortal,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import { Button } from "../components/button";
import { Icon } from "../data/Icon";
import { UiEllipsis, UiCheck } from "../icons";
import { cn } from "../lib/utils";
import { useEscapeLayer, useFloatingZIndex } from "../overlay/modalStack";
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
  const [open, setOpen] = useState(false);
  const pad = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";
  const activeLabel = options.find((opt) => opt.value === value)?.label ?? value;

  // Portaled (floating-ui) so the menu escapes `overflow` clipping from
  // scroll-container ancestors, matching Combobox/DropdownMenu.
  const floatingZ = useFloatingZIndex();
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-end",
    whileElementsMounted: autoUpdate,
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
  });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useDismiss(context, { escapeKey: false }),
    useRole(context, { role: "menu" }),
  ]);
  useEscapeLayer(open, () => {
    setOpen(false);
    if (refs.domReference.current instanceof HTMLElement) refs.domReference.current.focus();
  });

  return (
    <div className={cn("flex", className)}>
      <Button
        ref={refs.setReference as Ref<HTMLButtonElement>}
        type="button"
        variant="outline"
        size="sm"
        aria-label="Open format menu"
        className={cn("h-auto gap-1.5", pad)}
        {...getReferenceProps()}
      >
        <span className="text-xs font-medium">{activeLabel}</span>
        <Icon icon={UiEllipsis} className="text-muted-foreground" />
      </Button>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false}>
            <div
              ref={refs.setFloating}
              role="menu"
              aria-label="Format and preview options"
              style={{ ...floatingStyles, zIndex: floatingZ }}
              className="min-w-[12rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5"
              {...getFloatingProps()}
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
          </FloatingFocusManager>
        </FloatingPortal>
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
