import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import {
  CommentProvider,
  DEFAULT_COMMENT_STATUSES,
  DOCUMENT_ANCHOR,
} from "@flanksource/clicky-ui";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PageErrorBoundary } from "./PageErrorBoundary";

const { start } = vi.hoisted(() => ({
  start: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("./agent-runs/AgentRunsProvider", () => ({
  useAgentRuns: () => ({ start, data: { settings: { autoRun: false } } }),
}));

function BrokenPage(): never {
  throw new TypeError("Cannot read properties of undefined (reading 'length')");
}

function host(page = "oipa/test-runner-matrix", broken = true) {
  return (
    <CommentProvider
      comments={[]}
      config={{ statuses: DEFAULT_COMMENT_STATUSES }}
    >
      <nav>Host navigation</nav>
      <PageErrorBoundary page={page}>
        {broken ? <BrokenPage /> : <p>Healthy page</p>}
      </PageErrorBoundary>
    </CommentProvider>
  );
}

describe("PageErrorBoundary", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    start.mockClear();
  });

  it("keeps navigation and providers alive, posts the page report once, and sends the stored comment through the existing agent flow", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const saved = {
      id: "error-comment",
      body: "report",
      status: "open",
      createdAt: "2026-11-02T09:23:52Z",
    };
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(saved), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetch);
    render(host());
    expect(screen.getByText("Host navigation")).toBeTruthy();
    expect(fetch).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Comment on error" }));
    await screen.findByRole("button", { name: "Error comment posted" });
    const payload = JSON.parse(fetch.mock.calls[0]![1].body);
    expect(payload).toMatchObject({
      page: "oipa/test-runner-matrix",
      anchor: DOCUMENT_ANCHOR,
      element: {
        source: "apps/playground/src/pages/oipa/test-runner-matrix.tsx",
      },
    });
    expect(payload.body).toContain("React component stack:");
    expect(payload.body).toContain("Cannot read properties of undefined");
    fireEvent.click(screen.getByRole("button", { name: "Send to agent" }));
    await waitFor(() => expect(start).toHaveBeenCalledWith(saved));
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("shows persistence errors and recovers when navigation selects another page", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Comments service unavailable")),
    );
    const { rerender } = render(host());
    fireEvent.click(screen.getByRole("button", { name: "Send to agent" }));
    await screen.findByText("Comments service unavailable");
    expect(start).not.toHaveBeenCalled();
    rerender(host("welcome", false));
    expect(screen.getByText("Healthy page")).toBeTruthy();
    expect(screen.queryByRole("region", { name: "Page error" })).toBeNull();
  });
});
