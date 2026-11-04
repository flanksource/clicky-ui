import { describe, expect, it } from "vitest";
import { UiFileCode } from "@flanksource/clicky-ui/icons";

import { buildRecentSection } from "./recent-navigation";
import type { PageActivity } from "./sidebar-activity";
import { RECENT_WINDOW } from "./sidebar-visibility";

const DAY = 24 * 60 * 60 * 1000;
const now = Date.now();

function activity(partial: Partial<PageActivity>): PageActivity {
  return { updated: 0, commented: 0, resolved: 0, openCount: 0, resolvedCount: 0, ...partial };
}

const entries = ["fresh", "commented", "stale", "never"].map((slug) => ({ slug, title: slug, icon: UiFileCode }));
const activityMap = new Map<string, PageActivity>([
  ["fresh", activity({ updated: now - DAY })],
  ["commented", activity({ commented: now - 2 * DAY })],
  ["stale", activity({ updated: now - RECENT_WINDOW - DAY })],
]);

const section = buildRecentSection({
  entries,
  activity: activityMap,
  query: "",
  filters: [],
  pageHref: (slug) => `?page=${slug}`,
  loading: false,
});

describe("buildRecentSection", () => {
  it("lists only pages whose source or feedback activity is inside the recent window", () => {
    expect(section.items?.map((item) => item.key)).toEqual(["recent:fresh", "recent:commented"]);
  });

  it("never marks a row active, leaving the single highlight to the Pages section", () => {
    expect(section.items?.map((item) => item.active ?? false)).toEqual([false, false]);
  });
});
