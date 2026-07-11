import { useState, type ReactNode } from "react";
import { InputField } from "../../../components/InputField";
import { Switch } from "../../../components/Switch";
import { Icon, type StaticIconComponent } from "../../Icon";
import { UiChevronDown, UiChevronRight } from "../../../icons";
import { cn } from "../../../lib/utils";

const controlClassName =
  "h-control-h w-full rounded-md border border-border bg-background px-density-2 text-sm outline-none focus:ring-2 focus:ring-ring";

export function SpecField({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string | undefined;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0 space-y-1 text-xs text-muted-foreground">
      <span>
        {label}
        {hint && <span className="text-muted-foreground/70"> ({hint})</span>}
      </span>
      {children}
    </label>
  );
}

export function SpecInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  icon,
  mono = false,
}: {
  value?: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  ariaLabel?: string | undefined;
  icon?: StaticIconComponent | undefined;
  mono?: boolean | undefined;
}) {
  return (
    <InputField
      aria-label={ariaLabel}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      prefix={
        icon ? (
          <Icon icon={icon} className="size-4 text-muted-foreground/70" />
        ) : undefined
      }
      inputClassName={cn(mono && "font-mono text-xs")}
      className="bg-background"
    />
  );
}

export function SpecSelect({
  value,
  onChange,
  ariaLabel,
  icon,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string | undefined;
  icon?: StaticIconComponent | undefined;
  children: ReactNode;
}) {
  const select = (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={cn(controlClassName, icon && "pl-8")}
    >
      {children}
    </select>
  );
  if (!icon) return select;
  return (
    <div className="relative">
      <Icon
        icon={icon}
        className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/70"
      />
      {select}
    </div>
  );
}

export function SpecButton({
  onClick,
  children,
  ariaLabel,
}: {
  onClick: () => void;
  children: ReactNode;
  ariaLabel?: string | undefined;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="inline-flex  items-center gap-1 rounded-md border border-border bg-background px-density-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  icon,
  integer = false,
}: {
  label: string;
  value?: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number | undefined;
  max?: number | undefined;
  step?: number | undefined;
  icon?: StaticIconComponent | undefined;
  integer?: boolean | undefined;
}) {
  return (
    <SpecField label={label}>
      <InputField
        type="number"
        aria-label={label}
        value={value == null ? "" : String(value)}
        min={min}
        max={max}
        step={step}
        onChange={(next) => onChange(parseOptionalNumber(next, integer))}
        prefix={
          icon ? (
            <Icon icon={icon} className="size-4 text-muted-foreground/70" />
          ) : undefined
        }
        className="bg-background"
      />
    </SpecField>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  minHeight = 76,
  placeholder,
  icon,
}: {
  label: string;
  value?: string | undefined;
  onChange: (value: string) => void;
  minHeight?: number | undefined;
  placeholder?: string | undefined;
  icon?: StaticIconComponent | undefined;
}) {
  return (
    <SpecField label={label}>
      <InputField
        as="textarea"
        aria-label={label}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        spellCheck={false}
        style={{ minHeight }}
        prefix={
          icon ? (
            <Icon
              icon={icon}
              className="mt-1 size-4 text-muted-foreground/70"
            />
          ) : undefined
        }
        inputClassName="font-mono text-xs"
        className="bg-background"
      />
    </SpecField>
  );
}

// Single-line field that expands into a textarea while focused (design
// .expand-field): collapsed it clips to one row, expanded it grows for
// comfortable multi-line editing.
export function ExpandField({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value?: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  icon?: StaticIconComponent | undefined;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <SpecField label={label}>
      <InputField
        as="textarea"
        aria-label={label}
        rows={1}
        value={value ?? ""}
        onChange={onChange}
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
        placeholder={placeholder}
        spellCheck={false}
        prefix={
          icon ? (
            <Icon
              icon={icon}
              className={cn(
                "size-4 text-muted-foreground/70",
                expanded ? "mt-1" : undefined,
              )}
            />
          ) : undefined
        }
        inputClassName={cn(
          "font-mono text-xs transition-[height]",
          expanded
            ? "h-24 resize-y overflow-auto whitespace-pre-wrap"
            : "h-5 resize-none overflow-hidden whitespace-nowrap leading-5",
        )}
        className={cn(
          "bg-background",
          expanded ? undefined : " items-center py-0",
        )}
      />
    </SpecField>
  );
}

export function ListField({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value?: string[] | undefined;
  onChange: (value: string[]) => void;
  placeholder?: string | undefined;
  icon?: StaticIconComponent | undefined;
}) {
  return (
    <TextareaField
      label={label}
      value={value?.join("\n") ?? ""}
      onChange={(next) =>
        onChange(
          next
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter(Boolean),
        )
      }
      minHeight={64}
      placeholder={placeholder}
      icon={icon}
    />
  );
}

export function KeyValueField({
  label,
  value,
  onChange,
  placeholder = "key=value",
  icon,
}: {
  label: string;
  value?: Record<string, string> | undefined;
  onChange: (value: Record<string, string>) => void;
  placeholder?: string | undefined;
  icon?: StaticIconComponent | undefined;
}) {
  return (
    <TextareaField
      label={label}
      value={recordToText(value)}
      onChange={(next) => onChange(textToRecord(next))}
      minHeight={72}
      placeholder={placeholder}
      icon={icon}
    />
  );
}

// Borderless on/off toggle (design .chk-card superseded): a Switch with an
// inline label; the label carries its own icon so it reads at a glance.
export function CheckboxField({
  label,
  checked,
  onChange,
  icon,
}: {
  label: string;
  checked?: boolean | undefined;
  onChange: (checked: boolean) => void;
  icon?: StaticIconComponent | undefined;
}) {
  return (
    <Switch
      checked={Boolean(checked)}
      onChange={onChange}
      className=" py-density-1"
      label={
        <span className="inline-flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
          {icon && (
            <Icon
              icon={icon}
              className="size-3.5 shrink-0 text-muted-foreground/70"
            />
          )}
          <span className="min-w-0 truncate">{label}</span>
        </span>
      }
    />
  );
}

// "Advanced" disclosure under a dashed rule (design details.adv).
export function Disclosure({
  label = "Advanced",
  hint,
  children,
  defaultOpen = false,
}: {
  label?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
  defaultOpen?: boolean | undefined;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mt-density-3 border-t border-dashed border-border pt-density-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <Icon
          icon={open ? UiChevronDown : UiChevronRight}
          className="size-3.5"
        />
        <span>{label}</span>
        {hint && (
          <span className="font-normal text-muted-foreground/70">· {hint}</span>
        )}
      </button>
      {open && <div className="pt-density-2">{children}</div>}
    </div>
  );
}

function recordToText(value: Record<string, string> | undefined) {
  if (!value) return "";
  return Object.entries(value)
    .map(([key, val]) => `${key}=${val}`)
    .join("\n");
}

function textToRecord(value: string) {
  const out: Record<string, string> = {};
  for (const line of value.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const index = trimmed.indexOf("=");
    const key = (index < 0 ? trimmed : trimmed.slice(0, index)).trim();
    const val = index < 0 ? "" : trimmed.slice(index + 1);
    if (key) out[key] = val;
  }
  return out;
}

function parseOptionalNumber(value: string, integer: boolean) {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return integer ? Math.max(0, Math.trunc(parsed)) : parsed;
}
