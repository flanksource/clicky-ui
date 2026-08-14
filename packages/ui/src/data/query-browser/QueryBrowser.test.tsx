import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryBrowser } from "./QueryBrowser";

describe("QueryBrowser", () => {
  beforeEach(() => window.localStorage.clear());

  it("runs the initial query and records duration/results", async () => {
    const execute = vi.fn().mockResolvedValue({ rows: [{ answer: 42 }] });
    render(
      <QueryBrowser
        id="db-1"
        initialQuery="SELECT 42"
        language="sql"
        execute={execute}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() =>
      expect(execute).toHaveBeenCalledWith({ query: "SELECT 42", options: {} }),
    );
    expect(await screen.findByText("1 rows")).toBeInTheDocument();
    expect(
      window.localStorage.getItem("clicky-ui:query-browser:db-1:history"),
    ).toContain("SELECT 42");
  });

  it("runs an option-only request when an empty query is allowed", async () => {
    const execute = vi.fn().mockResolvedValue({ rows: [] });
    render(
      <QueryBrowser
        id="kubernetes-logs"
        initialOptions={{
          kind: "Pod",
          namespace: "payments",
          name: "api-abc12",
        }}
        allowEmptyQuery
        execute={execute}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() =>
      expect(execute).toHaveBeenCalledWith({
        query: "",
        options: {
          kind: "Pod",
          namespace: "payments",
          name: "api-abc12",
        },
      }),
    );
    expect(
      window.localStorage.getItem(
        "clicky-ui:query-browser:kubernetes-logs:history",
      ),
    ).toBeNull();
  });

  // A trailing "+" says there is more without saying the console stopped, which
  // reads as a small table rather than a bounded read.
  it("names the bound a truncated console read stopped at", async () => {
    const execute = vi.fn().mockResolvedValue({
      rows: [{ answer: 42 }],
      truncated: true,
      limit: 100,
    });
    render(
      <QueryBrowser
        id="db-bound"
        initialQuery="SELECT *"
        language="sql"
        execute={execute}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));

    expect(await screen.findByText("1 rows+")).toBeInTheDocument();
    expect(
      await screen.findByText(/stopped at the console's 100-row bound/),
    ).toBeInTheDocument();
  });

  it("says nothing about a bound when the read was complete", async () => {
    const execute = vi.fn().mockResolvedValue({ rows: [{ answer: 42 }] });
    render(
      <QueryBrowser
        id="db-whole"
        initialQuery="SELECT 42"
        language="sql"
        execute={execute}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));

    expect(await screen.findByText("1 rows")).toBeInTheDocument();
    expect(
      screen.queryByText(/stopped at the console/),
    ).not.toBeInTheDocument();
  });

  it("opens result rows in a Properties detail dialog", async () => {
    const execute = vi.fn().mockResolvedValue({
      rows: [{ id: "row-1", nullable: null, nested: { status: "ready" } }],
    });
    render(
      <QueryBrowser
        id="db-row-details"
        initialQuery="SELECT * FROM jobs"
        language="sql"
        execute={execute}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    fireEvent.click(await screen.findByText("row-1"));

    const dialog = screen.getByRole("dialog", { name: "Row details" });
    expect(within(dialog).getByText("id")).toBeInTheDocument();
    expect(within(dialog).getByText("nullable")).toBeInTheDocument();
    expect(within(dialog).getByText("null")).toBeInTheDocument();
    expect(within(dialog).getByText(/"status": "ready"/)).toBeInTheDocument();
  });

  it("renders failed queries with the diagnostic error details panel", async () => {
    const execute = vi
      .fn()
      .mockRejectedValue(new Error("database connection failed"));
    const { container } = render(
      <QueryBrowser
        id="db-error"
        initialQuery="SELECT 1"
        language="sql"
        execute={execute}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Run" }));

    expect(
      await screen.findByText("database connection failed"),
    ).toBeInTheDocument();
    const details = container.querySelector("details");
    expect(details).toBeInTheDocument();
    fireEvent.click(screen.getByText("Error"));
    expect(screen.getByTitle("Copy Query")).toHaveTextContent("SELECT 1");
    expect(screen.getByTitle("Copy Language")).toHaveTextContent("sql");
  });

  it("reconfigures async completion without replacing the editor document", () => {
    const execute = vi.fn().mockResolvedValue({ rows: [] });
    const { container, rerender } = render(
      <QueryBrowser
        id="db-completion"
        initialQuery="SELECT * FROM users"
        language="sql"
        execute={execute}
      />,
    );

    rerender(
      <QueryBrowser
        id="db-completion"
        initialQuery="SELECT * FROM users"
        language="sql"
        completion={{
          kind: "sql",
          dialect: "postgresql",
          defaultSchema: "public",
          schemas: [
            {
              name: "public",
              relations: [{ name: "users", columns: [{ name: "email" }] }],
            },
          ],
        }}
        execute={execute}
      />,
    );

    expect(container.querySelector(".cm-content")).toHaveTextContent(
      "SELECT * FROM users",
    );
  });

  it("reports editor and programmatic query changes", async () => {
    const onQueryChange = vi.fn();
    const execute = vi.fn().mockResolvedValue({ rows: [] });
    const { container, rerender } = render(
      <QueryBrowser
        id="db-query-change"
        initialQuery="SELECT 1"
        onQueryChange={onQueryChange}
        execute={execute}
      />,
    );

    const content = container.querySelector(".cm-content");
    expect(content).not.toBeNull();
    fireEvent.input(content as Element, {
      target: { textContent: "SELECT 2" },
    });

    rerender(
      <QueryBrowser
        id="db-query-change"
        initialQuery="SELECT 3"
        onQueryChange={onQueryChange}
        execute={execute}
      />,
    );
    await waitFor(() => expect(onQueryChange).toHaveBeenCalledWith("SELECT 3"));
  });

  describe("source-described filters", () => {
    const describedResult = {
      rows: [{ region: "us-east" }],
      columns: [
        {
          name: "region",
          filterKey: "region",
          filter: {
            kind: "terms" as const,
            options: [{ value: "us-east" }, { value: "eu" }],
          },
        },
      ],
    };

    // Columns the source described say which of them it can narrow on, which is
    // something no amount of looking at one page of rows can answer.
    it("renders the described columns rather than inferring them", async () => {
      render(
        <QueryBrowser
          id="db-described"
          initialQuery="SELECT region FROM orders"
          language="sql"
          execute={vi.fn().mockResolvedValue({
            ...describedResult,
            columns: [{ name: "region", label: "Region name" }],
          })}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Run" }));
      await screen.findByRole("table");
      expect(await screen.findByText("Region name")).toBeInTheDocument();
    });

    // A filter pill commits a value on selection, so it re-runs immediately —
    // and it re-runs the query that produced the result, never the editor's
    // current text, which may be a half-typed edit.
    it("re-runs the last executed query when a filter changes", async () => {
      const execute = vi.fn().mockResolvedValue(describedResult);
      render(
        <QueryBrowser
          id="db-filter"
          initialQuery="SELECT region FROM orders"
          language="sql"
          execute={execute}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Run" }));
      await screen.findByRole("table");

      // A server filter binds to its column through filterKey, so the header
      // control and the cell actions address one filter rather than two.
      fireEvent.click(
        await screen.findByRole("button", {
          name: /open region column filter/i,
        }),
      );
      const option = document.querySelector('[data-filter-option="eu"]');
      if (!option)
        throw new Error("Expected an eu option in the header filter");
      fireEvent.click(option);

      // The columns the result described ride along, so the source binds the
      // selection to what it offered rather than re-deriving it from a result
      // the selection itself narrowed.
      await waitFor(() =>
        expect(execute).toHaveBeenLastCalledWith({
          query: "SELECT region FROM orders",
          options: {},
          filters: { region: "eu" },
          columns: describedResult.columns,
        }),
      );
    });

    // Filters name columns, so a different statement is a clean slate: neither
    // the pills nor the column set they bind to may follow it across.
    it("re-runs a changed query with neither filters nor stale columns", async () => {
      const execute = vi.fn().mockResolvedValue(describedResult);
      const { rerender } = render(
        <QueryBrowser
          id="db-requery"
          initialQuery="SELECT region FROM orders"
          language="sql"
          execute={execute}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Run" }));
      await screen.findByRole("table");
      fireEvent.click(
        await screen.findByRole("button", {
          name: /open region column filter/i,
        }),
      );
      const option = document.querySelector('[data-filter-option="eu"]');
      if (!option)
        throw new Error("Expected an eu option in the header filter");
      fireEvent.click(option);
      await waitFor(() => expect(execute).toHaveBeenCalledTimes(2));

      rerender(
        <QueryBrowser
          id="db-requery"
          initialQuery="SELECT env FROM orders"
          language="sql"
          execute={execute}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Run" }));

      await waitFor(() =>
        expect(execute).toHaveBeenLastCalledWith({
          query: "SELECT env FROM orders",
          options: {},
        }),
      );
    });

    // A filter that excluded everything must not unmount the bar that would
    // undo it, so a described result keeps its table at zero rows.
    it("keeps the table when a filter leaves no rows", async () => {
      const execute = vi
        .fn()
        .mockResolvedValue({ ...describedResult, rows: [] });
      render(
        <QueryBrowser
          id="db-empty"
          initialQuery="SELECT region FROM orders"
          language="sql"
          execute={execute}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: "Run" }));
      expect(await screen.findByRole("table")).toBeInTheDocument();
    });
  });
});
