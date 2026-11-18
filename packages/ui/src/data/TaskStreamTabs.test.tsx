import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TaskStreamTabs, type TaskStreamTab } from "./TaskStreamTabs";
import type { TaskSnapshot } from "./TaskSnapshot";

const TASK: TaskSnapshot = {
  id: "t1",
  name: "run",
  type: "task",
  status: "running",
  stdout: "hello from stdout",
};

const plainTab = (surface?: "plain" | "terminal"): TaskStreamTab => ({
  id: "session",
  label: "Session",
  ...(surface ? { surface } : {}),
  render: () => <div data-testid="pane">pane content</div>,
});

const container = () => screen.getByTestId("pane").closest("[data-task-stream-tabs]") as HTMLElement;

describe("TaskStreamTabs surface", () => {
  it("keeps the black terminal surface for a tab with no declared surface", () => {
    render(<TaskStreamTabs task={TASK} extraTabs={[plainTab()]} />);

    expect(container()).toHaveClass("bg-black");
  });

  it("drops the black terminal surface while a plain tab is active", () => {
    render(<TaskStreamTabs task={TASK} extraTabs={[plainTab("plain")]} />);

    expect(container()).not.toHaveClass("bg-black");
    expect(screen.getByRole("button", { name: "Session" })).not.toHaveClass("text-gray-100");
  });

  it("restores the terminal surface when switching to the stdout tab", () => {
    render(<TaskStreamTabs task={TASK} extraTabs={[plainTab("plain")]} />);

    fireEvent.click(screen.getByRole("button", { name: "stdout" }));

    expect(screen.getByText("hello from stdout").closest("[data-task-stream-tabs]")).toHaveClass(
      "bg-black",
    );
  });
});
