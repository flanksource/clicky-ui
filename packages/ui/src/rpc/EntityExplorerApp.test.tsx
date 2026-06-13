import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { OpenAPISpec } from "./types";
import type { OperationsApiClient } from "./useOperations";
import type { RenderLink } from "./EndpointList";
import { EntityExplorerApp, type EntityExplorerAppProps } from "./EntityExplorerApp";
import { mockChatTransport } from "../data/chat/Chat.fixtures";
import { ThemeProvider } from "../hooks/theme-provider";

function makeClient(): OperationsApiClient {
  const spec: OpenAPISpec = {
    openapi: "3.0.0",
    info: { title: "test", version: "1" },
    "x-clicky": {
      surfaces: [{ key: "widgets", entity: "widget", title: "Widgets" }],
    },
    paths: {
      "/api/v1/widgets": {
        get: {
          operationId: "widget_list",
          summary: "List widgets",
          responses: {},
          "x-clicky": { surface: "widgets", verb: "list", scope: "collection" },
        },
      },
    },
  };
  return {
    getOpenAPISpec: () => Promise.resolve(spec),
    executeCommand: () =>
      Promise.resolve({ success: true, exit_code: 0, contentType: "text/plain", stdout: "" }),
  };
}

const renderLink: RenderLink = ({ to, className, children, key }) => (
  <a key={key} href={to} className={className}>
    {children}
  </a>
);

function renderApp(extra?: Pick<EntityExplorerAppProps, "chat">) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <EntityExplorerApp
          client={makeClient()}
          pathname="/widgets"
          renderLink={renderLink}
          {...extra}
        />
      </QueryClientProvider>
    </ThemeProvider>,
  );
}

describe("EntityExplorerApp chat integration", () => {
  it("mounts the chat launch FAB when a chat config is provided", () => {
    renderApp({ chat: { modelsApi: null, transport: mockChatTransport() } });
    expect(screen.getByTestId("chat-fab")).toBeTruthy();
  });

  it("renders no chat affordance when chat is omitted", () => {
    renderApp();
    expect(screen.queryByTestId("chat-fab")).toBeNull();
  });
});
