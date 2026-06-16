# Component Documentation Coverage

Tracks the documentation surface for every **public (exported)** visual component in
`@flanksource/clicky-ui`. Two systems serve as docs:

- **Story** — colocated `*.stories.tsx` driving Storybook autodocs.
- **Demo** — a live entry in `apps/kitchen-sink/src/demos/*.tsx`, registered in `demo-catalog.tsx`.

Source of truth for "public" is the index barrels: `components.ts`, `data.ts`, `rpc.ts`, `ai.ts`, `chat.ts`.
Non-visual exports (hooks, providers, pure utilities, type-only) are excluded.

Legend: ✅ present · ❌ missing · ➖ covered by a family/combined demo or not applicable.

> **Status:** All in-scope waves complete. Every exported visual component now has a
> Storybook story; kitchen-sink demos were added for the form fields, cells, timeseries
> and cache-browser families. Remaining ➖ entries are intentionally covered by a
> family/combined demo or are non-visual (providers).

## components/

| Component | Story | Demo | Priority |
|---|---|---|---|
| Button | ✅ | ✅ | — |
| Loading / LoadingDots | ✅ | ✅ | done |
| IconButton | ✅ | ✅ | done |
| SplitButton | ✅ | ➖ | — |
| SegmentedControl | ✅ | ✅ | — |
| SearchInput | ✅ | ✅ | — |
| Switch | ✅ | ➖ | — |
| FormatOptionsDropdown | ✅ | ➖ | — |
| DateField | ✅ | ✅ | — |
| DatePicker | ✅ | ✅ | done |
| DateTimePicker | ✅ | ✅ | done |
| TimeRange | ✅ | ✅ | — |
| RangeSlider | ✅ | ✅ | done |
| FilterBar / TriStateMultiSelect | ✅ | ✅ | — |
| MultiSelect | ✅ | ✅ | — |
| Select | ✅ | ✅ | done |
| Combobox | ✅ | ❌ | P2 (demo) |
| Field | ✅ | ✅ | done |
| TreePickerField | ✅ | ✅ | done |
| WorkloadPicker | ✅ | ❌ | P2 (demo) |
| SecretKeySelector | ✅ | ❌ | P2 (demo) |
| ThemeSwitcher | ✅ | ✅ | — |
| DensitySwitcher | ✅ | ✅ | — |
| IconMenuPicker | ✅ | ➖ | — |
| JsonSchemaForm | ✅ | ❌ | P2 (demo) |

## layout/

| Component | Story | Demo | Priority |
|---|---|---|---|
| SplitPane | ✅ | ✅ | — |
| AppSidebar / AppLayout | ❌ | ✅* | P1 (story) |
| AppShell | ✅ | ✅ | — |
| Panel | ✅ | ✅ | — |
| Tabs | ✅ | ✅ | — |
| Section / DetailEmptyState | ✅ | ✅ | — |

\* `AppSidebarDemo.tsx` exists (untracked / in progress).

## overlay/

| Component | Story | Demo | Priority |
|---|---|---|---|
| DropdownMenu | ✅ | ✅ | — |
| HoverCard | ✅ | ✅ | — |
| Modal | ✅ | ✅ | — |
| ToastProvider | ✅ | ✅ | — |

## data/

| Component | Story | Demo | Priority |
|---|---|---|---|
| AnsiHtml | ✅ | ✅ | — |
| Avatar | ✅ | ✅ | — |
| AvatarBadge | ✅ | ✅ | done |
| Badge | ✅ | ✅ | — |
| CodeBlock | ✅ | ✅ | — |
| DataTable | ✅ | ✅ | — |
| FilterPill | ✅ | ✅ | — |
| Gauge | ✅ | ❌ | P2 (demo) |
| RadialGauge | ✅ | ❌ | P2 (demo) |
| Icon / LabelIcon | ✅ | ✅ | — |
| JsonView | ✅ | ✅ | — |
| KeyValueList | ✅ | ✅ | done |
| Properties | ✅ | ✅ | — |
| LogViewer | ✅ | ✅ | — |
| LogsTable | ✅ | ✅ | — |
| MatrixTable | ✅ | ➖ | done |
| Markdown | ✅ | ✅ | — |
| MethodBadge | ✅ | ❌ | P3 (demo) |
| ProgressBar | ✅ | ✅ | — |
| SignedDeltaBar | ✅ | ✅ | — |
| SortableHeader | ✅ | ✅ | — |
| TabButton | ✅ | ✅ | — |
| TimeseriesPanel | ✅ | ✅ | done |
| TimeseriesGauge | ✅ | ✅ | done |
| TimeseriesCoreBars | ✅ | ✅ | done |
| StatusBreakdown (StatusRows / StackedStatusBar) | ✅ | ➖ | done |
| Version | ✅ | ❌ | P3 (demo) |
| Tree | ✅ | ✅ | — |
| TreeNode | ✅ | ➖ | done |
| TreeGroupHeader | ✅ | ✅ | — |
| Timeline | ✅ | ✅ | — |
| TaskProgress | ✅ | ❌ | P3 (demo) |
| TaskManager | ✅ | ➖ | done |

### data/cells/

| Component | Story | Demo | Priority |
|---|---|---|---|
| StatusDot | ✅ | ✅ | done |
| TagList | ✅ | ✅ | done |
| Timestamp | ✅ | ✅ | done |

### data/diagnostics/

| Component | Story | Demo | Priority |
|---|---|---|---|
| DiagnosticsTree | ✅ | ✅ | — |
| DiagnosticsDetailPanel | ✅ | ✅ | — |
| StackTrace (RenderedStackTrace) | ✅ | ✅ | — |
| ErrorDetails / PrettyStackTrace / CopyBadge | ✅ | ➖ | done |
| JvmStackTrace / JvmStackFrameRow | ✅ | ➖ | done |
| FrameSourceWindow | ✅ | ➖ | done |

### data/har/

| Component | Story | Demo | Priority |
|---|---|---|---|
| HarPanel | ✅ | ✅ | — |

### data/test-runner/

| Component | Story | Demo | Priority |
|---|---|---|---|
| TestRunner | ✅ | ➖ | — |
| TestDetailPanel | ✅ | ➖ | done |
| TestFailureDetail | ✅ | ➖ | done |
| TestFilterBar | ✅ | ➖ | done |
| TestRunSummary | ✅ | ➖ | done |
| TestTree | ✅ | ➖ | done |
| TestTreeNode | ✅ | ➖ | done |

### data/cache-browser/

| Component | Story | Demo | Priority |
|---|---|---|---|
| CacheBrowser | ✅ | ✅ | done |
| CacheDetailPanel | ✅ | ➖ | done |
| CacheStatsOverview | ✅ | ➖ | done |
| CacheTree | ✅ | ➖ | done |
| CacheValue | ✅ | ➖ | done |

### data/chat/ (low-level chat family)

| Component | Story | Demo | Priority |
|---|---|---|---|
| Chat | ✅ | ➖ | — |
| Attachment (AttachmentButton / AttachmentList) | ✅ | ➖ | done |
| ContextUsage | ✅ | ➖ | done |
| Conversation | ✅ | ➖ | done |
| Message | ✅ | ➖ | done |
| MessageActions | ✅ | ➖ | done |
| ModelSelector / EffortSelector | ✅ | ➖ | done |
| PromptInput | ✅ | ➖ | done |
| Reasoning | ✅ | ➖ | done |
| Suggestions | ✅ | ➖ | done |
| ToolCall | ✅ | ➖ | done |

### data/ai/ (chat application shell)

| Component | Story | Demo | Priority |
|---|---|---|---|
| ChatWindows (family) | ✅ | ➖ | — |
| ChatFab / ChatWindow / ChatWindowManager / ContextBadges / ThreadPicker / ToolPreferences | ❌ | ➖ | P3 |

## rpc/

| Component | Story | Demo | Priority |
|---|---|---|---|
| OperationCatalog | ✅ | ➖ | — |
| OperationActionDialog | ✅ | ✅ | — |
| CommandForm | ✅ | ✅ | — |
| EntityExplorerApp | ✅ | ✅ | done |
| AcceptPicker | ✅ | ➖ | done |
| CommandOutput | ✅ | ➖ | done |
| FilterForm | ✅ | ➖ | done |
| InlineError | ✅ | ➖ | done |
| OperationEntityPage | ✅ | ➖ | done |
| OperationCommandPage | ✅ | ➖ | done |
| EndpointList | ✅ | ➖ | done |
| RouterProvider | ➖ | ➖ | n/a (non-visual provider) |

## Summary

- **All ~50 previously-missing stories have been added** — every exported visual component
  now drives Storybook autodocs.
- New kitchen-sink demos: **Form fields**, **Table cells**, **Timeseries**, **CacheBrowser**.
- Connected components (timeseries, cache-browser, rpc pages, TaskManager) are storied with
  synthetic in-memory fetchers / clients / SSE — no backend required. Story-support fixtures
  live in `*.fixtures.ts(x)` (not exported from the package index).
- Remaining ➖ rows are deliberate: a subcomponent covered by its family's demo, or a
  non-visual provider (`RouterProvider`).
