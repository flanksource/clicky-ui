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

  it("renders a non-collapsible pane without a duplicate header when requested", () => {
    render(
      <Workspace
        panes={panes.map((pane) =>
          pane.id === "editor"
            ? { ...pane, collapsible: false, showHeader: false }
            : pane,
        )}
      />,
    );

    const editor = screen.getByTestId("workspace-pane-editor");
    expect(editor).toHaveTextContent("Source");
    expect(editor).not.toHaveTextContent("Editor");
    expect(editor.querySelector("header")).not.toBeInTheDocument();
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
    expect(screen.getByTestId("workspace-stack-sized").style.flexBasis).toBe(
      "",
    );
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

  it("holds the sides a host names collapsed, hiding their toggles, and keeps the layout it stores for their return", () => {
    const width = (side: string) =>
      screen
        .getByTestId(`workspace-region-${side}`)
        .style.getPropertyValue("--workspace-region-width");
    const { rerender } = render(<Workspace panes={panes} storageKey="held" />);
    fireEvent.click(screen.getByRole("button", { name: "Collapse Explorer" }));
    const stored = window.localStorage.getItem("held");

    rerender(
      <Workspace panes={panes} storageKey="held" collapsedSides={["left", "right"]} />,
    );
    const held = {
      widths: [width("left"), width("right")],
      panes: [screen.queryByText("Symbols"), screen.queryByText("Values")],
      toggles: screen.queryAllByRole("button", { name: /(left|right) side$/ }),
      stored: window.localStorage.getItem("held") === stored,
    };
    rerender(<Workspace panes={panes} storageKey="held" />);

    expect({
      held,
      returned: [width("left"), width("right"), screen.getByRole("button", { name: "Expand Explorer" }).tagName],
    }).toEqual({
      held: { widths: ["0px", "0px"], panes: [null, null], toggles: [], stored: true },
      returned: ["280px", "340px", "BUTTON"],
    });
  });

  it("keeps the stored layout of sides a host holds collapsed from the first render", () => {
    render(<Workspace panes={panes} storageKey="held" />);
    fireEvent.click(screen.getByRole("button", { name: "Collapse Explorer" }));
    const stored = window.localStorage.getItem("held");

    const { unmount } = render(
      <Workspace panes={panes} storageKey="held" collapsedSides={["left"]} />,
    );
    unmount();

    expect(window.localStorage.getItem("held")).toBe(stored);
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
      expect(() =>
        render(
          <Workspace
            panes={panes.map((pane) =>
              pane.id === "editor" ? { ...pane, showHeader: false } : pane,
            )}
          />,
        ),
      ).toThrow("headerless panes must not be collapsible");
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
              paneWidths: {},
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

  describe("side columns", () => {
    const EXPLORER_WIDTH = 240;
    const SOURCE_WIDTH = 400;
    const KEY_STEP = 16;
    const columnPanes: WorkspacePaneSpec[] = [
      {
        id: "explorer",
        label: "Explorer",
        location: "left",
        content: <div>Files</div>,
        width: EXPLORER_WIDTH,
      },
      {
        id: "source",
        label: "Source",
        location: "left",
        content: <div>Code</div>,
        width: SOURCE_WIDTH,
        minWidth: 200,
        maxWidth: 600,
      },
      { id: "page", label: "Page", location: "center", content: <div>Page</div> },
      {
        id: "variables",
        label: "Variables",
        location: "right",
        content: <div>Values</div>,
        width: 340,
      },
    ];
    const withoutSource = columnPanes.filter((pane) => pane.id !== "source");
    const columns = { left: "columns" } as const;
    const regionWidth = (side: string) =>
      screen
        .getByTestId(`workspace-region-${side}`)
        .style.getPropertyValue("--workspace-region-width");
    const paneWidth = (id: string) =>
      screen
        .getByTestId(`workspace-stack-${id}`)
        .style.getPropertyValue("--workspace-pane-width");
    const stackOrder = (side: string) =>
      Array.from(
        screen
          .getByTestId(`workspace-region-${side}`)
          .querySelectorAll("[data-testid^=workspace-stack-]"),
      ).map((node) => node.getAttribute("data-testid"));

    it("lays the panes of a columns side next to each other in pane order, each at its own width, and leaves other sides stacked", () => {
      render(<Workspace panes={columnPanes} sideArrangement={columns} />);

      expect({
        order: stackOrder("left"),
        widths: [paneWidth("explorer"), paneWidth("source")],
        left: [
          regionWidth("left"),
          screen.getByTestId("workspace-region-left").classList.contains("@3xl/workspace:flex-row"),
        ],
        right: [
          regionWidth("right"),
          screen.getByTestId("workspace-region-right").classList.contains("@3xl/workspace:flex-row"),
        ],
      }).toEqual({
        order: ["workspace-stack-explorer", "workspace-stack-source"],
        widths: [`${EXPLORER_WIDTH}px`, `${SOURCE_WIDTH}px`],
        left: [`${EXPLORER_WIDTH + SOURCE_WIDTH}px`, true],
        right: ["340px", false],
      });
    });

    it("keeps stacking with one shared width when no arrangement is given", () => {
      render(
        <Workspace
          panes={columnPanes.map((pane) =>
            pane.id === "source" ? { ...pane, width: EXPLORER_WIDTH } : pane,
          )}
        />,
      );

      expect({
        region: regionWidth("left"),
        flexRow: screen.getByTestId("workspace-region-left").classList.contains("@3xl/workspace:flex-row"),
        paneHandles: screen.queryAllByTestId(/^workspace-resize-pane-/),
        sideHandle: screen.queryByTestId("workspace-resize-left") !== null,
      }).toEqual({
        region: `${EXPLORER_WIDTH}px`,
        flexRow: false,
        paneHandles: [],
        sideHandle: true,
      });
    });

    it("allows panes of a columns side to differ in width, which a stacked side forbids", () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      try {
        expect(() => render(<Workspace panes={columnPanes} />)).toThrow("share one width");
        expect(() =>
          render(<Workspace panes={columnPanes} sideArrangement={columns} />),
        ).not.toThrow();
      } finally {
        consoleError.mockRestore();
      }
    });

    it("resizes one column by keyboard without moving the others, and remembers it by pane id", () => {
      const first = render(
        <Workspace panes={columnPanes} sideArrangement={columns} storageKey="columns" />,
      );
      const handle = screen.getByTestId("workspace-resize-pane-source");
      expect(handle).toHaveAttribute("aria-valuenow", `${SOURCE_WIDTH}`);
      fireEvent.keyDown(handle, { key: "ArrowRight" });
      expect({
        explorer: paneWidth("explorer"),
        source: paneWidth("source"),
        region: regionWidth("left"),
      }).toEqual({
        explorer: `${EXPLORER_WIDTH}px`,
        source: `${SOURCE_WIDTH + KEY_STEP}px`,
        region: `${EXPLORER_WIDTH + SOURCE_WIDTH + KEY_STEP}px`,
      });
      first.unmount();

      render(<Workspace panes={columnPanes} sideArrangement={columns} storageKey="columns" />);
      expect([paneWidth("explorer"), paneWidth("source")]).toEqual([
        `${EXPLORER_WIDTH}px`,
        `${SOURCE_WIDTH + KEY_STEP}px`,
      ]);
    });

    it("clamps a column to its own min and max width", () => {
      render(<Workspace panes={columnPanes} sideArrangement={columns} />);
      const handle = screen.getByTestId("workspace-resize-pane-source");

      fireEvent.keyDown(handle, { key: "End" });
      const widest = paneWidth("source");
      fireEvent.keyDown(handle, { key: "Home" });

      expect([widest, paneWidth("source")]).toEqual(["600px", "200px"]);
    });

    it("hands a pane that appears later its own default width and leaves resized siblings alone", () => {
      const { rerender } = render(<Workspace panes={withoutSource} sideArrangement={columns} />);
      fireEvent.keyDown(screen.getByTestId("workspace-resize-pane-explorer"), {
        key: "ArrowRight",
      });

      rerender(<Workspace panes={columnPanes} sideArrangement={columns} />);

      expect({
        explorer: paneWidth("explorer"),
        source: paneWidth("source"),
        region: regionWidth("left"),
      }).toEqual({
        explorer: `${EXPLORER_WIDTH + KEY_STEP}px`,
        source: `${SOURCE_WIDTH}px`,
        region: `${EXPLORER_WIDTH + KEY_STEP + SOURCE_WIDTH}px`,
      });
    });

    it("shrinks a collapsed column to a rail while the side toggle still collapses the whole side", () => {
      render(<Workspace panes={columnPanes} sideArrangement={columns} />);

      fireEvent.click(screen.getByRole("button", { name: "Collapse Explorer" }));
      const afterPane = [paneWidth("explorer"), regionWidth("left")];
      fireEvent.click(screen.getByRole("button", { name: "Collapse left side" }));

      expect({ afterPane, afterSide: regionWidth("left") }).toEqual({
        afterPane: ["40px", `${40 + SOURCE_WIDTH}px`],
        afterSide: "0px",
      });
    });

    it("offers no column handle for a non-resizable pane or a collapsed one", () => {
      render(
        <Workspace
          panes={columnPanes.map((pane) =>
            pane.id === "explorer" ? { ...pane, resizable: false } : pane,
          )}
          sideArrangement={columns}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Collapse Source" }));

      expect(screen.queryAllByTestId(/^workspace-resize-pane-/)).toEqual([]);
    });
  });

  describe("stored layout versions", () => {
    const stored = (version: number, state: Record<string, unknown>) =>
      window.localStorage.setItem("versioned", JSON.stringify({ version, state }));
    const base = {
      leftWidth: 300,
      rightWidth: 350,
      bottomHeight: 200,
      stackHeights: {},
      collapsed: {},
      sideCollapsed: { left: false, right: false },
    };

    it("reads a version 2 layout, which predates column widths, keeping its sizes", () => {
      stored(2, base);

      render(<Workspace panes={panes} storageKey="versioned" />);

      expect(
        screen
          .getByTestId("workspace-region-left")
          .style.getPropertyValue("--workspace-region-width"),
      ).toBe("300px");
    });

    it("warns and resets a layout whose column widths are not numbers", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      try {
        stored(3, { ...base, paneWidths: { explorer: "wide" } });

        render(<Workspace panes={panes} storageKey="versioned" />);

        expect({
          warned: warn.mock.calls.length,
          left: screen
            .getByTestId("workspace-region-left")
            .style.getPropertyValue("--workspace-region-width"),
          cleared: window.localStorage.getItem("versioned")?.includes("wide"),
        }).toEqual({ warned: 1, left: "280px", cleared: false });
      } finally {
        warn.mockRestore();
      }
    });
  });

  describe("top-right controls", () => {
    const withoutRight = panes.filter((pane) => pane.location !== "right");
    const header = (id: string) =>
      screen.getByTestId(`workspace-pane-${id}`).querySelector("header");
    const reserve = (container: HTMLElement) =>
      (
        container.querySelector("[data-slot=workspace]") as HTMLElement
      ).style.getPropertyValue("--workspace-top-right-reserve");

    it("keeps the center header clear of the controls at every width when no right pane is shown", () => {
      render(<Workspace panes={withoutRight} />);

      expect(header("editor")).toHaveClass(
        "pr-[var(--workspace-top-right-reserve,0px)]",
      );
    });

    it("hands the corner to the first right pane once the sides sit by side, and keeps the stacked center clear", () => {
      render(<Workspace panes={panes} />);

      expect({
        center: header("editor")?.className.match(
          /\S*top-right-reserve\S*|@3xl\/workspace:pr-2/g,
        ),
        right: header("variables")?.className.match(/\S*top-right-reserve\S*/g),
      }).toEqual({
        center: [
          "pr-[var(--workspace-top-right-reserve,0px)]",
          "@3xl/workspace:pr-2",
        ],
        right: ["@3xl/workspace:pr-[var(--workspace-top-right-reserve,0px)]"],
      });
    });

    it("publishes the measured width of the controls, with their inset, for the headers under them", () => {
      const measured = 64;
      const rect = vi
        .spyOn(HTMLElement.prototype, "getBoundingClientRect")
        .mockImplementation(function (this: HTMLElement) {
          return {
            width: this.dataset["testid"] === "workspace-top-right" ? measured : 0,
          } as DOMRect;
        });
      try {
        const { container } = render(<Workspace panes={withoutRight} />);

        expect(reserve(container)).toBe(`${measured + 8}px`);
      } finally {
        rect.mockRestore();
      }
    });

    it("reserves nothing when there are no controls", () => {
      const { container } = render(
        <Workspace
          panes={withoutRight.filter((pane) => pane.location !== "left")}
        />,
      );

      expect(reserve(container)).toBe("0px");
    });

    it("lets a crowded header wrap its trailing actions onto another row", () => {
      render(<Workspace panes={panes} />);

      expect(header("explorer")).toHaveClass("flex-wrap", "min-h-9");
    });
  });
});
