import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Combobox } from "./Combobox";

const OPTIONS = [
  { value: "PrimaryDB", label: "PrimaryDB" },
  { value: "ArchiveDB", label: "ArchiveDB" },
  { value: "IVS", label: "IVS" },
];

describe("Combobox sizing", () => {
  it("uses the density control height when size is unset", () => {
    render(<Combobox value="" onChange={vi.fn()} options={OPTIONS} />);
    const input = screen.getByRole("combobox");
    expect(input.className).toContain("h-control-h");
    expect(input.className).toContain("px-control-px");
    expect(input.className).toContain("text-sm");
  });

  it("uses explicit form size classes when size is set", () => {
    render(<Combobox value="" onChange={vi.fn()} options={OPTIONS} size="sm" />);
    const input = screen.getByRole("combobox");
    expect(input.className).toContain("h-8");
    expect(input.className).not.toContain("h-control-h");
  });
});

describe("Combobox clear button", () => {
  it("shows a clear button when a value is set", () => {
    render(<Combobox value="PrimaryDB" onChange={vi.fn()} options={OPTIONS} />);
    expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
  });

  it("hides the clear button when the value is empty", () => {
    render(<Combobox value="" onChange={vi.fn()} options={OPTIONS} />);
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });

  it("clears the value and input when clicked", () => {
    const onChange = vi.fn();
    render(<Combobox value="PrimaryDB" onChange={onChange} options={OPTIONS} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith("");
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("hides the clear button when required, even with a value", () => {
    render(<Combobox value="PrimaryDB" onChange={vi.fn()} options={OPTIONS} required />);
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });

  it("hides the clear button while loading", () => {
    render(<Combobox value="PrimaryDB" onChange={vi.fn()} options={OPTIONS} loading />);
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });
});

describe("Combobox does not force the first item", () => {
  it("commits the typed free text on Enter rather than the first option", () => {
    const onChange = vi.fn();
    render(<Combobox value="" onChange={onChange} options={OPTIONS} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Arch" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("Arch");
    expect(onChange).not.toHaveBeenCalledWith("ArchiveDB");
  });

  it("does not highlight any option when the list opens", () => {
    render(<Combobox value="" onChange={vi.fn()} options={OPTIONS} id="db" />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    expect(input).not.toHaveAttribute("aria-activedescendant");
  });
});

describe("Combobox type-ahead", () => {
  it("shows the selected label while closed and an empty filter when opened", () => {
    render(<Combobox value="PrimaryDB" onChange={vi.fn()} options={OPTIONS} />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("PrimaryDB");
    fireEvent.focus(input);
    expect(input).toHaveValue("");
  });

  it("lists every option on open regardless of the selected value", () => {
    render(<Combobox value="PrimaryDB" onChange={vi.fn()} options={OPTIONS} />);
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(OPTIONS.length);
  });

  it("filters by the typed query only, not the selected value", () => {
    render(<Combobox value="PrimaryDB" onChange={vi.fn()} options={OPTIONS} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "archive" } });
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("ArchiveDB");
  });

  it("allows type-ahead filtering when required", () => {
    const onChange = vi.fn();
    render(<Combobox value="PrimaryDB" onChange={onChange} options={OPTIONS} required />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    expect(input).toHaveValue("");
    fireEvent.change(input, { target: { value: "IVS" } });
    const option = screen.getByRole("option", { name: "IVS" });
    fireEvent.mouseDown(option);
    expect(onChange).toHaveBeenCalledWith("IVS");
  });

  it("reverts to the selected label when closed without choosing", () => {
    render(<Combobox value="PrimaryDB" onChange={vi.fn()} options={OPTIONS} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "xyz" } });
    fireEvent.keyDown(input, { key: "Escape" });
    expect(input).toHaveValue("PrimaryDB");
  });
});

describe("Combobox strict mode (allowCustomValue=false)", () => {
  it("does not commit unmatched typed text on Enter", () => {
    const onChange = vi.fn();
    render(<Combobox value="" onChange={onChange} options={OPTIONS} allowCustomValue={false} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "Arch" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("reverts to the selected label after typing unmatched text and closing", () => {
    render(
      <Combobox value="PrimaryDB" onChange={vi.fn()} options={OPTIONS} allowCustomValue={false} />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "zzz" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input).toHaveValue("PrimaryDB");
  });

  it("still allows selecting an option from the list", () => {
    const onChange = vi.fn();
    render(<Combobox value="" onChange={onChange} options={OPTIONS} allowCustomValue={false} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.mouseDown(screen.getByRole("option", { name: "ArchiveDB" }));
    expect(onChange).toHaveBeenCalledWith("ArchiveDB");
  });
});

describe("Combobox multiple", () => {
  it("toggles values into and out of the array, keeping the menu open", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Combobox multiple value={[]} onChange={onChange} options={OPTIONS} allowCustomValue={false} />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);

    fireEvent.mouseDown(screen.getByRole("option", { name: "PrimaryDB" }));
    expect(onChange).toHaveBeenLastCalledWith(["PrimaryDB"]);

    rerender(
      <Combobox
        multiple
        value={["PrimaryDB"]}
        onChange={onChange}
        options={OPTIONS}
        allowCustomValue={false}
      />,
    );
    // Menu stays open after a toggle, so options are still rendered.
    fireEvent.mouseDown(screen.getByRole("option", { name: "IVS" }));
    expect(onChange).toHaveBeenLastCalledWith(["PrimaryDB", "IVS"]);

    rerender(
      <Combobox
        multiple
        value={["PrimaryDB", "IVS"]}
        onChange={onChange}
        options={OPTIONS}
        allowCustomValue={false}
      />,
    );
    fireEvent.mouseDown(screen.getByRole("option", { name: "PrimaryDB" }));
    expect(onChange).toHaveBeenLastCalledWith(["IVS"]);
  });

  it("summarizes the selection when closed", () => {
    const { rerender } = render(
      <Combobox multiple value={["PrimaryDB", "ArchiveDB"]} onChange={vi.fn()} options={OPTIONS} />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("PrimaryDB, ArchiveDB");

    rerender(
      <Combobox
        multiple
        value={["PrimaryDB", "ArchiveDB", "IVS"]}
        onChange={vi.fn()}
        options={OPTIONS}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("3 selected");
  });

  it("clears the whole array via the clear button", () => {
    const onChange = vi.fn();
    render(<Combobox multiple value={["PrimaryDB", "IVS"]} onChange={onChange} options={OPTIONS} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it("marks selected options with aria-selected", () => {
    render(<Combobox multiple value={["IVS"]} onChange={vi.fn()} options={OPTIONS} />);
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "IVS" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "PrimaryDB" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });
});

describe("Combobox dropdown portal", () => {
  it("renders the open listbox outside the component root so a dialog's overflow cannot clip it", () => {
    render(
      <div data-testid="container">
        <Combobox value="" onChange={vi.fn()} options={OPTIONS} />
      </div>,
    );
    fireEvent.focus(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    const container = screen.getByTestId("container");
    expect(container.contains(listbox)).toBe(false);
    expect(document.body.contains(listbox)).toBe(true);
  });

  it("keeps the menu open and selects when an option in the portal is clicked", () => {
    const onChange = vi.fn();
    render(<Combobox value="" onChange={onChange} options={OPTIONS} />);
    fireEvent.focus(screen.getByRole("combobox"));
    const option = screen.getByRole("option", { name: "ArchiveDB" });
    fireEvent.mouseDown(option);
    expect(onChange).toHaveBeenCalledWith("ArchiveDB");
  });

  it("sizes the menu to the input width as a minimum and caps growth at 400px", () => {
    const INPUT_WIDTH = 220;
    const anchorRect = {
      width: INPUT_WIDTH,
      height: 32,
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: INPUT_WIDTH,
      bottom: 32,
      toJSON: () => ({}),
    } as DOMRect;
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue(anchorRect);
    // Wide viewport so the 400px cap is the binding constraint, not the edge.
    const originalInnerWidth = window.innerWidth;
    Object.defineProperty(window, "innerWidth", { value: 1600, configurable: true });

    render(<Combobox value="" onChange={vi.fn()} options={OPTIONS} />);
    fireEvent.focus(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");

    expect(listbox.style.minWidth).toBe(`${INPUT_WIDTH}px`);
    expect(listbox.style.maxWidth).toBe("400px");
    // No fixed width — the menu grows to fit content between the two bounds.
    expect(listbox.style.width).toBe("");

    rectSpy.mockRestore();
    Object.defineProperty(window, "innerWidth", {
      value: originalInnerWidth,
      configurable: true,
    });
  });
});

describe("Combobox inline label", () => {
  it("renders the label and uses it as the input's accessible name", () => {
    render(<Combobox label="Database" value="" onChange={vi.fn()} options={OPTIONS} />);
    expect(screen.getByRole("combobox", { name: "Database" })).toBeInTheDocument();
  });
});

describe("Combobox option icons", () => {
  it("renders an option's ReactNode icon before its label in the list", () => {
    const options = [
      { value: "aws", label: "AWS", icon: <span data-testid="aws-icon">★</span> },
      { value: "gcp", label: "GCP" },
    ];
    render(<Combobox value="" onChange={vi.fn()} options={options} />);
    fireEvent.focus(screen.getByRole("combobox"));
    const awsOption = screen.getByRole("option", { name: /AWS/ });
    expect(awsOption.querySelector('[data-testid="aws-icon"]')).not.toBeNull();
    const gcpOption = screen.getByRole("option", { name: /GCP/ });
    expect(gcpOption.querySelector('[data-testid="aws-icon"]')).toBeNull();
  });

  it("shows the selected option's icon in the closed trigger", () => {
    render(
      <Combobox
        value="a"
        onChange={vi.fn()}
        options={[
          { value: "a", label: "Alpha", icon: <span data-testid="sel-icon">★</span> },
          { value: "b", label: "Beta" },
        ]}
      />,
    );
    // Closed (not focused): the list isn't rendered, so this icon is the trigger's.
    expect(screen.getByTestId("sel-icon")).toBeInTheDocument();
  });

  it("prefers an explicit prefix over the selected option's icon", () => {
    render(
      <Combobox
        value="a"
        onChange={vi.fn()}
        prefix={<span data-testid="explicit-prefix">P</span>}
        options={[
          { value: "a", label: "Alpha", icon: <span data-testid="auto-icon">★</span> },
        ]}
      />,
    );
    expect(screen.getByTestId("explicit-prefix")).toBeInTheDocument();
    expect(screen.queryByTestId("auto-icon")).not.toBeInTheDocument();
  });
});

describe("Combobox group headers", () => {
  const GROUPED = [
    { value: "demo-svc", label: "demo-svc", group: "Service" },
    { value: "db-svc", label: "db-svc", group: "Service" },
    { value: "demo-ing", label: "demo-ing", group: "Ingress" },
  ];

  it("renders a section header above the first option of each group", () => {
    render(<Combobox value="" onChange={vi.fn()} options={GROUPED} />);
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByText("Service")).toBeInTheDocument();
    expect(screen.getByText("Ingress")).toBeInTheDocument();
    // One header per group, not one per option.
    expect(screen.getAllByText("Service")).toHaveLength(1);
  });

  it("renders headers as presentation rows, never as selectable options", () => {
    render(<Combobox value="" onChange={vi.fn()} options={GROUPED} />);
    fireEvent.focus(screen.getByRole("combobox"));
    // Headers are not options: the option count equals the data length.
    expect(screen.getAllByRole("option")).toHaveLength(GROUPED.length);
    expect(screen.queryByRole("option", { name: "Service" })).toBeNull();
    expect(screen.getByText("Service").getAttribute("role")).toBe("presentation");
  });

  it("hides a group's header when filtering removes all its options", () => {
    render(<Combobox value="" onChange={vi.fn()} options={GROUPED} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "ing" } });
    // Only the Ingress option survives, so the Service header is gone.
    expect(screen.queryByText("Service")).toBeNull();
    expect(screen.getByText("Ingress")).toBeInTheDocument();
  });
});

describe("Combobox tristate", () => {
  const openTristate = (
    value: Record<string, "include" | "exclude">,
    onChange = vi.fn(),
    extra: Partial<Parameters<typeof Combobox>[0]> = {},
  ) => {
    const view = render(
      <Combobox
        multiple
        tristate
        value={value}
        onChange={onChange}
        options={OPTIONS}
        allowCustomValue={false}
        {...extra}
      />,
    );
    fireEvent.focus(screen.getByRole("combobox"));
    return { view, onChange };
  };

  it("cycles include -> exclude -> neutral on row click, deleting the key on neutral", () => {
    const onChange = vi.fn();
    const { view } = openTristate({}, onChange);
    const row = screen.getByRole("option", { name: "ArchiveDB" });
    fireEvent.mouseDown(row);
    fireEvent.click(row);
    expect(onChange).toHaveBeenLastCalledWith({ ArchiveDB: "include" });

    view.rerender(
      <Combobox
        multiple
        tristate
        value={{ ArchiveDB: "include" }}
        onChange={onChange}
        options={OPTIONS}
        allowCustomValue={false}
      />,
    );
    const included = screen.getByRole("option", { name: /ArchiveDB/ });
    fireEvent.mouseDown(included);
    fireEvent.click(included);
    expect(onChange).toHaveBeenLastCalledWith({ ArchiveDB: "exclude" });

    view.rerender(
      <Combobox
        multiple
        tristate
        value={{ ArchiveDB: "exclude" }}
        onChange={onChange}
        options={OPTIONS}
        allowCustomValue={false}
      />,
    );
    const excluded = screen.getByRole("option", { name: /ArchiveDB/ });
    fireEvent.mouseDown(excluded);
    fireEvent.click(excluded);
    expect(onChange).toHaveBeenLastCalledWith({});
  });

  it("applies exactly one transition when a tristate region is clicked", () => {
    const onChange = vi.fn();
    openTristate({}, onChange);
    const row = screen.getByRole("option", { name: "IVS" });
    const excludeRegion = row.querySelector('[data-tristate-region="exclude"]')!;
    // Browser sequence: mousedown bubbles to the row first, then click on the region.
    fireEvent.mouseDown(excludeRegion);
    fireEvent.click(excludeRegion);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({ IVS: "exclude" });
  });

  it("cycles the highlighted row on Enter without closing the menu", () => {
    const onChange = vi.fn();
    openTristate({}, onChange);
    const input = screen.getByRole("combobox");
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith({ PrimaryDB: "include" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("exposes no focusable element inside option rows", () => {
    openTristate({ ArchiveDB: "include" });
    for (const option of screen.getAllByRole("option")) {
      expect(option.querySelector("button")).toBeNull();
      const focusables = option.querySelectorAll("[tabindex]");
      for (const el of focusables) {
        expect(Number(el.getAttribute("tabindex"))).toBeLessThan(0);
      }
    }
  });

  it("announces the mode in the option accessible name and aria-selected", () => {
    openTristate({ ArchiveDB: "include", IVS: "exclude" });
    expect(screen.getByRole("option", { name: "ArchiveDB, included" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: "IVS, excluded" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("option", { name: "PrimaryDB" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("summarizes include/exclude counts while closed and empties for no selection", () => {
    const { rerender } = render(
      <Combobox
        multiple
        tristate
        value={{ PrimaryDB: "include", ArchiveDB: "include", IVS: "exclude" }}
        onChange={vi.fn()}
        options={OPTIONS}
      />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("+2 -1");

    rerender(
      <Combobox multiple tristate value={{}} onChange={vi.fn()} options={OPTIONS} />,
    );
    expect(screen.getByRole("combobox")).toHaveValue("");
  });

  it("clears the whole record via the clear button", () => {
    const onChange = vi.fn();
    render(
      <Combobox
        multiple
        tristate
        value={{ PrimaryDB: "include" }}
        onChange={onChange}
        options={OPTIONS}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith({});
  });

  it("keeps the typed query after toggling an option", () => {
    const onChange = vi.fn();
    openTristate({}, onChange);
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "archive" } });
    const row = screen.getByRole("option", { name: "ArchiveDB" });
    fireEvent.mouseDown(row);
    fireEvent.click(row);
    expect(onChange).toHaveBeenCalledWith({ ArchiveDB: "include" });
    expect(input).toHaveValue("archive");
  });

  it("renders the footer below the option rows", () => {
    openTristate({}, vi.fn(), { footer: <span>… and 247 more</span> });
    expect(screen.getByRole("listbox")).toHaveTextContent("… and 247 more");
  });

  it("renders option titles as row tooltips", () => {
    render(
      <Combobox
        multiple
        tristate
        value={{}}
        onChange={vi.fn()}
        options={[{ value: "IVS", label: "IVS", title: "Investment service" }]}
      />,
    );
    fireEvent.focus(screen.getByRole("combobox"));
    expect(screen.getByRole("option", { name: "IVS" })).toHaveAttribute(
      "title",
      "Investment service",
    );
  });

  it("adds a typed custom value as include via the keyboard-reachable add row", () => {
    const onChange = vi.fn();
    render(
      <Combobox
        multiple
        tristate
        value={{}}
        onChange={onChange}
        options={OPTIONS}
        allowCustomValue
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "custom-*" } });

    const addRow = screen.getByRole("option", { name: /Add "custom-\*"/ });
    expect(addRow).toHaveAttribute("data-filter-add-custom", "custom-*");

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith({ "custom-*": "include" });
  });
});

describe("Combobox multiple keeps the query after a toggle", () => {
  it("does not reset the typed query when an option is toggled", () => {
    const onChange = vi.fn();
    render(
      <Combobox multiple value={[]} onChange={onChange} options={OPTIONS} allowCustomValue={false} />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "archive" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: "ArchiveDB" }));
    expect(onChange).toHaveBeenCalledWith(["ArchiveDB"]);
    expect(input).toHaveValue("archive");
  });
});

describe("Combobox onSearch (server-side)", () => {
  it("debounces onSearch and fires once with the typed query", () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<Combobox value="" onChange={vi.fn()} options={[]} onSearch={onSearch} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "smi" } });
    fireEvent.change(input, { target: { value: "smith" } });

    // Before the debounce window elapses, no call.
    vi.advanceTimersByTime(200);
    expect(onSearch).not.toHaveBeenCalledWith("smith");

    vi.advanceTimersByTime(100);
    expect(onSearch).toHaveBeenLastCalledWith("smith");
    vi.useRealTimers();
  });

  it("renders provided options as-is without client-side filtering when onSearch is set", () => {
    // The server already filtered; even a typed query must not narrow the list.
    render(
      <Combobox
        value=""
        onChange={vi.fn()}
        options={[{ value: "Smithson", label: "Smithson" }]}
        onSearch={vi.fn()}
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "zzz" } });
    // "zzz" matches nothing client-side, but the server-provided option stays.
    expect(screen.getByRole("option")).toHaveTextContent("Smithson");
  });

  it("keeps an already-selected value visible when it is absent from the search results", () => {
    // "Jones" was selected earlier; the current results (Smithson) don't include
    // it, but it must still render so the user can unselect it.
    render(
      <Combobox
        multiple
        value={["Jones"]}
        onChange={vi.fn()}
        options={[{ value: "Smithson", label: "Smithson" }]}
        onSearch={vi.fn()}
        allowCustomValue={false}
      />,
    );
    fireEvent.focus(screen.getByRole("combobox"));
    const options = screen.getAllByRole("option");
    const labels = options.map((o) => o.textContent);
    expect(labels).toContain("Jones");
    expect(labels).toContain("Smithson");
    // The pinned selection is marked selected.
    expect(screen.getByRole("option", { name: /Jones/ })).toHaveAttribute("aria-selected", "true");
  });
});
