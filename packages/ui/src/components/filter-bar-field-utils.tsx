import {
  cloneElement,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import type { FilterMode } from "../data/FilterPill";
import { LabelIcon, type LabelIconSpec } from "../data/Icon";
import { FILTER_INPUT_DEBOUNCE_MS, FilterBarContext } from "./filter-bar-context";
import type { MultiSelectOption } from "./MultiSelect";

export type FilterBarMultiFilterMode = Extract<FilterMode, "include" | "exclude">;

// mergeMultiSelectOptions concatenates two option lists, deduping by value with
// the first list (the head) taking precedence on ordering and label.
export function mergeMultiSelectOptions(
  head: MultiSelectOption[],
  extra: MultiSelectOption[],
): MultiSelectOption[] {
  if (extra.length === 0) return head;
  const seen = new Set(head.map((o) => o.value));
  const merged = [...head];
  for (const option of extra) {
    if (!seen.has(option.value)) {
      seen.add(option.value);
      merged.push(option);
    }
  }
  return merged;
}

export function multiSelectOptionText(option: MultiSelectOption) {
  const label = typeof option.label === "string" ? option.label : "";
  return [option.value, label, option.title ?? ""].filter(Boolean).join(" ");
}

export function summarizeMultiFilter(
  label: string,
  value: Record<string, FilterBarMultiFilterMode>,
): string {
  const includeCount = Object.values(value).filter((mode) => mode === "include").length;
  const excludeCount = Object.values(value).filter((mode) => mode === "exclude").length;

  if (includeCount === 0 && excludeCount === 0) {
    return label;
  }

  const counts = [
    includeCount > 0 ? `+${includeCount}` : null,
    excludeCount > 0 ? `-${excludeCount}` : null,
  ].filter(Boolean);

  return `${label} ${counts.join(" ")}`;
}

export function useDebouncedMultiDraft(
  value: Record<string, FilterBarMultiFilterMode>,
  onChange: (value: Record<string, FilterBarMultiFilterMode>) => void,
) {
  const { autoSubmit } = useContext(FilterBarContext);
  const [draft, setDraft] = useState(value);
  const latestOnChange = useRef(onChange);
  const latestValue = useRef(value);
  const valueKey = multiFilterValueKey(value);

  useEffect(() => {
    latestOnChange.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!sameMultiFilterValue(latestValue.current, value)) {
      latestValue.current = value;
      setDraft(value);
      return;
    }
    latestValue.current = value;
  }, [valueKey, value]);

  useEffect(() => {
    if (sameMultiFilterValue(draft, value)) return;

    if (!autoSubmit) {
      latestOnChange.current(draft);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      latestOnChange.current(draft);
    }, FILTER_INPUT_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [autoSubmit, draft, valueKey]);

  return [draft, setDraft] as const;
}

function multiFilterValueKey(value: Record<string, FilterBarMultiFilterMode>): string {
  return Object.keys(value)
    .sort()
    .map((key) => `${key}:${value[key]}`)
    .join("\u0000");
}

function sameMultiFilterValue(
  a: Record<string, FilterBarMultiFilterMode>,
  b: Record<string, FilterBarMultiFilterMode>,
) {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

export function updateMultiFilterValue(
  current: Record<string, FilterBarMultiFilterMode>,
  optionValue: string,
  nextMode: FilterMode,
): Record<string, FilterBarMultiFilterMode> {
  const next = { ...current };

  if (nextMode === "neutral") {
    delete next[optionValue];
    return next;
  }

  if (nextMode === "include" || nextMode === "exclude") {
    next[optionValue] = nextMode;
  }

  return next;
}

export function nextFilterMode(mode: FilterMode): FilterMode {
  if (mode === "include") return "exclude";
  if (mode === "exclude") return "neutral";
  return "include";
}

// sizedIcon constrains a filter icon to `px`. A node icon (e.g. a lucide
// component, which otherwise renders at its own default 24px) is cloned with an
// explicit inline width/height — done in clicky-ui via a real style so it never
// depends on a Tailwind arbitrary class being generated in the consumer's build.
// A string (runtime/iconify) icon is returned as-is and sized by the wrapper's
// font-size. An existing inline size on the node wins (consumer override).
export function sizedIcon(icon: LabelIconSpec | undefined, px: number): LabelIconSpec | undefined {
  if (!isValidElement(icon)) return icon;
  const el = icon as ReactElement<{ style?: CSSProperties }>;
  return cloneElement(el, {
    style: { width: `${px}px`, height: `${px}px`, ...el.props.style },
  });
}

// comboboxLabelProps maps a filter to the Combobox `label`/`ariaLabel`: when the
// filter carries an `icon`, the icon replaces the inline text label (with the
// field name kept as tooltip + accessible name); otherwise the text label shows.
// clicky-ui owns the size (10px default) — the consumer supplies only the icon
// and its colour.
export function comboboxLabelProps(filter: { icon?: LabelIconSpec; label: string }): {
  label: ReactNode;
  ariaLabel?: string;
} {
  if (filter.icon == null) return { label: filter.label };
  return {
    label: (
      <span title={filter.label} className="inline-flex items-center text-[10px]">
        <LabelIcon icon={sizedIcon(filter.icon, 10)} className="normal-case" />
      </span>
    ),
    ariaLabel: filter.label,
  };
}

export function lookupFieldWidthClass(grow: boolean) {
  return grow ? "min-w-[12rem] max-w-[18rem] flex-1" : "min-w-[11rem] max-w-[15rem] shrink-0";
}
