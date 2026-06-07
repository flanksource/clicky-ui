import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Combobox } from "./Combobox";

const OPTIONS = [
  { value: "PrimaryDB", label: "PrimaryDB" },
  { value: "ArchiveDB", label: "ArchiveDB" },
  { value: "IVS", label: "IVS" },
];

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
