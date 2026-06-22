import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperationCatalog } from "./OperationCatalog";
import type { RenderLink } from "./EndpointList";
import type { ExecutionResponse, OpenAPISpec, OperationLookupResponse } from "./types";
import type { OperationsApiClient } from "./useOperations";

function makeSpec(): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "test", version: "1" },
    paths: {
      "/api/v1/widgets": {
        get: {
          operationId: "widget_list",
          tags: ["widget"],
          "x-clicky": { surface: "widgets", verb: "list", scope: "collection" },
          parameters: [
            { name: "q", in: "query", schema: { type: "string" } },
            {
              name: "limit",
              in: "query",
              schema: { type: "integer" },
              "x-clicky": { role: "limit" },
            },
            {
              name: "offset",
              in: "query",
              schema: { type: "integer" },
              "x-clicky": { role: "offset" },
            },
            {
              name: "kind",
              in: "query",
              schema: { type: "string", enum: ["big", "small"] },
            },
            { name: "team", in: "query", schema: { type: "string" } },
            { name: "tags", in: "query", schema: { type: "string" } },
            { name: "include-archived", in: "query", schema: { type: "boolean" } },
            { name: "from", in: "query", schema: { type: "string" } },
            { name: "to", in: "query", schema: { type: "string" } },
          ],
          responses: {},
        },
        post: {
          operationId: "widget_create",
          tags: ["widget"],
          "x-clicky": { surface: "widgets", verb: "create", scope: "collection" },
          responses: {},
        },
      },
      "/api/v1/widgets/{id}": {
        get: {
          operationId: "widget_get",
          tags: ["widget"],
          "x-clicky": { surface: "widgets", verb: "get", scope: "entity", idParam: "id" },
          parameters: [{ name: "id", in: "path" }],
          responses: {},
        },
        put: {
          operationId: "widget_update",
          tags: ["widget"],
          summary: "Update a widget",
          "x-clicky": { surface: "widgets", verb: "update", scope: "entity", idParam: "id" },
          parameters: [{ name: "id", in: "path" }],
          responses: {},
        },
        delete: {
          operationId: "widget_delete",
          tags: ["widget"],
          summary: "Delete a widget",
          "x-clicky": { surface: "widgets", verb: "delete", scope: "entity", idParam: "id" },
          parameters: [{ name: "id", in: "path" }],
          responses: {},
        },
      },
      "/api/v1/widgets/{id}/restart": {
        post: {
          operationId: "widget_restart",
          tags: ["widget"],
          summary: "Restart a widget",
          "x-clicky": {
            surface: "widgets",
            verb: "action",
            actionName: "restart",
            scope: "entity",
            idParam: "id",
          },
          parameters: [{ name: "id", in: "path" }],
          responses: {},
        },
      },
      "/api/v1/widgets/pause": {
        post: {
          operationId: "widget_pause",
          tags: ["widget"],
          summary: "Pause widgets matching the current filters",
          "x-clicky": {
            surface: "widgets",
            verb: "action",
            actionName: "pause",
            scope: "collection",
            idParam: "id",
            supportsFilterMode: true,
          },
          responses: {},
        },
      },
    },
  };
}

const clickyTableResponse: ExecutionResponse = {
  success: true,
  exit_code: 0,
  stdout: JSON.stringify({
    version: 1,
    node: {
      kind: "table",
      columns: [
        { name: "ID", label: "ID" },
        { name: "Name", label: "Name" },
      ],
      rows: [
        {
          cells: {
            ID: {
              kind: "link-command",
              command: "widget/get",
              args: ["one"],
              autoRun: true,
              text: "one",
              plain: "one",
            },
            Name: { kind: "text", text: "First", plain: "First" },
          },
        },
      ],
    },
  }),
};

function clickyTablePageResponse(
  rowCount: number,
  pagination: NonNullable<ExecutionResponse["pagination"]>,
): ExecutionResponse {
  return {
    ...clickyTableResponse,
    stdout: JSON.stringify({
      version: 1,
      node: {
        kind: "map",
        fields: [
          {
            name: "Data",
            value: {
              kind: "table",
              columns: [
                { name: "ID", label: "ID" },
                { name: "Name", label: "Name" },
              ],
              rows: Array.from({ length: rowCount }, (_, index) => ({
                cells: {
                  ID: {
                    kind: "text",
                    text: `widget-${index + 1}`,
                    plain: `widget-${index + 1}`,
                  },
                  Name: {
                    kind: "text",
                    text: `Widget ${index + 1}`,
                    plain: `Widget ${index + 1}`,
                  },
                },
              })),
            },
          },
          {
            name: "Page",
            value: {
              kind: "map",
              fields: [
                { name: "Limit", value: { kind: "text", text: String(pagination.limit) } },
                { name: "Offset", value: { kind: "text", text: String(pagination.offset) } },
                { name: "Total", value: { kind: "text", text: String(pagination.total) } },
              ],
            },
          },
        ],
      },
    }),
    pagination,
  };
}

function makeClient(
  executeResponse: ExecutionResponse = clickyTableResponse,
): OperationsApiClient & {
  executeMock: ReturnType<typeof vi.fn>;
  lookupMock: ReturnType<typeof vi.fn>;
} {
  const executeMock = vi.fn().mockResolvedValue(executeResponse);
  const lookupMock = vi.fn().mockResolvedValue(undefined);
  return {
    executeMock,
    lookupMock,
    getOpenAPISpec: async () => makeSpec(),
    executeCommand: executeMock,
    lookupFilters: lookupMock,
  };
}

function makeLookupResponse(): OperationLookupResponse {
  return {
    filters: {
      team: {
        label: "Team",
        options: {
          "team/platform": { kind: "text", text: "Platform", plain: "Platform" },
          "team/core": { kind: "text", text: "Core", plain: "Core" },
        },
      },
      tags: {
        label: "Tags",
        multi: true,
        options: {
          api: { kind: "text", text: "API", plain: "API" },
          worker: { kind: "text", text: "Worker", plain: "Worker" },
        },
      },
      "include-archived": {
        label: "Include archived",
        type: "bool",
      },
      from: {
        label: "From",
        type: "from",
      },
      to: {
        label: "To",
        type: "to",
      },
    },
  };
}

const renderFakeLink: RenderLink = ({ to, className, children, title, key }) => (
  <a key={key} href={to} className={className} title={title}>
    {children}
  </a>
);

function renderCatalog(client: OperationsApiClient) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <OperationCatalog
        definition={{
          key: "widgets",
          title: "Widgets",
          description: "All the widgets.",
        }}
        entities={["widget"]}
        surfaceKey="widgets"
        client={client}
        renderLink={renderFakeLink}
      />
    </QueryClientProvider>,
  );
}

describe("OperationCatalog", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    window.history.replaceState(null, "", "/");
  });

  it("renders the table with rows from the list endpoint", async () => {
    const client = makeClient();
    renderCatalog(client);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Widgets" })).toBeInTheDocument(),
    );
    await waitFor(() => {
      expect(screen.getByText("First")).toBeInTheDocument();
    });
    expect(client.executeMock).toHaveBeenCalledTimes(1);
    expect(client.executeMock).toHaveBeenCalledWith(
      "/api/v1/widgets",
      "get",
      {},
      { Accept: "application/json+clicky" },
    );
    // ID cell rendered as a link-command node (no command runtime in the
    // test harness, so it falls back to an inline span containing the id).
    expect(screen.getByText("one")).toBeInTheDocument();
  });

  it("shows only collection-scoped actions in the list action bar", async () => {
    const client = makeClient();
    renderCatalog(client);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Widgets" })).toBeInTheDocument(),
    );

    // Collection-scoped actions belong on the list: create + the bulk pause
    // (which acts on the filtered set).
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

    // Entity-scoped actions require an {id} and live on the detail page; they
    // must not leak onto the list action bar.
    expect(screen.queryByRole("button", { name: "Update" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Restart" })).not.toBeInTheDocument();
  });

  it("lets a resultRenderer replace the default result surface, receiving the response", async () => {
    const client = makeClient();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    let seenSurfaceKey: string | undefined = "unset";
    let seenSuccess: boolean | undefined;
    render(
      <QueryClientProvider client={queryClient}>
        <OperationCatalog
          definition={{ key: "widgets", title: "Widgets", description: "All the widgets." }}
          entities={["widget"]}
          surfaceKey="widgets"
          client={client}
          renderLink={renderFakeLink}
          resultRenderer={({ surfaceKey, response }) => {
            seenSurfaceKey = surfaceKey;
            if (response) seenSuccess = response.success;
            return <div data-testid="custom-result">custom logs view</div>;
          }}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("custom-result")).toBeInTheDocument());
    // The renderer is re-invoked once the list response resolves.
    await waitFor(() => expect(seenSuccess).toBe(true));
    // The default clicky table cell must not render — the override replaced it.
    expect(screen.queryByText("First")).not.toBeInTheDocument();
    expect(seenSurfaceKey).toBe("widgets");
  });

  it("renders the default table when the resultRenderer returns defaultView", async () => {
    const client = makeClient();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <OperationCatalog
          definition={{ key: "widgets", title: "Widgets", description: "All the widgets." }}
          entities={["widget"]}
          surfaceKey="widgets"
          client={client}
          renderLink={renderFakeLink}
          resultRenderer={({ defaultView }) => defaultView}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText("First")).toBeInTheDocument());
  });

  it("paginates list tables through native table controls", async () => {
    const client = makeClient(
      clickyTablePageResponse(5, {
        total: 14,
        limit: 5,
        offset: 0,
      }),
    );
    renderCatalog(client);

    expect(await screen.findByText("1-5 of 14")).toBeInTheDocument();
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(screen.queryByText("Total")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(2));
    expect(client.executeMock).toHaveBeenLastCalledWith(
      "/api/v1/widgets",
      "get",
      { limit: "5", offset: "5" },
      { Accept: "application/json+clicky" },
    );

    fireEvent.change(screen.getByLabelText("Rows per page"), { target: { value: "10" } });

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(3));
    expect(client.executeMock).toHaveBeenLastCalledWith(
      "/api/v1/widgets",
      "get",
      { limit: "10", offset: "0" },
      { Accept: "application/json+clicky" },
    );
  });

  it("live-filters: typing debounces then refires with the final value", async () => {
    const client = makeClient();
    renderCatalog(client);

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));

    // The list filters now live inside the rendered table's FilterBar, so wait
    // for the table response to mount before driving the Q field.
    const search = await screen.findByLabelText("Q");
    fireEvent.change(search, { target: { value: "foo" } });
    fireEvent.change(search, { target: { value: "foobar" } });

    // No Apply button exists.
    expect(screen.queryByRole("button", { name: /apply/i })).not.toBeInTheDocument();

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(2), { timeout: 2_000 });
    expect(client.executeMock).toHaveBeenLastCalledWith(
      "/api/v1/widgets",
      "get",
      { q: "foobar" },
      { Accept: "application/json+clicky" },
    );
  });

  it("preserves reserved URL params when writing live filters", async () => {
    window.history.replaceState(null, "", "/widgets?__entity=entity-1");
    const client = makeClient();
    renderCatalog(client);

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));

    const search = await screen.findByLabelText("Q");
    fireEvent.change(search, { target: { value: "scoped" } });

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(2), { timeout: 2_000 });
    const params = new URLSearchParams(window.location.search);
    expect(params.get("__entity")).toBe("entity-1");
    expect(params.get("q")).toBe("scoped");
  });

  it("switches to the endpoint list view", async () => {
    const client = makeClient();
    renderCatalog(client);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Widgets" })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /endpoint list view/i }));
    // The id path now carries several methods (get/put/delete), so it appears
    // once per operation in the endpoint list.
    expect(screen.getAllByText("/api/v1/widgets/{id}").length).toBeGreaterThan(0);
    expect(screen.getAllByText("GET").length).toBeGreaterThan(0);
    expect(screen.getAllByText("POST").length).toBeGreaterThan(0);
  });

  it("uses lookup metadata to shape list filters while keeping enum filters strict", async () => {
    const client = makeClient();
    client.lookupMock.mockResolvedValue(makeLookupResponse());
    renderCatalog(client);

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(client.lookupMock).toHaveBeenCalledTimes(1));

    // Filters render inside the table's FilterBar once the response mounts.
    expect(await screen.findByLabelText(/kind/i)).toHaveRole("combobox");
    expect(screen.getByLabelText("Team")).toHaveRole("combobox");
    expect(screen.getByLabelText("Tags")).toHaveRole("combobox");
    expect(screen.getByLabelText("Include archived")).toHaveAttribute("type", "checkbox");
    expect(screen.getByRole("button", { name: /date range filter/i })).toBeInTheDocument();
    expect(screen.queryByLabelText("From")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("To")).not.toBeInTheDocument();
  });

  it("live-filters: selecting a lookup option refires the list", async () => {
    const client = makeClient();
    client.lookupMock.mockResolvedValue(makeLookupResponse());
    renderCatalog(client);

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(client.lookupMock).toHaveBeenCalledTimes(1));

    const team = await screen.findByLabelText("Team");
    fireEvent.focus(team);
    fireEvent.mouseDown(screen.getByRole("option", { name: "Platform" }));

    await waitFor(
      () =>
        expect(client.executeMock).toHaveBeenLastCalledWith(
          "/api/v1/widgets",
          "get",
          { team: "team/platform" },
          { Accept: "application/json+clicky" },
        ),
      { timeout: 2_000 },
    );
  });
});
