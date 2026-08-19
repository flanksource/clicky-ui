import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Keep the Shiki dynamic imports out of jsdom: with highlighting stubbed to
// null, CodeBlock renders its plain-text fallback so the code text stays a
// single addressable node. (Same approach as CodeDiff.test.tsx.)
vi.mock("./code-highlight", () => ({
  highlightCode: vi.fn(async () => null),
  highlightToLines: vi.fn(async () => null),
}));

import { Markdown } from "./Markdown";

describe("Markdown code blocks", () => {
  it("renders a fenced block with the library CodeBlock, not Streamdown's default", async () => {
    const { container } = render(<Markdown text={"```yaml\ntimeout: 300\n```"} />);

    // Streamdown loads lazily; wait for it and the `code` override to render.
    await waitFor(() => {
      expect(screen.getByText("timeout: 300")).toBeInTheDocument();
    });

    // CodeBlock's language header replaces Streamdown's own code-block chrome.
    expect(screen.getByText("yaml")).toBeInTheDocument();
    expect(container.querySelector('[data-streamdown="code-block"]')).toBeNull();
    expect(container.querySelector(".not-prose")).not.toBeNull();
  });

  it("leaves inline code as a plain <code> element", async () => {
    const { container } = render(<Markdown text={"Run `pnpm build` to compile."} />);

    await waitFor(() => {
      const code = container.querySelector("code");
      expect(code?.textContent).toBe("pnpm build");
    });
    expect(container.querySelector('[data-streamdown="code-block"]')).toBeNull();
  });
});

const CALLOUT_SOURCE = [
  '<CalloutBox variant="caution" badge="BCR-08" label="Gap" source="Policy Owner">',
  "",
  "Recovery times are not yet evidenced.",
  "",
  "</CalloutBox>",
].join("\n");

describe("Markdown callouts", () => {
  it("renders an authored <CalloutBox> as a Callout when callouts is on", async () => {
    render(<Markdown callouts text={CALLOUT_SOURCE} />);

    await waitFor(() => {
      expect(screen.getByText("Recovery times are not yet evidenced.")).toBeInTheDocument();
    });
    // The attributes survive rehype-raw's lowercasing and reach the component.
    for (const text of ["BCR-08", "Gap", "Policy Owner"]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });

  // Off by default because enabling it turns on raw-HTML passthrough for the
  // whole document — a sanitization decision the caller has to make explicitly.
  it("leaves the raw tag alone when callouts is off", async () => {
    const { container } = render(<Markdown text={CALLOUT_SOURCE} />);

    await waitFor(() => {
      expect(screen.getByText("Recovery times are not yet evidenced.")).toBeInTheDocument();
    });
    expect(screen.queryByText("Gap")).toBeNull();
    expect(container.querySelector("[data-callout-editor]")).toBeNull();
  });
});
