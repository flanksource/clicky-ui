import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DensityValueProvider } from "../../hooks/density-provider";
import { SessionViewer } from "./SessionViewer";
import { ResponseBlock } from "./SessionViewer.tool-details";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

const SESSION: UnifiedSessionInput = {
  messages: [{ id: "lookup", role: "assistant", parts: [{
    type: "dynamic-tool", toolName: "lookup",
    input: { query: "example", options: { enabled: true } },
    output: { matches: ["001", "true"], next: null },
  }] }],
};

describe("Tool detail density", () => {
  it("switches expanded tool inputs and JSON responses to YAML only in compact density", () => {
    const { container } = render(<SessionViewer session={SESSION} defaultDensity="comfortable" defaultExpanded />);
    expect(container.querySelectorAll('[data-format="json"]')).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Session options" }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Compact" }));
    const yamlViews = container.querySelectorAll('[data-format="yaml"]');
    expect(yamlViews).toHaveLength(2);
    expect(container.querySelector('[data-format="json"]')).toBeNull();
    expect(yamlViews[0]).toHaveAttribute("data-density", "compact");
    expect(yamlViews[0]).toHaveTextContent("query: example");
    expect(yamlViews[0]).toHaveTextContent("enabled: true");
    expect(yamlViews[1]).toHaveTextContent('- "001"');
    expect(yamlViews[1]).toHaveTextContent('- "true"');
    expect(yamlViews[1]).toHaveTextContent("next: null");
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Spacious" }));
    expect(container.querySelectorAll('[data-format="json"]')).toHaveLength(2);
    expect(container.querySelector('[data-format="yaml"]')).toBeNull();
  });

  it.each(["Finished", "[INFO] lookup completed", '{"unfinished":'])
    ("preserves non-JSON response text in compact density: %s", (response) => {
      const { container } = render(<DensityValueProvider density="compact"><ResponseBlock response={response} /></DensityValueProvider>);
      expect(container.querySelector("pre")).toHaveTextContent(response);
      expect(container.querySelector("[data-format]")).toBeNull();
    });
});
