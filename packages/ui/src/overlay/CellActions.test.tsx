import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { UiChatDots, UiSparkles } from "../icons";
import { CellActionButton, CellActions } from "./CellActions";

function Harness({
  onComment = vi.fn(),
  onAskAI = vi.fn(),
}: {
  onComment?: () => void;
  onAskAI?: () => void;
}) {
  const [cell, setCell] = useState<HTMLDivElement | null>(null);
  return (
    <div>
      <div ref={setCell} tabIndex={0} data-testid="cell">
        Revenue
        <CellActions
          contextTarget={cell}
          menuLabel="Cell actions"
          menuItems={[
            { label: "Add comment", icon: UiChatDots, onSelect: onComment },
            { label: "Ask AI", icon: UiSparkles, onSelect: onAskAI },
          ]}
        >
          <CellActionButton label="Ask AI" icon={UiSparkles} onSelect={onAskAI} />
          <CellActionButton label="Add comment" icon={UiChatDots} onSelect={onComment} />
        </CellActions>
      </div>
      <button type="button">Outside</button>
    </div>
  );
}

describe("CellActions", () => {
  it("renders muted inline actions that invoke their handlers", () => {
    const onComment = vi.fn();
    const onAskAI = vi.fn();
    render(<Harness onComment={onComment} onAskAI={onAskAI} />);

    const askAI = screen.getByRole("button", { name: "Ask AI" });
    const comment = screen.getByRole("button", { name: "Add comment" });
    expect(askAI.className).toContain("opacity-70");
    expect(comment.className).toContain("opacity-70");

    fireEvent.click(askAI);
    fireEvent.click(comment);
    expect(onAskAI).toHaveBeenCalledTimes(1);
    expect(onComment).toHaveBeenCalledTimes(1);
  });

  it("accepts a custom inline comment badge", () => {
    const [cell] = [null];
    render(
      <CellActions contextTarget={cell} menuLabel="Cell actions" menuItems={[]}>
        <button type="button" aria-label="2 comments">
          2
        </button>
      </CellActions>,
    );
    expect(screen.getByRole("button", { name: "2 comments" })).toBeInTheDocument();
  });

  it("opens on a cell context-menu event and selects an item", () => {
    const onComment = vi.fn();
    render(<Harness onComment={onComment} />);

    fireEvent.contextMenu(screen.getByTestId("cell"), { clientX: 120, clientY: 80 });
    expect(screen.getByRole("menu", { name: "Cell actions" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "Add comment" }));

    expect(onComment).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens from the keyboard and closes on Escape", () => {
    render(<Harness />);
    const cell = screen.getByTestId("cell");
    cell.focus();

    fireEvent.keyDown(cell, { key: "F10", shiftKey: true });
    expect(screen.getByRole("menu", { name: "Cell actions" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(cell).toHaveFocus();
  });

  it("closes on an outside pointer press", () => {
    render(<Harness />);
    fireEvent.contextMenu(screen.getByTestId("cell"));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
