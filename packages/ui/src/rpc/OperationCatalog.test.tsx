import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OperationCatalog } from "./OperationCatalog";
import type { RenderLink } from "./EndpointList";
import type {
  ExecutionResponse,
  OpenAPISpec,
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

function makeClient(
  executeResponse: ExecutionResponse = {
    success: true,
    exit_code: 0,
    stdout: JSON.stringify([{ id: "one", name: "First" }]),
  },
): OperationsApiClient & {
  executeMock: ReturnType<typeof vi.fn>;
} {
  const executeMock = vi.fn().mockResolvedValue(executeResponse);
  return {
    executeMock,
    getOpenAPISpec: async () => makeSpec(),
    executeCommand: executeMock,
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
      { Accept: "application/json" },
    );
  });

  it("autoSubmit=false: typing does not refire; Apply triggers a single execute", async () => {
    const client = makeClient();
    renderCatalog(client);

    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("q"), { target: { value: "foo" } });
    fireEvent.change(screen.getByLabelText("q"), { target: { value: "foobar" } });
    // Without Apply, the query key is unchanged, so no extra request is fired.
    await new Promise((r) => setTimeout(r, 50));
    expect(client.executeMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /apply/i }));

    await waitFor(() => {
      expect(client.executeMock).toHaveBeenCalledTimes(2);
    });
    expect(client.executeMock).toHaveBeenLastCalledWith(
      "/api/v1/widgets",
      "get",
      { q: "foobar" },
      { Accept: "application/json" },
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
});
