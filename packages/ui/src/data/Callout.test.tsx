import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Callout } from "./Callout";
import { CALLOUT_TONES, CALLOUT_VARIANT_LABELS, CALLOUT_VARIANTS } from "./callout-tones";

function box(container: HTMLElement) {
  const element = container.firstElementChild;
  if (!(element instanceof HTMLElement)) throw new Error("Callout rendered nothing");
  return element;
}

describe("Callout", () => {
  it.each(CALLOUT_TONES)("labels a %s callout with its own tone name", (tone) => {
    render(<Callout variant={tone}>body</Callout>);
    expect(screen.getByText(CALLOUT_VARIANT_LABELS[tone])).toBeInTheDocument();
  });

  it("leaves an unlabelled default callout without a header row", () => {
    const { container } = render(<Callout>body</Callout>);
    expect(box(container).querySelector("span")).toBeNull();
  });

  it("gives a default callout a header row once it carries a badge", () => {
    render(<Callout badge="N14">body</Callout>);
    expect(screen.getByText("N14")).toBeInTheDocument();
  });

  it("shows the label, badge and source together on the header row", () => {
    render(
      <Callout variant="caution" badge="BCR-08" label="Gap" source="Policy Owner">
        body
      </Callout>,
    );
    for (const text of ["BCR-08", "Gap", "Policy Owner"]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
    expect(screen.queryByText(CALLOUT_VARIANT_LABELS.caution)).toBeNull();
  });

  // rehype-raw hands attributes over as strings, so a callout authored as raw
  // JSX in markdown reaches the component with `emphasis=""` or `"true"`.
  it.each([
    ["true", true],
    ["", true],
    ["false", false],
    [undefined, false],
  ])("reads emphasis=%o as the %o treatment", (emphasis, heavy) => {
    const { container } = render(
      <Callout variant="note" emphasis={emphasis}>
        body
      </Callout>,
    );
    expect(box(container).className.includes("border-2")).toBe(heavy);
  });

  it("draws no glyph for a default callout but honours an explicit icon", () => {
    const { container: plain } = render(<Callout badge="x">body</Callout>);
    expect(plain.querySelector("svg")).toBeNull();
    const { container: iconed } = render(
      <Callout badge="x" icon="warning">
        body
      </Callout>,
    );
    expect(iconed.querySelector("svg")).not.toBeNull();
  });

  it("throws on a variant outside the vocabulary rather than rendering it grey", () => {
    expect(() => render(<Callout variant={"informational" as never}>body</Callout>)).toThrow(
      `Unknown Callout variant "informational" — expected one of: ${CALLOUT_VARIANTS.join(", ")}`,
    );
  });

  it("throws on an icon outside the tone vocabulary", () => {
    expect(() => render(<Callout icon={"default" as never}>body</Callout>)).toThrow(
      `Unknown Callout icon "default" — expected one of: ${CALLOUT_TONES.join(", ")}`,
    );
  });
});
