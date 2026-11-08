import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Clicky, ClickyNodeView, type ClickyDocument, type ClickyNode } from "./Clicky";
import { setFallbackIconProvider } from "./icon-fallback";
import { UiInfo, UiWarningTriangle } from "../icons";

const WARNING = "Warning: Null value is eliminated by an aggregate or other SET operation.";
const INFO = "3 rows staged";

// What gavel's query kind emits for a batch's server messages (serverMessage in
// fixtures/kinds/query/kind.go), as formatters.NewClickyDocument serialises
// icons.Warning / icons.Info: an icon node with the iconify name, the unicode
// fallback and clicky's semantic style name.
const message = (icon: ClickyNode, text: string, className: string): ClickyNode => ({
  kind: "text",
  plain: `${icon.unicode} ${text}`,
  children: [icon, { kind: "text", plain: ` ${text}`, text: ` ${text}`, style: { className } }],
});
const warningIcon: ClickyNode = { kind: "icon", plain: "⚠️", style: { className: "warning" }, iconify: "ion:warning", unicode: "⚠️" };
const infoIcon: ClickyNode = { kind: "icon", plain: "•", style: { className: "info" }, iconify: "ion:information-circle", unicode: "•" };

const view: ClickyDocument = {
  version: 1,
  node: {
    kind: "text",
    plain: `⚠️ ${WARNING}\n• ${INFO}`,
    children: [
      message(warningIcon, WARNING, "text-amber-600"),
      { kind: "html", plain: "\n", html: '<br class="clicky">' },
      message(infoIcon, INFO, "text-muted-foreground"),
    ],
  },
};

/** The path data of an imported glyph, rendered on its own: the oracle for which glyph an icon node drew. */
function glyphPath(Glyph: typeof UiWarningTriangle): string {
  const { container, unmount } = render(<Glyph />);
  const d = container.querySelector("path")!.getAttribute("d")!;
  unmount();
  return d;
}

afterEach(() => setFallbackIconProvider(null));

describe("Clicky icon nodes", () => {
  it("draws a server message's warning and info icons as clicky-ui glyphs, without a host icon provider", () => {
    const warningPath = glyphPath(UiWarningTriangle);
    const infoPath = glyphPath(UiInfo);
    render(<Clicky data={view} />);

    // One icon per message line, in document order: the warning, then the info.
    const icons = [...document.querySelectorAll<HTMLElement>("[data-clicky-icon]")];
    expect(icons.map((icon) => icon.querySelector("path")?.getAttribute("d"))).toEqual([warningPath, infoPath]);
    expect(icons.map((icon) => icon.textContent)).toEqual(["", ""]);
    expect(screen.getByText(WARNING, { exact: false })).toHaveClass("text-amber-600");
    expect(screen.getByText(INFO, { exact: false })).toHaveClass("text-muted-foreground");
  });

  it("colours a glyph with the icon's own text class", () => {
    render(<ClickyNodeView node={{ ...warningIcon, style: { className: "text-red-500" } }} />);
    expect(document.querySelector("[data-clicky-icon] svg")).toHaveClass("text-red-500");
  });

  it("resolves an iconify name clicky-ui has no glyph for through the host's provider", () => {
    setFallbackIconProvider(({ name }) => <span data-testid="host-glyph">{name}</span>);
    render(<ClickyNodeView node={{ kind: "icon", iconify: "devicon:kubernetes", unicode: "☸️" }} />);
    expect(screen.getByTestId("host-glyph")).toHaveTextContent("devicon:kubernetes");
  });

  it("falls back to the icon's unicode when neither clicky-ui nor a host provider draws it", () => {
    render(<ClickyNodeView node={{ kind: "icon", iconify: "devicon:kubernetes", unicode: "☸️" }} />);
    const icon = document.querySelector("[data-clicky-icon]")!;
    expect(icon).toHaveTextContent("☸️");
    expect(icon).not.toHaveTextContent("?");
  });
});
