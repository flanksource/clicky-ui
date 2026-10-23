import { describe, expect, it } from "vitest";

import { PAGE_SLUG_PATTERN } from "../../plugins/pages-store";
import {
  EXTERNAL_PAGES_ROOT,
  UNASSIGNED,
  commentPageTreePath,
  filterDashboardComments,
} from "./dashboard-model";
import type { DashboardState } from "./dashboard-state";
import type { PageComment } from "./useComments";

const claude = { name: "Claude", kind: "agent" as const };
const bo = { name: "Bo", kind: "user" as const };

function comment(
  id: string,
  overrides: Partial<PageComment> = {},
): PageComment {
  return {
    id,
    body: `note ${id}`,
    createdAt: "2026-10-18T09:00:00.000Z",
    author: { name: "You", kind: "user" },
    page: "demo/page",
    status: "open",
    ...overrides,
  };
}

const state = (overrides: Partial<DashboardState> = {}): DashboardState => ({
  status: "all",
  projects: {},
  pages: {},
  author: "",
  assignee: "",
  screenshots: "all",
  query: "",
  sort: null,
  ...overrides,
});

const ids = (comments: PageComment[], selection: DashboardState) =>
  filterDashboardComments(comments, selection).map((entry) => entry.id);

describe("filterDashboardComments", () => {
  const comments = [
    comment("open"),
    comment("held-by-agent", { status: "in_progress", assignee: claude }),
    comment("held-by-user", { status: "in_progress", assignee: bo }),
    comment("resolved", { status: "resolved", assignee: claude }),
    comment("closed", { status: "closed" }),
    comment("reply", { parentId: "open" }),
  ];

  it("treats open and in-progress roots as unresolved, and drops replies", () => {
    expect(ids(comments, state({ status: "unresolved" }))).toEqual([
      "open",
      "held-by-agent",
      "held-by-user",
    ]);
  });

  it.each([
    ["one assignee", "Claude", ["held-by-agent", "resolved"]],
    ["another assignee", "Bo", ["held-by-user"]],
    ["nobody", UNASSIGNED, ["open", "closed"]],
    ["no assignee filter", "", ["open", "held-by-agent", "held-by-user", "resolved", "closed"]],
  ])("filters roots by %s", (_label, assignee, expected) => {
    expect(ids(comments, state({ assignee }))).toEqual(expected);
  });

  it("combines the assignee with the status filter", () => {
    expect(
      ids(comments, state({ status: "unresolved", assignee: "Claude" })),
    ).toEqual(["held-by-agent"]);
  });

  it("matches the assignee name in the text search", () => {
    expect(ids(comments, state({ query: "claude" }))).toEqual([
      "held-by-agent",
      "resolved",
    ]);
  });
});

describe("page tree selection", () => {
  const externalId = "external:0b8e3c1a-2f4d-4c1e-9a77-5d3f2a1b6c90";
  const pageComments = [
    comment("fs-root", { page: "flanksource/overview" }),
    comment("fs-merivio", { page: "flanksource/merivio/approval-evidence" }),
    comment("fs-merivio-deep", { page: "flanksource/merivio/audit/log" }),
    comment("fs-merivio-sibling", { page: "flanksource/merivio-extras" }),
    comment("demo", { page: "demo/page" }),
    comment("external", { page: externalId }),
  ];
  const pagesIds = (pages: DashboardState["pages"], projects = {}) =>
    ids(pageComments, state({ pages, projects }));

  it("maps real slugs to their own path and external pages under the synthetic root", () => {
    expect(commentPageTreePath("flanksource/overview")).toBe(
      "flanksource/overview",
    );
    expect(commentPageTreePath(externalId)).toBe(
      `${EXTERNAL_PAGES_ROOT}/${externalId}`,
    );
  });

  it("keeps the synthetic root out of the set of valid page slugs", () => {
    expect(EXTERNAL_PAGES_ROOT).not.toMatch(PAGE_SLUG_PATTERN);
  });

  it("includes every page beneath a selected folder", () => {
    expect(pagesIds({ flanksource: "include" })).toEqual([
      "fs-root",
      "fs-merivio",
      "fs-merivio-deep",
      "fs-merivio-sibling",
    ]);
  });

  it("carves an excluded subfolder out of an included folder", () => {
    expect(
      pagesIds({ flanksource: "include", "flanksource/merivio": "exclude" }),
    ).toEqual(["fs-root", "fs-merivio-sibling"]);
  });

  it("matches whole path segments, so a folder key never selects a longer sibling name", () => {
    expect(pagesIds({ "flanksource/merivio": "include" })).toEqual([
      "fs-merivio",
      "fs-merivio-deep",
    ]);
  });

  it("excludes a folder while keeping everything else when nothing is included", () => {
    expect(pagesIds({ flanksource: "exclude" })).toEqual(["demo", "external"]);
  });

  it("includes every external page through the synthetic root", () => {
    expect(pagesIds({ [EXTERNAL_PAGES_ROOT]: "include" })).toEqual(["external"]);
  });

  it("excludes every external page through the synthetic root", () => {
    expect(pagesIds({ [EXTERNAL_PAGES_ROOT]: "exclude" })).toEqual([
      "fs-root",
      "fs-merivio",
      "fs-merivio-deep",
      "fs-merivio-sibling",
      "demo",
    ]);
  });

  it("selects one external page by its tree key", () => {
    expect(
      pagesIds({ [commentPageTreePath(externalId)]: "include" }),
    ).toEqual(["external"]);
  });

  it("matches nothing for an included key that is not in any page, and everything for an excluded one", () => {
    expect(pagesIds({ "retired/folder": "include" })).toEqual([]);
    expect(pagesIds({ "retired/folder": "exclude" })).toEqual(
      pageComments.map((entry) => entry.id),
    );
  });

  it("requires both the project and the page tree to match", () => {
    expect(
      pagesIds({ flanksource: "include" }, { "flanksource": "exclude" }),
    ).toEqual([]);
    expect(
      pagesIds(
        { "flanksource/merivio": "include" },
        { __external__: "exclude" },
      ),
    ).toEqual(["fs-merivio", "fs-merivio-deep"]);
    expect(pagesIds({}, { __external__: "include" })).toEqual(["external"]);
  });
});
