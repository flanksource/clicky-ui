import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TaskProgress } from "./TaskProgress";
import type { TaskSnapshot } from "./TaskSnapshot";

describe("nested task progress", () => {
  it("renders descendants inside their parent exactly once and includes them in progress", () => {
    const snapshots: TaskSnapshot[] = [
      {
        id: "compare",
        name: "Compare sources",
        groupId: "compare-id",
        type: "group",
        status: "running",
        total: 2,
      },
      {
        id: "git",
        name: "Git reads",
        groupId: "git-id",
        parentGroupId: "compare-id",
        type: "group",
        status: "running",
        total: 1,
      },
      {
        id: "open",
        name: "Open source",
        groupId: "compare-id",
        type: "task",
        status: "success",
      },
      {
        id: "fetch",
        name: "Fetch objects",
        groupId: "git-id",
        type: "task",
        status: "running",
        progress: 5,
        maxValue: 10,
      },
    ];
    render(<TaskProgress snapshots={snapshots} />);
    const parent = screen.getByRole("group", { name: "Compare sources" });
    expect(
      within(parent).getByRole("group", { name: "Git reads" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Fetch objects")).toHaveLength(1);
    expect(within(parent).getByText("1/2")).toBeInTheDocument();
  });
});
