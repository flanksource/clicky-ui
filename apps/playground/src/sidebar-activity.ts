import { useEffect, useState } from "react";
import updatedAtBuild from "virtual:playground-page-activity";
import { assertFeedbackActivity, type FeedbackActivity } from "../plugins/comment-activity";
import { isRecent } from "./sidebar-visibility";

export type SidebarSort = "none" | "updated" | "commented" | "resolved";
export type SidebarFilter = "open" | "resolved" | "recent";
export type PageActivity = { updated: number; commented: number; resolved: number; openCount: number; resolvedCount: number; waitingOn?: string[] };

function timestamp(value: string): number {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) throw new Error(`Invalid sidebar activity timestamp: ${value}`);
  return time;
}

export function matchesActivity(activity: PageActivity | undefined, filters: SidebarFilter[], now: number): boolean {
  const statuses = filters.filter((filter) => filter !== "recent");
  return (!statuses.length || statuses.some((status) => status === "open" ? Boolean(activity?.openCount) : Boolean(activity?.resolvedCount)))
    && (!filters.includes("recent") || isRecent(activity, now));
}

export function usePageActivity() {
  const [updates, setUpdates] = useState(updatedAtBuild);
  const [feedback, setFeedback] = useState<Record<string, FeedbackActivity>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const summary = await fetch("/__playground/comments/activity", { signal: controller.signal });
        if (!summary.ok) throw new Error(`Comment activity failed (${summary.status})`);
        const payload = await summary.json() as { pages: unknown };
        assertFeedbackActivity(payload.pages);
        const next = payload.pages;
        setFeedback((previous) => JSON.stringify(previous) === JSON.stringify(next) ? previous : next);
        if (!import.meta.env.DEV) { setError(null); return; }
        const response = await fetch("/__playground/page-activity", { signal: controller.signal });
        const data = await response.json() as { updated: Record<string, string>; error?: string };
        if (!response.ok) throw new Error(data.error ?? `Page activity failed (${response.status})`);
        if (!data.updated || typeof data.updated !== "object" || Array.isArray(data.updated) || Object.values(data.updated).some((date) => typeof date !== "string" || !Number.isFinite(Date.parse(date)))) throw new Error("Invalid page update timestamps");
        setUpdates((previous) => JSON.stringify(previous) === JSON.stringify(data.updated) ? previous : data.updated);
        setError(null);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : String(cause));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void refresh();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") void refresh(); }, 5000);
    window.addEventListener("focus", refresh);
    window.addEventListener("playground-feedback-updated", refresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", refresh); window.removeEventListener("playground-feedback-updated", refresh); };
  }, []);
  return { updates, feedback, error, loading };
}

export function mergeActivity(feedback: Record<string, FeedbackActivity>, updates: Record<string, string>): Map<string, PageActivity> {
  const result = new Map<string, PageActivity>(Object.entries(feedback));
  for (const [slug, date] of Object.entries(updates)) {
    result.set(slug, { ...(result.get(slug) ?? { commented: 0, resolved: 0, openCount: 0, resolvedCount: 0 }), updated: timestamp(date) });
  }
  return result;
}
