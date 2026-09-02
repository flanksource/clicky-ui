import { describe, expect, it, vi } from "vitest";

import {
  announcePageMove,
  filterDeletedPageModules,
  matchSourceRoute,
} from "./sources-server";

describe("matchSourceRoute", () => {
  it.each([
    ["GET", "/", false, "folders"],
    ["GET", "/", true, "read"],
    ["POST", "/", false, "create-page"],
    ["PUT", "/", true, "write"],
    ["PATCH", "/", false, "move"],
    ["DELETE", "/", true, "delete"],
    ["POST", "/folders", false, "create-folder"],
    ["DELETE", "/folders", true, "delete-folder"],
  ])("maps %s %s with target=%s to %s", (method, path, hasTarget, route) => {
    expect(matchSourceRoute(method, path, hasTarget)).toBe(route);
  });

  it.each([
    ["PUT", "/", false],
    ["DELETE", "/", false],
    // Every destructive route has to name what it acts on.
    ["DELETE", "/folders", false],
    ["GET", "/folders", false],
    ["POST", "/unknown", false],
  ])("rejects unsupported %s %s with target=%s", (method, path, hasTarget) => {
    expect(matchSourceRoute(method, path, hasTarget)).toBeUndefined();
  });
});

describe("filterDeletedPageModules", () => {
  const pagesDir = "/repo/src/pages";
  const page = { file: "/repo/src/pages/review.tsx" };
  const registry = { file: "/repo/src/registry.ts" };

  it("keeps the glob registry update but drops the deleted page module", () => {
    expect(
      filterDeletedPageModules(pagesDir, page.file, [page, registry]),
    ).toEqual([registry]);
  });

  it("leaves deletions outside the pages directory to Vite", () => {
    expect(
      filterDeletedPageModules(pagesDir, "/repo/src/App.tsx", [registry]),
    ).toBeUndefined();
  });
});

describe("announcePageMove", () => {
  it("invalidates the page glob once at the destination", () => {
    const events = {
      created: vi.fn(),
      changed: vi.fn(),
      deleted: vi.fn(),
      folderCreated: vi.fn(),
      folderDeleted: vi.fn(),
    };

    announcePageMove("/repo/src/pages", events, "review", "recon/review");

    expect(events.created).toHaveBeenCalledExactlyOnceWith(
      "/repo/src/pages/recon/review.tsx",
    );
    expect(events.deleted).not.toHaveBeenCalled();
    expect(events.changed).not.toHaveBeenCalled();
  });
});
