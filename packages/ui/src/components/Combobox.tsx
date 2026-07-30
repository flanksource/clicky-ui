import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { cn } from "../lib/utils";
import { LabelIcon } from "../data/Icon";
import { inputSizeClass } from "./json-schema-form-size";
import { useFloatingZIndex } from "../overlay/modalStack";
import { ComboboxActions } from "./ComboboxActions";
import { ComboboxMenu } from "./ComboboxMenu";
import type {
  ComboboxOption,
  ComboboxProps,
  ComboboxTriStateMode,
} from "./combobox-types";
import {
  COMBOBOX_MENU_MAX_HEIGHT_PX,
  COMBOBOX_MENU_MAX_WIDTH_PX,
  comboboxLabelPadding,
  type ComboboxMenuPosition,
  withSelectedComboboxOptions,
} from "./combobox-utils";

export type {
  ComboboxMultiProps,
  ComboboxOption,
  ComboboxProps,
  ComboboxSingleProps,
  ComboboxTriStateMode,
  ComboboxTriStateProps,
} from "./combobox-types";

export function Combobox(props: ComboboxProps) {
  const {
    options,
    placeholder,
    label,
    ariaLabel: ariaLabelProp,
    disabled,
    required,
    invalid,
    allowCustomValue = true,
    onNew,
    onCreate,
    id,
    size,
    className,
    loading,
    onSearch,
    onKeyDown: onKeyDownProp,
    suffix,
    prefix,
    footer,
  } = props;
  const multiple = props.multiple === true;
  const tristate = props.multiple === true && props.tristate === true;
  const modes = useMemo<Record<string, ComboboxTriStateMode>>(
    () => (props.multiple === true && props.tristate === true ? props.value : {}),
    [props.multiple, props.tristate, props.value],
  );
  const selectedValues = useMemo<string[]>(() => {
    if (props.multiple === true && props.tristate === true) return Object.keys(props.value);
    if (props.multiple === true) return props.value;
    return props.value ? [props.value] : [];
  }, [props.multiple, props.tristate, props.value]);

  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);
  const floatingZ = useFloatingZIndex();
  const [menuPos, setMenuPos] = useState<ComboboxMenuPosition | null>(null);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const [labelWidth, setLabelWidth] = useState(0);

  const isSelected = (optValue: string) => selectedValues.includes(optValue);
  const selectedOption = useMemo(() => {
    if (multiple) return undefined;
    const selected = selectedValues[0];
    if (!selected) return undefined;
    return (
      options.find((option) => option.value === selected) ??
      (allowCustomValue ? onNew?.(selected) ?? undefined : undefined)
    );
  }, [allowCustomValue, multiple, onNew, options, selectedValues]);

  const closedLabel = useMemo(() => {
    if (tristate) {
      const values = Object.values(modes);
      const includes = values.filter((mode) => mode === "include").length;
      const excludes = values.length - includes;
      return [includes > 0 && `+${includes}`, excludes > 0 && `-${excludes}`]
        .filter(Boolean)
        .join(" ");
    }
    if (multiple) {
      const labels = options
        .filter((o) => selectedValues.includes(o.value))
        .map((o) => o.selectedLabel ?? o.label);
      if (labels.length === 0) return "";
      if (labels.length <= 2) return labels.join(", ");
      return `${labels.length} selected`;
    }
    const single = selectedValues[0] ?? "";
    return (
      selectedOption?.selectedLabel ?? selectedOption?.label ?? single
    );
  }, [tristate, modes, multiple, options, selectedOption, selectedValues]);

  const effectivePrefix =
    prefix ??
    (selectedOption?.icon != null ? (
      <LabelIcon icon={selectedOption.icon} className="size-4" />
    ) : null);

  const displayValue = open ? query : closedLabel;

  const filtered = useMemo(() => {
    if (onSearch) return withSelectedComboboxOptions(options, selectedValues);
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [onSearch, options, query, selectedValues]);

  useEffect(() => {
    if (!onSearch || !open) return;
    const handle = setTimeout(() => onSearch(query.trim()), 250);
    return () => clearTimeout(handle);
  }, [onSearch, open, query]);

  const trimmedQuery = query.trim();
  const customEntry = useMemo<ComboboxOption | null>(() => {
    if (
      !allowCustomValue ||
      !trimmedQuery ||
      (!tristate && (multiple || !onNew)) ||
      options.some((option) => option.value === trimmedQuery)
    ) {
      return null;
    }
    if (onNew) return onNew(trimmedQuery);
    return {
      value: trimmedQuery,
      label: `Add "${trimmedQuery}"`,
    };
  }, [
    allowCustomValue,
    multiple,
    onNew,
    options,
    trimmedQuery,
    tristate,
  ]);
  const navOptions = useMemo(
    () => (customEntry ? [...filtered, customEntry] : filtered),
    [filtered, customEntry],
  );

  useEffect(() => {
    setHighlighted(-1);
  }, [query]);
  useEffect(() => {
    if (highlighted >= navOptions.length) setHighlighted(-1);
  }, [highlighted, navOptions.length]);

  useEffect(() => {
    if (!open) return;
    // Dismiss when the pointer goes down, OR focus moves, anywhere outside the
    // control and its portaled listbox — so clicking elsewhere in a dialog (the
    // backdrop never intercepts a document-level listener) or tabbing to another
    // field both close the menu. The listbox is portaled out of rootRef, so a
    // click inside it would otherwise read as "outside" and close before select.
    const onAway = (e: Event) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) {
        commitAndClose();
      }
    };
    document.addEventListener("mousedown", onAway);
    document.addEventListener("focusin", onAway);
    return () => {
      document.removeEventListener("mousedown", onAway);
      document.removeEventListener("focusin", onAway);
    };
  });

  useLayoutEffect(() => {
    if (label == null) {
      setLabelWidth(0);
      return;
    }
    const el = labelRef.current;
    if (el) setLabelWidth(el.offsetWidth);
  }, [label]);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }
    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      const viewportCap = window.innerWidth - rect.left - 8;
      const maxWidth = Math.max(
        rect.width,
        Math.min(COMBOBOX_MENU_MAX_WIDTH_PX, viewportCap),
      );
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const openUp =
        spaceBelow < COMBOBOX_MENU_MAX_HEIGHT_PX && spaceAbove > spaceBelow;
      const maxHeight = Math.min(
        COMBOBOX_MENU_MAX_HEIGHT_PX,
        openUp ? spaceAbove : spaceBelow,
      );
      setMenuPos({
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
        left: rect.left,
        width: rect.width,
        maxWidth,
        maxHeight,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  function emit(next: string[]) {
    if (props.multiple === true && props.tristate !== true) {
      props.onChange(next);
    } else if (props.multiple !== true) {
      props.onChange(next[0] ?? "");
    }
  }

  function emitModes(next: Record<string, ComboboxTriStateMode>) {
    if (props.multiple === true && props.tristate === true) props.onChange(next);
  }

  function setMode(value: string, mode: string) {
    const next = { ...modes };
    if (mode === "include" || mode === "exclude") next[value] = mode;
    else delete next[value];
    emitModes(next);
  }

  function cycleOption(value: string) {
    const current = modes[value];
    setMode(
      value,
      current === undefined ? "include" : current === "include" ? "exclude" : "neutral",
    );
  }

  function openMenu() {
    if (open) return;
    setQuery("");
    setHighlighted(-1);
    setOpen(true);
  }

  function commitAndClose() {
    const trimmed = query.trim();
    if (!multiple && allowCustomValue && trimmed && trimmed !== selectedValues[0]) {
      const existing = options.find((option) => option.value === trimmed);
      const candidate = existing ?? (onNew ? onNew(trimmed) : {
        value: trimmed,
        label: trimmed,
      });
      const created = candidate
        ? existing
          ? existing.value
          : onCreate
            ? onCreate(candidate)
            : candidate.value
        : null;
      if (created !== null) emit([created]);
    }
    setQuery("");
    setOpen(false);
    setHighlighted(-1);
  }

  function selectOption(opt: ComboboxOption) {
    if (opt === customEntry) {
      const created = onCreate ? onCreate(opt) : opt.value;
      if (created !== null) {
        if (tristate) setMode(created, "include");
        else emit([created]);
      }
      if (!tristate) {
        setQuery("");
        setOpen(false);
        setHighlighted(-1);
      }
      inputRef.current?.focus();
      return;
    }
    if (tristate) {
      cycleOption(opt.value);
      inputRef.current?.focus();
      return;
    }
    if (multiple) {
      const next = isSelected(opt.value)
        ? selectedValues.filter((v) => v !== opt.value)
        : [...selectedValues, opt.value];
      emit(next);
      setHighlighted(-1);
      inputRef.current?.focus();
      return;
    }
    emit([opt.value]);
    setQuery("");
    setOpen(false);
    setHighlighted(-1);
    inputRef.current?.focus();
  }

  function clear() {
    if (selectedValues.length > 0) {
      if (tristate) emitModes({});
      else emit([]);
    }
    setQuery("");
    setHighlighted(-1);
    inputRef.current?.focus();
  }

  function scrollToHighlighted(index: number) {
    const list = listRef.current;
    if (!list) return;
    const item = list.querySelectorAll<HTMLElement>('[role="option"]')[index];
    item?.scrollIntoView?.({ block: "nearest" });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        openMenu();
        return;
      }
      const next = highlighted < navOptions.length - 1 ? highlighted + 1 : 0;
      setHighlighted(next);
      scrollToHighlighted(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return;
      const next = highlighted > 0 ? highlighted - 1 : navOptions.length - 1;
      setHighlighted(next);
      scrollToHighlighted(next);
    } else if (e.key === "Enter") {
      if (
        open &&
        highlighted >= 0 &&
        navOptions[highlighted] &&
        !navOptions[highlighted].disabled
      ) {
        e.preventDefault();
        selectOption(navOptions[highlighted]);
        return;
      }
      commitAndClose();
      onKeyDownProp?.(e);
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setQuery("");
        setOpen(false);
        setHighlighted(-1);
      }
    } else {
      onKeyDownProp?.(e);
    }
  }

  const listId = id ? `${id}-listbox` : undefined;
  const ariaLabel = ariaLabelProp ?? (typeof label === "string" ? label : undefined);
  const showClear = !required && !loading && !disabled && selectedValues.length > 0;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div ref={anchorRef} data-jsf-control className="relative flex items-center">
        {label != null && (
          <span
            ref={labelRef}
            className="pointer-events-none absolute left-2 z-10 whitespace-nowrap font-medium uppercase tracking-wide text-muted-foreground text-[10px]"
          >
            {label}
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
          aria-label={ariaLabel}
          aria-invalid={invalid || undefined}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          {...(!open && closedLabel ? { title: closedLabel } : {})}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={openMenu}
          onClick={() => {
            if (!open) openMenu();
          }}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full rounded-md border border-input bg-background text-foreground",
            size ? inputSizeClass[size] : "h-control-h px-control-px text-sm",
            effectivePrefix && "pl-8",
            suffix ? (showClear ? "pr-[5.5rem]" : "pr-14") : showClear ? "pr-14" : "pr-8",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            invalid && "border-destructive focus-visible:ring-destructive",
          )}
          style={
            label != null
              ? comboboxLabelPadding(label, labelWidth)
              : undefined
          }
        />
        {effectivePrefix && (
          <div className="absolute inset-y-0 left-1.5 flex items-center">{effectivePrefix}</div>
        )}
        {suffix && (
          <div className={cn("absolute flex h-full items-center", showClear ? "right-[3.75rem]" : "right-7")}>
            {suffix}
          </div>
        )}
        <ComboboxActions
          disabled={disabled}
          loading={loading}
          onClear={clear}
          onToggle={() => {
            if (open) {
              commitAndClose();
            } else {
              openMenu();
              inputRef.current?.focus();
            }
          }}
          showClear={showClear}
        />
      </div>
      {open && menuPos && typeof document !== "undefined" && (
        <ComboboxMenu
          customEntry={customEntry}
          filtered={filtered}
          floatingZ={floatingZ}
          footer={footer}
          highlighted={highlighted}
          isSelected={isSelected}
          listId={listId}
          listRef={listRef}
          loading={loading}
          menuPos={menuPos}
          modes={modes}
          multiple={multiple}
          onHighlight={setHighlighted}
          onSelect={selectOption}
          onSetMode={setMode}
          tristate={tristate}
        />
      )}
    </div>
  );
}
