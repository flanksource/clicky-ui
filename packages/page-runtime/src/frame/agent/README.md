# Page agent

`startPageAgent({ root, page, send, error })` installs the embedded `@flanksource/react-grab` picker, a shadow-root overlay, DOM and resize observers, and shortcut forwarding. `root` is the mounted page wrapper, `page` is its source path, `send` sends an `AgentFrameMessage` through the existing authenticated bridge, and `error` reports failures through the frame's render-error path. An optional `picker` supplies an existing fork instance for the bookmarklet loader; disposal restores its toolbar action and enabled state. The loader must install `devtools-hook.js` as the first classic script before React.

The returned agent accepts `mode`, `pick`, `page`, `pins`, `highlight` and `scroll` messages through `receive`. The existing bridge validates these messages and every outbound frame message; the agent also validates incoming commands before acting. `mode: comment` activates the picker and `mode: off` deactivates it. Each saved pin has an `anchor`, a positive `count` and its captured `locators`; optional `focus` selects an anchor. Reported anchors retain their stored identity and explicitly report `found`, `moved` or `orphaned`, with a null rectangle for an orphan. Geometry uses frame viewport coordinates. The host adds the frame offset when cropping its own screenshot.

Wrap the rendered page in `<PageAgentProvider agent={agent}>` from `./provider.tsx`. It uses clicky-ui's comment contexts to forward component registrations and pin focus, without transferring comment storage or identity into the frame. `registerAnchor` is also available directly for non-React content. Call `dispose` on page teardown.

Source resolution first uses the nearest page `data-source` ancestor, retaining the picked library component's name. Without a marker it inspects React owner creation locations (`_debugSource` and React 19 `_debugStack`). Library and generated entry locations are rejected. Picks without a page location fail visibly through `error`.

The development compiler preserves the original `fileName`, `lineNumber` and `columnNumber` for composite JSX call sites, including member components and Sucrase's spread/key `createElement` path. A library pick without a marked page ancestor can therefore resolve through its owner creation location. Incomplete or non-page locations still fail visibly; the agent does not invent a column.

The bookmarklet explicitly supplies `sourceContext: { mode: "external-document", url: document.location.href }`. Its ordinary HTML selections use this canonical, credential-free HTTP(S) or `file:` URL for `element.source` and carry the same `element.sourceContext`; no markers or React owner are required. File documents use the bookmarklet loader's opaque-origin source-window/session contract; they are never runtime-frame sources. Runtime frames omit this option and retain strict page-source resolution. Both loaders use the same picker. The external host still owns screenshots. Design mode is unavailable for external documents.

Review commands and the host adapter are described in [Remote review](../../host/review/README.md). `startPageAgent` also accepts `pageSources` from the lock to validate the declared page-link context. The compiler projects editable linked page markers to page-relative paths before the agent sees them; ordinary library links retain their rejected library locations.

Design mode activates the same picker with `{ type: "mode", mode: "design" }`. Editable facet call sites (`BoxNode`, `ContainerNode`, `BrandBox`, `BrandContainer`, `Tile`, `Zone`, including named aliases and namespace imports from facet subpaths) and intrinsic SVG (`rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, `path`, `text`, `tspan`, `g`) carry `data-source="<file>:<line>:<column>#<ordinal>@<hash>"`. They share the write server's source-order ordinal sequence. The hash is the first 12 SHA-256 hex digits of the original UTF-8 source. Other host tags retain positional markers. Import `EditableSourceMarker`, `EDITABLE_SOURCE_ATTRIBUTE`, `parseEditableSource(value: string): EditableSourceMarker` and `formatEditableSource(marker: EditableSourceMarker): string` from `@flanksource/page-runtime/markers`; this pure entry has no compiler, Node or React dependency.

The Design bridge types are exported from `@flanksource/page-runtime/schema`:

```ts
type DesignHostMessage =
  | { type: "design-override"; requestId: string; source: string; props: Record<string, JsonValue> }
  | { type: "design-write"; requestId: string; page: string; source: string; edit: DesignEdit; choose?: string }
  | { type: "design-write-result"; requestId: string; result: DesignWriteResult };
```

The frame emits `design-selection` with `{ selection: AgentSelection, source: string, props: Record<string, JsonValue> }`. `props` projects scalar call-site props suitable for the host panel; React children, callbacks and renderer internals are excluded. Preview with `design-override`; null removes a prop. The override runs against the frame's development renderer and committed call-site fiber, and emits `design-override-result` with `{ requestId, source, ok: true }` or `{ requestId, source, ok: false, error }`. All live DOM instances carrying that selected marker update together.

Send `design-write` to ask the frame to emit `design-write-request` with `{ requestId, request: DesignWriteRequest }`. Supply the host API's page identifier explicitly (`report`, not the frame entry `report.tsx`, for playground's slug-based API). The host forwards `request` unchanged to `POST /__playground/visual-edits` and returns its validated response using `design-write-result`. The frame accepts only a pending request ID and acknowledges the result with the same frame event. The request carries `{ page, source, edit, choose? }`; its edit and result unions match the existing visual-edits API, including attributes, delete, text, style and applied/stale/refused/ambiguous/invalid results. The host owns refusal recovery and reload after a successful write. It can send another override to restore a failed preview. Requests must match a live selection and Design mode; package and runtime sources are rejected.

The overlay is a `[data-page-agent][data-react-grab-ignore]` sibling outside the page root. Pins, highlight and styles live in its shadow root. HTML export must remove that host and the fork's `[data-react-grab]` overlay hosts; Tailwind and readiness observers must observe the page root. Screenshot capture and clipboard writes belong to the host.

While focus is in the frame, Alt+C and Escape are forwarded as `keys`; Alt+C is ignored in editable controls and composition. Escape deactivates the picker. The host owns toggling its comment UI.

Run focused checks from the repository root:

```bash
gavel test --work-dir ./packages/ui --framework vitest --recursive=false -- src/comments/anchoring
gavel test --work-dir ./packages/page-runtime --framework vitest --recursive=false -- agent
gavel test --work-dir ./packages/page-runtime --framework vitest --recursive=false -- --config src/frame/agent/vitest.browser.config.ts agent
gavel test --work-dir ./apps/playground --framework vitest --recursive=false -- src/comments src/bookmarklet
```

The browser project uses agent-browser with Chromium because picking and pins require real hit testing and layout. The `agent-browser` executable must be on PATH. The package's shared browser config includes `src/**/*.browser.ts`.

`bootFrame` constructs the agent after styles are prepared and before mounting the page, routes all six command types, and wraps the page in `PageAgentProvider`. The bridge sends agent events and reports errors. Teardown and boot failures dispose the agent, page root and styles. HTML exports remove agent and picker hosts before inlining assets; Tailwind and readiness continue observing only the page root.
