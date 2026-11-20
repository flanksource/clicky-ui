import { render, waitFor } from "@testing-library/react";
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

describe("Tool calls carrying prose", () => {
  it("renders a reply's body as Markdown and its other arguments as the structured block", async () => {
    const session: UnifiedSessionInput = {
      messages: [
        {
          id: "reply",
          role: "assistant",
          parts: [
            {
              type: "dynamic-tool",
              toolName: "mcp__captain__reply_to_thread",
              input: { id: "thread-1", body: "**Where it comes from:** the hook\n\n- one\n- two" },
              output: "ok",
            },
          ],
        },
      ],
    };
    const { container } = render(<SessionViewer session={session} defaultExpanded />);

    const strong = '[data-tool-markdown-field="body"] [data-streamdown="strong"]';
    await waitFor(() => expect(container.querySelector(strong)).not.toBeNull());
    const body = container.querySelector('[data-tool-markdown-field="body"]');
    expect({
      bold: container.querySelector(strong)?.textContent,
      items: [...(body?.querySelectorAll("li") ?? [])].map((item) => item.textContent),
      rest: container.querySelector('[data-tool-markdown-input] [data-format="yaml"]')?.textContent,
    }).toEqual({
      bold: "Where it comes from:",
      items: ["one", "two"],
      rest: expect.stringContaining("id: thread-1"),
    });
    expect(container.querySelector('[data-tool-markdown-input] [data-format="yaml"]')?.textContent).not.toContain("Where it comes from");
  });
});

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
