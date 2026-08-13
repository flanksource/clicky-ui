import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, vi } from "vitest";
import { Clicky, type ClickyDocument } from "./Clicky";
import { clickyFixture } from "./Clicky.fixtures";

// Mock the Shiki wrapper so the dynamic `import("shiki")` never executes
// during unit tests — it pulls in the full grammar/theme bundle and slows
// the suite. Each test that exercises the client-highlight path overrides
// the mock with a per-case implementation via `mocked(...).mockImplementation`.
vi.mock("./code-highlight", () => ({
  highlightCode: vi.fn(async () => null),
}));
import { highlightCode } from "./code-highlight";
const mockHighlightCode = vi.mocked(highlightCode);

function createCommandClient() {
  const executeCommand = vi.fn().mockResolvedValue({
    success: true,
    exit_code: 0,
    stdout: JSON.stringify({
      version: 1,
      node: {
        kind: "text",
        text: "Loaded descendants",
        plain: "Loaded descendants",
      },
    }),
  });

  return {
    getOpenAPISpec: vi.fn().mockResolvedValue({
      openapi: "3.0.3",
      info: {
        title: "Clicky test",
        version: "1.0.0",
      },
      paths: {
        "/api/v1/stacks/{id}/descendants": {
          get: {
            operationId: "stack_get_descendants",
            summary: "List descendants",
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                description: "Positional argument from command",
                schema: { type: "string" },
              },
              {
                name: "events",
                in: "query",
                schema: { type: "string" },
              },
            ],
            responses: { "200": {} },
            "x-clicky": {
              command: "stack/get-descendants",
              verb: "action",
              scope: "entity",
            },
          },
        },
      },
    }),
    executeCommand,
    lookupFilters: vi.fn().mockResolvedValue({ filters: {} }),
  };
}

describe("Clicky", () => {
  beforeEach(() => {
    document.getElementById("clicky-download-frame")?.remove();
  });

  it("renders a JSON string payload", () => {
    render(<Clicky data={JSON.stringify(clickyFixture)} />);

    expect(screen.getByText("Cluster Status")).toBeInTheDocument();
    expect(screen.getByText(/Healthy/)).toBeInTheDocument();
  });

  it("renders comments with a 50ch and three-line clamp", () => {
    render(
      <Clicky
        data={{
          kind: "comment",
          text: "Approved after validating the deployment notes, linked change request, and release evidence.",
          plain:
            "Approved after validating the deployment notes, linked change request, and release evidence.",
        }}
      />,
    );

    const comment = screen.getByText(/Approved after validating/);
    expect(comment).toHaveStyle({ maxWidth: "50ch" });
    expect(comment.style.WebkitLineClamp).toBe("3");
  });

  it("renders markdown-style block nodes natively", () => {
    const document: ClickyDocument = {
      version: 1,
      node: {
        kind: "list",
        unstyled: true,
        items: [
          {
            kind: "heading",
            level: 3,
            content: {
              kind: "text",
              text: "Accounting policy",
              plain: "Accounting policy",
            },
          },
          {
            kind: "blockquote",
            content: {
              kind: "text",
              text: "Revenue is recognized when control transfers.",
              plain: "Revenue is recognized when control transfers.",
            },
          },
          {
            kind: "admonition",
            severity: "warning",
            label: {
              kind: "text",
              text: "Manual review",
              plain: "Manual review",
            },
            content: {
              kind: "text",
              text: "Confirm the disclosure before publication.",
              plain: "Confirm the disclosure before publication.",
            },
          },
          {
            kind: "text",
            text: "Cash balance reconciled",
            plain: "Cash balance reconciled",
            children: [{ kind: "footnote-ref", id: "cash", plain: "[^cash]" }],
          },
          {
            kind: "footnotes",
            items: [
              {
                kind: "footnote",
                id: "cash",
                content: {
                  kind: "text",
                  text: "Cash includes restricted deposits.",
                  plain: "Cash includes restricted deposits.",
                },
              },
            ],
          },
        ],
      },
    };

    const { container } = render(<Clicky data={document} />);

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "Accounting policy",
      }),
    ).toBeInTheDocument();
    const blockquote = container.querySelector("blockquote");
    expect(blockquote).not.toBeNull();
    expect(blockquote).toHaveTextContent(
      "Revenue is recognized when control transfers.",
    );
    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Manual review")).toBeInTheDocument();
    expect(
      within(alert).getByText("Confirm the disclosure before publication."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Footnote cash" })).toHaveAttribute(
      "href",
      "#fn-cash",
    );
    const footnotes = screen.getByRole("region", { name: "Footnotes" });
    expect(
      within(footnotes).getByText("Cash includes restricted deposits."),
    ).toBeInTheDocument();
    expect(
      within(footnotes).getByRole("link", {
        name: "Back to footnote reference cash",
      }),
    ).toHaveAttribute("href", "#fnref-cash");
  });

  it("renders stacktrace nodes with source line gutters", () => {
    render(
      <Clicky
        data={{
          kind: "stacktrace",
          exceptionClass: "java.lang.NullPointerException",
          message: "name must not be null",
          causedBy: ["com.example.ServiceException: request failed"],
          frames: [
            {
              functionName: "com.example.Greeter.greet",
              displayName: "Greeter.greet",
              class: "com.example.Greeter",
              method: "greet",
              kind: "frame",
              runtime: false,
              nativeMethod: false,
              file: "Greeter.java",
              line: 14,
              location: "Greeter.java:14",
              sourceLines: [
                "    public String greet(String name) {",
                '        return prefix + ", " + name.toUpperCase();',
              ],
              sourceLineNumbers: [13, 14],
              sourceStartLine: 13,
              sourceLanguage: "java",
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByText("java.lang.NullPointerException"),
    ).toBeInTheDocument();
    expect(screen.getByText("name must not be null")).toBeInTheDocument();
    expect(screen.getByText("Caused by")).toBeInTheDocument();
    expect(screen.getByText("Greeter.greet")).toBeInTheDocument();
    expect(screen.getByText(">14")).toBeInTheDocument();
    expect(screen.getByText(/name\.toUpperCase/)).toBeInTheDocument();
  });

  it("sorts tables", () => {
    render(<Clicky data={clickyFixture} />);

    const latencyHeader = screen.getByRole("button", { name: /latency/i });
    fireEvent.click(latencyHeader);
    fireEvent.click(latencyHeader);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("worker");
    expect(rows[2]).toHaveTextContent("api");
  });

  it("passes raw table rows to the row click handler", () => {
    const onTableRowClick = vi.fn();
    const clickyDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        columns: [{ name: "name", label: "Name" }],
        rows: [
          {
            cells: {
              _id: { kind: "text", text: "widget-1", plain: "widget-1" },
              name: {
                kind: "text",
                text: "First widget",
                plain: "First widget",
              },
            },
          },
        ],
      },
    };

    render(<Clicky data={clickyDocument} onTableRowClick={onTableRowClick} />);

    fireEvent.click(screen.getByText("First widget"));

    expect(onTableRowClick).toHaveBeenCalledTimes(1);
    expect(onTableRowClick.mock.calls[0][0].cells._id.plain).toBe("widget-1");
  });

  it("does not expand an inline row-detail panel on row click", () => {
    const onTableRowClick = vi.fn();
    const clickyDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        columns: [{ name: "name", label: "Name" }],
        rows: [
          {
            cells: {
              _id: { kind: "text", text: "widget-1", plain: "widget-1" },
              name: {
                kind: "text",
                text: "First widget",
                plain: "First widget",
              },
            },
            detail: {
              kind: "code",
              language: "yaml",
              source: "secret-detail-content",
            },
          },
        ],
      },
    };

    render(<Clicky data={clickyDocument} onTableRowClick={onTableRowClick} />);
    fireEvent.click(screen.getByText("First widget"));

    // A row click goes to the handler (navigation), not an inline detail panel.
    // The removed ClickyTableRowDetail used to surface the row's `detail` node
    // and a "Fields" section on expand — neither should appear now.
    expect(onTableRowClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("secret-detail-content")).toBeNull();
    expect(screen.queryByText("Fields")).toBeNull();
  });

  it("supports auto-filtered clicky tables", async () => {
    const clickyDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        autoFilter: true,
        columns: [
          { name: "service", label: "Service", grow: true },
          { name: "status", label: "Status", shrink: true },
        ],
        rows: [
          {
            cells: {
              service: { kind: "text", text: "api", plain: "api" },
              status: { kind: "text", text: "healthy", plain: "healthy" },
            },
            detail: {
              kind: "code",
              language: "yaml",
              source: "kind: Deployment\nmetadata:\n  name: api",
            },
          },
          {
            cells: {
              service: { kind: "text", text: "worker", plain: "worker" },
              status: { kind: "text", text: "degraded", plain: "degraded" },
            },
          },
        ],
      },
    };

    render(<Clicky data={clickyDocument} />);

    fireEvent.focus(screen.getByRole("combobox", { name: "Status" }));
    const healthyFilter = document.querySelector(
      '[data-filter-option="healthy"]',
    );
    if (!healthyFilter) {
      throw new Error("Expected healthy filter option");
    }
    fireEvent.click(healthyFilter);

    await waitFor(
      () => expect(screen.queryByText("worker")).not.toBeInTheDocument(),
      {
        timeout: 1_500,
      },
    );
    expect(screen.getByText("api")).toBeInTheDocument();
  });

  it("renders and filters structured key-value columns without losing duplicate keys", async () => {
    const clickyDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        autoFilter: true,
        columns: [
          { name: "service", label: "Service" },
          { name: "labels", label: "Labels", type: "key_values" },
        ],
        rows: [
          {
            cells: {
              service: { kind: "text", text: "api", plain: "api" },
              labels: {
                kind: "map",
                fields: [
                  {
                    name: "env",
                    value: { kind: "text", text: "prod", plain: "prod" },
                  },
                  {
                    name: "env",
                    value: { kind: "text", text: "blue", plain: "blue" },
                  },
                ],
              },
            },
          },
          {
            cells: {
              service: { kind: "text", text: "worker", plain: "worker" },
              labels: {
                kind: "map",
                fields: [
                  {
                    name: "env",
                    value: { kind: "text", text: "staging", plain: "staging" },
                  },
                ],
              },
            },
          },
        ],
      },
    };

    render(<Clicky data={clickyDocument} />);

    expect(screen.getAllByText("env")).toHaveLength(3);
    expect(screen.getByText("blue")).toBeInTheDocument();
    fireEvent.focus(screen.getByRole("combobox", { name: "Labels" }));
    const prodFilter = document.querySelector(
      '[data-filter-option="env=prod"]',
    );
    if (!prodFilter) throw new Error("Expected env=prod filter option");
    fireEvent.click(prodFilter);

    await waitFor(() =>
      expect(screen.queryByText("worker")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("api")).toBeInTheDocument();
  });

  it("renders a single-table map as a bare table with no label or border wrapper", () => {
    const doc: ClickyDocument = {
      version: 1,
      node: {
        kind: "map",
        fields: [
          {
            name: "data",
            label: "Data",
            value: {
              kind: "table",
              columns: [{ name: "service", label: "Service" }],
              rows: [
                {
                  cells: {
                    service: { kind: "text", text: "api", plain: "api" },
                  },
                },
              ],
            },
          },
        ],
      },
    };
    const { container } = render(<Clicky data={doc} />);
    // The table renders directly, exactly like a bare table node…
    expect(screen.getByText("api")).toBeInTheDocument();
    // …with the field label and the ClickyMap section/border wrapper dropped.
    expect(screen.queryByText("Data")).not.toBeInTheDocument();
    expect(container.querySelector("section")).toBeNull();
  });

  it("keeps the non-fill layout for a multi-field map", () => {
    const doc: ClickyDocument = {
      version: 1,
      node: {
        kind: "map",
        fields: [
          {
            name: "first",
            label: "First",
            value: {
              kind: "table",
              columns: [{ name: "a", label: "A" }],
              rows: [{ cells: { a: { kind: "text", text: "1", plain: "1" } } }],
            },
          },
          {
            name: "second",
            label: "Second",
            value: {
              kind: "table",
              columns: [{ name: "b", label: "B" }],
              rows: [{ cells: { b: { kind: "text", text: "2", plain: "2" } } }],
            },
          },
        ],
      },
    };
    const { container } = render(<Clicky data={doc} />);
    const section = container.querySelector("section");
    if (!section) throw new Error("expected a section wrapper");
    expect(section.className).toContain("space-y-2");
    expect(section.className).not.toContain("flex-1");
  });

  it("makes a Clicky-rendered table fill a bounded flex parent (flex-1 on the table root)", () => {
    const doc: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        columns: [{ name: "service", label: "Service" }],
        rows: [
          { cells: { service: { kind: "text", text: "api", plain: "api" } } },
        ],
      },
    };
    const { container } = render(<Clicky data={doc} />);
    const root = container.querySelector("[data-theme]");
    if (!root) throw new Error("expected the DataTable theme root");
    expect(root.className).toContain("flex-1");
    expect(root.className).toContain("min-h-0");
  });

  it("renders typed JSON cells as collapsed expandable trees", () => {
    const clickyDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        columns: [{ name: "metadata", label: "Metadata", type: "json" }],
        rows: [
          {
            cells: {
              metadata: {
                kind: "code",
                language: "json",
                source: `{"enabled":true,"nested":{"retries":3}}`,
                plain: `{"enabled":true,"nested":{"retries":3}}`,
              },
            },
          },
        ],
      },
    };

    render(<Clicky data={clickyDocument} />);

    const collapsed = screen.getByText(/2 keys/);
    expect(screen.queryByText("enabled")).not.toBeInTheDocument();
    fireEvent.click(collapsed);
    expect(screen.getByText("enabled")).toBeInTheDocument();
    expect(screen.getByText("nested")).toBeInTheDocument();
  });

  it("keeps table controls visible for empty clicky tables", () => {
    const clickyDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        columns: [
          { name: "date", label: "Date", sortable: true },
          { name: "description", label: "Description", grow: true },
        ],
        rows: [],
      },
    };

    render(
      <Clicky
        data={clickyDocument}
        timeRange={{
          from: "2026-06-01",
          to: "2026-06-30",
          onApply: vi.fn(),
        }}
        externalFilters={[
          {
            key: "kind",
            kind: "enum",
            label: "Kind",
            value: "",
            options: [
              { value: "invoice", label: "Invoice" },
              { value: "payment", label: "Payment" },
            ],
            onChange: vi.fn(),
          },
        ]}
      />,
    );

    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /date/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /time range filter/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Kind" })).toBeInTheDocument();
    expect(screen.getByText("No data")).toBeInTheDocument();
    expect(screen.getByText("0 of 0 rows")).toBeInTheDocument();
  });

  it("renders table rows with struct cells as collapsed sections", () => {
    const clickyDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        columns: [
          { name: "agreement", label: "agreement" },
          { name: "company", label: "company" },
          { name: "definition", label: "definition" },
        ],
        rows: [
          {
            cells: {
              agreement: {
                kind: "map",
                fields: [
                  {
                    name: "agreementName",
                    value: {
                      kind: "text",
                      text: "Group Scheme Contract",
                      plain: "Group Scheme Contract",
                    },
                  },
                  {
                    name: "agreementGUID",
                    value: {
                      kind: "text",
                      text: "agreement-1",
                      plain: "agreement-1",
                    },
                  },
                ],
              },
              company: {
                kind: "map",
                fields: [
                  {
                    name: "companyName",
                    value: {
                      kind: "text",
                      text: "Acme Africa Holdings",
                      plain: "Acme Africa Holdings",
                    },
                  },
                ],
              },
              definition: {
                kind: "map",
                fields: [
                  {
                    name: "typeCode",
                    value: {
                      kind: "text",
                      text: "MSTR-INS",
                      plain: "MSTR-INS",
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    };

    render(<Clicky data={clickyDocument} />);

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(
      screen.getByText("Agreement 1: Group Scheme Contract"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Acme Africa Holdings")).not.toBeVisible();

    fireEvent.click(screen.getByText("Agreement 1: Group Scheme Contract"));

    expect(screen.getByText("Acme Africa Holdings")).toBeVisible();
    expect(screen.getByText("MSTR-INS")).toBeVisible();
  });

  it("consolidates view modes and downloads into the table menu, hiding the standalone view bar", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input) => {
        const url = String(input);

        if (url.includes("format=clicky-json")) {
          return new Response(JSON.stringify(clickyFixture), {
            status: 200,
            headers: { "Content-Type": "application/json+clicky" },
          });
        }

        if (url.includes("format=json")) {
          return new Response(
            JSON.stringify({
              service: "api",
              healthy: true,
              replicas: 3,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        return new Response("", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      });
    render(<Clicky url="/api/clicky/report" />);

    expect(await screen.findByText("Cluster Status")).toBeInTheDocument();
    // The table hosts the controls, so the standalone view bar is gone — this
    // is what looked out of place on a plain list surface.
    expect(
      screen.queryByRole("radiogroup", { name: /clicky view mode/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /open additional view menu/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /open download menu/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    const tableMenu = screen.getByRole("menu", { name: /column menu/i });

    // Ten view formats and five download formats are two rows, not fifteen:
    // one submenu trigger naming the active view, and one Export row.
    expect(
      within(tableMenu).getByRole("menuitem", { name: /^View: Clicky/i }),
    ).toBeInTheDocument();
    expect(
      within(tableMenu).getByRole("menuitem", { name: /^Export/i }),
    ).toBeInTheDocument();
    for (const label of ["PDF", "HTML", "Pretty", "Slack"]) {
      expect(
        within(tableMenu).queryByRole("menuitem", {
          name: new RegExp(`^${label}$`, "i"),
        }),
      ).not.toBeInTheDocument();
    }

    // The formats live behind the submenu, with the active one not re-selectable.
    fireEvent.click(
      within(tableMenu).getByRole("menuitem", { name: /^View: Clicky/i }),
    );
    const viewMenu = screen.getByRole("menu", { name: /^View: Clicky/i });
    for (const label of [
      "Clicky",
      "JSON",
      "PDF",
      "HTML",
      "Markdown",
      "YAML",
      "CSV",
      "Pretty",
      "Excel",
      "Slack",
    ]) {
      expect(
        within(viewMenu).getByRole("menuitem", {
          name: new RegExp(`^${label}`, "i"),
        }),
      ).toBeInTheDocument();
    }
    expect(
      within(viewMenu).getByRole("menuitem", { name: /^Clicky/i }),
    ).toBeDisabled();

    // Exporting picks format and range in a dialog, then downloads.
    fireEvent.click(
      within(tableMenu).getByRole("menuitem", { name: /^Export/i }),
    );
    const exportDialog = await screen.findByRole("dialog");
    fireEvent.click(within(exportDialog).getByText("JSON"));
    fireEvent.click(
      within(exportDialog).getByRole("button", { name: /^Download$/i }),
    );
    const downloadFrame = document.getElementById(
      "clicky-download-frame",
    ) as HTMLIFrameElement;
    expect(downloadFrame).toBeInstanceOf(HTMLIFrameElement);
    expect(downloadFrame.src).toContain("/api/clicky/report?format=json");
    expect(downloadFrame.src).toContain("filename=report.json");

    // Picking a View format switches the inline preview; leaving the table
    // brings the view bar back so the user can switch away from JSON again.
    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    fireEvent.click(
      screen.getByRole("menuitem", { name: /^View: Clicky/i }),
    );
    fireEvent.click(
      within(screen.getByRole("menu", { name: /^View: Clicky/i })).getByRole(
        "menuitem",
        { name: /^JSON/i },
      ),
    );
    expect(await screen.findByLabelText("JSON tree")).toBeInTheDocument();
    expect(screen.getByText("service")).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: /clicky view mode/i }),
    ).toBeInTheDocument();

    fetchSpy.mockRestore();
  });

  it("supports an empty remote view config without rendering the mode switcher", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input) => {
        const url = String(input);

        if (url.includes("format=clicky-json")) {
          return new Response(JSON.stringify(clickyFixture), {
            status: 200,
            headers: { "Content-Type": "application/json+clicky" },
          });
        }

        return new Response("", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      });
    render(
      <Clicky
        url="/api/clicky/report"
        data={clickyFixture}
        view={[]}
        download={{ all: true, label: "report" }}
      />,
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/clicky/report?format=clicky-json",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: expect.stringContaining("application/json+clicky"),
        }),
      }),
    );
    expect(await screen.findByText("Cluster Status")).toBeInTheDocument();
    expect(
      screen.queryByRole("radiogroup", { name: /clicky view mode/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /open additional view menu/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /download json/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    const tableMenu = screen.getByRole("menu", { name: /column menu/i });
    // With no view formats configured there is no View submenu to offer, so
    // Export is the only action the menu carries.
    expect(
      within(tableMenu).queryByRole("menuitem", { name: /^View:/i }),
    ).not.toBeInTheDocument();
    fireEvent.click(
      within(tableMenu).getByRole("menuitem", { name: /^Export/i }),
    );

    const exportDialog = await screen.findByRole("dialog");
    fireEvent.click(within(exportDialog).getByText("PDF"));
    fireEvent.click(
      within(exportDialog).getByRole("button", { name: /^Download$/i }),
    );

    const downloadFrame = document.getElementById(
      "clicky-download-frame",
    ) as HTMLIFrameElement;
    expect(downloadFrame).toBeInstanceOf(HTMLIFrameElement);
    expect(downloadFrame.src).toContain("/api/clicky/report?format=pdf");
    expect(downloadFrame.src).toContain("filename=report.pdf");
    expect(downloadFrame.src).toContain("_download=");

    fetchSpy.mockRestore();
  });

  it("moves format downloads into the table menu for table outputs", async () => {
    const tableDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        columns: [
          { name: "code", label: "Code" },
          { name: "name", label: "Name" },
        ],
        rows: [
          {
            cells: {
              code: { kind: "text", text: "200", plain: "200" },
              name: { kind: "text", text: "Sales", plain: "Sales" },
            },
          },
        ],
      },
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(tableDocument), {
        status: 200,
        headers: { "Content-Type": "application/json+clicky" },
      }),
    );

    render(
      <Clicky
        url="/api/v1/accounts?limit=5"
        data={tableDocument}
        download={{ all: true, label: "accounts" }}
      />,
    );

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^download json/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /open download menu/i }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    const menu = screen.getByRole("menu", { name: /column menu/i });

    const densityItem = within(menu).getByRole("menuitemradio", {
      name: /use page density/i,
    });
    const exportItem = within(menu).getByRole("menuitem", { name: /^Export/i });

    // Export follows the density control.
    expect(
      Boolean(
        densityItem.compareDocumentPosition(exportItem) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true);

    fireEvent.click(exportItem);
    const dialog = await screen.findByRole("dialog");

    // Only the whitelisted download formats are offered.
    for (const label of ["YAML", "JSON", "CSV", "PDF", "Markdown"]) {
      expect(within(dialog).getByText(label)).toBeInTheDocument();
    }
    for (const label of ["Clicky", "HTML", "Pretty", "Excel", "Slack"]) {
      expect(within(dialog).queryByText(label)).not.toBeInTheDocument();
    }

    fireEvent.click(within(dialog).getByText("PDF"));
    fireEvent.click(
      within(dialog).getByRole("button", { name: /^Download$/i }),
    );

    const downloadFrame = document.getElementById(
      "clicky-download-frame",
    ) as HTMLIFrameElement;
    expect(downloadFrame).toBeInstanceOf(HTMLIFrameElement);
    expect(downloadFrame.src).toContain("/api/v1/accounts?limit=5&format=pdf");
    expect(downloadFrame.src).toContain("filename=accounts.pdf");
    expect(downloadFrame.src).toContain("_download=");

    fetchSpy.mockRestore();
  });

  it("prepares a table download before starting the native download", async () => {
    const prepare = vi.fn().mockResolvedValue({
      url: "/api/v1/profile/reconciliations/run/export",
      label: "selected reconciliation",
    });
    render(
      <Clicky
        data={JSON.stringify(clickyFixture)}
        url="/api/v1/profile/reconciliations/run/results"
        download={{ formats: ["csv"], scopes: ["all"], prepare }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    const menu = screen.getByRole("menu", { name: /column menu/i });
    fireEvent.click(within(menu).getByRole("menuitem", { name: /^Export/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /^Download$/i }),
    );

    await waitFor(() =>
      expect(prepare).toHaveBeenCalledWith({ format: "csv", scope: "all" }),
    );
    const frame = document.getElementById(
      "clicky-download-frame",
    ) as HTMLIFrameElement;
    await waitFor(() =>
      expect(frame.src).toContain("/api/v1/profile/reconciliations/run/export"),
    );
    expect(frame.src).toContain("format=csv");
    expect(frame.src).toContain("scope=all");
    expect(frame.src).toContain("filename=selected-reconciliation.csv");
  });

  it("surfaces a prepared download failure without starting a download", async () => {
    render(
      <Clicky
        data={JSON.stringify(clickyFixture)}
        url="/api/v1/profile/reconciliations/run/results"
        download={{
          formats: ["csv"],
          prepare: vi.fn().mockRejectedValue(new Error("snapshot expired")),
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    const menu = screen.getByRole("menu", { name: /column menu/i });
    fireEvent.click(within(menu).getByRole("menuitem", { name: /^Export/i }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(dialog).getByRole("button", { name: /^Download$/i }),
    );

    // The dialog stays open holding the reason, rather than closing onto a
    // download that never started.
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "snapshot expired",
    );
    expect(document.getElementById("clicky-download-frame")).toBeNull();
  });

  it("separates current-page and all-row endpoint exports", async () => {
    const tableDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        columns: [{ name: "id", label: "ID" }],
        rows: [{ cells: { id: { kind: "text", text: "1", plain: "1" } } }],
      },
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(tableDocument), {
        status: 200,
        headers: { "Content-Type": "application/json+clicky" },
      }),
    );

    render(
      <Clicky
        url="/api/v1/accounts?limit=25&offset=50&region=EU"
        data={tableDocument}
        download={{
          formats: ["json", "ndjson", "excel", "pdf"],
          scopes: ["page", "all"],
          allRowsMode: "streaming",
          formatMaxRows: { pdf: 1000 },
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /^Export/i }));
    const dialog = await screen.findByRole("dialog");

    // One range at a time, so the per-format caps describe the range in hand
    // rather than being listed twice under two headings.
    expect(within(dialog).getByText("NDJSON")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("radio", { name: "All rows" }));
    expect(
      within(dialog).getAllByText("Streams rows as they are read"),
    ).toHaveLength(3);
    expect(
      within(dialog).getByText("Limited to 1,000 rows"),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("radio", { name: "JSON" }));
    fireEvent.click(
      within(dialog).getByRole("button", { name: /^Download$/i }),
    );
    // The download resolves a tick after the click, so read it once it lands.
    const downloadedUrl = async () => {
      let params: URLSearchParams | null = null;
      await waitFor(() => {
        const frame = document.getElementById(
          "clicky-download-frame",
        ) as HTMLIFrameElement | null;
        expect(frame).not.toBeNull();
        params = new URL(frame!.src).searchParams;
        expect(params.get("format")).toBeTruthy();
      });
      return params!;
    };

    let downloaded = await downloadedUrl();
    expect(downloaded.get("scope")).toBe("all");
    expect(downloaded.get("region")).toBe("EU");
    expect(downloaded.has("limit")).toBe(false);
    expect(downloaded.has("offset")).toBe(false);

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /^Export/i }));
    const pageDialog = await screen.findByRole("dialog");
    fireEvent.click(
      within(pageDialog).getByRole("radio", { name: "Current page" }),
    );
    fireEvent.click(within(pageDialog).getByRole("radio", { name: "Excel" }));
    fireEvent.click(
      within(pageDialog).getByRole("button", { name: /^Download$/i }),
    );
    await waitFor(() => {
      const frame = document.getElementById(
        "clicky-download-frame",
      ) as HTMLIFrameElement;
      expect(new URL(frame.src).searchParams.get("format")).toBe("excel");
    });
    downloaded = await downloadedUrl();
    expect(downloaded.get("scope")).toBe("page");
    expect(downloaded.get("limit")).toBe("25");
    expect(downloaded.get("offset")).toBe("50");

    fetchSpy.mockRestore();
  });

  it("renders tree nodes through the native tree component", () => {
    render(<Clicky data={clickyFixture} />);

    const tree = screen.getByRole("tree");
    expect(tree).toBeInTheDocument();
    expect(
      within(tree).getAllByText(
        (_, element) => element?.textContent === "cluster / prod-eu",
      )[0],
    ).toBeInTheDocument();
    expect(within(tree).getByText("worker")).toBeInTheDocument();
  });

  it("sanitizes html fallback content", () => {
    const malicious: ClickyDocument = {
      version: 1,
      node: {
        kind: "html",
        html: '<span>Hello</span><script>window.__x = true</script><a href="javascript:alert(1)" onclick="alert(2)">bad</a>',
      },
    };

    const { container } = render(<Clicky data={malicious} />);
    expect(container.querySelector("script")).toBeNull();
    expect(container.innerHTML).not.toContain("onclick=");
    expect(container.innerHTML).not.toContain("javascript:");
  });

  it("shows a compact error for invalid JSON", () => {
    render(<Clicky data={"{"} />);

    expect(screen.getByText("Invalid Clicky payload")).toBeInTheDocument();
  });

  it("navigates link-command nodes through the clicky runtime", async () => {
    const client = createCommandClient();
    const onNavigate = vi.fn();

    render(
      <Clicky
        data={{
          version: 1,
          node: {
            kind: "link-command",
            command: "stack/get-descendants",
            target: "_clicky",
            args: ["stack-42"],
            flags: { events: "1" },
            text: "stack-42",
            plain: "stack-42",
          },
        }}
        commandRuntime={{ client, onNavigate }}
      />,
    );

    await waitFor(() => expect(client.getOpenAPISpec).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "stack-42" }));

    await waitFor(() => expect(onNavigate).toHaveBeenCalledTimes(1));
    expect(onNavigate.mock.calls[0][0].request.command).toBe(
      "stack/get-descendants",
    );
    expect(onNavigate.mock.calls[0][0].request.flags).toEqual({ events: "1" });
  });

  it("auto-runs dialog link-command nodes when required params are prefilled", async () => {
    const client = createCommandClient();

    render(
      <Clicky
        data={{
          version: 1,
          node: {
            kind: "link-command",
            command: "stack/get-descendants",
            target: "Dialog",
            autoRun: true,
            args: ["stack-42"],
            flags: { events: "1" },
            text: "stack-42",
            plain: "stack-42",
          },
        }}
        commandRuntime={{ client }}
      />,
    );

    await waitFor(() => expect(client.getOpenAPISpec).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "stack-42" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await waitFor(() =>
      expect(client.executeCommand).toHaveBeenCalledWith(
        "/api/v1/stacks/{id}/descendants",
        "get",
        { id: "stack-42", events: "1" },
        expect.objectContaining({ Accept: "application/json+clicky" }),
      ),
    );
    expect(await screen.findByText("Loaded descendants")).toBeInTheDocument();
  });

  it("opens dialog link-command nodes without auto-running when required params are missing", async () => {
    const client = createCommandClient();

    render(
      <Clicky
        data={{
          version: 1,
          node: {
            kind: "link-command",
            command: "stack/get-descendants",
            target: "Dialog",
            autoRun: true,
            text: "show descendants",
            plain: "show descendants",
          },
        }}
        commandRuntime={{ client }}
      />,
    );

    await waitFor(() => expect(client.getOpenAPISpec).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "show descendants" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /run command/i }),
    ).toBeInTheDocument();
    await waitFor(() => expect(client.executeCommand).not.toHaveBeenCalled());
  });

  it("executes expand link-command nodes asynchronously inline", async () => {
    const client = createCommandClient();

    render(
      <Clicky
        data={{
          version: 1,
          node: {
            kind: "link-command",
            command: "stack/get-descendants",
            target: "Expand",
            args: ["stack-42"],
            text: "expand descendants",
            plain: "expand descendants",
          },
        }}
        commandRuntime={{ client }}
      />,
    );

    await waitFor(() => expect(client.getOpenAPISpec).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "expand descendants" }));

    await waitFor(() => expect(client.executeCommand).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Loaded descendants")).toBeInTheDocument();
  });

  it("renders json code blocks with the interactive JsonView", () => {
    const document: ClickyDocument = {
      version: 1,
      node: {
        kind: "code",
        language: "json",
        source: '{"intakeFileGUID":"2bc39b08","status":"SYSERR"}',
      },
    };

    const { container } = render(<Clicky data={document} />);

    // Header still surfaces the language label so operators can tell at
    // a glance which renderer engaged.
    expect(within(container).getByText("json")).toBeInTheDocument();

    // The JsonView path renders each scalar key as plain text (no
    // surrounding quotes) — the chroma path would emit them inside a
    // <pre class="chroma"> with the value inline-quoted. Looking for the
    // unquoted key is the cleanest behavioural signal since it only
    // appears in the JsonView output.
    expect(within(container).getByText("intakeFileGUID")).toBeInTheDocument();
    expect(within(container).getByText("status")).toBeInTheDocument();
    expect(within(container).getByText('"SYSERR"')).toBeInTheDocument();
  });

  it("falls back to highlighted html when json source is malformed", () => {
    const document: ClickyDocument = {
      version: 1,
      node: {
        kind: "code",
        language: "json",
        source: "{ this is not json }",
        // Pre-rendered chroma html so we can confirm the fallback path
        // engaged without depending on chroma running in the test env.
        highlightedHtml: '<pre class="chroma">malformed-marker</pre>',
      },
    };

    const { container } = render(<Clicky data={document} />);

    expect(within(container).getByText("malformed-marker")).toBeInTheDocument();
  });

  it("preserves chroma html for xml code blocks", () => {
    const document: ClickyDocument = {
      version: 1,
      node: {
        kind: "code",
        language: "xml",
        source: "<Activity><Math/></Activity>",
        highlightedHtml:
          '<pre class="chroma"><span class="nt">Activity</span> tag</pre>',
      },
    };

    const { container } = render(<Clicky data={document} />);

    // The XML branch preserves chroma classes (we don't strip .nt or
    // similar) so the targeted Tailwind rules can colour them at runtime.
    const chromaPre = container.querySelector("pre.chroma");
    expect(chromaPre).not.toBeNull();
    expect(chromaPre?.querySelector(".nt")).not.toBeNull();
  });

  it("uses Shiki to highlight when only language+source provided", async () => {
    mockHighlightCode.mockResolvedValueOnce(
      '<pre class="shiki"><code><span class="shiki-token">type</span> SourceResolver</code></pre>',
    );

    const document: ClickyDocument = {
      version: 1,
      node: {
        kind: "code",
        language: "go",
        source: "type SourceResolver interface {}",
      },
    };

    const { container } = render(<Clicky data={document} />);

    await waitFor(() => {
      expect(container.querySelector("pre.shiki")).not.toBeNull();
    });
    expect(mockHighlightCode).toHaveBeenCalledWith(
      "type SourceResolver interface {}",
      {
        lang: "go",
        theme: "github-light",
      },
    );
    expect(within(container).getByText("SourceResolver")).toBeInTheDocument();
  });

  it("falls back to plain pre when Shiki returns null", async () => {
    mockHighlightCode.mockResolvedValueOnce(null);

    const source = "fictional unknown-language source";
    const document: ClickyDocument = {
      version: 1,
      node: {
        kind: "code",
        language: "fictional-lang",
        source,
      },
    };

    const { container } = render(<Clicky data={document} />);

    await waitFor(() => expect(mockHighlightCode).toHaveBeenCalled());
    // No shiki wrapper appears, the unhighlighted source is rendered inside
    // a plain <pre> so operators still see something readable.
    expect(container.querySelector("pre.shiki")).toBeNull();
    expect(within(container).getByText(source)).toBeInTheDocument();
  });
});
