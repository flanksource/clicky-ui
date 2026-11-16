import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DefaultDeliveryLine } from "./DefaultDeliveryLine";

describe("DefaultDeliveryLine", () => {
  it.each([
    { delivery: { label: "claude", layer: "project" }, text: "Comments without an @target go to claude (rule from project)" },
    { delivery: { label: "codex" }, text: "Comments without an @target go to codex" },
  ])("names the destination and, when known, the rule layer ($text)", ({ delivery, text }) => {
    render(<DefaultDeliveryLine delivery={delivery} />);
    expect(screen.getByTestId("default-delivery").textContent).toBe(text);
  });

  it.each([null, undefined])("renders nothing for %s", (delivery) => {
    const { container } = render(<DefaultDeliveryLine delivery={delivery} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("uses the host's description as the tooltip", () => {
    render(<DefaultDeliveryLine delivery={{ label: "claude", description: "Sent by the project rule" }} />);
    expect(screen.getByTestId("default-delivery")).toHaveAttribute("title", "Sent by the project rule");
  });
});
