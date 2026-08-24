import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { ProfileFieldEditorForm } from "./profileFieldEditor";
import { PROFILE_FIELD_TYPES } from "./profileFieldTypes";
import {
  profileFilterKindOptions,
  profileTypeOptions,
} from "./profileFieldIcons";

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

    expect(
      screen.getByRole("option", { name: "Read duration_ms" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Default duration_ms when missing" }),
    ).toBeInTheDocument();

    fireEvent.change(examples, {
      target: { value: "row.duration_ms / 1000.0" },
    });

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
    fireEvent.change(examples, {
      target: { value: 'row["http.status-code"]' },
    });

    expect(onChange).toHaveBeenCalledWith({ cel: 'row["http.status-code"]' });

    fireEvent.change(examples, {
      target: {
        value: '"http.status-code" in row ? row["http.status-code"] : ""',
      },
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

    for (const name of ["Data type", "Role", "Format", "Unit"]) {
      expect(screen.getByRole("combobox", { name })).toBeInTheDocument();
    }

    fireEvent.focus(screen.getByRole("combobox", { name: "Data type" }));
    fireEvent.mouseDown(screen.getByRole("option", { name: "duration" }));
    expect(onChange).toHaveBeenLastCalledWith({ type: "duration" });
  });

  it("types a field as datetime when the timestamp role is chosen", () => {
    // The timestamp role names the column the table's date-range control reads.
    // Leaving the type behind renders the cell as whatever it was — a raw
    // string — under a header the table treats as time.
    const onChange = vi.fn();
    render(
      <ProfileFieldEditorForm
        field={{ name: "created_at" }}
        columns={1}
        onChange={onChange}
      />,
    );

    fireEvent.focus(screen.getByRole("combobox", { name: "Role" }));
    fireEvent.mouseDown(screen.getByRole("option", { name: "Timestamp" }));
    expect(onChange).toHaveBeenLastCalledWith({
      kind: "timestamp",
      type: "datetime",
    });
  });

  it("leaves the type alone for the roles that only say how a cell renders", () => {
    const onChange = vi.fn();
    render(
      <ProfileFieldEditorForm
        field={{ name: "level", type: "string" }}
        columns={1}
        onChange={onChange}
      />,
    );

    fireEvent.focus(screen.getByRole("combobox", { name: "Role" }));
    fireEvent.mouseDown(screen.getByRole("option", { name: "Status" }));
    expect(onChange).toHaveBeenLastCalledWith({ kind: "status" });
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
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
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

describe("ProfileFieldEditorForm filter segments", () => {
  const renderSegments = (
    field: Parameters<typeof ProfileFieldEditorForm>[0]["field"],
  ) => {
    const onChange = vi.fn();
    const rendered = render(
      <ProfileFieldEditorForm field={field} columns={1} onChange={onChange} />,
    );
    return {
      onChange,
      rerender: (next: typeof field) =>
        rendered.rerender(
          <ProfileFieldEditorForm
            field={next}
            columns={1}
            onChange={onChange}
          />,
        ),
    };
  };

  it("puts the filter type control before the output name", () => {
    renderSegments({ name: "message", type: "string" });

    const filter = screen.getByRole("radiogroup", { name: "Filter type" });
    const output = screen.getByRole("textbox", { name: "Output name" });
    expect(
      filter.compareDocumentPosition(output) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).not.toBe(0);
  });

  it("offers icon segments for auto, off and every concrete filter kind", () => {
    renderSegments({ name: "message", type: "string" });

    for (const name of [
      "Auto",
      "Off",
      "Value list",
      "Exact match",
      "Text search",
      "Numeric range",
      "Duration range",
      "Date range",
      "Date & time range",
      "Boolean",
    ]) {
      expect(screen.getByRole("radio", { name })).toBeInTheDocument();
    }
  });

  it("changes type directly and shows only applicable options", () => {
    const { onChange, rerender } = renderSegments({
      name: "message",
      type: "string",
    });

    fireEvent.click(screen.getByRole("radio", { name: "Text search" }));
    expect(onChange).toHaveBeenLastCalledWith({ filter: { kind: "text" } });
    rerender({ name: "message", type: "string", filter: { kind: "text" } });
    expect(
      screen.getByRole("textbox", { name: "Backend field" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("textbox", { name: "Values" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("spinbutton", { name: "Values offered" }),
    ).not.toBeInTheDocument();
  });

  it("disables in one click while retaining the prior filter configuration", () => {
    const { onChange } = renderSegments({
      name: "tenant",
      type: "string",
      filter: { kind: "terms", limit: 12 },
    });

    fireEvent.click(screen.getByRole("radio", { name: "Off" }));
    expect(onChange).toHaveBeenLastCalledWith({
      filter: { kind: "terms", limit: 12, disabled: true },
    });
  });
});
