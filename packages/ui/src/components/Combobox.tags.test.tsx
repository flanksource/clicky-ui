import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./Combobox";

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
