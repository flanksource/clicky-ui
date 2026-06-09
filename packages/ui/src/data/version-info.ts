// Build-time constants injected by Vite `define` (see packages/ui/vite.config.ts).
// They are absent in dev (Vite serves source without the library build), so every
// read falls back to a runtime-safe default.
declare const __CLICKY_COMMIT__: string;
declare const __CLICKY_TAG__: string;
declare const __CLICKY_DATE__: string;
declare const __CLICKY_DIRTY__: boolean;

function read<T>(getter: () => T, fallback: T): T {
  try {
    return getter();
  } catch {
    return fallback;
  }
}

export type RuntimeMode = "production" | "dev" | "storybook";

export interface VersionInfo {
  commit: string;
  tag: string;
  date: string;
  dirty: boolean;
  mode: RuntimeMode;
}

function detectMode(): RuntimeMode {
  if (read(() => Boolean((import.meta as ImportMeta).env?.STORYBOOK), false)) return "storybook";
  if (read(() => Boolean((import.meta as ImportMeta).env?.DEV), false)) return "dev";
  return "production";
}

/** Resolve build + runtime version metadata. */
export function getVersionInfo(): VersionInfo {
  return {
    commit: read(() => __CLICKY_COMMIT__, ""),
    tag: read(() => __CLICKY_TAG__, ""),
    date: read(() => __CLICKY_DATE__, ""),
    dirty: read(() => __CLICKY_DIRTY__, false),
    mode: detectMode(),
  };
}
