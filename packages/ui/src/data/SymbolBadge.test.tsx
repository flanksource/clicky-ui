import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { UiFunctionSquare } from "../icons";
import { SymbolBadge, type SymbolBadgeStyle } from "./SymbolBadge";

const CALL = "CalculatePremium(CoverMV) = …";
const COLOR = "#4338ca";

describe("SymbolBadge", () => {
  it.each<SymbolBadgeStyle>(["badge", "badge-outline", "inline"])(
    "renders the full symbol with its glyph in %s style",
    (style) => {
      render(<SymbolBadge style={style} color={COLOR} icon={UiFunctionSquare}>{CALL}</SymbolBadge>);
      const root = screen.getByText(CALL).closest("[data-symbol-style]");
      expect(root).toHaveAttribute("data-symbol-style", style);
      expect(root).toHaveStyle({ color: COLOR });
      expect(root).toHaveAttribute("title", CALL);
      expect(root?.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    },
  );

  it("fills the badge and gives only the outline variant a colored border", () => {
    const { container } = render(<>
      <SymbolBadge style="badge" color={COLOR}>{CALL}</SymbolBadge>
      <SymbolBadge style="badge-outline" color={COLOR}>{CALL}</SymbolBadge>
      <SymbolBadge style="inline" color={COLOR}>{CALL}</SymbolBadge>
    </>);
    const filled = container.querySelector<HTMLElement>('[data-symbol-style="badge"]');
    const outline = container.querySelector<HTMLElement>('[data-symbol-style="badge-outline"]');
    const inline = container.querySelector<HTMLElement>('[data-symbol-style="inline"]');
    expect(filled?.style.backgroundColor).toContain("color-mix");
    expect(filled).toHaveClass("border-transparent");
    expect(outline).toHaveClass("bg-transparent", "border-current");
    expect(inline).toHaveClass("border-0", "p-0");
  });

  it("uses named palette hues and keeps a custom accessible name", () => {
    render(<SymbolBadge color="violet" aria-label="Plan:DefaultCurrencyCode" title="Plan:DefaultCurrencyCode">DefaultCurrencyCode</SymbolBadge>);
    const root = screen.getByLabelText("Plan:DefaultCurrencyCode");
    expect(root).toHaveClass("text-violet-700");
    expect(root).toHaveTextContent("DefaultCurrencyCode");
    expect(root).toHaveAttribute("title", "Plan:DefaultCurrencyCode");
  });

  it.each([
    { language: "sql", source: "COALESCE(FloatValue, 0) * 12" },
    { language: "xml", source: '<MathVariable TYPE="FIELD" />' },
    { language: "javascript", source: CALL },
  ])("formats $language without changing its literal source", async ({ language, source }) => {
    const { container } = render(<SymbolBadge language={language} icon={UiFunctionSquare}>{source}</SymbolBadge>);
    await waitFor(() => expect(container.querySelectorAll("code span").length).toBeGreaterThan(1));
    expect(container.querySelector("code")?.textContent).toBe(source);
  });

  it.each(["", "   ", "SELECT 1\nFROM AsPolicy"])("rejects an empty or multiline symbol %j", (text) => {
    expect(() => render(<SymbolBadge>{text}</SymbolBadge>)).toThrow(/single-line symbol/);
  });

  it("preserves formatted math content and its accessible name", () => {
    render(<SymbolBadge style="inline" color="violet" icon={UiFunctionSquare} title="Premium ratio">
      <math aria-label="Premium ratio"><mfrac><mi>Premium</mi><mi>SumAssured</mi></mfrac></math>
    </SymbolBadge>);
    const math = screen.getByLabelText("Premium ratio");
    expect(math.querySelector("mfrac")).toHaveTextContent("PremiumSumAssured");
    expect(math.closest("[data-symbol-style]")).toHaveAttribute("data-symbol-style", "inline");
    expect(math.closest("[data-symbol-style]")?.querySelector("code")).toBeNull();
  });
});
