import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClickyRow } from "../data/Clicky";
import { OperationEntityContextPicker } from "./OperationEntityContextPicker";
import {
  contextItemFromEntityRow,
  entityContextItemID,
} from "./OperationEntityContextPicker.model";
import type { ExecutionResponse, OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";

const text = (plain: string) => ({ kind: "text" as const, plain, text: plain });

const widgetRow: ClickyRow = {
  cells: {
    id: text("widget-1"),
    name: text("Quarterly close"),
    status: text("pending"),
    owner: text("Finance"),
  },
};

const secondWidgetRow: ClickyRow = {
  cells: {
    id: text("widget-2"),
    name: text("Year-end pack"),
    status: text("ready"),
    owner: text("Reporting"),
  },
};

function spec(withDetail = true): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "test", version: "1" },
    "x-clicky": {
      surfaces: [{ key: "widgets", entity: "widget", title: "Widgets" }],
    },
    paths: {
      "/api/v1/widgets": {
        get: {
          operationId: "widgets",
          parameters: [
            { name: "q", in: "query", "x-clicky": { role: "search" } },
            { name: "limit", in: "query", "x-clicky": { role: "limit" } },
            { name: "offset", in: "query", "x-clicky": { role: "offset" } },
          ],
          "x-clicky": {
            surface: "widgets",
            verb: "list",
            scope: "collection",
            group: "Accounting Read",
          },
          responses: {},
        },
      },
      ...(withDetail
        ? {
            "/api/v1/widgets/{id}": {
              get: {
                operationId: "widget_get",
                parameters: [{ name: "id", in: "path" as const }],
                "x-clicky": {
                  surface: "widgets",
                  verb: "get" as const,
                  scope: "entity" as const,
                  idParam: "id",
                },
                responses: {},
              },
            },
          }
        : {}),
    },
  };
}

const listResponse: ExecutionResponse = {
  success: true,
  exit_code: 0,
  contentType: "application/json+clicky",
  parsed: {
    version: 1,
    node: {
      kind: "table",
      columns: [
        { name: "id", label: "ID" },
        { name: "name", label: "Name" },
        { name: "status", label: "Status" },
        { name: "owner", label: "Owner" },
      ],
      rows: [widgetRow, secondWidgetRow],
    },
  },
};

function multiGroupSpec(): OpenAPISpec {
  const listOp = (surface: string) => ({
    operationId: surface,
    "x-clicky": { surface, verb: "list" as const, scope: "collection" as const },
    responses: {},
  });
  return {
    openapi: "3.0.0",
    info: { title: "test", version: "1" },
    "x-clicky": {
      surfaces: [
        { key: "accounts", entity: "account", title: "Accounts", parent: "xero" },
        { key: "offers", entity: "offer", title: "Offers", parent: "takealot" },
      ],
    },
    paths: {
      "/api/v1/accounts": { get: listOp("accounts") },
      "/api/v1/offers": { get: listOp("offers") },
    },
  };
}

function client(withDetail = true) {
  const executeCommand = vi.fn(async (path: string) => {
    if (path.includes("{id}")) {
      return {
        success: true,
        exit_code: 0,
        parsed: {
          id: "widget-1",
          name: "Quarterly close",
          secret: "full detail",
        },
      } satisfies ExecutionResponse;
    }
    return listResponse;
  });
  const value: OperationsApiClient = {
    getOpenAPISpec: async () => spec(withDetail),
    executeCommand,
    lookupFilters: async () => ({ filters: { q: { label: "Search" } } }),
  };
  return { value, executeCommand };
}

function renderPicker(api: OperationsApiClient, onAdd = vi.fn(), items = []) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <OperationEntityContextPicker client={api} items={items} onAdd={onAdd} />
    </QueryClientProvider>,
  );
  return onAdd;
}

async function openWidgets() {
  fireEvent.click(screen.getByRole("button", { name: "Add context" }));
  fireEvent.click(await screen.findByRole("menuitem", { name: "Widgets" }));
  return screen.findByRole("dialog", { name: "Add Widgets context" });
}

beforeEach(() => vi.clearAllMocks());

describe("entity context conversion", () => {
  it("builds a stable compact context item around the rich record", () => {
    const item = contextItemFromEntityRow(
      { key: "widgets", entity: "widget", title: "Widgets" },
      widgetRow,
      { id: "widget-1", extra: true },
    );
    expect(item).toEqual({
      id: "entity:widgets:widget-1",
      type: "widgets",
      label: "Quarterly close",
      fields: { status: "pending", owner: "Finance" },
      payload: {
        surfaceKey: "widgets",
        surfaceTitle: "Widgets",
        entity: "widget",
        id: "widget-1",
        record: { id: "widget-1", extra: true },
      },
    });
  });
});

describe("OperationEntityContextPicker", () => {
  it("hydrates the selected row through its detail operation", async () => {
    const api = client();
    const onAdd = renderPicker(api.value);

    await openWidgets();
    fireEvent.click(await screen.findByText("Quarterly close"));
    fireEvent.click(screen.getByRole("button", { name: "Add 1 record" }));

    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1));
    expect(onAdd.mock.calls[0]?.[0].payload).toMatchObject({
      record: { secret: "full detail" },
    });
    expect(api.executeCommand).toHaveBeenCalledWith(
      "/api/v1/widgets/{id}",
      "get",
      { id: "widget-1" },
      { Accept: "application/json" },
    );
  });

  it("falls back to the list row when the surface has no detail operation", async () => {
    const api = client(false);
    const onAdd = renderPicker(api.value);

    await openWidgets();
    fireEvent.click(await screen.findByText("Quarterly close"));
    fireEvent.click(screen.getByRole("button", { name: "Add 1 record" }));

    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1));
    expect(onAdd.mock.calls[0]?.[0].payload).toMatchObject({
      record: {
        id: "widget-1",
        name: "Quarterly close",
        status: "pending",
        owner: "Finance",
      },
    });
    expect(api.executeCommand).toHaveBeenCalledTimes(1);
  });

  it("disables a row that is already attached", async () => {
    const api = client();
    const onAdd = renderPicker(api.value, vi.fn(), [
      {
        id: entityContextItemID("widgets", "widget-1"),
        type: "widgets",
        label: "Quarterly close",
      },
    ]);

    await openWidgets();
    const rowLabel = await screen.findByText("Quarterly close");
    expect(screen.getByText("Attached")).toBeInTheDocument();
    fireEvent.click(rowLabel);

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Add records" })).toBeDisabled();
    expect(
      screen.getByText(
        "1 context record attached. Attached rows are disabled.",
      ),
    ).toBeInTheDocument();
  });

  it("keeps the dialog open and reports a detail hydration failure", async () => {
    const api = client();
    api.executeCommand.mockImplementation(async (path: string) => {
      if (path.includes("{id}")) throw new Error("detail unavailable");
      return listResponse;
    });
    const onAdd = renderPicker(api.value);

    await openWidgets();
    fireEvent.click(await screen.findByText("Quarterly close"));
    fireEvent.click(screen.getByRole("button", { name: "Add 1 record" }));

    expect(await screen.findByText(/detail unavailable/)).toBeInTheDocument();
    expect(
      screen.getByRole("dialog", { name: "Add Widgets context" }),
    ).toBeInTheDocument();
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("selects multiple entity rows and adds them in one batch", async () => {
    const api = client(false);
    const onAddMany = vi.fn();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <OperationEntityContextPicker
          client={api.value}
          items={[]}
          onAdd={vi.fn()}
          onAddMany={onAddMany}
        />
      </QueryClientProvider>,
    );

    await openWidgets();
    fireEvent.click(await screen.findByText("Quarterly close"));
    fireEvent.click(screen.getByText("Year-end pack"));
    fireEvent.click(screen.getByRole("button", { name: "Add 2 records" }));

    await waitFor(() => expect(onAddMany).toHaveBeenCalledTimes(1));
    expect(onAddMany.mock.calls[0]?.[0]).toHaveLength(2);
    expect(
      onAddMany.mock.calls[0]?.[0].map((item: { id: string }) => item.id),
    ).toEqual(["entity:widgets:widget-1", "entity:widgets:widget-2"]);
  });

  it("keeps a selection made on a previous page after paging", async () => {
    const thirdWidgetRow: ClickyRow = {
      cells: {
        id: text("widget-3"),
        name: text("Q1 forecast"),
        status: text("ready"),
        owner: text("Finance"),
      },
    };
    const fourthWidgetRow: ClickyRow = {
      cells: {
        id: text("widget-4"),
        name: text("Audit pack"),
        status: text("pending"),
        owner: text("Audit"),
      },
    };
    // Server-shaped pages: the second page (offset >= 2) returns a disjoint set
    // of rows, and the response carries the total so a Next-page control appears.
    const pageResponse = (offset: number): ExecutionResponse => ({
      success: true,
      exit_code: 0,
      contentType: "application/json+clicky",
      pagination: { total: 4, limit: 2, offset },
      parsed: {
        version: 1,
        node: {
          kind: "table",
          columns: [
            { name: "id", label: "ID" },
            { name: "name", label: "Name" },
            { name: "status", label: "Status" },
            { name: "owner", label: "Owner" },
          ],
          rows:
            offset >= 2
              ? [thirdWidgetRow, fourthWidgetRow]
              : [widgetRow, secondWidgetRow],
        },
      },
    });
    const executeCommand = vi.fn(
      async (_path: string, _method: string, params: Record<string, unknown>) =>
        pageResponse(Number(params?.offset ?? 0)),
    );
    const api: OperationsApiClient = {
      getOpenAPISpec: async () => spec(false),
      executeCommand,
    };
    renderPicker(api);

    await openWidgets();
    // Page 1: pick a row, then page forward.
    fireEvent.click(await screen.findByText("Quarterly close"));
    expect(
      await screen.findByRole("button", { name: "Add 1 record" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    fireEvent.click(await screen.findByText("Q1 forecast"));

    // The page-1 selection survives — the running count is 2, not 1.
    expect(
      await screen.findByRole("button", { name: "Add 2 records" }),
    ).toBeInTheDocument();
  });

  it("nests surfaces from different groups under provider submenus", async () => {
    const executeCommand = vi.fn(async () => listResponse);
    const api: OperationsApiClient = {
      getOpenAPISpec: async () => multiGroupSpec(),
      executeCommand,
    };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <OperationEntityContextPicker client={api} items={[]} onAdd={vi.fn()} />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add context" }));
    // Two providers (surface.parent) become submenu triggers, and their types
    // are hidden until a provider is opened.
    const xero = await screen.findByRole("menuitem", { name: /xero/i });
    expect(xero).toHaveAttribute("aria-haspopup", "menu");
    expect(screen.getByRole("menuitem", { name: /takealot/i })).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Accounts" }),
    ).not.toBeInTheDocument();

    fireEvent.click(xero);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Accounts" }));
    expect(
      await screen.findByRole("dialog", { name: "Add Accounts context" }),
    ).toBeInTheDocument();
  });

  it("drops the redundant group prefix from a submenu child but keeps it on the dialog", async () => {
    const executeCommand = vi.fn(async () => listResponse);
    const api: OperationsApiClient = {
      getOpenAPISpec: async () => multiGroupSpec(),
      executeCommand,
    };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <OperationEntityContextPicker
          client={api}
          items={[]}
          onAdd={vi.fn()}
          surfaceGroup={(surface) =>
            surface.key === "accounts" ? "Xero" : "Takealot"
          }
          surfaceLabel={(surface) =>
            surface.key === "accounts" ? "Xero Transactions" : "Takealot Offers"
          }
        />
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add context" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /xero/i }));

    // The child sits under the "Xero" submenu, so the provider prefix is dropped.
    expect(
      await screen.findByRole("menuitem", { name: "Transactions" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: "Xero Transactions" }),
    ).not.toBeInTheDocument();

    // The dialog title keeps the full provider-qualified label.
    fireEvent.click(screen.getByRole("menuitem", { name: "Transactions" }));
    expect(
      await screen.findByRole("dialog", {
        name: "Add Xero Transactions context",
      }),
    ).toBeInTheDocument();
  });
});
