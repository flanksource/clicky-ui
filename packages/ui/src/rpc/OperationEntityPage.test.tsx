import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";
import { OperationEntityPage } from "./OperationEntityPage";

function makeSpec(): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "test", version: "1" },
    paths: {
      "/api/v1/widgets": {
        get: {
          operationId: "widget_list",
          tags: ["widget"],
          responses: {},
        },
      },
      "/api/v1/widgets/{id}": {
        get: {
          operationId: "widget_get",
          tags: ["widget"],
          parameters: [{ name: "id", in: "path", required: true }],
          responses: {},
        },
      },
      "/api/v1/admin/widgets/{id}": {
        get: {
          operationId: "admin_widget_get",
          tags: ["widget"],
          parameters: [{ name: "id", in: "path", required: true }],
          responses: {},
        },
      },
      "/api/v1/widgets/{id}/restart": {
        post: {
          operationId: "widget_restart",
          summary: "Restart widget",
          tags: ["widget"],
          parameters: [
            { name: "id", in: "path", required: true },
            { name: "reason", in: "query", schema: { type: "string" } },
            { name: "drain", in: "query", schema: { type: "boolean", default: true } },
          ],
          responses: {},
        },
      },
      "/api/v1/admin/widgets/{id}/reconcile": {
        post: {
          operationId: "admin_widget_reconcile",
          summary: "Reconcile widget",
          tags: ["widget"],
          parameters: [{ name: "id", in: "path", required: true }],
          responses: {},
        },
      },
    },
  };
}

function makeClient(): OperationsApiClient & {
  executeMock: ReturnType<typeof vi.fn>;
} {
  const executeMock = vi.fn(async (path: string, method: string, params: Record<string, string>) => {
    if (path === "/api/v1/widgets/{id}" && method === "get") {
      return {
        success: true,
        exit_code: 0,
        stdout: JSON.stringify({ id: params.id, name: "First widget" }),
      };
    }

    if (path === "/api/v1/widgets/{id}/restart" && method === "post") {
      return {
        success: true,
        exit_code: 0,
        stdout: JSON.stringify({ action: "restart", id: params.id, reason: params.reason }),
      };
    }

    return {
      success: true,
      exit_code: 0,
      stdout: "[]",
    };
  });

  return {
    executeMock,
    getOpenAPISpec: async () => makeSpec(),
    executeCommand: executeMock,
  };
}

function renderPage(client: OperationsApiClient) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OperationEntityPage
        id="one"
        definition={{
          key: "widgets",
          title: "Widgets",
          description: "All the widgets.",
        }}
        entities={["widget"]}
        client={client}
      />
    </QueryClientProvider>,
  );
}

describe("OperationEntityPage", () => {
  it("loads detail and locks the row id for actions", async () => {
    const client = makeClient();
    renderPage(client);

    await waitFor(() =>
      expect(client.executeMock).toHaveBeenCalledWith(
        "/api/v1/widgets/{id}",
        "get",
        { id: "one" },
        { Accept: "application/json" },
      ),
    );
    await waitFor(() => expect(screen.getByText(/First widget/)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Restart widget" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reconcile widget" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Restart widget" }));

    const idInput = await screen.findByLabelText("Id");
    expect(idInput).toHaveValue("one");
    expect(idInput).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Reason"), { target: { value: "manual" } });
    fireEvent.click(screen.getByLabelText("Drain"));
    fireEvent.click(screen.getByRole("button", { name: "Execute request" }));

    await waitFor(() =>
      expect(client.executeMock).toHaveBeenCalledWith(
        "/api/v1/widgets/{id}/restart",
        "post",
        { drain: "false", id: "one", reason: "manual" },
      ),
    );
    await waitFor(() => expect(screen.getAllByLabelText("Response body")[1]).toHaveTextContent('"action": "restart"'));
  });
});
