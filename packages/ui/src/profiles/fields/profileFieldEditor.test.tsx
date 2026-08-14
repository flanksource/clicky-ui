import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { ProfileFieldEditorForm } from "./profileFieldEditor";
import { PROFILE_FIELD_TYPES } from "./profileFieldTypes";
import { profileFilterKindOptions, profileTypeOptions } from "./profileFieldIcons";

describe("ProfileFieldEditorForm CEL examples", () => {
  it("offers field-aware expressions and applies the selected example", () => {
    const onChange = vi.fn();
    render(
      <ProfileFieldEditorForm
        field={{ name: "duration_ms", type: "number" }}
        columns={1}
        onChange={onChange}
      />,
    );

    const examples = screen.getByRole("combobox", { name: "CEL examples" });

    expect(screen.getByRole("option", { name: "Read duration_ms" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Default duration_ms when missing" })).toBeInTheDocument();

    fireEvent.change(examples, { target: { value: "row.duration_ms / 1000.0" } });

    expect(onChange).toHaveBeenCalledWith({ cel: "row.duration_ms / 1000.0" });
  });

  it("uses bracket notation for field names that are not CEL identifiers", () => {
    const onChange = vi.fn();
    render(
      <ProfileFieldEditorForm
        field={{ name: "http.status-code" }}
        columns={1}
        onChange={onChange}
      />,
    );

    // Double-quoted, so the header, the browsed paths and the dialog's own
    // examples all quote a key the same way — and so escaping goes through
    // JSON.stringify rather than a hand-rolled replace that misses newlines.
    const examples = screen.getByRole("combobox", { name: "CEL examples" });
    fireEvent.change(examples, { target: { value: 'row["http.status-code"]' } });

    expect(onChange).toHaveBeenCalledWith({ cel: 'row["http.status-code"]' });

    fireEvent.change(examples, {
      target: { value: '"http.status-code" in row ? row["http.status-code"] : ""' },
    });

    expect(onChange).toHaveBeenLastCalledWith({
      cel: '"http.status-code" in row ? row["http.status-code"] : ""',
    });
  });
});

describe("ProfileFieldEditorForm enum controls", () => {
  it("offers each enum as a combobox that clears back to the inferred value", () => {
    const onChange = vi.fn();
    render(
      <ProfileFieldEditorForm
        field={{ name: "duration_ms", type: "number" }}
        columns={1}
        onChange={onChange}
      />,
    );

    for (const name of ["Data type", "Role", "Format", "Unit", "Filter type"]) {
      expect(screen.getByRole("combobox", { name })).toBeInTheDocument();
    }

    fireEvent.focus(screen.getByRole("combobox", { name: "Data type" }));
    fireEvent.mouseDown(screen.getByRole("option", { name: "duration" }));
    expect(onChange).toHaveBeenLastCalledWith({ type: "duration" });
  });

  it("gives every declared type and filter kind a glyph, so no option renders bare", () => {
    expect(
      profileTypeOptions
        .filter((option) => !option.icon)
        .map((option) => option.value),
    ).toEqual([]);
    expect(profileTypeOptions.map((option) => option.value)).toEqual([
      ...PROFILE_FIELD_TYPES,
    ]);
    expect(
      profileFilterKindOptions
        .filter((option) => !option.icon)
        .map((option) => option.value),
    ).toEqual([]);
  });
});

describe("ProfileFieldEditorForm CEL editor", () => {
  it("offers the expression playground beside the field, not only on schema-rendered forms", () => {
    const onChange = vi.fn();
    render(
      // The dialog evaluates through react-query, as every sampling surface in
      // the editor does; the route mounts inside the host's provider.
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <ProfileFieldEditorForm
          field={{ name: "duration_ms", type: "number" }}
          columns={1}
          onChange={onChange}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Test" }));

    // The dialog names the column it is testing, and carries the playground's
    // own controls rather than just a second copy of the input.
    expect(screen.getByText("Expression — duration_ms")).toBeInTheDocument();
    expect(screen.getByText("In scope")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply" })).toBeInTheDocument();
  });
});

describe("ProfileFieldEditorForm filter toggle", () => {
  const renderFilterEditor = (field: Parameters<typeof ProfileFieldEditorForm>[0]["field"]) => {
    const onChange = vi.fn();
    render(<ProfileFieldEditorForm field={field} columns={1} onChange={onChange} />);
    return { onChange, toggle: screen.getByRole("checkbox", { name: /^Filter/ }) };
  };

  it("defaults on and shows the filter options", () => {
    const { toggle } = renderFilterEditor({ name: "status", type: "string" });

    expect(toggle).toBeChecked();
    expect(screen.getByRole("combobox", { name: "Filter type" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Backend field" })).toBeInTheDocument();
  });

  it("hides the filter options when switched off", () => {
    const { onChange, toggle } = renderFilterEditor({ name: "status", type: "string" });

    fireEvent.click(toggle);

    expect(onChange).toHaveBeenCalledWith({ filter: { disabled: true } });
  });

  it("renders a disabled filter with only the toggle and turns it back on", () => {
    const { onChange, toggle } = renderFilterEditor({
      name: "status",
      type: "string",
      filter: { disabled: true },
    });

    expect(toggle).not.toBeChecked();
    expect(screen.queryByRole("combobox", { name: "Filter type" })).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Backend field" })).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(onChange).toHaveBeenCalledWith({ filter: undefined });
  });
});
