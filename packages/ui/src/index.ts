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
export { RangeSlider, type RangeSliderProps, type RangeSliderValue } from "./components/RangeSlider";
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
export {
  Avatar,
  type AvatarKind,
  type AvatarProps,
  type AvatarVariant,
} from "./data/Avatar";
export { Badge, badgeVariants, type BadgeProps } from "./data/Badge";
export {
  Clicky,
  type ClickyColumn,
  type ClickyDownloadOptions,
  type ClickyDocument,
  type ClickyField,
  type ClickyNode,
  type ClickyProps,
  type ClickyRemoteFormat,
  type ClickyRow,
  type ClickyStyle,
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
export { Icon, type IconProps, type IconStyle, type IconTone } from "./data/Icon";
export { JsonView, type JsonViewProps } from "./data/JsonView";
export { LogViewer, type LogViewerProps } from "./data/LogViewer";
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
export {
  OperationCatalog,
  type OperationCatalogProps,
} from "./rpc/OperationCatalog";
export { FilterForm, type FilterFormProps } from "./rpc/FilterForm";
export {
  OperationEntityPage,
  type OperationEntityPageProps,
} from "./rpc/OperationEntityPage";
export {
  OperationCommandPage,
  type OperationCommandPageProps,
} from "./rpc/OperationCommandPage";
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
