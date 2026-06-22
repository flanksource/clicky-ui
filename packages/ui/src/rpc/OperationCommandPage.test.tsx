import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClickyDocument } from "../data/Clicky";
import type { ParameterValues } from "./formMetadata";
import type { ExecutionResponse, OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";
import { OperationCommandPage } from "./OperationCommandPage";

function makeSpec(paths?: OpenAPISpec["paths"]): OpenAPISpec {
  return {
    openapi: "3.0.0",
    info: { title: "test", version: "1" },
    paths: paths ?? {
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

function clickyResponse(
  document: ClickyDocument,
  requestUrl?: string,
): ExecutionResponse {
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
  responseFactory: (params: Record<string, string>) => ExecutionResponse,
  spec = makeSpec(),
): OperationsApiClient & {
  executeMock: ReturnType<typeof vi.fn>;
} {
  const executeMock = vi.fn(
    async (_path: string, _method: string, params: Record<string, string>) =>
      responseFactory(params),
  );

  return {
    executeMock,
    getOpenAPISpec: async () => spec,
    executeCommand: executeMock,
  };
}

function renderPage(
  client: OperationsApiClient,
  props: {
    initialValues?: ParameterValues;
    autoRun?: boolean;
    operationId?: string;
  } = {},
) {
  const { operationId = "widget_get", ...rest } = props;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <OperationCommandPage
        client={client}
        operationId={operationId}
        {...rest}
      />
    </QueryClientProvider>,
  );
}

describe("OperationCommandPage", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("auto-runs GET by default when initial values satisfy required parameters", async () => {
    const client = makeClient((params) =>
      clickyResponse(
        makeClickyDocument([{ name: "id", label: "ID", value: params.id }]),
        `/api/v1/widgets/${params.id}`,
      ),
    );

    renderPage(client, { initialValues: { id: "autorun-widget" } });

    await screen.findByRole("heading", { name: "Get widget" });
    await waitFor(() =>
      expect(client.executeMock).toHaveBeenCalledWith(
        "/api/v1/widgets/{id}",
        "get",
        { id: "autorun-widget" },
        { Accept: "application/clicky+json" },
      ),
    );
    await waitFor(() => expect(client.executeMock).toHaveBeenCalledTimes(1));
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    expect(client.executeMock).toHaveBeenCalledTimes(1);
  });

  it("does not auto-run GET when required deep-link values are missing", async () => {
    const client = makeClient((params) =>
      clickyResponse(
        makeClickyDocument([{ name: "id", label: "ID", value: params.id }]),
        `/api/v1/widgets/${params.id}`,
      ),
    );

    renderPage(client);

    await screen.findByRole("heading", { name: "Get widget" });
    await waitFor(() => expect(client.executeMock).not.toHaveBeenCalled());
  });

  it("auto-runs a GET that declares only optional parameters", async () => {
    // List endpoints (used by sidebar 'click → instant table') typically declare
    // optional limit/offset/filter params. Pre-relaxation the guard short-
    // circuited any GET with any parameters; that defeated the sidebar flow.
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "test", version: "1" },
      paths: {
        "/api/v1/widgets": {
          get: {
            operationId: "widget_list",
            summary: "List widgets",
            tags: ["widget"],
            parameters: [{ name: "limit", in: "query", required: false }],
            responses: {},
          },
        },
      },
    };
    const executeMock = vi.fn(async () => jsonResponse([]));
    const client: OperationsApiClient = {
      getOpenAPISpec: async () => spec,
      executeCommand: executeMock,
    };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <OperationCommandPage client={client} operationId="widget_list" />
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", { name: "List widgets" });
    await waitFor(() => expect(executeMock).toHaveBeenCalledTimes(1));
  });

  it("keeps lookup date range filters with an auto-run GET result", async () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "test", version: "1" },
      paths: {
        "/api/v1/transactions": {
          get: {
            operationId: "transaction_list",
            summary: "List transactions",
            tags: ["transaction"],
            parameters: [
              { name: "entity", in: "query", required: false },
              { name: "account", in: "query", required: false },
              { name: "since", in: "query", required: false },
              { name: "to", in: "query", required: false },
            ],
            responses: {},
          },
        },
      },
    };
    const executeMock = vi.fn(async () =>
      clickyResponse({
        version: 1,
        node: {
          kind: "table",
          columns: [{ name: "reference", label: "Reference" }],
          rows: [],
        },
      }),
    );
    const lookupMock = vi.fn(async () => ({
      filters: {
        entity: { label: "Entity" },
        account: { label: "Account" },
        since: { label: "Since", type: "from" as const },
        to: { label: "To", type: "to" as const },
      },
    }));
    const client: OperationsApiClient = {
      getOpenAPISpec: async () => spec,
      executeCommand: executeMock,
      lookupFilters: lookupMock,
    };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <OperationCommandPage client={client} operationId="transaction_list" />
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", { name: "List transactions" });
    await waitFor(() => expect(executeMock).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByLabelText("Date range filter"),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Since")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("To")).not.toBeInTheDocument();
  });

  it("writes transaction lookup filter changes back to the route", async () => {
    window.history.replaceState(
      null,
      "",
      "/commands/transactions?__entity=all&autoRun=1",
    );
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "test", version: "1" },
      paths: {
        "/api/v1/transactions": {
          get: {
            operationId: "transaction_list",
            summary: "List transactions",
            tags: ["transaction"],
            parameters: [
              { name: "contact", in: "query", required: false },
              { name: "account", in: "query", required: false },
            ],
            responses: {},
          },
        },
      },
    };
    const executeMock = vi.fn(async () =>
      clickyResponse({
        version: 1,
        node: {
          kind: "table",
          columns: [{ name: "reference", label: "Reference" }],
          rows: [],
        },
      }),
    );
    const lookupMock = vi.fn(async () => ({
      filters: {
        contact: {
          label: "Contact",
          options: {
            "contact-1": { kind: "text", text: "Acme Ltd", plain: "Acme Ltd" },
          },
        },
        account: {
          label: "Account",
          options: {
            "account-1": {
              kind: "text",
              text: "Operating Account",
              plain: "Operating Account",
            },
          },
        },
      },
    }));
    const client: OperationsApiClient = {
      getOpenAPISpec: async () => spec,
      executeCommand: executeMock,
      lookupFilters: lookupMock,
    };

    renderPage(client, { operationId: "transaction_list" });

    await screen.findByRole("heading", { name: "List transactions" });
    await waitFor(() => expect(executeMock).toHaveBeenCalledTimes(1));

    const contact = await screen.findByLabelText("Contact");
    fireEvent.focus(contact);
    fireEvent.change(contact, { target: { value: "acme" } });
    fireEvent.mouseDown(screen.getByRole("option", { name: "Acme Ltd" }));

    const account = await screen.findByLabelText("Account");
    fireEvent.focus(account);
    fireEvent.change(account, { target: { value: "operating" } });
    fireEvent.mouseDown(
      screen.getByRole("option", { name: "Operating Account" }),
    );

    await waitFor(
      () => {
        const params = new URLSearchParams(window.location.search);
        expect(params.get("__entity")).toBe("all");
        expect(params.get("autoRun")).toBe("1");
        expect(params.get("contact")).toBe("contact-1");
        expect(params.get("account")).toBe("account-1");
      },
      { timeout: 2_000 },
    );
    await waitFor(
      () =>
        expect(executeMock).toHaveBeenLastCalledWith(
          "/api/v1/transactions",
          "get",
          { contact: "contact-1", account: "account-1" },
          { Accept: "application/clicky+json" },
        ),
      { timeout: 2_000 },
    );
  });

  it("honors explicit autoRun false for GET operations", async () => {
    const spec: OpenAPISpec = {
      openapi: "3.0.0",
      info: { title: "test", version: "1" },
      paths: {
        "/api/v1/widgets": {
          get: {
            operationId: "widget_list",
            summary: "List widgets",
            tags: ["widget"],
            parameters: [{ name: "limit", in: "query", required: false }],
            responses: {},
          },
        },
      },
    };
    const executeMock = vi.fn(async () => jsonResponse([]));
    const client: OperationsApiClient = {
      getOpenAPISpec: async () => spec,
      executeCommand: executeMock,
    };
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <OperationCommandPage
          client={client}
          operationId="widget_list"
          autoRun={false}
        />
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", { name: "List widgets" });
    await new Promise((resolve) => window.setTimeout(resolve, 350));
    expect(executeMock).not.toHaveBeenCalled();
  });

  it("auto-runs non-GET operations when explicitly requested", async () => {
    const operation = {
      path: "/api/v1/widgets/{id}/refresh",
      method: "post",
      operation: {
        operationId: "widget_refresh",
        summary: "Refresh widget",
        tags: ["widget"],
        parameters: [{ name: "id", in: "path", required: true }],
        responses: {},
      },
    };
    const client = makeClient((params) =>
      jsonResponse({ refreshed: params.id }),
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <OperationCommandPage
          client={client}
          operation={operation}
          initialValues={{ id: "refresh-me" }}
          autoRun
        />
      </QueryClientProvider>,
    );

    await screen.findByRole("heading", { name: "Refresh widget" });
    await waitFor(() =>
      expect(client.executeMock).toHaveBeenCalledWith(
        "/api/v1/widgets/{id}/refresh",
        "post",
        { id: "refresh-me" },
        { Accept: "application/clicky+json" },
      ),
    );
  });

  it("strips runner flags before executing", async () => {
    const client = makeClient((params) =>
      clickyResponse(
        makeClickyDocument([{ name: "id", label: "ID", value: params.id }]),
        `/api/v1/widgets/${params.id}`,
      ),
    );

    renderPage(client, {
      initialValues: {
        id: "flagged-widget",
        autoRun: "1",
        __autoRun: "1",
        __entity: "entity-1",
      },
    });

    await screen.findByRole("heading", { name: "Get widget" });
    await waitFor(() =>
      expect(client.executeMock).toHaveBeenCalledWith(
        "/api/v1/widgets/{id}",
        "get",
        { id: "flagged-widget" },
        { Accept: "application/clicky+json" },
      ),
    );
  });
});
