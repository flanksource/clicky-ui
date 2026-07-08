import { createContext } from "react";

export const FILTER_INPUT_DEBOUNCE_MS = 500;

// When `autoSubmit` is false, debounced fields forward their draft value
// immediately (no timer) so the consumer can accumulate state locally and
// fire one request when Apply is clicked. When true (default) fields debounce
// upstream, matching the live-filter behaviour used in trace/log UIs.
export const FilterBarContext = createContext<{ autoSubmit: boolean }>({
  autoSubmit: true,
});
