import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SESSIONS_SURFACE_KEY, SessionsCatalog } from "./SessionsCatalog";
import type { RenderLink } from "./EndpointList";
import { RouterProvider } from "./RouterProvider";
import type { RouterAdapter } from "./router";
import type { ExecutionResponse, OpenAPIParameter, OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";

const SESSION_ID = "7c1e2f4a-3b5d-4e6f-8a9b-0c1d2e3f4a5b";
const SESSION_LABEL = "FileMessageListener#onMessage (trace)";
const JVM_TRACE_LOCK = { profile: "trace-capture/jvm_trace", "label.target": "cycle" };

function sessionsSpec(surface: string): OpenAPISpec {
  const query = (name: string, role: "filter" | "limit" | "offset" = "filter"): OpenAPIParameter => ({
    name,
    in: "query",
    schema: { type: "string" },
    "x-clicky": { role },
  });
  return {
    openapi: "3.0.0",
    info: { title: "sessions", version: "1" },
    paths: {
      "/api/v1/sessions": {
        get: {
          operationId: "list-sessions",
          "x-clicky": { surface, verb: "list", scope: "collection" },
          parameters: [
            query("profile"),
            query("state"),
            query("label.target"),
            query("limit", "limit"),
            query("offset", "offset"),
          ],
          responses: {},
        },
      },
    },
  };
}

function sessionsPage(): ExecutionResponse {
  const text = (value: string) => ({ kind: "text" as const, text: value, plain: value });
  return {
    success: true,
    exit_code: 0,
    // Shaped like commons-db's sessions table (cmd/query/sessions/service_table.go):
    // the id rides in a hidden `_id` column, absent from `columns`, and the
    // visible Session column shows the label.
    stdout: JSON.stringify({
      version: 1,
      node: {
        kind: "table",
        columns: [
          { name: "state", label: "State" },
          { name: "session", label: "Session" },
        ],
        rows: [{ cells: { _id: text(SESSION_ID), state: text("stopped"), session: text(SESSION_LABEL) } }],
      },
    }),
  };
}

function makeClient(surface: string) {
  const executeCommand = vi.fn().mockResolvedValue(sessionsPage());
  const lookupFilters = vi.fn().mockResolvedValue({ filters: {} });
  const client: OperationsApiClient = {
    getOpenAPISpec: async () => sessionsSpec(surface),
    executeCommand,
    lookupFilters,
  };
  return { client, executeCommand, lookupFilters };
}

// Client-side links, as a host router renders them: jsdom cannot navigate.
const renderLink: RenderLink = ({ to, children, className, key }) => (
  <a key={key} href={to} className={className} onClick={(event) => event.preventDefault()}>
    {children}
  </a>
);

function renderCatalog(
  client: OperationsApiClient,
  props: Partial<ComponentProps<typeof SessionsCatalog>> = {},
) {
  const navigate = vi.fn();
  const adapter: RouterAdapter = { pathname: "/traces", renderLink, navigate };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider adapter={adapter}>
        <SessionsCatalog client={client} renderLink={renderLink} {...props} />
      </RouterProvider>
    </QueryClientProvider>,
  );
  return { navigate };
}

describe("SessionsCatalog", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("lists the default sessions surface with the host's locked values on the list and lookup requests", async () => {
    const { client, executeCommand, lookupFilters } = makeClient(SESSIONS_SURFACE_KEY);
    renderCatalog(client, { lockedValues: JVM_TRACE_LOCK, urlState: false });

    await waitFor(() =>
      expect(executeCommand).toHaveBeenLastCalledWith(
        "/api/v1/sessions",
        "get",
        JVM_TRACE_LOCK,
        { Accept: "application/json+clicky" },
      ),
    );
    await waitFor(() =>
      expect(lookupFilters).toHaveBeenCalledWith("/api/v1/sessions", "get", JVM_TRACE_LOCK, {
        Accept: "application/json+clicky",
      }),
    );
  });

  it("reads the surface named by surfaceKey instead of the default", async () => {
    const { client, executeCommand } = makeClient("jvm-trace-sessions");
    renderCatalog(client, { surfaceKey: "jvm-trace-sessions", urlState: false });
    await waitFor(() => expect(executeCommand).toHaveBeenCalled());
  });

  it("navigates a row to the host's session href", async () => {
    const { client } = makeClient(SESSIONS_SURFACE_KEY);
    const { navigate } = renderCatalog(client, {
      getRowDetailHref: (id) => `/traces/sessions/${id}`,
      urlState: false,
    });

    fireEvent.click(await screen.findByText(SESSION_LABEL));
    expect(screen.queryByText(SESSION_ID)).toBeNull();
    expect(navigate).toHaveBeenCalledWith(`/traces/sessions/${SESSION_ID}`);
  });

  // `labels.target` is a typo for the declared `label.target`; `owner` is no list filter at all.
  it.each([
    {
      name: "lockedValues",
      props: { lockedValues: { profile: "trace-capture/jvm_trace", "labels.target": "cycle" } },
      message: 'lockedValues key "labels.target"',
    },
    {
      name: "initialValues",
      props: { initialValues: { owner: "mission-control-oipa-6d9f" } },
      message: 'initialValues key "owner"',
    },
  ])("refuses $name naming a parameter the list operation does not declare", async ({ props, message }) => {
    const { client, executeCommand } = makeClient(SESSIONS_SURFACE_KEY);
    renderCatalog(client, { ...props, urlState: false });

    expect(await screen.findByText((content) => content.includes(message))).toBeInTheDocument();
    expect(executeCommand).not.toHaveBeenCalled();
  });
});
