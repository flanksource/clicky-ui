import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { FieldOption } from "../components/json-schema-form-types";
import { ConnectionPicker } from "./ConnectionPicker";

const TYPE_ICONS = { postgres: "pg-mark", redis: "redis-mark", sql_server: "mssql-mark" };
const TYPE_LABELS = { sql_server: "SQL Server" };

const MAIN: FieldOption = {
  value: "connection://pg/main",
  label: "main",
  icon: "pg-mark",
  description: "db.internal:5432 · app",
  badges: [{ label: "svc" }],
};
const WAREHOUSE: FieldOption = { value: "connection://pg/warehouse", label: "warehouse", icon: "pg-mark" };
const SESSIONS: FieldOption = { value: "connection://cache/sessions", label: "sessions", icon: "redis-mark" };
const LEDGER: FieldOption = { value: "connection://ledger", label: "ledger", icon: "mssql-mark" };
// Deliberately interleaved: groups must come out contiguous.
const OPTIONS = [MAIN, SESSIONS, WAREHOUSE, LEDGER];

function open() {
  fireEvent.focus(screen.getByRole("combobox"));
}

describe("ConnectionPicker", () => {
  it("groups an untyped picker under a header per connection type, derived from the option icons", () => {
    render(<ConnectionPicker options={OPTIONS} value="" onChange={vi.fn()} typeIcons={TYPE_ICONS} typeLabels={TYPE_LABELS} />);
    open();

    const listbox = screen.getByRole("listbox");
    const sequence = Array.from(listbox.querySelectorAll('[role="option"], div[role="presentation"]')).map(
      (node) => node.textContent?.replace(/\s+/g, " ").trim() ?? "",
    );
    expect(sequence).toEqual([
      "Postgres",
      expect.stringContaining("main"),
      expect.stringContaining("warehouse"),
      "Redis",
      expect.stringContaining("sessions"),
      "SQL Server",
      expect.stringContaining("ledger"),
    ]);
  });

  it("lists rows under the group the server supplied, without any schema icon table", () => {
    const grouped: FieldOption[] = [
      { value: "connection://a", label: "a", group: "Redis" },
      { value: "connection://b", label: "b", group: "Postgres" },
      { value: "connection://c", label: "c", group: "Redis" },
    ];
    render(<ConnectionPicker options={grouped} value="" onChange={vi.fn()} />);
    open();

    const sequence = Array.from(screen.getByRole("listbox").querySelectorAll('[role="option"], div[role="presentation"]')).map(
      (node) => node.textContent?.trim(),
    );
    expect(sequence).toEqual(["Redis", "a", "c", "Postgres", "b"]);
  });

  it("renders no group headers for a typed picker and pins the type icon in the control", () => {
    render(
      <ConnectionPicker options={[MAIN, WAREHOUSE]} value="" onChange={vi.fn()} types={["postgres"]} typeIcons={TYPE_ICONS} />,
    );
    open();

    expect(screen.queryByText("Postgres")).toBeNull();
    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getByRole("combobox", { name: "Postgres connection" })).toBeInTheDocument();
  });

  it("commits the connection:// ref, not the label", () => {
    const onChange = vi.fn();
    render(<ConnectionPicker options={OPTIONS} value="" onChange={onChange} typeIcons={TYPE_ICONS} />);
    open();

    fireEvent.mouseDown(within(screen.getByRole("listbox")).getByRole("option", { name: /warehouse/ }));

    expect(onChange).toHaveBeenCalledWith("connection://pg/warehouse");
  });

  it("shows a server-supplied description and badge on the row", () => {
    render(<ConnectionPicker options={[MAIN]} value="" onChange={vi.fn()} types={["postgres"]} />);
    open();

    const row = screen.getByRole("option", { name: /main/ });
    expect(within(row).getByText("db.internal:5432 · app")).toBeInTheDocument();
    expect(within(row).getByText("svc")).toBeInTheDocument();
  });

  it("has no create footer without onCreate", () => {
    render(<ConnectionPicker options={OPTIONS} value="" onChange={vi.fn()} />);
    open();

    expect(screen.queryByRole("button", { name: /New .*connection/ })).toBeNull();
  });

  it("names the type in the typed footer and asks to create that type", () => {
    const onCreate = vi.fn();
    render(
      <ConnectionPicker options={[LEDGER]} value="" onChange={vi.fn()} types={["sql_server"]} typeLabels={TYPE_LABELS} onCreate={onCreate} />,
    );
    open();

    fireEvent.click(screen.getByRole("button", { name: "New SQL Server connection…" }));

    expect(onCreate).toHaveBeenCalledWith({ type: "sql_server" });
  });

  it("asks to create an unspecified type from the untyped footer", () => {
    const onCreate = vi.fn();
    render(<ConnectionPicker options={OPTIONS} value="" onChange={vi.fn()} onCreate={onCreate} />);
    open();

    fireEvent.click(screen.getByRole("button", { name: "New connection…" }));

    expect(onCreate).toHaveBeenCalledWith({});
  });

  it("does not accept a free-typed value outside the options", () => {
    const onChange = vi.fn();
    render(<ConnectionPicker options={OPTIONS} value="" onChange={onChange} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "connection://nope" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalledWith("connection://nope");
  });
});
