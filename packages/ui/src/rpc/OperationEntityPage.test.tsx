import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { ClickyDocument } from "../data/Clicky";
import type { ExecutionResponse, OpenAPISpec } from "./types";
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

function makeClickyDocument(
  fields: Array<{ name: string; label: string; value: string }>,
): ClickyDocument {
  return {
    version: 1,
    node: {
      kind: "map",
      fields: fields.map((field) => ({
        name: field.name,
        label: field.label,
        value: {
          kind: "text",
          text: field.value,
          plain: field.value,
        },
      })),
    },
  };
}

function clickyResponse(document: ClickyDocument, requestUrl?: string): ExecutionResponse {
  return {
    success: true,
    exit_code: 0,
    stdout: JSON.stringify(document),
    contentType: "application/json+clicky",
    requestUrl,
    parsed: document,
  };
}

function jsonResponse(data: unknown): ExecutionResponse {
  return {
    success: true,
    exit_code: 0,
    stdout: JSON.stringify(data),
    contentType: "application/json",
    parsed: data,
  };
}

function makeClient(
  handler?: (
    path: string,
    method: string,
    params: Record<string, string>,
  ) => Promise<ExecutionResponse>,
): OperationsApiClient & {
  executeMock: ReturnType<typeof vi.fn>;
} {
  const executeMock = vi.fn(
    async (path: string, method: string, params: Record<string, string>) => {
      if (handler) {
        return handler(path, method, params);
      }

      if (path === "/api/v1/widgets/{id}" && method === "get") {
        return clickyResponse(
          makeClickyDocument([
            { name: "id", label: "ID", value: params.id },
            { name: "name", label: "Name", value: "First widget" },
          ]),
          `/api/v1/widgets/${params.id}`,
        );
      }

      if (path === "/api/v1/widgets/{id}/restart" && method === "post") {
        return clickyResponse(
          makeClickyDocument([
            { name: "action", label: "Action", value: "restart" },
            { name: "id", label: "ID", value: params.id },
            { name: "reason", label: "Reason", value: params.reason },
          ]),
        );
      }

      return jsonResponse([]);
    },
  );

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
  it("loads detail and locks the row id for actions with Clicky results", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify(
          makeClickyDocument([
            { name: "id", label: "ID", value: "one" },
            { name: "name", label: "Name", value: "First widget" },
          ]),
        ),
        {
          status: 200,
          headers: { "Content-Type": "application/json+clicky" },
        },
      ),
    );
    const client = makeClient();
    renderPage(client);

    await waitFor(() =>
      expect(client.executeMock).toHaveBeenCalledWith(
        "/api/v1/widgets/{id}",
        "get",
        { id: "one" },
        { Accept: "application/json+clicky" },
      ),
    );
    await waitFor(() =>
      expect(screen.getByRole("region", { name: "Response body" })).toHaveTextContent(
        "First widget",
      ),
    );
    await waitFor(() =>
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/v1/widgets/one?format=clicky-json",
        expect.objectContaining({
          headers: expect.objectContaining({
            Accept: expect.stringContaining("application/json+clicky"),
          }),
        }),
      ),
    );
    expect(screen.getByRole("radiogroup", { name: /clicky view mode/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^download json$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Restart widget" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reconcile widget" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Restart widget" }));

    // The id is locked and hidden from the form.
    const reasonInput = await screen.findByLabelText("Reason");
    expect(screen.queryByLabelText("Id")).not.toBeInTheDocument();

    fireEvent.change(reasonInput, { target: { value: "manual" } });
    fireEvent.click(screen.getByLabelText("Drain"));
    fireEvent.click(screen.getByRole("button", { name: "Execute request" }));

    await waitFor(() =>
      expect(client.executeMock).toHaveBeenCalledWith(
        "/api/v1/widgets/{id}/restart",
        "post",
        { drain: "false", id: "one", reason: "manual" },
        { Accept: "application/json+clicky" },
      ),
    );
    await waitFor(() =>
      expect(screen.getAllByRole("region", { name: "Response body" })[1]).toHaveTextContent(
        "manual",
      ),
    );

    fetchSpy.mockRestore();
  });

  it("falls back to the raw response panel when the payload is not Clicky", async () => {
    const client = makeClient(async (path, method, params) => {
      if (path === "/api/v1/widgets/{id}" && method === "get") {
        return jsonResponse({ id: params.id, name: "Fallback widget" });
      }

      return jsonResponse([]);
    });

    renderPage(client);

    await waitFor(() =>
      expect(screen.getByLabelText("Response body")).toHaveTextContent('"name": "Fallback widget"'),
    );
  });
});
