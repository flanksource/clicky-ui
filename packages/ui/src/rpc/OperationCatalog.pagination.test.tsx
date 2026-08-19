// End-to-end guard for remote pagination through the real rpc stack: the
// shared story fixtures declare limit/offset roles, OperationCatalog turns them
// into a DataTable footer, and advancing a page re-executes the operation
// against the backend rather than slicing rows in the browser.
//
// The second half covers the cursor half of that contract: an operation that
// declares a cursor role walks forward instead of stepping, accumulating every
// page it has fetched into one continuous table.

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OperationCatalog } from "./OperationCatalog";
import { OperationsApiClientError } from "./apiClient";
import type { ResultRenderContext } from "./OperationResultView";
import { FAKE_CLIENT, anchorLink } from "./rpc-story.fixtures";
import { WIDGETS_FIXTURE } from "./rpc-story-fixtures/widgets.fixture";
import type { ExecutionResponse, OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";

// Filters live in the URL, so a test that changes one leaves it there for the
// next test to read back as its starting state.
beforeEach(() => {
  window.history.replaceState({}, "", "/");
});

function renderWidgets() {
  const executeSpy = vi.fn(FAKE_CLIENT.executeCommand);
  const client: OperationsApiClient = {
    ...FAKE_CLIENT,
    executeCommand: executeSpy,
  };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <OperationCatalog
        definition={{
          key: "widgets",
          title: "Widgets",
          description: "Remote-paged widgets.",
        }}
        entities={["widget"]}
        surfaceKey="widgets"
        client={client}
        renderLink={anchorLink}
      />
    </QueryClientProvider>,
  );

  return { executeSpy };
}

/** Query params of the most recent list call. */
function lastListParams(
  spy: ReturnType<typeof vi.fn>,
): Record<string, string> | undefined {
  const listCalls = spy.mock.calls.filter(
    (call) => call[0] === "/api/v1/widgets",
  );
  return listCalls[listCalls.length - 1]?.[2] as
    | Record<string, string>
    | undefined;
}

describe("OperationCatalog — remote pagination", () => {
  it("renders a pagination footer reporting the backend's total", async () => {
    renderWidgets();

    // "Page 1 of N" only appears when response.pagination.total is present.
    const total = WIDGETS_FIXTURE.listRows.length;
    const expectedPages = Math.ceil(total / 25);
    await waitFor(() =>
      expect(
        screen.getByText(`Page 1 of ${expectedPages}`),
      ).toBeInTheDocument(),
    );
  });

  it("renders only one page of rows, not the whole row set", async () => {
    renderWidgets();

    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
    const bodyRows = within(screen.getByRole("table")).getAllByRole("row");

    // 25 data rows + 1 header row; the fixture holds far more than that.
    expect(bodyRows.length).toBeLessThanOrEqual(26);
    expect(WIDGETS_FIXTURE.listRows.length).toBeGreaterThan(26);
  });

  it("re-executes the operation with a new offset when the page advances", async () => {
    const { executeSpy } = renderWidgets();

    await waitFor(() =>
      expect(screen.getByText(/Page 1 of/)).toBeInTheDocument(),
    );
    const firstPageParams = lastListParams(executeSpy);
    expect(firstPageParams?.offset ?? "0").toBe("0");

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    // The offset moving is what proves paging is remote: a client-side slice
    // would never touch the backend again.
    await waitFor(() => expect(lastListParams(executeSpy)?.offset).toBe("25"));
    await waitFor(() =>
      expect(screen.getByText(/Page 2 of/)).toBeInTheDocument(),
    );
  });
});

const SORTABLE_SPEC: OpenAPISpec = {
  openapi: "3.0.0",
  info: { title: "Sortable records", version: "1" },
  "x-clicky": {
    surfaces: [{ key: "sortable-records", entity: "record", title: "Records" }],
  },
  paths: {
    "/api/v1/records": {
      get: {
        operationId: "record_list",
        tags: ["record"],
        "x-clicky": {
          surface: "sortable-records",
          verb: "list",
          scope: "collection",
        },
        parameters: [
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["name", "updated"] },
            "x-clicky": { role: "sort" },
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"] },
            "x-clicky": { role: "order" },
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer" },
            "x-clicky": { role: "offset" },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 25 },
            "x-clicky": { role: "limit" },
          },
        ],
        responses: {},
      },
    },
  },
};

function renderSortableRecords() {
  const document = {
    version: 1 as const,
    node: {
      kind: "table" as const,
      columns: [
        { name: "name", label: "Name", sortKey: "name" },
        { name: "updated", label: "Updated", sortKey: "updated" },
        { name: "id", label: "ID" },
      ],
      rows: [
        {
          cells: {
            name: { kind: "text" as const, text: "Zulu" },
            updated: { kind: "text" as const, text: "2026-08-19" },
            id: { kind: "text" as const, text: "id-2" },
          },
        },
        {
          cells: {
            name: { kind: "text" as const, text: "Alpha" },
            updated: { kind: "text" as const, text: "2026-08-18" },
            id: { kind: "text" as const, text: "id-1" },
          },
        },
      ],
    },
  };
  const executeMock = vi.fn(async () => ({
    success: true,
    exit_code: 0,
    contentType: "application/json+clicky",
    parsed: document,
    stdout: JSON.stringify(document),
    requestUrl: "/api/v1/records",
    pagination: { total: 2, limit: 25, offset: 0, hasMore: false },
  }));
  const client: OperationsApiClient = {
    getOpenAPISpec: async () => SORTABLE_SPEC,
    executeCommand: executeMock,
  };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <OperationCatalog
        definition={{
          key: "sortable-records",
          title: "Records",
          description: "Server-sorted records.",
        }}
        entities={["record"]}
        surfaceKey="sortable-records"
        client={client}
        renderLink={anchorLink}
      />
    </QueryClientProvider>,
  );
  return executeMock;
}

describe("OperationCatalog — server sorting", () => {
  it("re-executes the whole query from sortable columns and clears back to the backend default", async () => {
    const executeMock = renderSortableRecords();
    await waitFor(() => expect(screen.getByText("Zulu")).toBeInTheDocument());
    expect(screen.queryByRole("button", { name: /^id/i })).toBeNull();

    const nameHeader = screen.getByRole("button", { name: /name/i });
    fireEvent.click(nameHeader);
    await waitFor(() =>
      expect(executeMock.mock.calls.at(-1)?.[2]).toMatchObject({
        sort: "name",
        order: "asc",
        offset: "0",
      }),
    );

    fireEvent.click(nameHeader);
    await waitFor(() =>
      expect(executeMock.mock.calls.at(-1)?.[2]).toMatchObject({
        sort: "name",
        order: "desc",
      }),
    );

    fireEvent.click(nameHeader);
    await waitFor(() => {
      const params = executeMock.mock.calls.at(-1)?.[2] as
        | Record<string, string>
        | undefined;
      expect(params?.sort).toBeUndefined();
      expect(params?.order).toBeUndefined();
    });
  });
});

// ---------------------------------------------------------------------------
// Cursor walk — an events surface that declares a cursor and no offset, which
// is the shape a backend serves when it can resume a query but cannot name an
// arbitrary position in it.
// ---------------------------------------------------------------------------

const EVENT_COUNT = 6;
const EVENT_PAGE_SIZE = 2;

const EVENTS_SPEC: OpenAPISpec = {
  openapi: "3.0.0",
  info: { title: "Events", version: "1" },
  "x-clicky": {
    surfaces: [{ key: "events", entity: "event", title: "Events" }],
  },
  paths: {
    "/api/v1/events": {
      get: {
        operationId: "event_list",
        tags: ["event"],
        "x-clicky": { surface: "events", verb: "list", scope: "collection" },
        parameters: [
          {
            name: "severity",
            in: "query",
            schema: { type: "string" },
            "x-clicky": { role: "filter" },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: EVENT_PAGE_SIZE },
            "x-clicky": { role: "limit" },
          },
          {
            name: "cursor",
            in: "query",
            schema: { type: "string" },
            "x-clicky": { role: "cursor" },
          },
        ],
        responses: {},
      },
    },
  },
};

/** The page starting at `offset`, with the cursor that resumes after it. */
function eventPage(offset: number, limit: number): ExecutionResponse {
  const names = Array.from(
    { length: EVENT_COUNT },
    (_, index) => `Event ${index + 1}`,
  ).slice(offset, offset + limit);
  const next = offset + names.length;
  const document = {
    version: 1 as const,
    node: {
      kind: "table" as const,
      columns: [{ name: "name", label: "Name" }],
      rows: names.map((name) => ({
        cells: { name: { kind: "text" as const, text: name, plain: name } },
      })),
    },
  };
  return {
    success: true,
    exit_code: 0,
    contentType: "application/json",
    parsed: document,
    stdout: JSON.stringify(document),
    requestUrl: `/api/v1/events?limit=${limit}${offset > 0 ? `&cursor=after-${offset}` : ""}`,
    pagination: {
      total: EVENT_COUNT,
      limit,
      hasMore: next < EVENT_COUNT,
      ...(next < EVENT_COUNT ? { nextCursor: `after-${next}` } : {}),
    },
  };
}

function staleCursorError() {
  return new OperationsApiClientError("cursor no longer matches this query", {
    status: 400,
    responseData: { code: "cursor_stale", message: "the query changed" },
  });
}

/** A backend that pages by opaque cursor. `after-N` decodes to an offset here
 *  only so the fake can serve a page; the UI never reads inside the token. */
function makeEventsClient(): OperationsApiClient & {
  executeMock: ReturnType<typeof vi.fn>;
} {
  const executeMock = vi.fn(
    async (_path: string, _method: string, params: Record<string, string>) => {
      const cursor = params.cursor ?? "";
      const offset = cursor ? Number(cursor.replace("after-", "")) : 0;
      return eventPage(offset, Number(params.limit || EVENT_PAGE_SIZE));
    },
  );
  return {
    executeMock,
    getOpenAPISpec: async () => EVENTS_SPEC,
    executeCommand: executeMock,
  };
}

/**
 * Renders the events surface with a renderer that keeps the default table and
 * adds a button onto the walk's own load-more handle. The button stands in for
 * the scroll sentinel, which needs an IntersectionObserver jsdom does not have —
 * it drives exactly the handle the table would.
 */
function renderEvents(client: OperationsApiClient) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  const seen: { context?: ResultRenderContext } = {};

  render(
    <QueryClientProvider client={queryClient}>
      <OperationCatalog
        definition={{
          key: "events",
          title: "Events",
          description: "Cursor-paged events.",
        }}
        entities={["event"]}
        surfaceKey="events"
        client={client}
        renderLink={anchorLink}
        resultRenderer={(context) => {
          seen.context = context;
          return (
            <>
              <button
                type="button"
                onClick={() => context.infinite?.onLoadMore()}
              >
                Load more
              </button>
              {context.defaultView}
            </>
          );
        }}
      />
    </QueryClientProvider>,
  );

  return seen;
}

function cursorOf(
  spy: ReturnType<typeof vi.fn>,
  call: number,
): string | undefined {
  return (spy.mock.calls[call]?.[2] as Record<string, string> | undefined)
    ?.cursor;
}

describe("OperationCatalog — cursor walk", () => {
  it("opens the walk with no cursor and resumes it with the one the server minted", async () => {
    const client = makeEventsClient();
    renderEvents(client);

    await waitFor(() =>
      expect(screen.getByText("Event 1")).toBeInTheDocument(),
    );
    expect(cursorOf(client.executeMock, 0)).toBeUndefined();

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(2));
    expect(cursorOf(client.executeMock, 1)).toBe("after-2");
  });

  it("stacks the fetched pages into one table instead of replacing them", async () => {
    const client = makeEventsClient();
    renderEvents(client);

    await waitFor(() =>
      expect(screen.getByText("Event 2")).toBeInTheDocument(),
    );
    expect(screen.queryByText("Event 3")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    await waitFor(() =>
      expect(screen.getByText("Event 4")).toBeInTheDocument(),
    );
    // The first page is still on screen — that is the whole point of the walk.
    expect(screen.getByText("Event 1")).toBeInTheDocument();
  });

  it("hands the renderer every page with the newest as `response`", async () => {
    const client = makeEventsClient();
    const seen = renderEvents(client);

    await waitFor(() => expect(seen.context?.pages).toHaveLength(1));
    expect(seen.context?.infinite?.hasMore).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    await waitFor(() => expect(seen.context?.pages).toHaveLength(2));
    expect(seen.context?.response?.pagination?.nextCursor).toBe("after-4");
    expect(seen.context?.response).toBe(seen.context?.pages?.[1]);
  });

  // The footer still counts and still resizes under an infinite walk; only the
  // step controls go, because there is no page to step back to.
  it("keeps counting and resizing while stepping is withdrawn", async () => {
    const client = makeEventsClient();
    renderEvents(client);

    await waitFor(() =>
      expect(screen.getByText("Event 1")).toBeInTheDocument(),
    );
    expect(screen.getByText("1-2 of 6")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next page" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    await waitFor(() =>
      expect(screen.getByText("1-4 of 6")).toBeInTheDocument(),
    );
  });

  // The cursor deliberately excludes the page size from what it fingerprints, so
  // resizing is the UI's call: the accumulated run no longer describes pages of
  // the new size, so the walk starts again rather than resuming mid-run.
  it("restarts the walk when the page size changes", async () => {
    const client = makeEventsClient();
    renderEvents(client);

    await waitFor(() =>
      expect(screen.getByText("Event 1")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    await waitFor(() =>
      expect(screen.getByText("Event 4")).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByLabelText("Rows per page"), {
      target: { value: "10" },
    });

    await waitFor(() =>
      expect(screen.getByText("Event 6")).toBeInTheDocument(),
    );
    const restart = client.executeMock.mock.calls.at(-1)?.[2] as Record<
      string,
      string
    >;
    expect(restart.limit).toBe("10");
    expect(restart.cursor).toBeUndefined();
  });

  // A stale cursor is always recoverable — the query is fine, only the position
  // is gone — so the walk starts again rather than stranding the reader on an
  // error panel they cannot page out of.
  it("restarts the walk when the server refuses a replayed cursor", async () => {
    const client = makeEventsClient();
    client.executeMock
      .mockResolvedValueOnce(eventPage(0, EVENT_PAGE_SIZE))
      .mockRejectedValueOnce(staleCursorError())
      .mockResolvedValueOnce(eventPage(0, EVENT_PAGE_SIZE));
    renderEvents(client);

    await waitFor(() =>
      expect(screen.getByText("Event 1")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(3));
    expect(cursorOf(client.executeMock, 2)).toBeUndefined();
    await waitFor(() =>
      expect(screen.getByText("Event 1")).toBeInTheDocument(),
    );
    expect(
      screen.queryByText("Failed to load /api/v1/events"),
    ).not.toBeInTheDocument();
  });

  // Restarting a walk that never started would spin: refuse, restart, refuse.
  it("surfaces a first-page refusal instead of restarting forever", async () => {
    const client = makeEventsClient();
    client.executeMock.mockRejectedValue(staleCursorError());
    renderEvents(client);

    await waitFor(() =>
      expect(
        screen.getByText("Failed to load /api/v1/events"),
      ).toBeInTheDocument(),
    );
    expect(client.executeMock).toHaveBeenCalledTimes(1);
  });

  // Every other surface is the majority case, and an offset one has no walk to
  // accumulate: it replaces its page, and the renderer must not be told
  // otherwise.
  it("leaves an offset-only surface on single-page queries", async () => {
    const client: OperationsApiClient = { ...FAKE_CLIENT };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const seen: { context?: ResultRenderContext } = {};

    render(
      <QueryClientProvider client={queryClient}>
        <OperationCatalog
          definition={{
            key: "widgets",
            title: "Widgets",
            description: "Remote-paged widgets.",
          }}
          entities={["widget"]}
          surfaceKey="widgets"
          client={client}
          renderLink={anchorLink}
          resultRenderer={(context) => {
            seen.context = context;
            return context.defaultView;
          }}
        />
      </QueryClientProvider>,
    );

    await waitFor(() => expect(seen.context?.response).toBeTruthy());
    expect(seen.context?.infinite).toBeUndefined();
    expect(seen.context?.pages).toBeUndefined();
  });
});
