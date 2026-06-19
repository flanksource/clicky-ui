import { useRef, useState, type ReactNode } from "react";
import { Icon } from "../data/Icon";
import { UiBraces } from "../icons";
import { DropdownMenu, type DropdownMenuItem } from "../overlay/DropdownMenu";
import type { FieldControl } from "./json-schema-form-types";

// A plain string is both the inserted value and the label; the object form lets a
// rich ReactNode label display while the plain `value` string is what gets inserted.
export type TemplateToken = string | { value: string; label?: ReactNode };

// A static list, or a loader called the first time the menu opens — it may return
// synchronously or as a Promise (e.g. values fetched from an API).
export type TemplateValuesLoader =
  | readonly TemplateToken[]
  | (() => readonly TemplateToken[] | Promise<readonly TemplateToken[]>);

function normalizeToken(token: TemplateToken): { value: string; label: ReactNode } {
  return typeof token === "string"
    ? { value: token, label: token }
    : { value: token.value, label: token.label ?? token.value };
}

// Splices `value` into the field's text input at the caret, located through the
// data-jsf-control wrapper that hosts this prefix. Enum/combobox fields own their
// text state and expose no input[data-jsf-input], so there the value replaces the
// field value instead of inserting at a caret.
function insertTemplateValue(field: FieldControl, trigger: HTMLElement | null, value: string) {
  const input = trigger
    ?.closest("[data-jsf-control]")
    ?.querySelector<HTMLInputElement>("input[data-jsf-input]");
  const current = typeof field.value === "string" ? field.value : "";
  if (!input) {
    field.onChange(value);
    return;
  }
  const start = input.selectionStart ?? current.length;
  const end = input.selectionEnd ?? current.length;
  field.onChange(current.slice(0, start) + value + current.slice(end));
  const caret = start + value.length;
  requestAnimationFrame(() => {
    input.focus();
    input.setSelectionRange(caret, caret);
  });
}

// A leading `{ }` glyph that opens a separate dropdown of template tokens; picking
// one inserts its value into the field. Tokens resolve lazily on first open and are
// cached, so an async loader shows a `Loading…` row until it settles.
export function TemplateVarMenu({
  field,
  tokens,
  menuLabel,
  header,
  footer,
}: {
  field: FieldControl;
  tokens: TemplateValuesLoader;
  menuLabel: string;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [resolved, setResolved] = useState<readonly TemplateToken[] | null>(
    Array.isArray(tokens) ? tokens : null,
  );
  const [loading, setLoading] = useState(false);

  const loadOnOpen = (open: boolean) => {
    if (!open || resolved !== null || typeof tokens !== "function") return;
    const result = tokens();
    if (result instanceof Promise) {
      setLoading(true);
      void result.then((values) => {
        setResolved(values);
        setLoading(false);
      });
    } else {
      setResolved(result);
    }
  };

  const items: DropdownMenuItem[] = loading
    ? [{ label: "Loading…", onSelect: () => {}, disabled: true }]
    : (resolved ?? []).map((token) => {
        const { value, label } = normalizeToken(token);
        return { label, onSelect: () => insertTemplateValue(field, triggerRef.current, value) };
      });

  return (
    <DropdownMenu
      align="left"
      menuLabel={menuLabel}
      menuClassName="font-mono text-xs"
      items={items}
      onOpenChange={loadOnOpen}
      header={header}
      footer={footer}
      trigger={
        <button
          ref={triggerRef}
          type="button"
          aria-label={menuLabel}
          title={menuLabel}
          className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Icon icon={UiBraces} />
        </button>
      }
    />
  );
}
