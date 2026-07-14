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
    fireEvent.input(content as Element, { target: { textContent: "SELECT 2" } });

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
});
