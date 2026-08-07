import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { cn } from "../lib/utils";
import { LabelIcon } from "../data/Icon";
import { useFloatingZIndex } from "../overlay/modalStack";
import { ComboboxControl } from "./ComboboxControl";
import {
  useComboboxLabelWidth,
  useComboboxMenuPosition,
} from "./useComboboxLayout";
import { ComboboxMenu } from "./ComboboxMenu";
import type {
  ComboboxOption,
  ComboboxProps,
  ComboboxTriStateMode,
} from "./combobox-types";
import {
  createComboboxCustomEntry,
  multipleComboboxLabel,
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
    ariaRequired,
    describedBy,
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
  const tags =
    props.multiple === true &&
    props.tristate !== true &&
    props.variant === "tags";
  const modes = useMemo<Record<string, ComboboxTriStateMode>>(
    () =>
      props.multiple === true && props.tristate === true ? props.value : {},
    [props.multiple, props.tristate, props.value],
  );
  const selectedValues = useMemo<string[]>(() => {
    if (props.multiple === true && props.tristate === true)
      return Object.keys(props.value);
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
  const menuPos = useComboboxMenuPosition(open, anchorRef);
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(-1);
  const labelWidth = useComboboxLabelWidth(label, labelRef);

  const isSelected = (optValue: string) => selectedValues.includes(optValue);
  const selectedOption = useMemo(() => {
    if (multiple) return undefined;
    const selected = selectedValues[0];
    if (!selected) return undefined;
    return (
      options.find((option) => option.value === selected) ??
      (allowCustomValue ? (onNew?.(selected) ?? undefined) : undefined)
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
      return multipleComboboxLabel(options, selectedValues);
    }
    const single = selectedValues[0] ?? "";
    return selectedOption?.selectedLabel ?? selectedOption?.label ?? single;
  }, [tristate, modes, multiple, options, selectedOption, selectedValues]);

  const effectivePrefix =
    prefix ??
    (selectedOption?.icon != null ? (
      <LabelIcon icon={selectedOption.icon} className="size-4" />
    ) : null);

  const displayValue = tags ? query : open ? query : closedLabel;

  const filtered = useMemo(() => {
    if (onSearch) return withSelectedComboboxOptions(options, selectedValues);
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.description?.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q),
    );
  }, [onSearch, options, query, selectedValues]);

  useEffect(() => {
    if (!onSearch || !open) return;
    const handle = setTimeout(() => onSearch(query.trim()), 250);
    return () => clearTimeout(handle);
  }, [onSearch, open, query]);

  const trimmedQuery = query.trim();
  const customEntry = useMemo<ComboboxOption | null>(
    () =>
      createComboboxCustomEntry({
        allowCustomValue,
        query: trimmedQuery,
        multiple,
        tristate,
        onNew,
        choices: options,
        selectedValues,
      }),
    [
      allowCustomValue,
      multiple,
      onNew,
      options,
      selectedValues,
      trimmedQuery,
      tristate,
    ],
  );
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
      if (
        !rootRef.current?.contains(target) &&
        !listRef.current?.contains(target)
      ) {
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

  function emit(next: string[]) {
    if (props.multiple === true && props.tristate !== true) {
      props.onChange(next);
    } else if (props.multiple !== true) {
      props.onChange(next[0] ?? "");
    }
  }

  function emitModes(next: Record<string, ComboboxTriStateMode>) {
    if (props.multiple === true && props.tristate === true)
      props.onChange(next);
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
      current === undefined
        ? "include"
        : current === "include"
          ? "exclude"
          : "neutral",
    );
  }

  function openMenu() {
    if (open) return;
    setQuery("");
    setHighlighted(-1);
    setOpen(true);
  }
  function createOptionValue(option: ComboboxOption): string | null {
    return onCreate ? onCreate(option) : option.value;
  }
  function emitCustomValue(value: string) {
    if (tristate) {
      setMode(value, "include");
      return;
    }
    if (multiple) {
      if (!selectedValues.includes(value)) emit([...selectedValues, value]);
      return;
    }
    emit([value]);
  }

  function commitAndClose() {
    const trimmed = query.trim();
    if (customEntry) {
      const created = createOptionValue(customEntry);
      if (created !== null) emitCustomValue(created);
    } else if (
      !multiple &&
      allowCustomValue &&
      trimmed &&
      trimmed !== selectedValues[0]
    ) {
      const existing = options.find((option) => option.value === trimmed);
      const candidate =
        existing ??
        (onNew
          ? onNew(trimmed)
          : {
              value: trimmed,
              label: trimmed,
            });
      const created = candidate
        ? existing
          ? existing.value
          : createOptionValue(candidate)
        : null;
      if (created !== null) emit([created]);
    }
    setQuery("");
    setOpen(false);
    setHighlighted(-1);
  }

  function selectOption(opt: ComboboxOption) {
    if (opt === customEntry) {
      const created = createOptionValue(opt);
      if (created !== null) emitCustomValue(created);
      setQuery("");
      setHighlighted(-1);
      if (!multiple) {
        setOpen(false);
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

  function removeTag(value: string) {
    emit(selectedValues.filter((selected) => selected !== value));
    inputRef.current?.focus();
  }

  function scrollToHighlighted(index: number) {
    const list = listRef.current;
    if (!list) return;
    const item = list.querySelectorAll<HTMLElement>('[role="option"]')[index];
    item?.scrollIntoView?.({ block: "nearest" });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (
      tags &&
      e.key === "Backspace" &&
      query === "" &&
      selectedValues.length > 0
    ) {
      e.preventDefault();
      emit(selectedValues.slice(0, -1));
    } else if (e.key === "ArrowDown") {
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
      if (open && multiple && customEntry) {
        e.preventDefault();
        selectOption(customEntry);
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
  const ariaLabel =
    ariaLabelProp ?? (typeof label === "string" ? label : undefined);
  const showClear =
    !required && !loading && !disabled && selectedValues.length > 0;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <ComboboxControl
        anchorRef={anchorRef}
        ariaLabel={ariaLabel}
        ariaRequired={ariaRequired}
        closedLabel={closedLabel}
        describedBy={describedBy}
        disabled={disabled}
        displayValue={displayValue}
        effectivePrefix={effectivePrefix}
        highlighted={highlighted}
        id={id}
        inputRef={inputRef}
        invalid={invalid}
        label={label}
        labelRef={labelRef}
        labelWidth={labelWidth}
        listId={listId}
        loading={loading}
        onClear={clear}
        onInput={(value) => {
          setQuery(value);
          if (!open) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        onOpen={openMenu}
        onRemoveTag={removeTag}
        onToggle={() => {
          if (open) {
            commitAndClose();
          } else {
            openMenu();
            inputRef.current?.focus();
          }
        }}
        open={open}
        options={options}
        placeholder={placeholder}
        showClear={showClear}
        size={size}
        suffix={suffix}
        tagValues={selectedValues}
        tags={tags}
      />
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
