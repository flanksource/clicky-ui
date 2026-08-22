import { describe, expect, it } from "vitest";

import { foldersFromSlugs, joinPageSlug, pageFilename, pageFolder } from "./page-management-model";

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
