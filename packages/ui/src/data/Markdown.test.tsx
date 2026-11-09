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
  it("resolves relative document links and images before URL hardening while keeping scripts blocked", async () => {
    const { container } = render(<Markdown sourceBlocks text={'[Details](docs/details.md)\n\n![Diagram](diagram.svg)\n\n<script>bad()</script>\n\n[Unsafe](javascript:bad())'} resolveUrl={(url, kind) => kind === "image" ? "/assets/diagram.svg" : url === "docs/details.md" ? "/?page=details" : url} />);
    expect(await screen.findByRole("link", { name: "Details" })).toHaveAttribute("href", "/?page=details");
    expect(screen.getByRole("img", { name: "Diagram" })).toHaveAttribute("src", "/assets/diagram.svg");
    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
  });
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

describe("Markdown headings", () => {
  it("keeps headings within the message typography scale", async () => {
    render(
      <Markdown
        text={["# Title", "## Section", "### Detail", "#### Note", "##### Minor", "###### Aside"].join(
          "\n\n",
        )}
      />,
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Title" })).toHaveClass("text-lg");
    expect(screen.getByRole("heading", { level: 2, name: "Section" })).toHaveClass("text-base");
    expect(screen.getByRole("heading", { level: 2, name: "Section" })).toHaveAttribute(
      "data-streamdown",
      "heading-2",
    );
    expect(screen.getByRole("heading", { level: 3, name: "Detail" })).toHaveClass("text-sm");
    expect(screen.getByRole("heading", { level: 4, name: "Note" })).toHaveClass("text-sm");
    expect(screen.getByRole("heading", { level: 5, name: "Minor" })).toHaveClass("text-sm");
    expect(screen.getByRole("heading", { level: 6, name: "Aside" })).toHaveClass("text-sm");
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

// Line numbers are 1-based and absolute in the source passed to <Markdown>.
const SOURCE_BLOCKS_DOC = [
  "# Title", // 1
  "", // 2
  "A paragraph", // 3
  "that spans two lines.", // 4
  "", // 5
  "- first", // 6
  "- second", // 7
  "", // 8
  "```go", // 9
  "package main", // 10
  "```", // 11
  "", // 12
  "| a | b |", // 13
  "| - | - |", // 14
  "| 1 | 2 |", // 15
  "", // 16
  "1. one", // 17
  "2. two", // 18
  "", // 19
  "> quoted", // 20
].join("\n");

function sourceRanges(container: HTMLElement): Array<[string, string, string]> {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-source-start]")).map((el) => [
    el.dataset.sourceStart!,
    el.dataset.sourceEnd!,
    el.tagName.toLowerCase(),
  ]);
}

describe("Markdown sourceBlocks", () => {
  it("stamps each top-level block with its absolute source line range", async () => {
    const { container } = render(<Markdown sourceBlocks text={SOURCE_BLOCKS_DOC} />);

    await waitFor(() => {
      expect(container.querySelector("table")).not.toBeNull();
    });
    expect(sourceRanges(container)).toEqual([
      ["1", "1", "h1"],
      ["3", "4", "p"],
      ["6", "7", "ul"],
      ["9", "11", "div"],
      ["13", "15", "div"],
      ["17", "18", "ol"],
      ["20", "20", "blockquote"],
    ]);
  });

  it("keeps positions absolute when the document is long enough for streaming to split it into blocks", async () => {
    const filler = Array.from({ length: 40 }, (_, i) => `Paragraph ${i}.`).join("\n\n");
    const { container } = render(<Markdown sourceBlocks text={`${filler}\n\n# Last`} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Last" })).toBeInTheDocument();
    });
    const heading = screen.getByRole("heading", { level: 1, name: "Last" });
    // 40 paragraphs on lines 1,3,...,79 and a blank line 80 put the heading on line 81.
    expect(heading.dataset.sourceStart).toBe("81");
    expect(heading.dataset.sourceEnd).toBe("81");
    expect(container.querySelectorAll("[data-source-start]")).toHaveLength(41);
  });

  it("does not stamp anything when sourceBlocks is off", async () => {
    const { container } = render(<Markdown text={SOURCE_BLOCKS_DOC} />);

    await waitFor(() => {
      expect(container.querySelector("table")).not.toBeNull();
    });
    expect(container.querySelector("[data-source-start]")).toBeNull();
  });

  it("keeps sanitising the document", async () => {
    const { container } = render(
      <Markdown sourceBlocks text={'<script>window.pwned = 1</script>\n\n<p onclick="pwned()">click</p>'} />,
    );

    await waitFor(() => {
      expect(screen.getByText("click")).toBeInTheDocument();
    });
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("click")).not.toHaveAttribute("onclick");
  });

  it("refuses to combine with callouts, whose sanitiser schema it would replace", () => {
    const errors = vi.spyOn(console, "error").mockImplementation(() => undefined);
    // jsdom reports an error thrown during render as an uncaught window error.
    const swallow = (event: ErrorEvent) => event.preventDefault();
    window.addEventListener("error", swallow);
    expect(() => render(<Markdown sourceBlocks callouts text="x" />)).toThrow(/sourceBlocks.*callouts/);
    window.removeEventListener("error", swallow);
    errors.mockRestore();
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
