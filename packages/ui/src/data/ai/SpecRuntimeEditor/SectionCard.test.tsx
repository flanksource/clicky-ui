// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SPEC_RUNTIME_SECTIONS } from "./types";
import { SectionCard } from "./SectionCard";

describe("SectionCard", () => {
  it("toggles when the section hint is clicked", () => {
    const meta = SPEC_RUNTIME_SECTIONS[0];
    if (!meta) throw new Error("runtime editor requires a model section");

    render(
      <SectionCard
        meta={meta}
        number="01"
        domId="model"
        sectionRef={() => {}}
        defaultCollapsed
      >
        <div>Model settings</div>
      </SectionCard>,
    );

    expect(screen.queryByText("Model settings")).toBeNull();
    fireEvent.click(screen.getByText(meta.hint));
    expect(screen.getByText("Model settings")).toBeInTheDocument();
  });
});
