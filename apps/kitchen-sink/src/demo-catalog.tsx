import type { ComponentType } from "react";
import { SwitchersDemo } from "./demos/SwitchersDemo";
import { ButtonDemo } from "./demos/ButtonDemo";
import { IconDemo } from "./demos/IconDemo";
import { GeneratedIconsDemo } from "./demos/GeneratedIconsDemo";
import { BadgeDemo } from "./demos/BadgeDemo";
import { AvatarDemo } from "./demos/AvatarDemo";
import { ProgressBarDemo } from "./demos/ProgressBarDemo";
import { SignedDeltaBarDemo } from "./demos/SignedDeltaBarDemo";
import { JsonViewDemo } from "./demos/JsonViewDemo";
import { AnsiHtmlDemo } from "./demos/AnsiHtmlDemo";
import { ClickyDemo } from "./demos/ClickyDemo";
import { ClickyNativeDemo } from "./demos/ClickyNativeDemo";
import { CodeBlocksDemo } from "./demos/CodeBlocksDemo";
import { LogViewerDemo } from "./demos/LogViewerDemo";
import { LogsTableDemo } from "./demos/LogsTableDemo";
import { MarkdownDemo } from "./demos/MarkdownDemo";
import { PropertiesDemo } from "./demos/PropertiesDemo";
import { FilterBarDemo } from "./demos/FilterBarDemo";
import { FilterPillDemo } from "./demos/FilterPillDemo";
import { TimeRangeDemo } from "./demos/TimeRangeDemo";
import { DataTableDemo } from "./demos/DataTableDemo";
import { TraceLogsDemo } from "./demos/TraceLogsDemo";
import { SortableHeaderDemo } from "./demos/SortableHeaderDemo";
import { TabButtonDemo } from "./demos/TabButtonDemo";
import { TabsDemo } from "./demos/TabsDemo";
import { SectionDemo } from "./demos/SectionDemo";
import { PanelDemo } from "./demos/PanelDemo";
import { AppShellDemo } from "./demos/AppShellDemo";
import { SplitPaneDemo } from "./demos/SplitPaneDemo";
import { TreeDemo } from "./demos/TreeDemo";
import { TreeGroupHeaderDemo } from "./demos/TreeGroupHeaderDemo";
import { HoverCardDemo } from "./demos/HoverCardDemo";
import { ModalDemo } from "./demos/ModalDemo";
import { DropdownMenuDemo } from "./demos/DropdownMenuDemo";
import { DiagnosticsDemo } from "./demos/DiagnosticsDemo";
import { StackTraceDemo } from "./demos/StackTraceDemo";
import { HarPanelDemo } from "./demos/HarPanelDemo";
import { CommandFormDemo } from "./demos/CommandFormDemo";
import { OperationDialogsDemo } from "./demos/OperationDialogsDemo";
import { OperationExplorerDemo } from "./demos/OperationExplorerDemo";
import {
  type StaticIconComponent,
  UiToggleOn, UiSelect, UiSparkles, UiImage,
  UiTag, UiUserCircle, UiLoader, UiTrendUp, UiFileCode, UiJson, UiTerminal,
  UiListFlat, UiTable, UiListDashes, UiMarkdown,
  UiFilter, UiFunnelData, UiCalendar, UiArrowDown, UiPulse, UiChartBar,
  UiLayoutDashboard, UiSquare, UiKanban, UiRows, UiColumns, UiListTree,
  UiComment, UiDotsVertical, UiBug, UiNetwork, UiForm, UiCommand,
} from "@flanksource/clicky-ui";

export type DemoEntry = {
  id: string;
  label: string;
  component: ComponentType;
  icon?: StaticIconComponent;
};

export type DemoGroup = {
  title: string;
  items: DemoEntry[];
};

export const DEMO_GROUPS: DemoGroup[] = [
  {
    title: "Foundations",
    items: [
      { id: "switchers", label: "Switchers", component: SwitchersDemo, icon: UiToggleOn },
      { id: "button", label: "Button", component: ButtonDemo, icon: UiSelect },
      { id: "icon", label: "Icon", component: IconDemo, icon: UiSparkles },
      { id: "generated-icons", label: "Generated Icons", component: GeneratedIconsDemo, icon: UiImage },
    ],
  },
  {
    title: "Display",
    items: [
      { id: "badge", label: "Badge", component: BadgeDemo, icon: UiTag },
      { id: "avatar", label: "Avatar", component: AvatarDemo, icon: UiUserCircle },
      { id: "progress", label: "ProgressBar", component: ProgressBarDemo, icon: UiLoader },
      { id: "signed-delta-bar", label: "SignedDeltaBar", component: SignedDeltaBarDemo, icon: UiTrendUp },
      { id: "clicky", label: "Clicky", component: ClickyDemo, icon: UiSparkles },
      { id: "clicky-native", label: "Clicky Native", component: ClickyNativeDemo, icon: UiSparkles },
      { id: "code-blocks", label: "CodeBlocks", component: CodeBlocksDemo, icon: UiFileCode },
      { id: "json-view", label: "JsonView", component: JsonViewDemo, icon: UiJson },
      { id: "ansi-html", label: "AnsiHtml", component: AnsiHtmlDemo, icon: UiTerminal },
      { id: "log-viewer", label: "LogViewer", component: LogViewerDemo, icon: UiListFlat },
      { id: "logs-table", label: "LogsTable", component: LogsTableDemo, icon: UiTable },
      { id: "properties", label: "Properties", component: PropertiesDemo, icon: UiListDashes },
      { id: "markdown", label: "Markdown", component: MarkdownDemo, icon: UiMarkdown },
    ],
  },
  {
    title: "Controls",
    items: [
      { id: "filter-bar", label: "FilterBar / MultiSelect", component: FilterBarDemo, icon: UiFilter },
      { id: "filter-pill", label: "FilterPill", component: FilterPillDemo, icon: UiFunnelData },
      { id: "time-range", label: "TimeRange / DateField", component: TimeRangeDemo, icon: UiCalendar },
      { id: "sortable", label: "SortableHeader", component: SortableHeaderDemo, icon: UiArrowDown },
      { id: "data-table", label: "DataTable", component: DataTableDemo, icon: UiTable },
      { id: "trace-logs", label: "Trace logs", component: TraceLogsDemo, icon: UiPulse },
      { id: "tab-gauge", label: "Tabs & Gauges", component: TabButtonDemo, icon: UiChartBar },
    ],
  },
  {
    title: "Layout",
    items: [
      { id: "app-shell", label: "AppShell", component: AppShellDemo, icon: UiLayoutDashboard },
      { id: "panel", label: "Panel", component: PanelDemo, icon: UiSquare },
      { id: "tabs", label: "Tabs", component: TabsDemo, icon: UiKanban },
      { id: "section", label: "Section", component: SectionDemo, icon: UiRows },
      { id: "split-pane", label: "SplitPane", component: SplitPaneDemo, icon: UiColumns },
      { id: "tree", label: "Tree", component: TreeDemo, icon: UiListTree },
      { id: "tree-group", label: "TreeGroupHeader", component: TreeGroupHeaderDemo, icon: UiListTree },
    ],
  },
  {
    title: "Overlay",
    items: [
      { id: "hover-card", label: "HoverCard", component: HoverCardDemo, icon: UiComment },
      { id: "modal", label: "Modal", component: ModalDemo, icon: UiSquare },
      { id: "dropdown-menu", label: "DropdownMenu", component: DropdownMenuDemo, icon: UiDotsVertical },
    ],
  },
  {
    title: "Diagnostics",
    items: [
      { id: "diagnostics", label: "Process & Stack", component: DiagnosticsDemo, icon: UiBug },
      { id: "stacktrace", label: "StackTrace", component: StackTraceDemo, icon: UiBug },
      { id: "har-panel", label: "HarPanel", component: HarPanelDemo, icon: UiNetwork },
    ],
  },
  {
    title: "Clicky-RPC",
    items: [
      { id: "command-form", label: "CommandForm", component: CommandFormDemo, icon: UiForm },
      { id: "operation-dialogs", label: "OperationDialogs", component: OperationDialogsDemo, icon: UiCommand },
      {
        id: "operation-explorer",
        label: "OperationCatalog",
        component: OperationExplorerDemo,
        icon: UiTerminal,
      },
    ],
  },
];

export const DEFAULT_DEMO_ID = DEMO_GROUPS[0]?.items[0]?.id ?? "switchers";

export const DEMO_ENTRIES = DEMO_GROUPS.flatMap((group) => group.items);

export function findDemoEntry(id: string | null | undefined) {
  if (!id) return undefined;
  return DEMO_ENTRIES.find((item) => item.id === id);
}

export function findDemoGroup(id: string | null | undefined) {
  if (!id) return undefined;
  return DEMO_GROUPS.find((group) => group.items.some((item) => item.id === id));
}
