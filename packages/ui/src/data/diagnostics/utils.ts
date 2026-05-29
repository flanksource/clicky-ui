import type { StaticIconComponent } from "../Icon";
import {
  UiCircleFilled,
  UiPause,
  UiDebugStepOver,
  UiError,
  UiPlayCircle,
  UiWatch,
} from "@flanksource/icons/ui";
import type { ProcessNode } from "./types";

export function countProcesses(node?: ProcessNode): number {
  if (!node) return 0;
  return (
    1 +
    (node.children || []).reduce((sum, child) => sum + countProcesses(child), 0)
  );
}

export function findProcessByPID(
  node: ProcessNode | undefined,
  pid: number,
): ProcessNode | null {
  if (!node) return null;
  if (node.pid === pid) return node;
  for (const child of node.children || []) {
    const found = findProcessByPID(child, pid);
    if (found) return found;
  }
  return null;
}

export function processStateIcon(status?: string): StaticIconComponent {
  const value = (status || "").toLowerCase();
  if (value.includes("run")) return UiPlayCircle;
  if (value.includes("sleep") || value.includes("idle")) return UiWatch;
  if (value.includes("stop") || value.includes("halt")) return UiPause;
  if (value.includes("zombie") || value.includes("dead")) return UiError;
  if (value.includes("wait") || value.includes("block")) return UiDebugStepOver;
  return UiCircleFilled;
}

export function processStateColor(status?: string): string {
  const value = (status || "").toLowerCase();
  if (value.includes("run")) return "text-green-600";
  if (value.includes("sleep") || value.includes("idle"))
    return "text-amber-500";
  if (value.includes("stop") || value.includes("halt"))
    return "text-orange-600";
  if (value.includes("zombie") || value.includes("dead")) return "text-red-600";
  if (value.includes("wait") || value.includes("block")) return "text-blue-600";
  return "text-muted-foreground";
}

export function formatBytes(value?: number): string {
  if (!value || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size >= 10 || unit === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

export function processLabel(node: ProcessNode): string {
  if (node.name) return node.name;
  if (node.command) {
    const [first] = node.command.split(/\s+/, 1);
    return first || `pid ${node.pid}`;
  }
  return `pid ${node.pid}`;
}
