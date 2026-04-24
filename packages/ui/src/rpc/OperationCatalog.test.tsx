import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
          parameters: [
            { name: "q", in: "query", schema: { type: "string" } },
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
          responses: {},
        },
      },
      "/api/v1/widgets/{id}": {
        get: {
          operationId: "widget_get",
          tags: ["widget"],
          parameters: [{ name: "id", in: "path" }],
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

  it("live-filters: typing debounces then refires with the final value", async () => {
    const client = makeClient();
    renderCatalog(client);

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("Q"), { target: { value: "foo" } });
    fireEvent.change(screen.getByLabelText("Q"), { target: { value: "foobar" } });

    // No Apply button exists.
    expect(screen.queryByRole("button", { name: /apply/i })).not.toBeInTheDocument();

    await waitFor(
      () => expect(client.executeMock).toHaveBeenCalledTimes(2),
      { timeout: 2_000 },
    );
    expect(client.executeMock).toHaveBeenLastCalledWith(
      "/api/v1/widgets",
      "get",
      { q: "foobar" },
      { Accept: "application/json+clicky" },
    );
  });

  it("switches to the endpoint list view", async () => {
    const client = makeClient();
    renderCatalog(client);

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Widgets" })).toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: /endpoint list view/i }));
    expect(screen.getByText("/api/v1/widgets/{id}")).toBeInTheDocument();
    expect(screen.getAllByText("GET").length).toBeGreaterThan(0);
    expect(screen.getAllByText("POST").length).toBeGreaterThan(0);
  });

  it("uses lookup metadata to shape list filters while keeping enum filters strict", async () => {
    const client = makeClient();
    client.lookupMock.mockResolvedValue(makeLookupResponse());
    renderCatalog(client);

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(client.lookupMock).toHaveBeenCalledTimes(1));

    expect(screen.getByLabelText(/kind/i)).toHaveRole("combobox");
    expect(screen.getByLabelText("Team")).toHaveAttribute("list", "team-lookup-options");
    expect(screen.getByLabelText("Tags")).toHaveAttribute("list", "tags-lookup-options");
    expect(screen.getByLabelText("Include archived")).toHaveAttribute("type", "checkbox");
    expect(screen.getByRole("button", { name: /time range filter/i })).toBeInTheDocument();
    expect(screen.queryByLabelText("From")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("To")).not.toBeInTheDocument();
  });

  it("live-filters: a debounced lookup field refires the list", async () => {
    const client = makeClient();
    client.lookupMock.mockResolvedValue(makeLookupResponse());
    renderCatalog(client);

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(client.lookupMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("Team"), { target: { value: "platform" } });

    await waitFor(
      () =>
        expect(client.executeMock).toHaveBeenLastCalledWith(
          "/api/v1/widgets",
          "get",
          { team: "platform" },
          { Accept: "application/json+clicky" },
        ),
      { timeout: 2_000 },
    );
  });
});
