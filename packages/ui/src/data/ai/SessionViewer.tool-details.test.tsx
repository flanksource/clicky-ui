import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DensityValueProvider } from "../../hooks/density-provider";
import { SessionViewer } from "./SessionViewer";
import { ResponseBlock } from "./SessionViewer.tool-details";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

const SESSION: UnifiedSessionInput = {
  messages: [
    {
      id: "lookup",
      role: "assistant",
      parts: [
        {
          type: "dynamic-tool",
          toolName: "lookup",
          input: { query: "example", options: { enabled: true } },
          output: { matches: ["001", "true"], next: null },
        },
      ],
    },
  ],
};

describe("Tool detail density", () => {
  it.each(["compact", "comfortable", "spacious"] as const)(
    "renders expanded tool inputs and responses as compact YAML at %s viewer density",
    (density) => {
      const { container } = render(
        <SessionViewer
          session={SESSION}
          defaultDensity={density}
          defaultExpanded
        />,
      );
      const yamlViews = container.querySelectorAll('[data-format="yaml"]');
      expect(yamlViews).toHaveLength(2);
      expect(container.querySelector('[data-format="json"]')).toBeNull();
      expect(yamlViews[0]).toHaveAttribute("data-density", "compact");
      expect(yamlViews[1]).toHaveAttribute("data-density", "compact");
      expect(yamlViews[0]).toHaveTextContent("query: example");
      expect(yamlViews[0]).toHaveTextContent("enabled: true");
      expect(yamlViews[1]).toHaveTextContent('- "001"');
      expect(yamlViews[1]).toHaveTextContent('- "true"');
      expect(yamlViews[1]).toHaveTextContent("next: null");
    },
  );

  it.each(["Finished", "[INFO] lookup completed", '{"unfinished":'])(
    "preserves non-JSON response text in compact density: %s",
    (response) => {
      const { container } = render(
        <DensityValueProvider density="compact">
          <ResponseBlock response={response} />
        </DensityValueProvider>,
      );
      expect(container.querySelector("pre")).toHaveTextContent(response);
      expect(container.querySelector("[data-format]")).toBeNull();
    },
  );
});
