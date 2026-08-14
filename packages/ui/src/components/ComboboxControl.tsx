import type {
  ClipboardEvent,
  KeyboardEvent,
  ReactNode,
  RefObject,
} from "react";
import { cn } from "../lib/utils";
import {
  controlMinHeightClass,
  inputSizeClass,
  labelSizeClass,
  type FormSize,
} from "./json-schema-form-size";
import type { ComboboxOption, ComboboxTriStateMode } from "./combobox-types";
import { comboboxLabelPadding } from "./combobox-utils";
import { ComboboxActions } from "./ComboboxActions";
import { ComboboxTags } from "./ComboboxTags";

export function ComboboxControl({
  anchorRef,
  ariaLabel,
  ariaRequired,
  closedLabel,
  describedBy,
  disabled,
  displayValue,
  effectivePrefix,
  highlighted,
  id,
  inputRef,
  invalid,
  label,
  labelRef,
  labelWidth,
  listId,
  loading,
  onClear,
  onInput,
  onKeyDown,
  onOpen,
  onPaste,
  onRemoveTag,
  onSetTagMode,
  onToggle,
  open,
  options,
  placeholder,
  showClear,
  size,
  suffix,
  tagModes,
  tagValues,
  tags,
}: {
  anchorRef: RefObject<HTMLDivElement>;
  ariaLabel: string | undefined;
  ariaRequired: boolean | undefined;
  closedLabel: string;
  describedBy: string | undefined;
  disabled: boolean | undefined;
  displayValue: string;
  effectivePrefix: ReactNode;
  highlighted: number;
  id: string | undefined;
  inputRef: RefObject<HTMLInputElement>;
  invalid: boolean | undefined;
  label: ReactNode;
  labelRef: RefObject<HTMLSpanElement>;
  labelWidth: number;
  listId: string | undefined;
  loading: boolean | undefined;
  onClear: () => void;
  onInput: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onOpen: () => void;
  onPaste: (event: ClipboardEvent<HTMLInputElement>) => void;
  onRemoveTag: (value: string) => void;
  onSetTagMode: (value: string, mode: string) => void;
  onToggle: () => void;
  open: boolean;
  options: ComboboxOption[];
  placeholder: string | undefined;
  showClear: boolean;
  size: FormSize | undefined;
  suffix: ReactNode;
  /** Per-value include/exclude modes; set only in tristate mode. */
  tagModes: Record<string, ComboboxTriStateMode> | undefined;
  tagValues: string[];
  tags: boolean;
}) {
  return (
    <div
      ref={anchorRef}
      data-jsf-control
      className={cn(
        "relative flex items-center",
        tags &&
          "flex-wrap gap-1 rounded-md border border-input bg-background px-2 py-1 text-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
        tags && (size ? controlMinHeightClass[size] : "min-h-control-h"),
        tags &&
          (suffix
            ? showClear
              ? "pr-[5.5rem]"
              : "pr-14"
            : showClear
              ? "pr-14"
              : "pr-8"),
        tags && invalid && "border-destructive focus-within:ring-destructive",
        tags && disabled && "cursor-not-allowed opacity-50",
      )}
      onMouseDown={(event) => {
        if (!tags || (event.target as HTMLElement).closest("button, input"))
          return;
        event.preventDefault();
        inputRef.current?.focus();
      }}
    >
      {label != null && (
        <span
          ref={labelRef}
          className={cn(
            "pointer-events-none whitespace-nowrap font-medium uppercase tracking-wide text-muted-foreground text-[10px]",
            tags ? "shrink-0" : "absolute left-2 z-10",
          )}
        >
          {label}
        </span>
      )}
      {tags && effectivePrefix}
      {tags && (
        <ComboboxTags
          disabled={disabled}
          modes={tagModes}
          onRemove={onRemoveTag}
          onSetMode={onSetTagMode}
          options={options}
          values={tagValues}
        />
      )}
      <input
        ref={inputRef}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={
          highlighted >= 0 ? `${listId}-${highlighted}` : undefined
        }
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        aria-required={ariaRequired || undefined}
        aria-describedby={describedBy}
        autoComplete="off"
        disabled={disabled}
        placeholder={tags && tagValues.length > 0 ? undefined : placeholder}
        value={displayValue}
        {...(!tags && !open && closedLabel ? { title: closedLabel } : {})}
        onChange={(event) => onInput(event.target.value)}
        onFocus={onOpen}
        onClick={onOpen}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        className={cn(
          tags
            ? "min-w-28 flex-1 bg-transparent px-1 py-1 text-foreground outline-none"
            : "w-full rounded-md border border-input bg-background text-foreground",
          tags
            ? size
              ? labelSizeClass[size]
              : "text-sm"
            : size
              ? inputSizeClass[size]
              : "h-control-h px-control-px text-sm",
          !tags && effectivePrefix && "pl-8",
          !tags &&
            (suffix
              ? showClear
                ? "pr-[5.5rem]"
                : "pr-14"
              : showClear
                ? "pr-14"
                : "pr-8"),
          !tags &&
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
          !tags && "disabled:cursor-not-allowed disabled:opacity-50",
          !tags &&
            invalid &&
            "border-destructive focus-visible:ring-destructive",
        )}
        style={
          !tags && label != null
            ? comboboxLabelPadding(label, labelWidth)
            : undefined
        }
      />
      {!tags && effectivePrefix && (
        <div className="absolute inset-y-0 left-1.5 flex items-center">
          {effectivePrefix}
        </div>
      )}
      {suffix && (
        <div
          className={cn(
            "absolute flex h-full items-center",
            showClear ? "right-[3.75rem]" : "right-7",
          )}
        >
          {suffix}
        </div>
      )}
      <ComboboxActions
        disabled={disabled}
        loading={loading}
        onClear={onClear}
        onToggle={onToggle}
        showClear={showClear}
      />
    </div>
  );
}
