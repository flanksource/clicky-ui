import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox, type ComboboxTriStateMode } from "./Combobox";

const OPTIONS = [
  { value: "PrimaryDB", label: "PrimaryDB" },
  { value: "ArchiveDB", label: "ArchiveDB" },
  { value: "IVS", label: "IVS" },
];

describe("Combobox tags variant", () => {
  it("renders every selected label as a removable pill", () => {
    const onChange = vi.fn();
    render(
      <Combobox
        multiple
        variant="tags"
        value={["PrimaryDB", "ArchiveDB", "custom-db"]}
        onChange={onChange}
        options={[
          {
            value: "PrimaryDB",
            label: "Primary database",
            selectedLabel: "Primary",
          },
          { value: "ArchiveDB", label: "ArchiveDB" },
        ]}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(screen.getByText("Primary")).toBeInTheDocument();
    expect(screen.getByText("ArchiveDB")).toBeInTheDocument();
    expect(screen.getByText("custom-db")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Remove ArchiveDB" }));
    expect(onChange).toHaveBeenCalledWith(["PrimaryDB", "custom-db"]);
  });

  it("removes the last pill with Backspace when the query is empty", () => {
    const onChange = vi.fn();
    render(
      <Combobox
        multiple
        variant="tags"
        value={["PrimaryDB", "ArchiveDB"]}
        onChange={onChange}
        options={OPTIONS}
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith(["PrimaryDB"]);

    fireEvent.change(input, { target: { value: "pri" } });
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("keeps the pills visible while the inline input searches", () => {
    render(
      <Combobox
        multiple
        variant="tags"
        value={["PrimaryDB", "custom-db"]}
        onChange={vi.fn()}
        options={OPTIONS}
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "archive" } });
    expect(screen.getByText("PrimaryDB")).toBeInTheDocument();
    expect(screen.getByText("custom-db")).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "ArchiveDB" }),
    ).toBeInTheDocument();
  });

  it("omits pill removal controls when disabled", () => {
    render(
      <Combobox
        multiple
        variant="tags"
        value={["PrimaryDB"]}
        onChange={vi.fn()}
        options={OPTIONS}
        disabled
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Remove PrimaryDB" }),
    ).not.toBeInTheDocument();
  });
});

// `separators` is what lets a tag list be typed or pasted the way people write
// one — comma-separated — instead of one Enter at a time.
describe("Combobox tags variant, separators", () => {
  function renderWithSeparators(value: string[] = []) {
    const onChange = vi.fn();
    render(
      <Combobox
        multiple
        variant="tags"
        separators={[","]}
        value={value}
        onChange={onChange}
        options={OPTIONS}
      />,
    );
    return { onChange, input: screen.getByRole("combobox") };
  }

  it("commits the typed text on a separator key", () => {
    const { onChange, input } = renderWithSeparators(["PrimaryDB"]);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "custom-db" } });
    fireEvent.keyDown(input, { key: "," });
    expect(onChange).toHaveBeenCalledWith(["PrimaryDB", "custom-db"]);
    expect(input).toHaveValue("");
  });

  it("splits pasted text on separators and newlines, in one commit", () => {
    const { onChange, input } = renderWithSeparators();
    fireEvent.paste(input, {
      clipboardData: { getData: () => "IVS, ArchiveDB\ncustom-db" },
    });
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(["IVS", "ArchiveDB", "custom-db"]);
  });

  it("drops blanks and values already selected", () => {
    const { onChange, input } = renderWithSeparators(["IVS"]);
    fireEvent.paste(input, {
      clipboardData: { getData: () => "IVS,, ArchiveDB ,ArchiveDB," },
    });
    expect(onChange).toHaveBeenCalledWith(["IVS", "ArchiveDB"]);
  });

  it("leaves an ordinary paste alone", () => {
    const { onChange, input } = renderWithSeparators();
    fireEvent.paste(input, { clipboardData: { getData: () => "ArchiveDB" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores separators when custom values are not allowed", () => {
    const onChange = vi.fn();
    render(
      <Combobox
        multiple
        variant="tags"
        separators={[","]}
        allowCustomValue={false}
        value={[]}
        onChange={onChange}
        options={OPTIONS}
      />,
    );
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "nope" } });
    fireEvent.keyDown(input, { key: "," });
    expect(onChange).not.toHaveBeenCalled();
  });
});

// Tristate keeps a mode per value rather than a list, so its pills have to say
// WHICH mode — and removing one means "back to neutral", not "splice a list".
describe("Combobox tags variant, tristate", () => {
  const MODES: Record<string, ComboboxTriStateMode> = {
    PrimaryDB: "include",
    ArchiveDB: "exclude",
  };

  function renderTriState(value = MODES) {
    const onChange = vi.fn();
    render(
      <Combobox
        multiple
        tristate
        variant="tags"
        value={value}
        onChange={onChange}
        options={OPTIONS}
      />,
    );
    return { onChange };
  }

  it("renders one pill per value, marked with its mode", () => {
    renderTriState();
    expect(screen.getByTitle("PrimaryDB included")).toBeInTheDocument();
    expect(screen.getByTitle("ArchiveDB excluded")).toBeInTheDocument();
    // The summary the non-tags tristate shows instead.
    expect(screen.queryByDisplayValue("+1 -1")).not.toBeInTheDocument();
  });

  it("flips a pill between include and exclude", () => {
    const { onChange } = renderTriState();
    fireEvent.click(screen.getByTitle("PrimaryDB included"));
    expect(onChange).toHaveBeenCalledWith({
      PrimaryDB: "exclude",
      ArchiveDB: "exclude",
    });
  });

  it("returns a value to neutral when its pill is removed", () => {
    const { onChange } = renderTriState();
    fireEvent.click(screen.getByRole("button", { name: "Remove ArchiveDB" }));
    expect(onChange).toHaveBeenCalledWith({ PrimaryDB: "include" });
  });

  it("drops the last mode with Backspace on an empty query", () => {
    const { onChange } = renderTriState();
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(onChange).toHaveBeenCalledWith({ PrimaryDB: "include" });
  });

  it("clears every mode at once", () => {
    const { onChange } = renderTriState();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onChange).toHaveBeenCalledWith({});
  });
});
