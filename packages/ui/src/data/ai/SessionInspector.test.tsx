import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionInspector } from "./SessionInspector";
import { INSPECTOR_SESSION } from "./SessionViewer.fixtures";

describe("SessionInspector", () => {
  it("keeps the composer mounted across detail tabs", () => {
    render(
      <div className="h-[720px]">
        <SessionInspector
          session={INSPECTOR_SESSION}
          composer={<div>Continue session</div>}
        />
      </div>,
    );

    expect(screen.getByText("Continue session")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "Plan" }));
    expect(screen.getByText("Continue session")).toBeInTheDocument();
  });

  it("renders the provider-aware summary, runtime details, and usage sidebar", () => {
    render(
      <div className="h-[720px]">
        <SessionInspector session={INSPECTOR_SESSION} />
      </div>,
    );

    expect(
      screen.getByRole("heading", { name: "claude-opus-4-8" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/(?:Running|Completed) with/),
    ).not.toBeInTheDocument();
    expect(
      within(screen.getByRole("banner")).getByText("High"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("session-runtime-mode")).toHaveTextContent(
      "cmux",
    );
    expect(screen.getByText("1234")).toBeInTheDocument();
    expect(screen.getByText("1.5k")).toBeInTheDocument();
    expect(screen.getByText("$0.03")).toBeInTheDocument();
    expect(screen.queryByText("Queued")).not.toBeInTheDocument();
    // The context meter now leads the header (moved from the right), with the
    // provider brand glyph — carrying its brand color — nested inside its ring.
    const contextMeter = within(screen.getByRole("banner")).getByLabelText(
      "Context 1% used",
    );
    expect(contextMeter.querySelector("svg")).not.toBeNull();
    const bannerSvgs = [...screen.getByRole("banner").querySelectorAll("svg")];
    expect(
      bannerSvgs.some((svg) => svg.classList.contains("text-[#C15F3C]")),
    ).toBe(true);
    expect(screen.getAllByLabelText("Context 1% used")).toHaveLength(1);
  });

  it("uses the session title and renders xhigh as a first-class effort", async () => {
    render(
      <div className="h-[720px]">
        <SessionInspector
          session={{
            ...INSPECTOR_SESSION,
            title: "You are organizing a set of changes",
            reasoningEffort: "xhigh",
          }}
        />
      </div>,
    );

    expect(
      screen.getByRole("heading", {
        name: "You are organizing a set of changes",
      }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("banner")).getByText("XHigh"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/(?:Running|Completed) with/),
    ).not.toBeInTheDocument();

    fireEvent.mouseEnter(screen.getByLabelText("Context 1% used"));
    expect(await screen.findByText("XHigh effort")).toBeInTheDocument();
  });

  it("falls back to the initial prompt when the session has no title", () => {
    render(
      <div className="h-[720px]">
        <SessionInspector
          session={{
            ...INSPECTOR_SESSION,
            initialPrompt: "Investigate the effort discrepancy",
          }}
        />
      </div>,
    );

    expect(
      screen.getByRole("heading", {
        name: "Investigate the effort discrepancy",
      }),
    ).toBeInTheDocument();
  });

  it("renders unknown effort values as neutral metadata", () => {
    render(
      <div className="h-[720px]">
        <SessionInspector
          session={{
            ...INSPECTOR_SESSION,
            title: "Future effort",
            reasoningEffort: "ultra-plus",
          }}
        />
      </div>,
    );

    const effort = within(screen.getByRole("banner")).getByText("Ultra-plus");
    expect(effort.parentElement?.querySelector("svg")).toBeNull();
  });

  it("renders full unified session detail tabs", async () => {
    render(
      <div className="h-[720px]">
        <SessionInspector session={INSPECTOR_SESSION} />
      </div>,
    );

    expect(screen.getByText("done")).toBeInTheDocument();
    expect(screen.getAllByTitle("Turn turn-1")).toHaveLength(2);

    expect(
      screen.queryByRole("tab", { name: /Turns/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: /Agents/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Select session content: 1 of 1 session",
      }),
    );
    const hierarchy = screen.getByRole("tree", { name: "Session content" });
    expect(within(hierarchy).getByText("Review parity")).toBeInTheDocument();
    expect(within(hierarchy).getByText("Turn 1")).toBeInTheDocument();
    expect(within(hierarchy).getByText("Turn 3")).toBeInTheDocument();
    fireEvent.click(within(hierarchy).getByText("Review parity"));
    expect(within(hierarchy).getByText("Turn 2")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Select session content: 1 of 1 session",
      }),
    );

    fireEvent.click(screen.getByRole("tab", { name: "Files 2" }));
    expect(
      screen.getByRole("tree", { name: "Session files" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("treeitem", { name: "pkg/session/session.go" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("treeitem", {
        name: "pkg/cli/webapp/src/SessionBrowser.tsx",
      }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Plan" }));
    expect(
      await screen.findByRole("heading", { name: "Implement parity panels" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Approvals 3" }));
    expect(screen.getByText("Needs manual review")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Costs $0.03" }));
    expect(screen.getAllByText("$0.03").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("tab", { name: "Metadata" }));
    expect(screen.getByText("/repo/.claude/session.jsonl")).toBeInTheDocument();
    expect(screen.getAllByText("anthropic").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText(/4 keys/));
    expect(document.body.textContent).toContain("memory_citation");

    fireEvent.click(screen.getByRole("tab", { name: "Raw" }));
    expect(screen.getByText('"session-parity"')).toBeInTheDocument();
  });

  it("keeps the hierarchy picker left aligned across detail tabs", () => {
    render(
      <div className="h-[720px]">
        <SessionInspector session={INSPECTOR_SESSION} />
      </div>,
    );

    const hierarchyToolbar = screen.getByRole("toolbar", {
      name: "Session content controls",
    });
    const hierarchyPicker = within(hierarchyToolbar).getByRole("button", {
      name: "Select session content: 1 of 1 session",
    });
    expect(hierarchyToolbar).toHaveClass("justify-start");
    const viewerActions = screen.getByRole("group", {
      name: "Session viewer actions",
    });
    expect(
      within(viewerActions).queryByRole("button", {
        name: "Select session content: 1 of 1 session",
      }),
    ).not.toBeInTheDocument();
    expect(
      within(viewerActions).getByRole("button", { name: "Session options" }),
    ).toBeInTheDocument();
    const badges = screen.getAllByTestId("transcript-turn-badge");
    expect(badges).toHaveLength(3);
    expect(badges[0]).toHaveClass("px-1", "py-px", "text-[9px]");
    expect(badges[0]).toHaveAttribute("data-turn-color");
    expect(badges[0]?.getAttribute("data-turn-color")).not.toBe(
      badges[1]?.getAttribute("data-turn-color"),
    );
    const messageBadges = screen.getAllByTestId("message-turn-badge");
    expect(messageBadges).toHaveLength(3);
    expect(messageBadges[2]).toHaveTextContent("turn-3");
    expect(messageBadges[2]?.parentElement).toHaveTextContent("third turn");
    expect(messageBadges[2]).toHaveAttribute(
      "data-turn-color",
      badges[2]?.getAttribute("data-turn-color"),
    );

    fireEvent.click(hierarchyPicker);
    const tree = screen.getByRole("tree", { name: "Session content" });
    fireEvent.click(within(tree).getByText("Review parity"));
    fireEvent.click(
      within(tree).getByRole("checkbox", { name: "Include Turn 2" }),
    );
    expect(screen.queryByText("second turn")).not.toBeInTheDocument();
    expect(screen.getByText("done")).toBeInTheDocument();
    expect(screen.getAllByTestId("message-turn-badge")).toHaveLength(2);

    fireEvent.click(hierarchyPicker);
    fireEvent.click(screen.getByRole("tab", { name: /^Costs/ }));
    expect(
      within(
        screen.getByRole("toolbar", { name: "Session content controls" }),
      ).getByRole("button", {
        name: "Select session content: 1 of 1 session",
      }),
    ).toBeVisible();
  });

  it("renders plan markdown inline and enables editing explicitly", async () => {
    const onPlanChange = vi.fn();
    render(
      <div className="h-[720px]">
        <SessionInspector
          session={INSPECTOR_SESSION}
          defaultTab="plan"
          onPlanChange={onPlanChange}
        />
      </div>,
    );

    expect(
      await screen.findByRole("heading", { name: "Implement parity panels" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Edit plan" }));
    const editor = screen.getByRole("textbox", { name: "Plan markdown" });
    fireEvent.change(editor, { target: { value: "# Revised plan" } });
    expect(onPlanChange).toHaveBeenCalledWith("# Revised plan");
    fireEvent.click(screen.getByRole("button", { name: "Done editing plan" }));
    expect(await screen.findByText("Revised plan")).toBeInTheDocument();
  });
});
