import { useEffect, useState } from "react";
import updatedAtBuild from "virtual:playground-page-activity";
import { assertFeedbackActivity, type FeedbackActivity } from "../plugins/comment-activity";
import { LIVE_SERVER } from "./live-server";

export type SidebarSort = "none" | "updated" | "commented" | "resolved";
export type SidebarFilter = "open" | "resolved";
export type PageActivity = { updated: number; commented: number; resolved: number; openCount: number; resolvedCount: number; waitingOn?: string[] };

function timestamp(value: string): number {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) throw new Error(`Invalid sidebar activity timestamp: ${value}`);
  return time;
}

export function matchesActivity(activity: PageActivity | undefined, filters: SidebarFilter[]): boolean {
  return !filters.length || filters.some((filter) => filter === "open" ? Boolean(activity?.openCount) : Boolean(activity?.resolvedCount));
}

export function usePageActivity() {
  const [updates, setUpdates] = useState(updatedAtBuild);
  const [feedback, setFeedback] = useState<Record<string, FeedbackActivity>>({});
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [updatesError, setUpdatesError] = useState<string | null>(null);
  const [updatesReady, setUpdatesReady] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    let sequence = 0;
    const applied = { comments: 0, updates: 0 };
    const message = (cause: unknown) => cause instanceof Error ? cause.message : String(cause);
    // A response is applied only if no newer request for the same stream has already been applied.
    const settle = (stream: keyof typeof applied, request: number, apply: () => void) => {
      if (signal.aborted || request < applied[stream]) return;
      applied[stream] = request;
      apply();
    };
    const refreshComments = async (request: number) => {
      try {
        const summary = await fetch("/__playground/comments/activity", { signal });
        if (!summary.ok) throw new Error(`Comment activity failed (${summary.status})`);
        const payload = await summary.json() as { pages: unknown };
        assertFeedbackActivity(payload.pages);
        const next = payload.pages;
        settle("comments", request, () => { setFeedback((previous) => JSON.stringify(previous) === JSON.stringify(next) ? previous : next); setCommentsError(null); });
      } catch (cause) {
        settle("comments", request, () => setCommentsError(message(cause)));
      }
    };
    const refreshUpdates = async (request: number) => {
      if (!LIVE_SERVER) { settle("updates", request, () => { setUpdatesError(null); setUpdatesReady(true); }); return; }
      try {
        const response = await fetch("/__playground/page-activity", { signal });
        const data = await response.json() as { updated: Record<string, string>; error?: string };
        if (!response.ok) throw new Error(data.error ?? `Page activity failed (${response.status})`);
        if (!data.updated || typeof data.updated !== "object" || Array.isArray(data.updated) || Object.values(data.updated).some((date) => typeof date !== "string" || !Number.isFinite(Date.parse(date)))) throw new Error("Invalid page update timestamps");
        settle("updates", request, () => { setUpdates((previous) => JSON.stringify(previous) === JSON.stringify(data.updated) ? previous : data.updated); setUpdatesError(null); setUpdatesReady(true); });
      } catch (cause) {
        settle("updates", request, () => setUpdatesError(message(cause)));
      }
    };
    const refresh = async () => {
      const request = ++sequence;
      await Promise.all([refreshComments(request), refreshUpdates(request)]);
      if (!signal.aborted) setLoading(false);
    };
    const onRefresh = () => { void refresh(); };
    onRefresh();
    const timer = window.setInterval(() => { if (document.visibilityState === "visible") onRefresh(); }, 5000);
    window.addEventListener("focus", onRefresh);
    window.addEventListener("playground-feedback-updated", onRefresh);
    return () => { controller.abort(); window.clearInterval(timer); window.removeEventListener("focus", onRefresh); window.removeEventListener("playground-feedback-updated", onRefresh); };
  }, []);
  return { updates, feedback, loading, commentsError, updatesError, updatesReady };
}

export function mergeActivity(feedback: Record<string, FeedbackActivity>, updates: Record<string, string>): Map<string, PageActivity> {
  const result = new Map<string, PageActivity>(Object.entries(feedback));
  for (const [slug, date] of Object.entries(updates)) {
    result.set(slug, { ...(result.get(slug) ?? { commented: 0, resolved: 0, openCount: 0, resolvedCount: 0 }), updated: timestamp(date) });
  }
  return result;
}
