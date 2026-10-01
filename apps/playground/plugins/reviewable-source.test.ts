import { describe, expect, it } from "vitest";

import {
  deleteReviewableSource,
  markReviewableSource,
} from "./reviewable-source";

describe("reviewable source edits", () => {
  it("marks and removes one static JSX element", () => {
    const source = `export default function Page() { return <main><section id="first">One</section><section id="second">Two</section></main>; }`;
    const marked = markReviewableSource(source, {
      domId: "first",
      reviewId: "review-first",
    });

    expect(marked).toContain('id="first" data-review-id="review-first"');
    expect(deleteReviewableSource(marked, "review-first")).toContain(
      '<section id="second">Two</section>',
    );
    expect(deleteReviewableSource(marked, "review-first")).not.toContain("One");
  });

  it("marks and removes only the selected row of a literal mapped array", () => {
    const source = `const VARIANTS = [{ id: "first", title: "One" }, { id: "second", title: "Two" }] as const;
export default function Page() { return <main>{VARIANTS.map((variant) => <section key={variant.id} id={variant.id}>{variant.title}</section>)}</main>; }`;
    const marked = markReviewableSource(source, {
      domId: "first",
      reviewId: "review-first",
    });

    expect(marked).toContain('reviewId: "review-first"');
    expect(marked).toContain("data-review-id={variant.reviewId}");
    const deleted = deleteReviewableSource(marked, "review-first");
    expect(deleted).not.toContain('id: "first"');
    expect(deleted).toContain('id: "second"');
  });

  it("uses the mapper variable and only the owning literal array", () => {
    const source = `const CARDS = [{ id: "first" }, { id: "second" }] as const;
export default function Page() { return <main>{CARDS.map((card) => <section key={card.id} id={card.id}>{card.id}</section>)}</main>; }`;
    const marked = markReviewableSource(source, {
      domId: "second",
      reviewId: "review-second",
    });

    expect(marked).toContain("data-review-id={card.reviewId}");
    expect(marked).toContain('reviewId: "review-second"');
  });

  it("locates a JSX element by source position when its DOM id is computed", () => {
    const source = `export default function Page() {
  const id = "computed";
  return <main>
    <section id={id}>Review me</section>
  </main>;
}`;
    const marked = markReviewableSource(source, {
      domId: "computed",
      line: 4,
      column: 5,
      reviewId: "review-computed",
    });

    expect(marked).toContain(
      '<section id={id} data-review-id="review-computed">',
    );
  });

  it("fails on ambiguous or unidentifiable source instead of editing another element", () => {
    const ambiguous = `export default function Page() { return <main><div id="same"/><div id="same"/></main>; }`;
    expect(() =>
      markReviewableSource(ambiguous, {
        domId: "same",
        reviewId: "review-same",
      }),
    ).toThrow(/unique/i);
    expect(() =>
      deleteReviewableSource('<main><div id="x" /></main>', "missing"),
    ).toThrow(/not found/i);
    expect(() =>
      markReviewableSource('export default () => <ImportedWidget id="x" />', {
        domId: "x",
        reviewId: "review-x",
      }),
    ).toThrow(/does not forward/i);
  });
});
