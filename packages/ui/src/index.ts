// Lib
export { cn } from "./lib/utils";
export { AVATAR_PALETTE, fnv1a32, paletteClass } from "./lib/palette";
export { SIZE_TOKENS, resolveSize, type SizeToken } from "./lib/size";

// Theming hooks
export { ThemeProvider, useTheme, type Theme, type ResolvedTheme } from "./hooks/use-theme";
export { DensityProvider, useDensity, useDensityValue, type Density } from "./hooks/use-density";

// Utility hooks
export {
  useSort,
  type SortDir,
  type SortState,
  type UseSortOptions,
  type UseSortReturn,
} from "./hooks/use-sort";
export { useHistoryRoute, type UseHistoryRouteOptions } from "./hooks/use-history-route";

// Existing components
export { Button, buttonVariants, type ButtonProps } from "./components/button";
export { DatePicker, type DatePickerProps } from "./components/DatePicker";
export { DateTimePicker, type DateTimePickerProps } from "./components/DateTimePicker";
export {
  RangeSlider,
  type RangeSliderProps,
  type RangeSliderValue,
} from "./components/RangeSlider";
export {
  FilterBar,
  type FilterBarBooleanFilter,
  type FilterBarEnumFilter,
  type FilterBarFilter,
  type FilterBarLookupFilter,
  type FilterBarLookupInputType,
  type FilterBarLookupMultiFilter,
  type FilterBarLookupOption,
  type FilterBarMultiFilter,
  type FilterBarMultiFilterMode,
  type FilterBarNumberFilter,
  type FilterBarNumberValue,
  type FilterBarProps,
  type FilterBarRangePreset,
  type FilterBarRangeProps,
  type FilterBarSearchProps,
  type FilterBarSelectMultiFilter,
  type FilterBarTextFilter,
} from "./components/FilterBar";
export {
  MultiSelect,
  type MultiSelectOption,
  type MultiSelectProps,
} from "./components/MultiSelect";
export { Select, type SelectProps, type SelectOption } from "./components/select";
export { ThemeSwitcher, type ThemeSwitcherProps } from "./components/theme-switcher";
export { DensitySwitcher, type DensitySwitcherProps } from "./components/density-switcher";

// Layout
export { SplitPane, type SplitPaneProps } from "./layout/SplitPane";
export {
  Section,
  DetailEmptyState,
  type SectionProps,
  type DetailEmptyStateProps,
} from "./layout/Section";

// Data
export { AnsiHtml, type AnsiHtmlProps } from "./data/AnsiHtml";
export { Avatar, type AvatarKind, type AvatarProps, type AvatarVariant } from "./data/Avatar";
export { AvatarBadge, type AvatarBadgeProps } from "./data/AvatarBadge";
export { Badge, badgeVariants, type BadgeProps } from "./data/Badge";
export {
  Clicky,
  type ClickyCommandRequest,
  type ClickyCommandRuntime,
  type ClickyLinkTarget,
  type ClickyResolvedCommand,
  type ClickyColumn,
  type ClickyDownloadOptions,
  type ClickyDocument,
  type ClickyField,
  type ClickyNode,
  type ClickyProps,
  type ClickyRemoteFormat,
  type ClickyRow,
  type ClickyStyle,
  type ClickyTableRowHref,
  type ClickyTableRowClick,
  type ClickyTableRowPredicate,
  type ClickyTreeItem,
  type ClickyViewOptions,
} from "./data/Clicky";
export {
  DataTable,
  inferColumns,
  type DataTableColumn,
  type DataTableProps,
} from "./data/DataTable";
export {
  FilterPill,
  FilterPillGroup,
  FilterSeparator,
  type FilterPillProps,
  type FilterPillGroupProps,
  type FilterMode,
} from "./data/FilterPill";
export { Gauge, type GaugeProps, type GaugeTone } from "./data/Gauge";
export {
  Icon,
  setFallbackIconProvider,
  type FallbackIconProps,
  type IconProps,
  type IconStyle,
  type IconTone,
} from "./data/Icon";
export { JsonView, type JsonViewProps } from "./data/JsonView";
export { KeyValueList, type KeyValueListItem, type KeyValueListProps } from "./data/KeyValueList";
export { LogViewer, type LogViewerProps } from "./data/LogViewer";
export { MatrixTable, type MatrixTableProps, type MatrixTableRow } from "./data/MatrixTable";
export { Markdown, type MarkdownProps } from "./data/Markdown";
export { MethodBadge, type MethodBadgeProps } from "./data/MethodBadge";
export { ProgressBar, type ProgressBarProps, type ProgressSegment } from "./data/ProgressBar";
export { SortableHeader, type SortableHeaderProps } from "./data/SortableHeader";
export { TabButton, type TabButtonProps } from "./data/TabButton";
export { Tree, type TreeProps } from "./data/Tree";
export { TreeNode, type TreeNodeProps, type TreeRowContext } from "./data/TreeNode";
export { TreeGroupHeader, type TreeGroupHeaderProps } from "./data/TreeGroupHeader";

// Diagnostics
export { DiagnosticsTree, type DiagnosticsTreeProps } from "./data/diagnostics/DiagnosticsTree";
export {
  DiagnosticsDetailPanel,
  type DiagnosticsDetailPanelProps,
} from "./data/diagnostics/DiagnosticsDetailPanel";
export type { ProcessNode, StackCapture, RunMeta } from "./data/diagnostics/types";
export {
  findProcessByPID,
  countProcesses,
  processLabel,
  processStateIcon,
  processStateColor,
} from "./data/diagnostics/utils";
export {
  parseGoroutineDump,
  countGoroutinesByState,
  parseStackDump,
  detectDumpFormat,
  countStackByState,
  type ParsedGoroutine,
  type ParsedGoroutineFrame,
  type ParsedStack,
  type DumpFormat,
} from "./data/diagnostics/stacktrace";
export {
  parseJvmThreadDump,
  countThreadsByState,
  type ParsedThread,
  type ParsedThreadFrame,
} from "./data/diagnostics/jvm-stacktrace";
export {
  JvmStackTrace,
  JvmStackFrameRow,
  type JvmStackTraceProps,
} from "./data/diagnostics/JvmStackTrace";
export {
  StackTrace,
  type StackTraceProps,
  type StackTraceSourceResolver,
} from "./data/diagnostics/RenderedStackTrace";
export {
  parseJavaStackTrace,
  type ParsedStackFrame,
  type ParsedStackTrace,
} from "./data/diagnostics/stacktrace-parse";

// HAR (HTTP archive viewer)
export { HarPanel, type HarPanelProps } from "./data/har/HarPanel";
export type {
  HAREntry,
  HARRequest,
  HARResponse,
  HARContent,
  HARHeader,
  HARPostData,
} from "./data/har/types";

// Overlay
export { HoverCard, type HoverCardProps, type HoverCardPlacement } from "./overlay/HoverCard";
export { Modal, type ModalProps, type ModalSize } from "./overlay/Modal";

// Clicky-rpc operations browser
// Note: ApiExplorer and EntityExplorerApp depend on @scalar/api-reference-react and are
// exposed via the "@flanksource/clicky-ui/api-explorer" subpath to keep that dep out of
// consumers who don't use them.
export { OperationCatalog, type OperationCatalogProps } from "./rpc/OperationCatalog";
export {
  ACCEPT_OPTIONS,
  AcceptPicker,
  VIEW_OPTIONS,
  type AcceptOption,
  type AcceptPickerProps,
  type AcceptValue,
  type OperationPreviewMode,
} from "./rpc/AcceptPicker";
export { CommandForm, type CommandFormProps } from "./rpc/CommandForm";
export { CommandOutput, type CommandOutputProps } from "./rpc/CommandOutput";
export { FilterForm, type FilterFormProps } from "./rpc/FilterForm";
export { InlineError, type InlineErrorProps } from "./rpc/InlineError";
export {
  OperationActionDialog,
  type OperationActionDialogProps,
} from "./rpc/OperationActionDialog";
export { OperationEntityPage, type OperationEntityPageProps } from "./rpc/OperationEntityPage";
export { OperationCommandPage, type OperationCommandPageProps } from "./rpc/OperationCommandPage";
export {
  EndpointList,
  type EndpointListProps,
  type RenderLink,
  type RenderLinkArgs,
} from "./rpc/EndpointList";
export {
  useOpenAPI,
  useOperations,
  useOperationById,
  type OperationsApiClient,
} from "./rpc/useOperations";
export {
  filterOperationsByDomain,
  findDetailEndpoint,
  findListEndpoint,
  normalizeRows,
  parseJsonBody,
} from "./rpc/classify";
export {
  type ClickyOperationMeta,
  type ClickySpecMeta,
  type ClickySurface,
  isPositionalParam,
  type DomainDefinition,
  type ExecutionRequest,
  type ExecutionResponse,
  type OpenAPIOperation,
  type OperationLookupFilter,
  type OperationLookupFilterType,
  type OperationLookupResponse,
  type OpenAPIParameter,
  type OpenAPISchema,
  type OpenAPISpec,
  type ResolvedOperation,
} from "./rpc/types";
