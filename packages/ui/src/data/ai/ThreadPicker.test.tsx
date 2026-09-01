import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ThreadPicker, type ThreadSummary } from "./ThreadPicker";

const API = "/api/chat/sessions";

const THREADS: ThreadSummary[] = [
  { id: "t-001", title: "Reconcile stuck records" },
  { id: "t-002", title: null },
];

function mockFetch(threads: ThreadSummary[] = THREADS) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!init || init.method === undefined || init.method === "GET") {
      return new Response(JSON.stringify(threads), { status: 200 });
    }
    return new Response(null, { status: 204 });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

async function openMenu() {
  fireEvent.click(await screen.findByRole("button", { name: /Reconcile|New Chat/ }));
  await screen.findAllByLabelText("Rename conversation");
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("ThreadPicker renaming", () => {
  it("PATCHes the trimmed title and shows it without a refetch", async () => {
    const fetchMock = mockFetch();
    render(
      <ThreadPicker threadId="t-001" onSelect={vi.fn()} onNew={vi.fn()} api={API} />,
    );
    await openMenu();

    fireEvent.click(screen.getAllByLabelText("Rename conversation")[0]!);
    const input = screen.getByLabelText("Conversation title");
    fireEvent.change(input, { target: { value: "  FY25 dimension cleanup  " } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        `${API}/t-001`,
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ title: "FY25 dimension cleanup" }),
        }),
      ),
    );
    // The renamed thread is the selected one, so it labels both the row and the
    // picker's trigger.
    expect(await screen.findAllByText("FY25 dimension cleanup")).toHaveLength(2);
  });

  it("leaves the title alone when the edit is cancelled", async () => {
    const fetchMock = mockFetch();
    render(
      <ThreadPicker threadId="t-001" onSelect={vi.fn()} onNew={vi.fn()} api={API} />,
    );
    await openMenu();

    fireEvent.click(screen.getAllByLabelText("Rename conversation")[0]!);
    const input = screen.getByLabelText("Conversation title");
    fireEvent.change(input, { target: { value: "discarded" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(await screen.findAllByText("Reconcile stuck records")).toHaveLength(2);
    expect(
      fetchMock.mock.calls.some(([, init]) => init?.method === "PATCH"),
    ).toBe(false);
  });

  it("routes the rename through an injected source instead of the API", async () => {
    const rename = vi.fn(async () => {});
    const fetchMock = mockFetch();
    render(
      <ThreadPicker
        threadId="t-001"
        onSelect={vi.fn()}
        onNew={vi.fn()}
        source={{ load: async () => THREADS, rename }}
      />,
    );
    await openMenu();

    fireEvent.click(screen.getAllByLabelText("Rename conversation")[0]!);
    const input = screen.getByLabelText("Conversation title");
    fireEvent.change(input, { target: { value: "Named by hand" } });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => expect(rename).toHaveBeenCalledWith("t-001", "Named by hand"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("refetches when the refresh token changes, so a backend title appears", async () => {
    const fetchMock = mockFetch();
    const { rerender } = render(
      <ThreadPicker
        threadId="t-002"
        onSelect={vi.fn()}
        onNew={vi.fn()}
        api={API}
        refreshToken={0}
      />,
    );
    expect(await screen.findByText("New Chat")).toBeTruthy();

    mockFetch([
      THREADS[0]!,
      { id: "t-002", title: "Named from the first message" },
    ]);
    rerender(
      <ThreadPicker
        threadId="t-002"
        onSelect={vi.fn()}
        onNew={vi.fn()}
        api={API}
        refreshToken={1}
      />,
    );

    expect(await screen.findByText("Named from the first message")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("ThreadPicker loading", () => {
  it("keeps the newest thread list when an older request resolves last", async () => {
    let resolveFirst!: (threads: ThreadSummary[]) => void;
    let resolveSecond!: (threads: ThreadSummary[]) => void;
    const load = vi
      .fn<() => Promise<ThreadSummary[]>>()
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveFirst = resolve)),
      )
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveSecond = resolve)),
      );
    const { rerender } = render(
      <ThreadPicker
        threadId="t-001"
        onSelect={vi.fn()}
        onNew={vi.fn()}
        source={{ load }}
        refreshToken={0}
      />,
    );
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));

    rerender(
      <ThreadPicker
        threadId="t-001"
        onSelect={vi.fn()}
        onNew={vi.fn()}
        source={{ load }}
        refreshToken={1}
      />,
    );
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));

    await act(async () => {
      resolveSecond([{ id: "t-001", title: "Newest conversations" }]);
    });
    expect(await screen.findByText("Newest conversations")).toBeTruthy();

    await act(async () => {
      resolveFirst([{ id: "t-001", title: "Stale conversations" }]);
    });
    expect(screen.getByText("Newest conversations")).toBeTruthy();
    expect(screen.queryByText("Stale conversations")).toBeNull();
  });

  it("keeps row actions outside the conversation selection control", async () => {
    mockFetch();
    render(
      <ThreadPicker threadId="t-001" onSelect={vi.fn()} onNew={vi.fn()} api={API} />,
    );
    await openMenu();

    const rename = screen.getAllByLabelText("Rename conversation")[0]!;
    const remove = screen.getAllByLabelText("Delete conversation")[0]!;
    expect(rename.closest('[role="button"]')).toBeNull();
    expect(remove.closest('[role="button"]')).toBeNull();
  });
});
