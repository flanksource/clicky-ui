import { useEffect, useState } from "react";
import updatedAtBuild from "virtual:playground-page-activity";
import type { PageComment } from "./comments/useComments";

export type SidebarSort = "none" | "updated" | "commented" | "resolved";
export type SidebarFilter = "open" | "resolved" | "recent";
export type PageActivity = { updated: number; commented: number; resolved: number; openCount: number; resolvedCount: number };
export const RECENT_WINDOW = 7 * 24 * 60 * 60 * 1000;

function timestamp(value: string): number {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) throw new Error(`Invalid sidebar activity timestamp: ${value}`);
  return time;
}

export function activityByPage(comments: readonly PageComment[], updates: Record<string, string>): Map<string, PageActivity> {
  const result = new Map<string, PageActivity>();
  const get = (page: string) => {
    let activity = result.get(page);
    if (!activity) {
      activity = { updated: updates[page] === undefined ? 0 : timestamp(updates[page]), commented: 0, resolved: 0, openCount: 0, resolvedCount: 0 };
      result.set(page, activity);
    }
    return activity;
  };
  for (const page of Object.keys(updates)) get(page);
  for (const comment of comments) {
    const activity = get(comment.page);
    activity.commented = Math.max(activity.commented, timestamp(comment.createdAt));
    if (comment.parentId) continue;
    if (comment.status === "open" || comment.status === "in_progress") activity.openCount++;
    if (comment.status === "resolved") {
      activity.resolvedCount++;
      activity.resolved = Math.max(activity.resolved, timestamp(comment.updatedAt ?? comment.createdAt));
    }
  }
  return result;
}

export function matchesActivity(activity: PageActivity | undefined, filters: SidebarFilter[], now: number): boolean {
  const statuses = filters.filter((filter) => filter !== "recent");
  return (!statuses.length || statuses.some((status) => status === "open" ? Boolean(activity?.openCount) : Boolean(activity?.resolvedCount)))
    && (!filters.includes("recent") || Boolean(activity?.updated && activity.updated >= now - RECENT_WINDOW));
}

export function usePageActivity() {
  const [updates, setUpdates] = useState(updatedAtBuild);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const response = await fetch("/__playground/page-activity", { signal: controller.signal });
        const data = await response.json() as { updated: Record<string, string>; error?: string };
        if (!response.ok) throw new Error(data.error ?? `Page activity failed (${response.status})`);
        if (!data.updated || typeof data.updated !== "object" || Array.isArray(data.updated) || Object.values(data.updated).some((date) => typeof date !== "string" || !Number.isFinite(Date.parse(date)))) throw new Error("Invalid page update timestamps");
        setUpdates(data.updated);
        setError(null);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : String(cause));
      }
    };
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 5000);
    window.addEventListener("focus", refresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, []);
  return { updates, error };
}
