import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Workspace, type WorkspacePaneSpec } from "./Workspace";

const panes: WorkspacePaneSpec[] = [
  {
    id: "explorer",
    label: "Explorer",
    icon: <span data-testid="explorer-icon" />,
    slots: {
      headerLeading: <span data-testid="explorer-leading" />,
      headerTrailing: <button type="button">Explorer actions</button>,
    },
    location: "left",
    content: <div>Files</div>,
    width: 280,
  },
  {
    id: "outline",
    label: "Outline",
    location: "left",
    content: <div>Symbols</div>,
    width: 280,
  },
  {
    id: "editor",
    label: "Editor",
    location: "center",
    content: <div>Source</div>,
  },
  {
    id: "variables",
    label: "Variables",
    location: "right",
    content: <div>Values</div>,
    width: 340,
  },
  {
    id: "terminal",
    label: "Terminal",
    location: "bottom",
    content: <div>Output</div>,
    height: 220,
  },
];

describe("Workspace", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders labeled panes in each location and stacks side panes", () => {
    render(<Workspace panes={panes} />);

    expect(screen.getByTestId("workspace-region-left")).toHaveTextContent(
      "ExplorerExplorer actionsFilesOutlineSymbols",
    );
    expect(screen.getByTestId("workspace-region-center")).toHaveTextContent(
      "EditorSource",
    );
    expect(screen.getByTestId("workspace-region-right")).toHaveTextContent(
      "VariablesValues",
    );
    expect(screen.getByTestId("workspace-region-bottom")).toHaveTextContent(
      "TerminalOutput",
    );
    expect(
      screen
        .getByTestId("workspace-region-left")
        .style.getPropertyValue("--workspace-region-width"),
    ).toBe("280px");
    expect(
      screen
        .getByTestId("workspace-region-right")
        .style.getPropertyValue("--workspace-region-width"),
    ).toBe("340px");
    expect(
      screen
        .getByTestId("workspace-region-bottom")
        .style.getPropertyValue("--workspace-bottom-height"),
    ).toBe("220px");
  });

  it("makes the center region fillable by its flexing editor pane", () => {
    render(<Workspace panes={panes} />);

    expect(screen.getByTestId("workspace-region-center")).toHaveClass(
      "flex",
      "flex-col",
    );
    expect(screen.getByTestId("workspace-pane-editor")).toHaveClass("flex-1");
  });

  const STACK_HEIGHT = 200;
  const stackPanes: WorkspacePaneSpec[] = [
    {
      id: "sized",
      label: "Sized",
      location: "left",
      content: <div>Sized body</div>,
      width: 280,
      height: STACK_HEIGHT,
    },
    {
      id: "auto",
      label: "Auto",
      location: "left",
      content: <div>Auto body</div>,
      width: 280,
    },
    { id: "editor", label: "Editor", location: "center", content: <div /> },
  ];

  it("flexes an open stacked pane with an explicit height instead of pinning it", () => {
    render(<Workspace panes={stackPanes} />);

    const wrapper = screen.getByTestId("workspace-stack-sized");
    expect(wrapper).toHaveClass("flex-1");
    expect(wrapper).not.toHaveClass("shrink-0");
    expect(wrapper.style.flexBasis).toBe(`${STACK_HEIGHT}px`);
    expect(screen.getByTestId("workspace-pane-sized")).toHaveClass("flex-1");
  });

  it("keeps a sized pane flexing after a stacked sibling collapses", () => {
    render(<Workspace panes={stackPanes} />);

    fireEvent.click(screen.getByRole("button", { name: "Collapse Auto" }));

    expect(screen.queryByText("Auto body")).not.toBeInTheDocument();
    expect(screen.getByTestId("workspace-stack-auto")).toHaveClass("shrink-0");
    expect(screen.getByTestId("workspace-stack-sized")).toHaveClass("flex-1");
    expect(screen.getByTestId("workspace-pane-sized")).toHaveClass("flex-1");
  });

  it("reserves only the header for a collapsed stacked pane", () => {
    render(<Workspace panes={stackPanes} />);

    fireEvent.click(screen.getByRole("button", { name: "Collapse Sized" }));

    const section = screen.getByTestId("workspace-pane-sized");
    expect(section).toHaveClass("shrink-0");
    expect(section).not.toHaveClass("flex-1");
    expect(screen.queryByText("Sized body")).not.toBeInTheDocument();
    expect(screen.getByTestId("workspace-stack-sized").style.flexBasis).toBe("");
  });

  it("enables collapse and resize by default and restores remembered size", () => {
    render(<Workspace panes={panes} />);

    const left = screen.getByTestId("workspace-region-left");
    expect(screen.getByTestId("workspace-resize-left")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Collapse Explorer" }));
    expect(screen.queryByText("Files")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Collapse Outline" }));
    expect(left.style.getPropertyValue("--workspace-region-width")).toBe(
      "40px",
    );
    fireEvent.click(screen.getByRole("button", { name: "Expand Explorer" }));
    expect(left.style.getPropertyValue("--workspace-region-width")).toBe(
      "280px",
    );
  });

  it("collapses a whole side independently from its panes", () => {
    render(<Workspace panes={panes} />);

    fireEvent.click(screen.getByRole("button", { name: "Collapse Explorer" }));
    expect(screen.queryByText("Files")).not.toBeInTheDocument();
    expect(screen.getByText("Symbols")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Collapse left side" }));
    expect(screen.queryByText("Symbols")).not.toBeInTheDocument();
    expect(
      screen
        .getByTestId("workspace-region-left")
        .style.getPropertyValue("--workspace-region-width"),
    ).toBe("0px");

    fireEvent.click(screen.getByRole("button", { name: "Expand left side" }));
    expect(screen.queryByText("Files")).not.toBeInTheDocument();
    expect(screen.getByText("Symbols")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Expand Explorer" }),
    ).toBeInTheDocument();
  });

  it("renders pane icons, named header slots, and the workspace top-right slot", () => {
    render(
      <Workspace
        panes={panes}
        slots={{
          topRightActions: <button type="button">Workspace menu</button>,
        }}
      />,
    );

    expect(screen.getByTestId("explorer-icon")).toBeInTheDocument();
    expect(screen.getByTestId("explorer-leading")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Explorer actions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Workspace menu" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Collapse left side" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Collapse right side" }),
    ).toBeInTheDocument();
  });

  it("resizes with keyboard controls and reports controlled changes", () => {
    const onValueChange = vi.fn();
    render(<Workspace panes={panes} onValueChange={onValueChange} />);

    const separator = screen.getByTestId("workspace-resize-left");
    expect(separator).toHaveAttribute("role", "separator");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).toHaveAttribute("aria-valuenow", "280");
    fireEvent.keyDown(separator, { key: "ArrowRight" });

    expect(
      screen
        .getByTestId("workspace-region-left")
        .style.getPropertyValue("--workspace-region-width"),
    ).toBe("296px");
    expect(onValueChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ leftWidth: 296 }),
    );
  });

  it("resizes side panes with pointer input", () => {
    render(<Workspace panes={panes} />);
    const separator = screen.getByTestId("workspace-resize-left");

    fireEvent(
      separator,
      new MouseEvent("pointerdown", { bubbles: true, clientX: 100 }),
    );
    fireEvent(
      document,
      new MouseEvent("pointermove", { bubbles: true, clientX: 140 }),
    );
    fireEvent(document, new MouseEvent("pointerup", { bubbles: true }));

    expect(
      screen
        .getByTestId("workspace-region-left")
        .style.getPropertyValue("--workspace-region-width"),
    ).toBe("320px");
  });

  it("honors non-collapsible and non-resizable panes", () => {
    render(
      <Workspace
        panes={[
          {
            id: "fixed",
            label: "Fixed",
            location: "left",
            content: <div>Fixed body</div>,
            collapsible: false,
            resizable: false,
          },
          {
            id: "editor",
            label: "Editor",
            location: "center",
            content: <div>Source</div>,
          },
        ]}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Collapse Fixed" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("workspace-resize-left"),
    ).not.toBeInTheDocument();
  });

  it("persists uncontrolled state by pane id", () => {
    const { unmount } = render(
      <Workspace panes={panes} storageKey="workspace-test" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Collapse Variables" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Collapse right side" }),
    );
    unmount();

    render(<Workspace panes={panes} storageKey="workspace-test" />);
    expect(
      screen.getByRole("button", { name: "Expand right side" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Values")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Expand right side" }));
    expect(
      screen.getByRole("button", { name: "Expand Variables" }),
    ).toBeInTheDocument();
  });

  it("applies defaults when a pane location is introduced after initial render", () => {
    const initial = panes.filter((pane) => pane.location !== "right");
    const { rerender } = render(<Workspace panes={initial} />);

    rerender(<Workspace panes={panes} />);

    expect(
      screen
        .getByTestId("workspace-region-right")
        .style.getPropertyValue("--workspace-region-width"),
    ).toBe("340px");
  });

  it("fails fast for invalid location cardinality and conflicting side widths", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      expect(() => render(<Workspace panes={[]} />)).toThrow(
        "exactly one center pane",
      );
      expect(() =>
        render(
          <Workspace
            panes={[
              ...panes,
              {
                id: "editor-2",
                label: "Other",
                location: "center",
                content: null,
              },
            ]}
          />,
        ),
      ).toThrow("exactly one center pane");
      expect(() =>
        render(
          <Workspace
            panes={[
              ...panes,
              {
                id: "search",
                label: "Search",
                location: "left",
                content: null,
                width: 300,
              },
            ]}
          />,
        ),
      ).toThrow("share one width");
    } finally {
      consoleError.mockRestore();
    }
  });

  it("rejects controlled state combined with built-in storage", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      expect(() =>
        render(
          <Workspace
            panes={panes}
            value={{
              leftWidth: 280,
              rightWidth: 340,
              bottomHeight: 220,
              stackHeights: {},
              collapsed: {},
              sideCollapsed: { left: false, right: false },
            }}
            storageKey="workspace-test"
          />,
        ),
      ).toThrow("cannot combine value with storageKey");
    } finally {
      consoleError.mockRestore();
    }
  });
});
