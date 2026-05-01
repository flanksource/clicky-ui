import type { ComponentType } from "react";
import { SwitchersDemo } from "./demos/SwitchersDemo";
import { ButtonDemo } from "./demos/ButtonDemo";
import { IconDemo } from "./demos/IconDemo";
import { BadgeDemo } from "./demos/BadgeDemo";
import { AvatarDemo } from "./demos/AvatarDemo";
import { ProgressBarDemo } from "./demos/ProgressBarDemo";
import { JsonViewDemo } from "./demos/JsonViewDemo";
import { AnsiHtmlDemo } from "./demos/AnsiHtmlDemo";
import { ClickyDemo } from "./demos/ClickyDemo";
import { CodeBlocksDemo } from "./demos/CodeBlocksDemo";
import { LogViewerDemo } from "./demos/LogViewerDemo";
import { MarkdownDemo } from "./demos/MarkdownDemo";
import { FilterBarDemo } from "./demos/FilterBarDemo";
import { FilterPillDemo } from "./demos/FilterPillDemo";
import { DataTableDemo } from "./demos/DataTableDemo";
import { SortableHeaderDemo } from "./demos/SortableHeaderDemo";
import { TabButtonDemo } from "./demos/TabButtonDemo";
import { SectionDemo } from "./demos/SectionDemo";
import { SplitPaneDemo } from "./demos/SplitPaneDemo";
import { TreeDemo } from "./demos/TreeDemo";
import { TreeGroupHeaderDemo } from "./demos/TreeGroupHeaderDemo";
import { HoverCardDemo } from "./demos/HoverCardDemo";
import { ModalDemo } from "./demos/ModalDemo";
import { DiagnosticsDemo } from "./demos/DiagnosticsDemo";
import { StackTraceDemo } from "./demos/StackTraceDemo";
import { HarPanelDemo } from "./demos/HarPanelDemo";
import { ApiExplorerDemo } from "./demos/ApiExplorerDemo";
import { CommandFormDemo } from "./demos/CommandFormDemo";
import { OperationDialogsDemo } from "./demos/OperationDialogsDemo";

export type DemoEntry = {
  id: string;
  label: string;
  component: ComponentType;
};

export type DemoGroup = {
  title: string;
  items: DemoEntry[];
};

export const DEMO_GROUPS: DemoGroup[] = [
  {
    title: "Foundations",
    items: [
      { id: "switchers", label: "Switchers", component: SwitchersDemo },
      { id: "button", label: "Button", component: ButtonDemo },
      { id: "icon", label: "Icon", component: IconDemo },
    ],
  },
  {
    title: "Display",
    items: [
      { id: "badge", label: "Badge", component: BadgeDemo },
      { id: "avatar", label: "Avatar", component: AvatarDemo },
      { id: "progress", label: "ProgressBar", component: ProgressBarDemo },
      { id: "clicky", label: "Clicky", component: ClickyDemo },
      { id: "code-blocks", label: "CodeBlocks", component: CodeBlocksDemo },
      { id: "json-view", label: "JsonView", component: JsonViewDemo },
      { id: "ansi-html", label: "AnsiHtml", component: AnsiHtmlDemo },
      { id: "log-viewer", label: "LogViewer", component: LogViewerDemo },
      { id: "markdown", label: "Markdown", component: MarkdownDemo },
    ],
  },
  {
    title: "Controls",
    items: [
      { id: "filter-bar", label: "FilterBar / MultiSelect", component: FilterBarDemo },
      { id: "filter-pill", label: "FilterPill", component: FilterPillDemo },
      { id: "sortable", label: "SortableHeader", component: SortableHeaderDemo },
      { id: "data-table", label: "DataTable", component: DataTableDemo },
      { id: "tab-gauge", label: "Tabs & Gauges", component: TabButtonDemo },
    ],
  },
  {
    title: "Layout",
    items: [
      { id: "section", label: "Section", component: SectionDemo },
      { id: "split-pane", label: "SplitPane", component: SplitPaneDemo },
      { id: "tree", label: "Tree", component: TreeDemo },
      { id: "tree-group", label: "TreeGroupHeader", component: TreeGroupHeaderDemo },
    ],
  },
  {
    title: "Overlay",
    items: [
      { id: "hover-card", label: "HoverCard", component: HoverCardDemo },
      { id: "modal", label: "Modal", component: ModalDemo },
    ],
  },
  {
    title: "Diagnostics",
    items: [
      { id: "diagnostics", label: "Process & Stack", component: DiagnosticsDemo },
      { id: "stacktrace", label: "StackTrace", component: StackTraceDemo },
      { id: "har-panel", label: "HarPanel", component: HarPanelDemo },
    ],
  },
  {
    title: "Clicky-RPC",
    items: [
      { id: "command-form", label: "CommandForm", component: CommandFormDemo },
      { id: "operation-dialogs", label: "OperationDialogs", component: OperationDialogsDemo },
      { id: "api-explorer", label: "ApiExplorer", component: ApiExplorerDemo },
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
