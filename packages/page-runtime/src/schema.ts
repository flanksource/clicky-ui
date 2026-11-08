// Contracts shared across @flanksource/page-runtime: what a library build publishes (src/build) and what the service
// worker, frame and host read (src/sw, src/frame, src/host). Each slice extends this file only through the owner named
// in the plan's Execution section; the types below come from the P0 spikes (spikes/lib/fragment.ts,
// spikes/lib/module-transform.ts) and are the starting contract.

export type PageStylesRecipe = {
  name: string;
  layer: string;
  /** Published precompiled stylesheet specifiers, linked on every page in library order. */
  base: string[];
  /** Compiler inputs only (theme, utilities, `@config`/`@plugin`, `@theme`); it must not import any `base` stylesheet. */
  entry: string;
  theme: string;
  /** Package specifiers or recipe-relative files loaded by the CSS compiler outside the JS import graph. */
  runtimeDependencies: string[];
  /** Managed libraries whose preset this one extends: only the most-derived recipe is compiled, every base is linked. */
  extends?: string[];
  transform?: (css: string) => string;
};

/** What a library publishes as `runtime/importmap.json`: its closure as package-relative import-map entries. */
export type Fragment = {
  fragment: 1;
  name: string;
  /** Top-level specifiers, including the shared development runtime set. */
  imports: Record<string, string>;
  /** One scope per package version: the bare imports that package's files make. */
  scopes: Record<string, Record<string, string>>;
  /** URL remaps for CommonJS files that ESM code imports by a relative path: file URL to converted URL. */
  remaps: Record<string, string>;
  /** Page-facing specifier prefixes that stand for another prefix, such as facet's `@facet`. */
  aliases: Record<string, string>;
  /** Specifiers the closure imports but leaves to another fragment's top level. */
  inherits: string[];
  /** Subresource integrity for every traced and converted file, by package-relative URL. */
  integrity: Record<string, string>;
  /** Compiler plugins the library contributes to HTML and PDF exports, declared in package.json `pageRuntime.compiler`. */
  compiler?: CompilerPlugins;
};

/** A remark plugin: a module the library exports, whose default export is the plugin, with the options it is applied with. */
export type CompilerPlugin = { module: string; options?: JsonValue };
export type CompilerPlugins = { remark: CompilerPlugin[] };

export type ImportMap ={ imports: Record<string, string>; scopes: Record<string, Record<string, string>> };

/**
 * A library's barrel export index, published as `runtime/barrels.json`: for each entry barrel, the defining module of
 * every named export (`modules[pos]`, or `[pos, importName]` when the name is re-exported under another one).
 */
export type BarrelIndex = {
  modules: string[];
  barrels: Record<string, Record<string, number | [number, string]>>;
};

export type DependencyPolicy = "any" | "ask" | "strict";
export type RuntimePolicy = { dependencies: DependencyPolicy; allow?: string[] };

export type RuntimeProfile = {
  runtimeDomain: string;
  embedders: string[];
  packageOrigin: string;
  registry: string;
  managed: Record<string, string>;
  dependencies?: Record<string, string>;
  /** `any` allows every declared package; `ask` and `strict` allow only the names (or `*` globs) in `allow`. */
  policy: RuntimePolicy;
  /** CommonJS-to-ESM converter for packages without ESM entries; also added to `connect-src`. */
  convert?: { origin: string };
  minReleaseAgeDays: number;
  network: { allow: string[] };
  /** `wasm` lets frames compile WebAssembly (`'wasm-unsafe-eval'`); off by default, and it never enables JS `eval`. */
  csp: { add: Record<string, string[]>; wasm?: boolean };
  links: "allow" | "deny";
  sources: Array<"host" | "opfs" | "folder" | "url" | "hash">;
  readinessTimeoutMs: number;
};

export type PageLock = {
  lock: 2;
  packageOrigin: string;
  page: string;
  versions: Record<string, string>;
  map: ImportMap;
  integrity: Record<string, string>;
  remaps: Record<string, string>;
  barrels: BarrelIndex;
  listings?: Record<string, string>;
  pageSources?: import("./link/page-sources.ts").PageSourceRoot[];
  /** Each library's export compiler plugins, in library order. */
  compiler?: Record<string, CompilerPlugins>;
};

export type FolderManifest = {
  dependencies: Record<string, string>;
  pageRuntime?: { pages?: Record<string, Record<string, string>> };
};

export type RuntimePhase = "resolve" | "fetch" | "compile" | "link" | "render" | "readiness";
export type RuntimeError = { phase: RuntimePhase; message: string; file: string; line?: number; column?: number };
export type Theme = { theme: "light" | "dark"; density: "compact" | "comfortable" | "spacious" };
export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };
export type HostMessage =
  | AgentHostMessage
  | { type: "open"; page: string; manifest: FolderManifest; lock?: PageLock; files: Record<string, string>; policy?: RuntimePolicy }
  | { type: "sources"; files: Record<string, string | null> }
  | { type: "reload" }
  | ({ type: "theme" } & Theme)
  | { type: "data"; data: JsonValue }
  | { type: "export"; format: "html" | "print" };
export type FrameMessage =
  | import("./activity-schema.ts").ActivityMessage
  | AgentFrameMessage
  | { type: "lock"; lock: PageLock }
  | { type: "status"; state: "connecting" | "booting" | "mounted" | "fonts" | "images" | "stylesheets" | "diagrams" | "hook" | "quiescence" | "ready" }
  | { type: "error"; error: RuntimeError }
  | { type: "snapshot"; html: string };
export type BridgeEnvelope<M = HostMessage | FrameMessage> = { bridge: "page-runtime-v1"; session: string; id?: string; re?: string; message: M };

export type FrameConfig = { page: string; entry: string; lock: PageLock; profile: RuntimeProfile; runtimeVersion: string };

export type AgentRect = { left: number; top: number; width: number; height: number };
export type AgentLocator = import("@flanksource/clicky-ui/comments").CommentLocator;
export type AgentSourceContext = { mode: "external-document"; url: string };
export type AgentElementContext = { source: string; sourceContext?: AgentSourceContext; componentName: string; html: string; locators: AgentLocator[] };
export type AgentSelection = { anchor: string; label: string; element: AgentElementContext; rect: AgentRect };
export type AgentPin = { anchor: string; count: number; locators: AgentLocator[] };
export type AgentAnchorState = { anchor: string; state: "found" | "moved" | "orphaned"; label: string; rect: AgentRect | null };
export type AgentHostMessage =
  | import("./review-schema.ts").ReviewHostMessage
  | import("./design-schema.ts").DesignHostMessage
  | { type: "mode"; mode: "off" | "comment" | "design" }
  | { type: "pick" }
  | { type: "page" }
  | { type: "capture-vocabulary" }
  | { type: "pins"; anchors: AgentPin[]; focus?: string | null }
  | { type: "highlight"; anchor: string | null }
  | { type: "scroll"; anchor: string; behavior?: ScrollBehavior; block?: "start" | "center"; offset?: number };
export type AgentFrameMessage =
  | import("./review-schema.ts").ReviewFrameMessage
  | import("./design-schema.ts").DesignFrameMessage
  | { type: "selection"; selection: AgentSelection }
  | { type: "vocabulary-previews"; images: { id: string; image: string; width: number; height: number }[] }
  | { type: "anchors"; anchors: AgentAnchorState[] }
  | { type: "focus"; anchor: string }
  | { type: "keys"; key: "Escape" | "c"; ctrlKey: boolean; metaKey: boolean; shiftKey: boolean; altKey: boolean }
  | { type: "geometry"; scrollX: number; scrollY: number; width: number; height: number };

export type { DesignEdit, DesignWriteRequest, DesignWriteCandidate, DesignWriteResult, DesignHostMessage, DesignFrameMessage } from "./design-schema.ts";
