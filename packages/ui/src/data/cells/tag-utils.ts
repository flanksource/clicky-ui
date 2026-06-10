import { createContext, useContext, useMemo } from "react";
import type { FilterMode } from "../FilterPill";

export type TagInput = string | { key: string; value: string } | { name: string; value: string };

export type NormalizedTag = {
  key?: string;
  value: string;
  display: string;
  token: string;
};

export type TagsValue =
  | TagInput[]
  | Record<string, string | number | boolean | null>
  | null
  | undefined;

export type TagsOptions = {
  /** Number of tags to show inline before using the `+N` overflow popover. */
  maxVisible?: number;
  /** Separator between tag keys and values. Defaults to `=`. */
  separator?: string;
};

export function normalizeTags(value: TagsValue, separator = "="): NormalizedTag[] {
  if (value == null) return [];

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeOne(entry, separator)).filter((tag) => tag.value !== "");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, raw]): NormalizedTag | null => {
        if (raw == null) return null;
        const valueStr = String(raw).trim();
        if (!valueStr) return null;
        return {
          key,
          value: valueStr,
          display: `${key}${separator}${valueStr}`,
          token: `${key}${separator}${valueStr}`,
        } satisfies NormalizedTag;
      })
      .filter((tag): tag is NormalizedTag => tag !== null);
  }

  return [];
}

function normalizeOne(entry: TagInput, separator: string): NormalizedTag {
  if (typeof entry === "string") {
    const trimmed = entry.trim();
    const eq = trimmed.indexOf("=");
    const colon = trimmed.indexOf(":");
    const splitAt =
      eq >= 0 && (colon < 0 || eq < colon)
        ? eq
        : colon >= 0 && colon < trimmed.length - 1
          ? colon
          : -1;

    if (splitAt > 0) {
      const key = trimmed.slice(0, splitAt);
      const value = trimmed.slice(splitAt + 1);
      return {
        key,
        value,
        display: `${key}${separator}${value}`,
        token: `${key}${separator}${value}`,
      };
    }

    return { value: trimmed, display: trimmed, token: trimmed };
  }

  const key =
    "key" in entry && typeof entry.key === "string"
      ? entry.key
      : "name" in entry && typeof entry.name === "string"
        ? entry.name
        : undefined;
  const value = String(entry.value ?? "").trim();

  if (key) {
    return {
      key,
      value,
      display: `${key}${separator}${value}`,
      token: `${key}${separator}${value}`,
    };
  }
  return { value, display: value, token: value };
}

export function tagFilterTokens(value: TagsValue, separator = "="): string[] {
  return normalizeTags(value, separator).map((tag) => tag.token);
}

/**
 * Splits a token previously produced by `normalizeTags`/`tagFilterTokens`
 * back into its key and value parts using the same separator. Tokens
 * without a separator (bare tags) return `{ key: "", value: token }`.
 */
export function splitTagToken(token: string, separator = "="): { key: string; value: string } {
  const idx = token.indexOf(separator);
  if (idx <= 0) return { key: "", value: token };
  return {
    key: token.slice(0, idx),
    value: token.slice(idx + separator.length),
  };
}

// Filter mode mapping (re-using FilterPill's tri-state vocabulary so the wire
// shape matches DataTable's existing multiFilters state).
export type TagFilterMode = Extract<FilterMode, "include" | "exclude">;

export type TagActionsContextValue = {
  /** Returns the current mode for a token; "neutral" if the user hasn't acted on it. */
  getMode: (token: string) => FilterMode;
  /** Toggle include for this token (off → include → off). */
  toggleInclude: (token: string) => void;
  /** Toggle exclude for this token (off → exclude → off). */
  toggleExclude: (token: string) => void;
};

const noop: TagActionsContextValue = {
  getMode: () => "neutral",
  toggleInclude: () => {},
  toggleExclude: () => {},
};

export const TagActionsContext = createContext<TagActionsContextValue>(noop);

export function useTagActions(): TagActionsContextValue {
  return useContext(TagActionsContext);
}

/**
 * Builds a TagActionsContextValue from a flat record-of-modes (the same
 * shape used by FilterBar's multi/nested-multi filters). Useful when
 * connecting DataTable's multiFilters state to the in-cell + / − buttons.
 */
export function tagActionsFromRecord(
  value: Record<string, TagFilterMode>,
  onChange: (next: Record<string, TagFilterMode>) => void,
): TagActionsContextValue {
  return {
    getMode: (token) => value[token] ?? "neutral",
    toggleInclude: (token) => {
      const next = { ...value };
      if (next[token] === "include") delete next[token];
      else next[token] = "include";
      onChange(next);
    },
    toggleExclude: (token) => {
      const next = { ...value };
      if (next[token] === "exclude") delete next[token];
      else next[token] = "exclude";
      onChange(next);
    },
  };
}

// Memoizing the context value avoids re-rendering every TagList cell on
// unrelated state changes.
export function useTagActionsValue(
  value: Record<string, TagFilterMode>,
  onChange: (next: Record<string, TagFilterMode>) => void,
): TagActionsContextValue {
  return useMemo(() => tagActionsFromRecord(value, onChange), [value, onChange]);
}
