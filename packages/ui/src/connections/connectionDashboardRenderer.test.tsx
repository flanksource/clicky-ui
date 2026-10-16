import { isValidElement } from "react";
import { describe, expect, it } from "vitest";
import type { ResultRenderContext } from "../rpc/OperationResultView";
import { createConnectionDashboardResultRenderer } from "./connectionDashboardRenderer";
import type { ConnectionLinkRenderer } from "./connectionDashboardModel";

function context(overrides: Partial<ResultRenderContext>): ResultRenderContext {
  return {
    surfaceKey: "connection",
    defaultView: null,
    response: { requestUrl: "/api/v1/connection?type=postgres&limit=50" },
    ...overrides,
  } as ResultRenderContext;
}

const renderConnectionLink: ConnectionLinkRenderer = (_connection, link) => (
  <span className={link.className}>{link.children}</span>
);

const renderResult = createConnectionDashboardResultRenderer({
  apiBase: "/api/v1",
  renderConnectionLink,
});

describe("connection dashboard renderer", () => {
  it("keeps the same surface identity when only the response body changes", () => {
    const first = renderResult(
      context({ response: { requestUrl: "/api/v1/connection?type=postgres", output: "a" } as never }),
    );
    const second = renderResult(
      context({ response: { requestUrl: "/api/v1/connection?type=postgres", output: "b" } as never }),
    );

    expect(isValidElement(first) && isValidElement(second)).toBe(true);
    // A response-derived key would mint a fresh react-query cache entry on
    // nearly every render, refetching the whole fleet each time.
    expect(isValidElement(first) ? first.props : null).toEqual(
      isValidElement(second) ? second.props : undefined,
    );
  });

  it("leaves surfaces other than connections to the default view", () => {
    const defaultView = "default";

    expect(renderResult(context({ surfaceKey: "profile", defaultView }))).toBe(defaultView);
  });
});
