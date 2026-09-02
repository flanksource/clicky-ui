import { describe, expect, it } from "vitest";

import {
  foldersFromSlugs,
  joinPageSlug,
  pageFilename,
  pageFolder,
  plannedPageMove,
} from "./page-management-model";

describe("page management paths", () => {
  it("derives every non-empty folder from registered page slugs", () => {
    expect(
      foldersFromSlugs([
        "welcome",
        "flanksource/foundations/colors",
        "flanksource/patterns/collections",
      ]),
    ).toEqual(["flanksource", "flanksource/foundations", "flanksource/patterns"]);
  });

  it("splits and rejoins page slugs", () => {
    expect(pageFolder("designs/drafts/review")).toBe("designs/drafts");
    expect(pageFilename("designs/drafts/review")).toBe("review");
    expect(joinPageSlug("designs/drafts", "review")).toBe("designs/drafts/review");
    expect(joinPageSlug("", "welcome")).toBe("welcome");
  });
});

describe("page moves planned from a nav drop", () => {
  it("keeps the filename and takes the folder from the row dropped on", () => {
    expect(
      plannedPageMove("designs/review", { key: "flanksource", kind: "group" }),
    ).toBe("flanksource/review");
    expect(
      plannedPageMove("designs/review", {
        key: "flanksource/foundations",
        kind: "group",
      }),
    ).toBe("flanksource/foundations/review");
  });

  it("moves a page to the root when dropped on the section", () => {
    expect(plannedPageMove("designs/review", { key: "", kind: "section" })).toBe(
      "review",
    );
  });

  // Dropping on a page means "next to it", which is what makes the root
  // reachable without aiming at the section heading.
  it("lands beside the page it was dropped on", () => {
    expect(
      plannedPageMove("designs/review", { key: "welcome", kind: "item" }),
    ).toBe("review");
    expect(
      plannedPageMove("welcome", { key: "designs/notes", kind: "item" }),
    ).toBe("designs/welcome");
  });

  // Each of these would be a no-op, so the drop has to be refused rather than
  // making a pointless round trip through the sources endpoint.
  it("refuses drops that are not moves", () => {
    // Its own folder-and-leaf row: `review` is both a page and a folder.
    expect(plannedPageMove("review", { key: "review", kind: "group" })).toBe(
      null,
    );
    // Already in that folder.
    expect(
      plannedPageMove("designs/review", { key: "designs", kind: "group" }),
    ).toBe(null);
    // Already beside that page.
    expect(
      plannedPageMove("designs/review", { key: "designs/notes", kind: "item" }),
    ).toBe(null);
    // Already at the root.
    expect(plannedPageMove("review", { key: "", kind: "section" })).toBe(null);
  });
});
