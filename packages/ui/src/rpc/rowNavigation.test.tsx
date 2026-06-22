import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { ClickyNode, ClickyRow } from "../data/Clicky";
import { RouterProvider } from "./RouterProvider";
import type { RouterAdapter } from "./router";
import {
  apiPathToRoutePath,
  clickyNodeText,
  getClickyRowId,
  hrefForOperation,
  useRowDetailNavigation,
} from "./rowNavigation";
import type { ResolvedOperation } from "./types";

const text = (value: string): ClickyNode => ({ kind: "text", plain: value });

const row = (cells: Record<string, string>): ClickyRow => ({
  cells: Object.fromEntries(
    Object.entries(cells).map(([key, value]) => [key, text(value)]),
  ),
});

const detailOp = (path: string): ResolvedOperation => ({
  path,
  method: "get",
  operation: { responses: {} },
});

const surfaceDetailOp = (path: string, surface: string): ResolvedOperation => ({
  path,
  method: "get",
  operation: {
    responses: {},
    "x-clicky": { surface, verb: "get", scope: "entity" },
  },
});

describe("clickyNodeText", () => {
  it("returns the plain value", () => {
    expect(clickyNodeText(text("hello"))).toBe("hello");
  });

  it("joins child node text", () => {
    expect(
      clickyNodeText({ kind: "text", children: [text("a"), text("b")] }),
    ).toBe("ab");
  });

  it("returns empty string for undefined", () => {
    expect(clickyNodeText(undefined)).toBe("");
  });
});

describe("getClickyRowId", () => {
  it("prefers the synthetic _id over a displayed id", () => {
    expect(getClickyRowId(row({ _id: "cls-001", id: "display" }))).toBe(
      "cls-001",
    );
  });

  it("falls back to id when _id is absent", () => {
    expect(getClickyRowId(row({ id: "cls-002" }))).toBe("cls-002");
  });

  it("returns undefined when no id-like cell is present", () => {
    expect(getClickyRowId(row({ name: "prod" }))).toBeUndefined();
  });
});

describe("apiPathToRoutePath", () => {
  it.each([
    ["/api/v1/clusters/{id}", "/clusters/:id"],
    ["/api/v1/clusters", "/clusters"],
    ["/orgs/{org}/repos/{repo}", "/orgs/:org/repos/:repo"],
  ])("maps %j to %j", (path, expected) => {
    expect(apiPathToRoutePath(path)).toBe(expected);
  });
});

describe("hrefForOperation", () => {
  it("fills the path param from flags", () => {
    expect(
      hrefForOperation(detailOp("/api/v1/clusters/{id}"), [], { id: "cls-1" }),
    ).toBe("/clusters/cls-1");
  });

  it("url-encodes the id value", () => {
    expect(
      hrefForOperation(detailOp("/api/v1/clusters/{id}"), [], { id: "a/b" }),
    ).toBe("/clusters/a%2Fb");
  });

  it("returns undefined when a required path param is unfilled", () => {
    expect(
      hrefForOperation(detailOp("/api/v1/clusters/{id}"), [], {}),
    ).toBeUndefined();
  });

  it("appends leftover flags as query params", () => {
    expect(
      hrefForOperation(detailOp("/api/v1/clusters/{id}"), [], {
        id: "cls-1",
        scope: "prod",
      }),
    ).toBe("/clusters/cls-1?scope=prod");
  });
});

describe("useRowDetailNavigation", () => {
  function wrapperFor(navigate: RouterAdapter["navigate"]) {
    const adapter: RouterAdapter = {
      pathname: "/",
      renderLink: () => null,
      navigate,
    };
    return ({ children }: { children: ReactNode }) => (
      <RouterProvider adapter={adapter}>{children}</RouterProvider>
    );
  }

  it("navigates to the detail route on row click", () => {
    const navigate = vi.fn();
    const { result } = renderHook(
      () => useRowDetailNavigation(detailOp("/api/v1/clusters/{id}")),
      { wrapper: wrapperFor(navigate) },
    );

    const clusterRow = row({ _id: "cls-001" });
    expect(result.current.getRowHref(clusterRow)).toBe("/clusters/cls-001");
    expect(result.current.isRowClickable(clusterRow)).toBe(true);

    act(() => result.current.onRowClick(clusterRow));
    expect(navigate).toHaveBeenCalledWith("/clusters/cls-001");
  });

  it("routes by surface key when the path segment differs (plural surface, singular path)", () => {
    const navigate = vi.fn();
    const { result } = renderHook(
      () =>
        useRowDetailNavigation(
          surfaceDetailOp("/api/v1/connection/{id}", "connections"),
        ),
      { wrapper: wrapperFor(navigate) },
    );

    const connRow = row({ _id: "019eed59-a72a-4722-31ea-5047548150a6" });
    expect(result.current.getRowHref(connRow)).toBe(
      "/connections/019eed59-a72a-4722-31ea-5047548150a6",
    );

    act(() => result.current.onRowClick(connRow));
    expect(navigate).toHaveBeenCalledWith(
      "/connections/019eed59-a72a-4722-31ea-5047548150a6",
    );
  });

  it("is inert without a detail operation", () => {
    const navigate = vi.fn();
    const { result } = renderHook(() => useRowDetailNavigation(undefined), {
      wrapper: wrapperFor(navigate),
    });

    const clusterRow = row({ _id: "cls-001" });
    expect(result.current.getRowHref(clusterRow)).toBeUndefined();
    expect(result.current.isRowClickable(clusterRow)).toBe(false);

    act(() => result.current.onRowClick(clusterRow));
    expect(navigate).not.toHaveBeenCalled();
  });
});
