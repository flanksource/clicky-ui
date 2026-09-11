import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClickyNodeView, ClickyTable } from "./Clicky";

// clicky's Go text styling (xetrace/pretty.go, clicky/api/text.go) uses the
// bare "text-muted" utility as its terminal "dim" style, the same way it
// uses "text-red-500" — but shadcn's `muted` color (clicky-ui's own
// tokens.css, and the palette clicky's standalone HTML formatter declares)
// splits a DEFAULT (a pale background fill) from a `foreground` (the
// readable dim text color), and Tailwind's `text-muted` resolves to the
// DEFAULT. A literal `text-muted` class therefore renders nearly invisible
// instead of legible-but-quiet.
describe("ClickyNodeRenderer text-muted normalization", () => {
  it("rewrites a bare text-muted class to text-muted-foreground", () => {
    render(
      <ClickyNodeView node={{ kind: "text", text: "idle", style: { className: "text-muted" } }} />,
    );
    const el = screen.getByText("idle");
    expect(el).toHaveClass("text-muted-foreground");
    expect(el.className.split(/\s+/)).not.toContain("text-muted");
  });

  it("leaves text-muted-foreground alone (no double-rewrite)", () => {
    render(
      <ClickyNodeView
        node={{ kind: "text", text: "already-fg", style: { className: "text-muted-foreground" } }}
      />,
    );
    const el = screen.getByText("already-fg");
    expect(el.className.split(/\s+/)).toEqual(["text-muted-foreground"]);
  });

  it("normalizes text-muted alongside other classes without disturbing them", () => {
    render(
      <ClickyNodeView
        node={{ kind: "text", text: "combo", style: { className: "font-bold text-muted text-xs" } }}
      />,
    );
    const el = screen.getByText("combo");
    expect(el).toHaveClass("font-bold", "text-muted-foreground", "text-xs");
    expect(el.className.split(/\s+/)).not.toContain("text-muted");
  });

  it("normalizes nested children the same way a composite cell (e.g. an event marker) builds them", () => {
    render(
      <ClickyNodeView
        node={{
          kind: "text",
          text: "",
          children: [
            { kind: "text", text: "R ", style: { className: "text-blue-500 font-bold" } },
            { kind: "text", text: "cpu: 12ms", style: { className: "text-muted" } },
          ],
        }}
      />,
    );
    const el = screen.getByText("cpu: 12ms");
    expect(el).toHaveClass("text-muted-foreground");
  });

  it("normalizes a table cell's style the same way as a standalone node", () => {
    render(
      <ClickyTable
        columns={[{ name: "cpu", label: "CPU" }]}
        rows={[{ cells: { cpu: { kind: "text", text: "12ms", style: { className: "text-muted" } } } }]}
      />,
    );
    const el = screen.getByText("12ms");
    expect(el).toHaveClass("text-muted-foreground");
  });
});
