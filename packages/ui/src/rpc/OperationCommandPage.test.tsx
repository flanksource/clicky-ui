import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { ClickyDocument } from "../data/Clicky";
import type { ExecutionResponse, OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";
import { OperationCommandPage } from "./OperationCommandPage";

function makeSpec(): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "test", version: "1" },
    paths: {
      "/api/v1/widgets/{id}": {
        get: {
          operationId: "widget_get",
          summary: "Get widget",
          tags: ["widget"],
          parameters: [{ name: "id", in: "path", required: true }],
          responses: {},
        },
      },
    },
  };
}

function makeClickyDocument(fields: Array<{ name: string; label: string; value: string }>): ClickyDocument {
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

function makeClient(responseFactory: (params: Record<string, string>) => ExecutionResponse): OperationsApiClient & {
  executeMock: ReturnType<typeof vi.fn>;
} {
  const executeMock = vi.fn(
    async (_path: string, _method: string, params: Record<string, string>) => responseFactory(params),
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
      <OperationCommandPage client={client} operationId="widget_get" />
    </QueryClientProvider>,
  );
}

describe("OperationCommandPage", () => {
  it("renders Clicky responses when the endpoint returns Clicky JSON", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
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
    const client = makeClient((params) =>
      clickyResponse(
        makeClickyDocument([
          { name: "id", label: "ID", value: params.id },
          { name: "name", label: "Name", value: "First widget" },
        ]),
        `/api/v1/widgets/${params.id}`,
      ),
    );

    renderPage(client);

    await screen.findByRole("heading", { name: "Get widget" });
    fireEvent.change(screen.getByLabelText("Id"), { target: { value: "one" } });
    fireEvent.click(screen.getByRole("button", { name: "Execute request" }));

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

    fetchSpy.mockRestore();
  });

  it("falls back to formatted JSON for non-Clicky results", async () => {
    const client = makeClient((params) => jsonResponse({ id: params.id, name: "Fallback widget" }));

    renderPage(client);

    await screen.findByRole("heading", { name: "Get widget" });
    fireEvent.change(screen.getByLabelText("Id"), { target: { value: "one" } });
    fireEvent.click(screen.getByRole("button", { name: "Execute request" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Response body")).toHaveTextContent(
        '"name": "Fallback widget"',
      ),
    );
  });
});
