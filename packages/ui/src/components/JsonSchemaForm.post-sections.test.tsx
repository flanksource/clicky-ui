import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject, JsonSchemaProperty, PostExtension } from "./json-schema-form-types";

// A post extension decorates a field's label wherever that label renders:
// an inline row, a section header (objects, tables, accordions, cards) and a
// table column header, which is its column's label.

const lineage: PostExtension = (field, { label, value }) => ({
  label: (
    <>
      {label}
      <span data-testid={`lineage-${field.key}`}>lineage</span>
    </>
  ),
  value: (
    <>
      {value}
      <span data-testid={`value-note-${field.key}`}>note</span>
    </>
  ),
});

const rate: JsonSchemaProperty = { type: "number", title: "Rate" };
const items: JsonSchemaProperty = { type: "object", properties: { Term: { type: "integer", title: "Term" }, Rate: rate } };

function headingRow(label: string): HTMLElement {
  const row = screen.getByText(label).closest<HTMLElement>("[data-jsf-section-heading]");
  if (!row) throw new Error(`"${label}" is not in a section heading`);
  return row;
}

function renderGroups(group: JsonSchemaProperty) {
  const schema: JsonSchemaObject = { type: "object", required: ["Group"], properties: { Group: { title: "Loan terms", ...group } } };
  return render(
    <JsonSchemaForm
      schema={schema}
      value={{ Group: [{ Term: 12, Rate: 4.5 }] }}
      onChange={vi.fn()}
      post={[lineage]}
      showPreferencesMenu={false}
    />,
  );
}

describe("post extensions on section and column labels", () => {
  it("renders a table array's label decoration in its section header, keeping one required marker", () => {
    renderGroups({ type: "array", "x-layout": "table", items });
    const header = headingRow("Loan terms");
    expect(within(header).getByTestId("lineage-Group")).toBeInTheDocument();
    expect(within(header).getAllByText("*")).toHaveLength(1);
  });

  it("renders the decoration on each column header, as that column's label, without the value adornment", () => {
    renderGroups({ type: "array", "x-layout": "table", items });
    const headers = within(screen.getByRole("table")).getAllByRole("columnheader");
    expect(within(headers[0]!).getByTestId("lineage-Term")).toBeInTheDocument();
    expect(within(headers[1]!).getByTestId("lineage-Rate")).toBeInTheDocument();
    expect(within(screen.getByRole("table").querySelector("thead")!).queryByText("note")).toBeNull();
  });

  // Cells already ran the post pipeline before this change; a cell's field key
  // is its row-qualified `Group[0].Rate`.
  it("keeps post-extended values in the table cells", () => {
    renderGroups({ type: "array", "x-layout": "table", items });
    const cells = within(screen.getByRole("table")).getAllByRole("cell");
    expect(within(cells[1]!).getByTestId("value-note-Group[0].Rate")).toBeInTheDocument();
  });

  it("renders an accordion array's label decoration in its section header", () => {
    renderGroups({ type: "array", "x-array-display": "accordion", items });
    expect(within(headingRow("Loan terms")).getByTestId("lineage-Group")).toBeInTheDocument();
  });

  it("renders a nested object's label decoration in its section header", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: { Account: { type: "object", title: "Account", properties: { Name: { type: "string", title: "Name" } } } },
    };
    render(<JsonSchemaForm schema={schema} value={{ Account: { Name: "Ada" } }} onChange={vi.fn()} post={[lineage]} showPreferencesMenu={false} />);
    expect(within(headingRow("Account")).getByTestId("lineage-Account")).toBeInTheDocument();
    expect(screen.getByTestId("lineage-Name")).toBeInTheDocument();
  });

  it("leaves a stacked array's label and item fields decorated as before", () => {
    renderGroups({ type: "array", "x-array-display": "stacked", items });
    expect(screen.getByTestId("lineage-Group")).toBeInTheDocument();
    expect(screen.getByTestId("lineage-Rate")).toBeInTheDocument();
  });
});
