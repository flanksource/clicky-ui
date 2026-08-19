import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperationCatalog } from "./OperationCatalog";
import type { RenderLink } from "./EndpointList";
import type {
  ExecutionResponse,
  OpenAPISpec,
  OperationLookupResponse,
} from "./types";
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
              name: "filter.Name",
              in: "query",
              schema: { type: "string" },
              "x-clicky": { role: "filter" },
            },
            {
              name: "kind",
              in: "query",
              schema: { type: "string", enum: ["big", "small"] },
            },
            { name: "team", in: "query", schema: { type: "string" } },
            { name: "tags", in: "query", schema: { type: "string" } },
            {
              name: "include-archived",
              in: "query",
              schema: { type: "boolean" },
            },
            { name: "from", in: "query", schema: { type: "string" } },
            { name: "to", in: "query", schema: { type: "string" } },
          ],
          responses: {},
        },
        post: {
          operationId: "widget_create",
          tags: ["widget"],
          "x-clicky": {
            surface: "widgets",
            verb: "create",
            scope: "collection",
          },
          responses: {},
        },
      },
      "/api/v1/widgets/{id}": {
        get: {
          operationId: "widget_get",
          tags: ["widget"],
          "x-clicky": {
            surface: "widgets",
            verb: "get",
            scope: "entity",
            idParam: "id",
          },
          parameters: [{ name: "id", in: "path" }],
          responses: {},
        },
        put: {
          operationId: "widget_update",
          tags: ["widget"],
          summary: "Update a widget",
          "x-clicky": {
            surface: "widgets",
            verb: "update",
            scope: "entity",
            idParam: "id",
          },
          parameters: [{ name: "id", in: "path" }],
          responses: {},
        },
        delete: {
          operationId: "widget_delete",
          tags: ["widget"],
          summary: "Delete a widget",
          "x-clicky": {
            surface: "widgets",
            verb: "delete",
            scope: "entity",
            idParam: "id",
          },
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
        { name: "Name", label: "Name", filterKey: "filter.Name" },
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
            Name: {
              kind: "text",
              text: "First",
              plain: "First",
              filterValue: "first.raw",
            },
          },
        },
      ],
    },
  }),
};

const ambiguousPlanResponse: ExecutionResponse = {
  success: false,
  exit_code: 1,
  error:
    '--plan: plan "Example Plan" is ambiguous: 2 matches (Example Plan [11111111-1111-1111-1111-111111111111], Example Plan [22222222-2222-2222-2222-222222222222]) — re-run with one of the GUIDs',
  stdout: "",
};

function clickyTablePageResponse(
  rowCount: number,
  pagination: NonNullable<ExecutionResponse["pagination"]>,
): ExecutionResponse {
  const offset = pagination.offset ?? 0;
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
                    text: `widget-${offset + index + 1}`,
                    plain: `widget-${offset + index + 1}`,
                  },
                  Name: {
                    kind: "text",
                    text: `Widget ${offset + index + 1}`,
                    plain: `Widget ${offset + index + 1}`,
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
                {
                  name: "Limit",
                  value: { kind: "text", text: String(pagination.limit) },
                },
                {
                  name: "Offset",
                  value: { kind: "text", text: String(pagination.offset) },
                },
                {
                  name: "Total",
                  value: { kind: "text", text: String(pagination.total) },
                },
              ],
            },
          },
        ],
      },
    }),
    pagination,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
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
          "team/platform": {
            kind: "text",
            text: "Platform",
            plain: "Platform",
          },
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
      "filter.Name": {
        label: "Name",
        multi: true,
        type: "multi-filter",
        options: {
          First: { kind: "text", text: "First", plain: "First" },
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

const renderFakeLink: RenderLink = ({
  to,
  className,
  children,
  title,
  key,
}) => (
  <a key={key} href={to} className={className} title={title}>
    {children}
  </a>
);

function renderCatalog(
  client: OperationsApiClient,
  actionLabels?: Record<string, string>,
) {
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
        {...(actionLabels ? { actionLabels } : {})}
      />
    </QueryClientProvider>,
  );
}

describe("OperationCatalog", () => {
  it("bounds the result pipeline so table rows scroll between the header and pager", async () => {
    renderCatalog(makeClient());

    const region = await screen.findByRole("region", {
      name: "Widgets results",
    });
    const catalog = document.querySelector('[data-slot="operation-catalog"]');
    const results = document.querySelector(
      '[data-slot="operation-catalog-results"]',
    );

    expect(catalog).toHaveClass("h-full", "min-h-0", "flex-col");
    expect(results).toHaveClass("min-h-0", "flex-1");
    expect(region).toHaveClass("h-full", "min-h-0", "flex-col");
    await waitFor(() =>
      expect(document.querySelector(".detail-output")).toHaveClass(
        "min-h-0",
        "flex-1",
        "flex-col",
      ),
    );
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    window.history.replaceState(null, "", "/");
  });

  it("renders the table with rows from the list endpoint", async () => {
    const client = makeClient();
    renderCatalog(client);

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

  it("updates the native list filter and URL from a table cell action", async () => {
    const client = makeClient();
    client.lookupMock.mockResolvedValue(makeLookupResponse());
    renderCatalog(client);

    const value = await screen.findByText("First");
    fireEvent.mouseEnter(value.closest("span.relative")!);
    fireEvent.click(
      await screen.findByRole("button", { name: "Include First" }),
    );

    await waitFor(() =>
      expect(client.executeMock).toHaveBeenLastCalledWith(
        "/api/v1/widgets",
        "get",
        { "filter.Name": "first.raw", offset: "0" },
        { Accept: "application/json+clicky" },
      ),
    );
    expect(new URLSearchParams(window.location.search).get("filter.Name")).toBe(
      "first.raw",
    );
  });

  // A filter's options are refetched on every selection, but the control they
  // fill is described by the spec, which is fetched once. Reading the control's
  // identity from the in-flight lookup instead collapsed every chip in the bar
  // into a plain text input for the length of that fetch.
  it("keeps a lookup-backed control while the next option set is in flight", async () => {
    const spec = makeSpec();
    spec.components = {
      "x-clicky-filters": {
        widget_workload: { type: "workload", label: "Workload" },
      },
    };
    spec.paths["/api/v1/widgets"]!.get!.parameters!.push({
      name: "workload",
      in: "query",
      schema: { type: "string" },
      "x-clicky": { role: "filter" },
      "x-clicky-lookup": {
        $ref: "#/components/x-clicky-filters/widget_workload",
        url: "/api/v1/widgets",
        filter: "workload",
        searchParam: "__lookup_q",
      },
    });

    const client = makeClient();
    client.getOpenAPISpec = async () => spec;
    // Every lookup hangs, including the first: this holds open the window the
    // bar used to degrade in, and covers first paint, where there is no earlier
    // option set to fall back on and only the spec can describe the control.
    client.lookupMock.mockReturnValue(new Promise(() => {}));

    window.history.replaceState(
      null,
      "",
      "/?workload=payments%2FDeployment%2Fapi",
    );
    renderCatalog(client);

    // The picker renders from the spec alone, before any options exist. A plain
    // text input here is the bug: it is what the bar decayed into.
    const value = await screen.findByText("First");
    expect(screen.getByLabelText("Workload")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Workload" })).toBeNull();

    fireEvent.mouseEnter(value.closest("span.relative")!);
    fireEvent.click(
      await screen.findByRole("button", { name: "Include First" }),
    );

    await waitFor(() =>
      expect(client.lookupMock.mock.calls.length).toBeGreaterThan(1),
    );
    // …and it still is one after a filter change, the window the reported bug
    // was seen in.
    expect(screen.getByLabelText("Workload")).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: "Workload" })).toBeNull();
  });

  it("renders a resolved Clicky command failure as a table error", async () => {
    renderCatalog(makeClient(ambiguousPlanResponse));

    const alert = await screen.findByRole("alert");
    const region = screen.getByRole("region", {
      name: "Widgets results",
    });
    const table = within(region).getByRole("table");
    expect(alert).toHaveTextContent(ambiguousPlanResponse.error!);
    expect(
      within(table).getByRole("columnheader", { name: "Error" }),
    ).toBeInTheDocument();
    expect(
      within(table).queryByRole("button", { name: "Error" }),
    ).not.toBeInTheDocument();
    expect(within(region).queryByText("Success")).not.toBeInTheDocument();
    expect(within(region).queryByText("ExitCode")).not.toBeInTheDocument();
  });

  it("renders a rejected list request as a table error", async () => {
    const client = makeClient();
    client.executeMock.mockRejectedValue(new Error("List request unavailable"));
    renderCatalog(client);

    const alert = await screen.findByRole("alert");
    const region = screen.getByRole("region", {
      name: "Widgets results",
    });
    expect(within(region).getByRole("table")).toBeInTheDocument();
    expect(alert).toHaveTextContent("List request unavailable");
  });

  it("keeps list filters available so a table error can recover", async () => {
    const client = makeClient();
    client.executeMock
      .mockResolvedValueOnce(ambiguousPlanResponse)
      .mockResolvedValueOnce(clickyTableResponse);
    renderCatalog(client);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      ambiguousPlanResponse.error!,
    );
    fireEvent.change(screen.getByLabelText("Q"), {
      target: { value: "11111111-1111-1111-1111-111111111111" },
    });

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(2), {
      timeout: 2_000,
    });
    expect(await screen.findByText("First")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows only collection-scoped actions in the list action bar", async () => {
    const client = makeClient();
    renderCatalog(client);

    // Collection-scoped actions belong on the list: create + the bulk pause
    // (which acts on the filtered set).
    expect(
      await screen.findByRole("button", { name: "Create" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();

    // Entity-scoped actions require an {id} and live on the detail page; they
    // must not leak onto the list action bar.
    expect(
      screen.queryByRole("button", { name: "Update" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Restart" }),
    ).not.toBeInTheDocument();
  });

  it("uses host-provided surface action labels", async () => {
    const client = makeClient();
    renderCatalog(client, { create: "Add Widget" });

    expect(
      await screen.findByRole("button", { name: "Add Widget" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Create" }),
    ).not.toBeInTheDocument();
  });

  it("uses a wide modal for schema actions and places controls in its footer", async () => {
    const client = makeClient();
    client.getSchema = vi.fn(async () => ({ type: "object", properties: {} }));
    client.submitForm = vi.fn();
    renderCatalog(client);

    fireEvent.click(await screen.findByRole("button", { name: "Create" }));
    await waitFor(() =>
      expect(
        document.querySelector('[data-slot="modal-footer"]'),
      ).not.toBeNull(),
    );
    expect(screen.getByRole("dialog", { name: "Create" })).toHaveClass(
      "max-w-6xl",
    );
    const footer = document.querySelector('[data-slot="modal-footer"]');
    const body = document.querySelector('[data-slot="modal-body"]');
    const submit = within(footer as HTMLElement).getByRole("button", {
      name: "Create",
    });
    expect(body).not.toContainElement(submit);
    expect(footer).toContainElement(submit);
  });

  it("invalidates discovery queries after a successful mutation", async () => {
    const client = makeClient();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    render(
      <QueryClientProvider client={queryClient}>
        <OperationCatalog
          definition={{
            key: "widgets",
            title: "Widgets",
            description: "All widgets",
          }}
          entities={["widget"]}
          surfaceKey="widgets"
          client={client}
          renderLink={renderFakeLink}
          actionLabels={{ create: "Add Widget" }}
        />
      </QueryClientProvider>,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Add Widget" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Execute request" }),
    );

    await waitFor(() => {
      expect(invalidate).toHaveBeenCalledWith({ queryKey: ["openapi-spec"] });
      expect(invalidate).toHaveBeenCalledWith({
        queryKey: ["logs-entity-names"],
      });
    });
  });

  it("lets a resultRenderer replace the default result surface, receiving the response", async () => {
    const client = makeClient();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    let seenSurfaceKey: string | undefined = "unset";
    let seenSuccess: boolean | undefined;
    let seenCellFilterChange: unknown;
    render(
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
          resultRenderer={({ filterConfig, surfaceKey, response }) => {
            seenCellFilterChange = filterConfig.onCellFilterChange;
            seenSurfaceKey = surfaceKey;
            if (response) seenSuccess = response.success;
            return <div data-testid="custom-result">custom logs view</div>;
          }}
        />
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("custom-result")).toBeInTheDocument(),
    );
    // The renderer is re-invoked once the list response resolves.
    await waitFor(() => expect(seenSuccess).toBe(true));
    // The default clicky table cell must not render — the override replaced it.
    expect(screen.queryByText("First")).not.toBeInTheDocument();
    expect(seenSurfaceKey).toBe("widgets");
    expect(seenCellFilterChange).toEqual(expect.any(Function));
  });

  it("renders the default table when the resultRenderer returns defaultView", async () => {
    const client = makeClient();
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    render(
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
          resultRenderer={({ defaultView }) => defaultView}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(screen.getByText("First")).toBeInTheDocument());
  });

  it("paginates list tables through native table controls", async () => {
    const firstPage = clickyTablePageResponse(5, {
      total: 14,
      limit: 5,
      offset: 0,
    });
    const secondPage = deferred<ExecutionResponse>();
    const client = makeClient();
    client.lookupMock
      .mockResolvedValueOnce(makeLookupResponse())
      .mockReturnValue(new Promise(() => {}));
    client.executeMock
      .mockResolvedValueOnce(firstPage)
      .mockReturnValueOnce(secondPage.promise)
      .mockResolvedValueOnce(
        clickyTablePageResponse(10, {
          total: 14,
          limit: 10,
          offset: 0,
        }),
      );
    renderCatalog(client);

    expect(await screen.findByText("1-5 of 14")).toBeInTheDocument();
    expect(await screen.findByLabelText("Team")).toHaveRole("combobox");
    expect(client.lookupMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
    expect(screen.queryByText("Total")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(2));
    expect(screen.getByText("Widget 1")).toBeInTheDocument();
    expect(screen.getByText("1-5 of 14")).toBeInTheDocument();
    expect(screen.getByTestId("data-table-loading-bar")).toBeInTheDocument();
    expect(screen.getByLabelText("Team")).toHaveRole("combobox");
    expect(client.lookupMock).toHaveBeenCalledTimes(1);
    expect(client.executeMock).toHaveBeenLastCalledWith(
      "/api/v1/widgets",
      "get",
      { limit: "5", offset: "5" },
      { Accept: "application/json+clicky" },
    );

    secondPage.resolve(
      clickyTablePageResponse(5, {
        total: 14,
        limit: 5,
        offset: 5,
      }),
    );
    expect(await screen.findByText("Widget 6")).toBeInTheDocument();
    expect(screen.queryByText("Widget 1")).not.toBeInTheDocument();
    expect(screen.getByText("6-10 of 14")).toBeInTheDocument();
    expect(
      screen.queryByTestId("data-table-loading-bar"),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Rows per page"), {
      target: { value: "10" },
    });

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(3));
    expect(client.lookupMock).toHaveBeenCalledTimes(1);
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
    expect(
      screen.queryByRole("button", { name: /apply/i }),
    ).not.toBeInTheDocument();

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(2), {
      timeout: 2_000,
    });
    expect(client.executeMock).toHaveBeenLastCalledWith(
      "/api/v1/widgets",
      "get",
      // A filter change returns to the first page, so the position travels
      // with the request that changed the result set.
      { q: "foobar", offset: "0" },
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

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(2), {
      timeout: 2_000,
    });
    const params = new URLSearchParams(window.location.search);
    expect(params.get("__entity")).toBe("entity-1");
    expect(params.get("q")).toBe("scoped");
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
    expect(screen.getByLabelText("Include archived")).toHaveAttribute(
      "type",
      "checkbox",
    );
    expect(
      screen.getByRole("button", { name: /date range filter/i }),
    ).toBeInTheDocument();
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
          { team: "team/platform", offset: "0" },
          { Accept: "application/json+clicky" },
        ),
      { timeout: 2_000 },
    );
  });
});
