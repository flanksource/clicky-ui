import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Keep the Shiki dynamic imports out of jsdom: with highlighting stubbed to
// null, CodeBlock renders its plain-text fallback so the code text stays a
// single addressable node. (Same approach as CodeDiff.test.tsx.)
vi.mock("./code-highlight", () => ({
  highlightCode: vi.fn(async () => null),
  highlightToLines: vi.fn(async () => null),
}));

import { Markdown } from "./Markdown";
import { RouterProvider } from "../rpc/RouterProvider";
import type { RouterAdapter } from "../rpc/router";

describe("Markdown links", () => {
  const routedAdapter = (navigate: (to: string) => void): RouterAdapter => ({
    pathname: "/",
    navigate,
    renderLink: ({ to, className, children }) => (
      <a
        href={to}
        className={className}
        onClick={(event) => {
          event.preventDefault();
          navigate(to);
        }}
      >
        {children}
      </a>
    ),
  });

  it("routes a root-relative link through the host router without a confirm prompt", async () => {
    const navigate = vi.fn();
    render(
      <RouterProvider adapter={routedAdapter(navigate)}>
        <Markdown text={"Open [Connections](/connections) first."} />
      </RouterProvider>,
    );

    const link = await screen.findByRole("link", { name: "Connections" });
    expect(link).toHaveAttribute("href", "/connections");
    fireEvent.click(link);
    expect(navigate).toHaveBeenCalledWith("/connections");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("asks before opening an external link in a new tab", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    render(<Markdown text={"See [the docs](https://example.com/guide)."} />);

    const link = await screen.findByRole("link", { name: "the docs" });
    expect(link).toHaveAttribute("href", "https://example.com/guide");
    fireEvent.click(link);
    expect(open).not.toHaveBeenCalled();

    fireEvent.click(await screen.findByRole("button", { name: "Open link" }));
    expect(open).toHaveBeenCalledWith("https://example.com/guide", "_blank", "noopener,noreferrer");
    open.mockRestore();
  });
});

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
