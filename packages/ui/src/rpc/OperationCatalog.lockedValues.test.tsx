import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperationCatalog } from "./OperationCatalog";
import type { RenderLink } from "./EndpointList";
import type { ExecutionResponse, OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";

// A minimal surface with one query-driven filter (q), one locked-shaped
// parameter (stream — the trace-results id a host panel pins), and paging.
function makeSpec(): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "test", version: "1" },
    paths: {
      "/api/v1/records": {
        get: {
          operationId: "record_list",
          tags: ["record"],
          "x-clicky": { surface: "records", verb: "list", scope: "collection" },
          parameters: [
            { name: "q", in: "query", schema: { type: "string" } },
            { name: "stream", in: "query", schema: { type: "string" } },
            {
              name: "from",
              in: "query",
              schema: { type: "string", format: "date-time" },
              "x-clicky": { role: "time-from" },
            },
            {
              name: "to",
              in: "query",
              schema: { type: "string", format: "date-time" },
              "x-clicky": { role: "time-to" },
            },
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
          ],
          responses: {},
        },
      },
    },
  };
}

function tableResponse(rowName: string): ExecutionResponse {
  return {
    success: true,
    exit_code: 0,
    stdout: JSON.stringify({
      version: 1,
      node: {
        kind: "table",
        columns: [{ name: "name", label: "Name" }],
        rows: [
          {
            cells: {
              name: { kind: "text", text: rowName, plain: rowName },
            },
          },
        ],
      },
    }),
  };
}

function tableResponseWithDetail(): ExecutionResponse {
  return {
    success: true,
    exit_code: 0,
    stdout: JSON.stringify({
      version: 1,
      node: {
        kind: "table",
        columns: [
          { name: "name", label: "Name" },
          { name: "detail", label: "Detail payload" },
        ],
        rows: [
          {
            cells: {
              name: { kind: "text", text: "Row one", plain: "Row one" },
              detail: {
                kind: "map",
                fields: [
                  {
                    name: "execution",
                    value: {
                      kind: "list",
                      items: [
                        {
                          kind: "map",
                          fields: [
                            {
                              name: "label",
                              value: { kind: "text", text: "process" },
                            },
                          ],
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    }),
  };
}

function makeClient(): OperationsApiClient & {
  executeMock: ReturnType<typeof vi.fn>;
  lookupMock: ReturnType<typeof vi.fn>;
} {
  const executeMock = vi.fn().mockResolvedValue(tableResponse("Row one"));
  const lookupMock = vi.fn().mockResolvedValue({ filters: {} });
  return {
    executeMock,
    lookupMock,
    getOpenAPISpec: async () => makeSpec(),
    executeCommand: executeMock,
    lookupFilters: lookupMock,
  };
}

const renderFakeLink: RenderLink = ({ to, className, children, title, key }) => (
  <a key={key} href={to} className={className} title={title}>
    {children}
  </a>
);

function renderCatalog(
  client: OperationsApiClient,
  overrides: Partial<React.ComponentProps<typeof OperationCatalog>> = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <OperationCatalog
        definition={{ key: "records", title: "Records", description: "" }}
        entities={["record"]}
        surfaceKey="records"
        client={client}
        renderLink={renderFakeLink}
        {...overrides}
      />
    </QueryClientProvider>,
  );
}

describe("OperationCatalog lockedValues", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("sends a locked value on every list request without rendering it as a filter chip", async () => {
    const client = makeClient();
    renderCatalog(client, { lockedValues: { stream: "trace-42" } });

    await waitFor(() =>
      expect(client.executeMock).toHaveBeenLastCalledWith(
        "/api/v1/records",
        "get",
        { stream: "trace-42" },
        { Accept: "application/json+clicky" },
      ),
    );
    // "stream" never appears as an editable field — only "q" does.
    expect(screen.queryByLabelText("Stream")).toBeNull();
    expect(screen.getByLabelText("Q")).toBeInTheDocument();
  });

  it("carries a locked value into the per-filter lookup request", async () => {
    const client = makeClient();
    renderCatalog(client, { lockedValues: { stream: "trace-42" } });

    await waitFor(() =>
      expect(client.lookupMock).toHaveBeenCalledWith(
        "/api/v1/records",
        "get",
        { stream: "trace-42" },
        { Accept: "application/json+clicky" },
      ),
    );
  });

  it("never round-trips a locked value through the URL", async () => {
    const client = makeClient();
    renderCatalog(client, { lockedValues: { stream: "trace-42" } });

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText("Q"), {
      target: { value: "foo" },
    });

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(2));
    const params = new URLSearchParams(window.location.search);
    expect(params.get("q")).toBe("foo");
    expect(params.has("stream")).toBe(false);
  });

  it("still applies a live-edited (non-locked) filter alongside the locked one", async () => {
    const client = makeClient();
    renderCatalog(client, { lockedValues: { stream: "trace-42" } });

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText("Q"), {
      target: { value: "needle" },
    });

    await waitFor(() =>
      expect(client.executeMock).toHaveBeenLastCalledWith(
        "/api/v1/records",
        "get",
        { q: "needle", stream: "trace-42", offset: "0" },
        { Accept: "application/json+clicky" },
      ),
    );
  });
});

describe("OperationCatalog urlState", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("writes list filters unprefixed by default", async () => {
    const client = makeClient();
    renderCatalog(client);

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText("Q"), { target: { value: "x" } });

    await waitFor(() =>
      expect(new URLSearchParams(window.location.search).get("q")).toBe("x"),
    );
  });

  it("writes nothing to the URL when urlState is false", async () => {
    const client = makeClient();
    renderCatalog(client, { urlState: false });

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText("Q"), { target: { value: "x" } });

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(2));
    expect(window.location.search).toBe("");
  });

  it("does not read initial filter state from the URL when urlState is false", async () => {
    window.history.replaceState(null, "", "/?q=stale");
    const client = makeClient();
    renderCatalog(client, { urlState: false });

    await waitFor(() =>
      expect(client.executeMock).toHaveBeenLastCalledWith(
        "/api/v1/records",
        "get",
        {},
        { Accept: "application/json+clicky" },
      ),
    );
  });

  it("namespaces read and written filters under the given prefix", async () => {
    window.history.replaceState(null, "", "/drawer?step=42&tr.q=preset");
    const client = makeClient();
    renderCatalog(client, { urlState: { prefix: "tr" } });

    // Read: the preset value under the prefix seeds the initial request.
    await waitFor(() =>
      expect(client.executeMock).toHaveBeenLastCalledWith(
        "/api/v1/records",
        "get",
        { q: "preset" },
        { Accept: "application/json+clicky" },
      ),
    );

    // Write: a further edit lands under the prefix, leaving the host's own
    // "step" param untouched.
    fireEvent.change(screen.getByLabelText("Q"), { target: { value: "next" } });
    await waitFor(() => {
      const params = new URLSearchParams(window.location.search);
      expect(params.get("tr.q")).toBe("next");
      expect(params.get("step")).toBe("42");
      expect(params.has("q")).toBe(false);
    });
  });
});

describe("OperationCatalog initialValues", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("seeds an editable filter field and sends it on the first request", async () => {
    const client = makeClient();
    renderCatalog(client, { initialValues: { q: "seeded" } });

    await waitFor(() =>
      expect(client.executeMock).toHaveBeenLastCalledWith(
        "/api/v1/records",
        "get",
        { q: "seeded" },
        { Accept: "application/json+clicky" },
      ),
    );
    // Unlike a locked value, it renders as an ordinary editable field.
    expect(screen.getByLabelText("Q")).toHaveValue("seeded");
  });

  it("lets a URL value win over the initial seed for the same key", async () => {
    window.history.replaceState(null, "", "/?q=fromUrl");
    const client = makeClient();
    renderCatalog(client, { initialValues: { q: "seeded" } });

    await waitFor(() =>
      expect(client.executeMock).toHaveBeenLastCalledWith(
        "/api/v1/records",
        "get",
        { q: "fromUrl" },
        { Accept: "application/json+clicky" },
      ),
    );
  });

  it("stays editable after being seeded", async () => {
    const client = makeClient();
    renderCatalog(client, { initialValues: { q: "seeded" } });

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText("Q"), {
      target: { value: "changed" },
    });

    await waitFor(() =>
      expect(client.executeMock).toHaveBeenLastCalledWith(
        "/api/v1/records",
        "get",
        { q: "changed", offset: "0" },
        { Accept: "application/json+clicky" },
      ),
    );
    expect(new URLSearchParams(window.location.search).get("q")).toBe(
      "changed",
    );
  });
});

describe("OperationCatalog filter placement", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("moves a decorated time range into the overflow menu without removing it", async () => {
    const client = makeClient();
    renderCatalog(client, {
      filterPre: [
        (filter) =>
          filter.key === "timeRange"
            ? { ...filter, placement: "overflow" }
            : filter,
      ],
    });

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));
    expect(screen.getByLabelText("Q")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /time range filter/i })).toBeNull();

    fireEvent.click(await screen.findByRole("button", { name: /^(more )?filters$/i }));
    const dialog = screen.getByRole("dialog", { name: /overflow filters/i });
    fireEvent.click(
      within(dialog).getByRole("button", { name: /time range filter/i }),
    );
    expect(screen.getByLabelText("Time range from")).toBeInTheDocument();
    expect(screen.getByLabelText("Time range to")).toBeInTheDocument();
    expect(dialog.querySelector('[data-overflow-filter-row="timeRange"]')).not.toBeNull();
  });
});

describe("OperationCatalog rowDetail", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("expands a row into host-rendered detail without disturbing the list request", async () => {
    const client = makeClient();
    renderCatalog(client, {
      rowDetail: { render: (row) => <div>Detail: {String(row.name)}</div> },
    });

    const cell = await screen.findByText("Row one");
    expect(screen.queryByText("Detail: Row one")).toBeNull();

    fireEvent.click(cell);

    expect(await screen.findByText("Detail: Row one")).toBeInTheDocument();
    // Expanding a row is purely presentational — it does not re-issue the list
    // request or otherwise disturb paging/filters/sort.
    expect(client.executeMock).toHaveBeenCalledTimes(1);
  });

  it("opens the detail in a dialog sized by rowDetail.dialogSize", async () => {
    const client = makeClient();
    renderCatalog(client, {
      rowDetail: {
        render: (row) => <div>Detail: {String(row.name)}</div>,
        style: "dialog",
        dialogSize: "xl",
      },
    });

    const cell = await screen.findByText("Row one");
    expect(screen.queryByRole("dialog")).toBeNull();

    fireEvent.click(cell);

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveTextContent("Detail: Row one");
    // Modal.tsx maps ModalSize "xl" to the "max-w-4xl" panel width class.
    expect(dialog).toHaveClass("max-w-4xl");
  });

  it("hides host-selected table columns while preserving their raw detail values", async () => {
    const client = makeClient();
    client.executeMock.mockResolvedValue(tableResponseWithDetail());
    const renderDetail = vi.fn((row: Record<string, unknown>) => (
      <div>Detail: {JSON.stringify(row.detail)}</div>
    ));
    renderCatalog(client, {
      hiddenColumns: ["detail"],
      rowDetail: { render: renderDetail },
    });

    const cell = await screen.findByText("Row one");
    expect(screen.queryByText("Detail payload")).toBeNull();

    fireEvent.click(cell);

    expect(await screen.findByText(/process/)).toBeInTheDocument();
    expect(renderDetail).toHaveBeenCalledWith({
      name: "Row one",
      detail: { execution: [{ label: "process" }] },
    });
  });

  it("renders cards from raw rows without losing the catalog's filters or pager", async () => {
    const client = makeClient();
    client.executeMock.mockResolvedValue(tableResponseWithDetail());
    const renderCard = vi.fn((row: Record<string, unknown>) => (
      <article>Invocation {String(row.name)}: {JSON.stringify(row.detail)}</article>
    ));
    renderCatalog(client, { hiddenColumns: ["detail"], rowCard: renderCard });

    expect(await screen.findByRole("article")).toHaveTextContent("Invocation Row one");
    expect(renderCard).toHaveBeenCalledWith({
      name: "Row one",
      detail: { execution: [{ label: "process" }] },
    });
    expect(screen.queryByRole("columnheader", { name: "name" })).not.toBeInTheDocument();
  });
});
