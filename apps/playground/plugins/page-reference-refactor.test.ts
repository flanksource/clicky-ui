import { describe, expect, it } from "vitest";

import { planPageReferenceUpdates } from "./page-reference-refactor";

const SOURCE_ROOT = "/workspace/apps/playground/src";
const OLD_FILE = `${SOURCE_ROOT}/pages/access-review-decisions.tsx`;
const NEW_FILE = `${SOURCE_ROOT}/pages/trust/access-review-decisions.tsx`;

describe("page reference refactoring", () => {
  it("preserves import targets and updates incoming references when a page moves", () => {
    const plan = planPageReferenceUpdates({
      sources: [
        {
          file: OLD_FILE,
          source: [
            'import { DesignSystemPage } from "../design-system/DesignSystemPage";',
            'import { fixture } from "./_access-review-decisions/fixture";',
            'export { LiveForm } from "./_access-review-decisions/live";',
            'const mockups = import("./_access-review-decisions/mockups");',
            'const fixtureUrl = new URL("./fixtures/access.json", import.meta.url);',
            'const self = "?page=access-review-decisions";',
          ].join("\n"),
        },
        {
          file: `${SOURCE_ROOT}/review/review-page.tsx`,
          source: [
            'import AccessReview from "../pages/access-review-decisions";',
            'type AccessReviewModule = typeof import("../pages/access-review-decisions");',
            'const reviewHref = "?page=access-review-decisions";',
          ].join("\n"),
        },
        {
          file: `${SOURCE_ROOT}/unrelated.ts`,
          source: 'import { Button } from "@flanksource/clicky-ui";',
        },
      ],
      oldFile: OLD_FILE,
      newFile: NEW_FILE,
      oldSlug: "access-review-decisions",
      newSlug: "trust/access-review-decisions",
    });

    expect(plan).toEqual({
      movedSource: [
        'import { DesignSystemPage } from "../../design-system/DesignSystemPage";',
        'import { fixture } from "../_access-review-decisions/fixture";',
        'export { LiveForm } from "../_access-review-decisions/live";',
        'const mockups = import("../_access-review-decisions/mockups");',
        'const fixtureUrl = new URL("../fixtures/access.json", import.meta.url);',
        'const self = "?page=trust/access-review-decisions";',
      ].join("\n"),
      edits: [
        {
          file: `${SOURCE_ROOT}/review/review-page.tsx`,
          source: [
            'import AccessReview from "../pages/access-review-decisions";',
            'type AccessReviewModule = typeof import("../pages/access-review-decisions");',
            'const reviewHref = "?page=access-review-decisions";',
          ].join("\n"),
          nextSource: [
            'import AccessReview from "../pages/trust/access-review-decisions";',
            'type AccessReviewModule = typeof import("../pages/trust/access-review-decisions");',
            'const reviewHref = "?page=trust/access-review-decisions";',
          ].join("\n"),
          updatedReferences: 3,
        },
      ],
      updatedReferences: 9,
    });
  });

  it("rewrites encoded links and explicit route values without changing prose", () => {
    const source = [
      'const encoded = "?page=drafts%2Freview&mode=compare";',
      'const route = { page: "drafts/review" };',
      'onNavigate("drafts/review");',
      'const prose = "drafts/review";',
    ].join("\n");
    const file = `${SOURCE_ROOT}/pages/drafts/review.tsx`;

    expect(
      planPageReferenceUpdates({
        sources: [{ file, source }],
        oldFile: file,
        newFile: `${SOURCE_ROOT}/pages/approved/review.tsx`,
        oldSlug: "drafts/review",
        newSlug: "approved/review",
      }).movedSource,
    ).toBe(
      [
        'const encoded = "?page=approved%2Freview&mode=compare";',
        'const route = { page: "approved/review" };',
        'onNavigate("approved/review");',
        'const prose = "drafts/review";',
      ].join("\n"),
    );
  });

  it("parses JavaScript and JSX sources with their native syntax", () => {
    const file = `${SOURCE_ROOT}/pages/drafts/review.jsx`;
    const source = [
      'import { Card } from "../../components/Card.js";',
      'export const Review = () => <Card href="?page=drafts/review" />;',
    ].join("\n");

    expect(
      planPageReferenceUpdates({
        sources: [{ file, source }],
        oldFile: file,
        newFile: `${SOURCE_ROOT}/pages/approved/review.jsx`,
        oldSlug: "drafts/review",
        newSlug: "approved/review",
      }).movedSource,
    ).toBe(
      [
        'import { Card } from "../../components/Card.js";',
        'export const Review = () => <Card href="?page=approved/review" />;',
      ].join("\n"),
    );
  });
});
