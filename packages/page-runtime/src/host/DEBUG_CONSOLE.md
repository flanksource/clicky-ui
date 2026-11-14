# Page runtimes in DebugConsole

`PageFrame` automatically registers each active frame with the shared `@flanksource/clicky-ui` DebugConsole. This covers Facet previews and Clicky UI pages without wiring diagnostics in each application. Mount the existing `DebugConsoleDock` and `DebugConsoleButton` in the host application; open the console and select **Runtimes**.

Each frame has an independent view of its status, build errors, libraries, requests, timeline, Tailwind builds and load summary. The build log includes frame lifecycle steps. The diagnostics view loads when selected. Unmounting or navigating the frame removes its registration, and **Clear captures** clears runtime diagnostics alongside the other console captures.

Request activity is retained only while the console is open with capture enabled. Each frame retains at most 2,000 requests and reports how many older requests were dropped. Status and the latest build error remain available when opening the console after a failure. Diagnostics do not retain template data, source content or export snapshots.

For a custom runtime host, `registerDebugRuntime({ id, label, content, clear })` from `@flanksource/clicky-ui/data` registers a React diagnostics view. The returned function unregisters it. IDs must be unique among active frames. `DebugConsole` subscribes to registrations, so mounting it after a frame still lists that frame. The selected top-level tab persists in `__debug_tab=runtimes`.

The **Devtools / Page runtimes / FacetAndClicky** Storybook story demonstrates both runtime views, a failed build and clearing diagnostics.
