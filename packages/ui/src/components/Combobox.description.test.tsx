import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Combobox } from "./Combobox";

describe("Combobox option descriptions", () => {
  it("renders a multiline description while keeping the closed label compact", () => {
    render(
      <Combobox
        value="session-1"
        onChange={vi.fn()}
        options={[
          {
            value: "session-1",
            label: "deployment/acme",
            selectedLabel: "deployment/acme · acme-698c549d96-hlxqm",
            description: "acme · pod: acme-698c549d96-hlxqm\n:60995 · mcp :0",
          },
        ]}
        allowCustomValue={false}
      />,
    );

    const input = screen.getByRole("combobox");
    expect(input).toHaveValue("deployment/acme · acme-698c549d96-hlxqm");
    fireEvent.focus(input);

    const description = screen.getByText(/acme · pod:/);
    expect(description).toHaveTextContent(":60995 · mcp :0");
    expect(description.className).toContain("whitespace-pre-line");
  });

  it("filters options by their descriptions", () => {
    render(
      <Combobox
        value=""
        onChange={vi.fn()}
        options={[
          { value: "session-1", label: "deployment/acme", description: "pod: acme-698c" },
          { value: "session-2", label: "deployment/cycle", description: "pod: cycle-479f" },
        ]}
        allowCustomValue={false}
      />,
    );

    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "acme-698c" } });

    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option")).toHaveTextContent("deployment/acme");
  });
});
