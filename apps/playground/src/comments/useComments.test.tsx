// @vitest-environment jsdom

import type { RefObject } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactGrabAPI } from "react-grab";
import { DOCUMENT_ANCHOR } from "@flanksource/clicky-ui/comments";

import { useComments } from "./useComments";

function jsonResponse(payload: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => payload,
  } as Response;
}

function contentRef(): RefObject<HTMLDivElement> {
  const root = document.createElement("div");
  root.innerHTML = '<button id="approve">Approve</button>';
  return { current: root };
}

const getStackContext = vi.fn(
  async () => "ApproveButton at /workspace/src/ApproveButton.tsx:27:5",
);
const reactGrab = {
  getDisplayName: vi.fn(() => "ApproveButton"),
  getSource: vi.fn(async () => ({
    filePath: "/workspace/src/ApproveButton.tsx",
    lineNumber: 27,
    columnNumber: 5,
    componentName: "ApproveButton",
  })),
  getStackContext,
} as unknown as ReactGrabAPI;

describe("useComments", () => {
  const fetchMock = vi.fn(
    async (_input: RequestInfo | URL, init?: RequestInit) =>
      init?.method === "POST"
        ? jsonResponse({ id: "created" }, 201)
        : jsonResponse({ comments: [] }),
  );

  beforeEach(() => {
    fetchMock.mockClear();
    getStackContext.mockClear();
    vi.stubGlobal("fetch", fetchMock);
    window.__REACT_GRAB__ = reactGrab;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete window.__REACT_GRAB__;
  });

  it("posts persisted React context for an anchored root", async () => {
    const { result } = renderHook(() => useComments("welcome", contentRef()));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await act(() =>
      result.current.create({ body: "Make this clearer", anchor: "#approve" }),
    );

    const post = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "POST",
    );
    expect(JSON.parse(String(post?.[1]?.body))).toMatchObject({
      page: "welcome",
      anchor: "#approve",
      element: {
        componentName: "ApproveButton",
        source: "ApproveButton at /workspace/src/ApproveButton.tsx:27:5",
        html: '<button id="approve">Approve</button>',
      },
    });
  });

  it("does not capture element context for a page-level comment", async () => {
    const { result } = renderHook(() => useComments("welcome", contentRef()));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    getStackContext.mockClear();

    await act(() =>
      result.current.create({
        body: "Whole-page note",
        anchor: DOCUMENT_ANCHOR,
      }),
    );

    const post = fetchMock.mock.calls.find(
      ([, init]) => init?.method === "POST",
    );
    expect(JSON.parse(String(post?.[1]?.body))).not.toHaveProperty("element");
    expect(getStackContext).not.toHaveBeenCalled();
  });

  it("rejects creation before posting when React context cannot be captured", async () => {
    delete window.__REACT_GRAB__;
    const { result } = renderHook(() => useComments("welcome", contentRef()));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    await expect(
      act(() =>
        result.current.create({ body: "Keep my draft", anchor: "#approve" }),
      ),
    ).rejects.toThrow(/React Grab is not ready/);
    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === "POST"),
    ).toBe(false);
  });
});
