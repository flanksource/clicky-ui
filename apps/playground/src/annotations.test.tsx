// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AnnotationVisibilityProvider } from "./annotations";
import { AnnotatedSpecimen } from "./design-system/practice/AnnotatedSpecimen";
import { PracticeGrid } from "./design-system/practice/PracticeGrid";
import { VariantFrame } from "./pages/_shared/variant-frame";
import { BestPractice, ReviewVariant } from "./review/ReviewComponents";

describe("hidden playground annotations", () => {
  afterEach(cleanup);

  it("removes pure guidance while retaining specimens and identifying titles", () => {
    render(
      <AnnotationVisibilityProvider value="hidden">
        <PracticeGrid practices={[{ title: "Do this", body: "A practice" }]} />
        <AnnotatedSpecimen
          label="Notes"
          notes={[{ id: "target", title: "Pinned note", body: "Annotation body" }]}
        >
          <div>Annotated specimen</div>
        </AnnotatedSpecimen>
        <VariantFrame title="Compact" verdict="Annotation verdict" width={640} selected>
          <div>Variant specimen</div>
        </VariantFrame>
        <BestPractice id="best" title="Best practice" description="Review guidance" />
        <ReviewVariant
          id="review"
          title="Review option"
          verdict="Review verdict"
          selected
          onDiscard={vi.fn()}
        >
          <div>Review specimen</div>
        </ReviewVariant>
      </AnnotationVisibilityProvider>,
    );

    expect(screen.queryByText("Do this")).toBeNull();
    expect(screen.queryByText("Pinned note")).toBeNull();
    expect(screen.queryByText("Annotation verdict")).toBeNull();
    expect(screen.queryByText("Best practice")).toBeNull();
    expect(screen.queryByText("Review verdict")).toBeNull();
    expect(screen.queryByRole("button", { name: "Discard Review option" })).toBeNull();
    expect(screen.getByText("Annotated specimen")).not.toBeNull();
    expect(screen.getByText("Compact")).not.toBeNull();
    expect(screen.getByText("Variant specimen")).not.toBeNull();
    expect(screen.getByText("Review option")).not.toBeNull();
    expect(screen.getByText("Review specimen")).not.toBeNull();
  });
});
