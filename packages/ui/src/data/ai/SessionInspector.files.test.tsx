import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SessionFilesPanel } from "./SessionInspector.files";

const FILES = {
  read: ["pkg/session/session.go"],
  written: ["pkg/cli/webapp/src/SessionBrowser.tsx"],
};

describe("SessionFilesPanel", () => {
  it("renders files with the shared tree controls", () => {
    render(<SessionFilesPanel files={FILES} />);

    const tree = screen.getByRole("tree", { name: "Session files" });
    const fileNode = within(tree).getByRole("treeitem", {
      name: "pkg/cli/webapp/src/SessionBrowser.tsx",
    });
    expect(fileNode).toBeInTheDocument();
    expect(fileNode.firstElementChild).toHaveClass("min-h-6", "py-0");

    fireEvent.click(within(tree).getByRole("button", { name: "Collapse all" }));
    expect(
      within(tree).queryByRole("treeitem", {
        name: "pkg/cli/webapp/src/SessionBrowser.tsx",
      }),
    ).toBeNull();

    fireEvent.click(within(tree).getByRole("button", { name: "Expand all" }));
    expect(
      within(tree).getByRole("treeitem", {
        name: "pkg/cli/webapp/src/SessionBrowser.tsx",
      }),
    ).toBeInTheDocument();
  });
});
