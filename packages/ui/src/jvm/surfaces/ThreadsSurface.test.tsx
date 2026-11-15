import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fakeJvmClient } from "../fixtures/fake-client";
import { THREADS_SNAPSHOT, threadDumpFixture, threadStackFixture } from "../fixtures/threads";
import type { JvmDiagnosticsClient } from "../protocol/client";
import { JvmProvider } from "./JvmProvider";
import { ThreadsSurface, type ThreadsSurfaceProps, type ThreadsSurfaceState } from "./ThreadsSurface";

type Options = Partial<Omit<ThreadsSurfaceProps, "state" | "onStateChange">> & { initial?: ThreadsSurfaceState };

function spiedClient(overrides: Partial<JvmDiagnosticsClient> = {}) {
  const base = fakeJvmClient();
  const threads = vi.fn(base.threads);
  const threadStack = vi.fn(base.threadStack);
  const threadDump = vi.fn(base.threadDump);
  const client: JvmDiagnosticsClient = { ...base, threads, threadStack, threadDump, ...overrides };
  return { client, threads, threadStack, threadDump };
}

function Harness({ client, initial, changes, ...props }: Options & { client: JvmDiagnosticsClient; changes: ThreadsSurfaceState[] }) {
  const [state, setState] = useState<ThreadsSurfaceState>(initial ?? {});
  return (
    <JvmProvider client={client} scope="prod-1">
      <ThreadsSurface
        state={state}
        onStateChange={(next) => {
          changes.push(next);
          setState(next);
        }}
        {...props}
      />
    </JvmProvider>
  );
}

function renderSurface(client: JvmDiagnosticsClient, options: Options = {}) {
  const changes: ThreadsSurfaceState[] = [];
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={queryClient}>
      <Harness client={client} changes={changes} {...options} />
    </QueryClientProvider>,
  );
  return changes;
}

const row = (id: number) => document.querySelector<HTMLElement>(`[data-thread-row="${id}"]`);

describe("ThreadsSurface", () => {
  it("samples CPU over 200 ms and summarises the snapshot", async () => {
    const { client, threads } = spiedClient();
    renderSurface(client);
    expect(await screen.findByText(/14 threads · CPU sampled over 200 ms/)).toBeInTheDocument();
    expect(threads.mock.calls[0]?.[0]).toEqual({ sampleMs: 200 });
  });

  it("flags the deadlock and selects a deadlocked thread from the banner", async () => {
    const { client } = spiedClient();
    const changes = renderSurface(client);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("2 threads are each waiting on a lock another one holds");
    fireEvent.click(within(alert).getByRole("button", { name: "http-nio-8080-exec-3" }));
    expect(changes).toEqual([{ thread: "23" }]);
    expect(await screen.findByRole("heading", { name: "http-nio-8080-exec-3" })).toBeInTheDocument();
  });

  it("asks for a thread's stack only once it is selected and renders its frames", async () => {
    const { client, threadStack } = spiedClient();
    renderSurface(client);
    await screen.findByText(/14 threads/);
    expect(screen.getByText("Select a thread to read its stack.")).toBeInTheDocument();
    expect(threadStack).not.toHaveBeenCalled();
    fireEvent.click(within(row(21)!).getByText("http-nio-8080-exec-1"));
    expect(await screen.findByText(/PriceCalculator\.total/)).toBeInTheDocument();
    expect(threadStack.mock.calls[0]?.[0]).toBe(21);
  });

  it("follows the lock owner of the selected thread", async () => {
    const { client } = spiedClient();
    renderSurface(client, { initial: { thread: "22" } });
    expect(await screen.findByRole("heading", { name: "http-nio-8080-exec-2" })).toBeInTheDocument();
    fireEvent.click(within(row(22)!).getByRole("button", { name: "http-nio-8080-exec-3" }));
    expect(await screen.findByRole("heading", { name: "http-nio-8080-exec-3" })).toBeInTheDocument();
  });

  it("keeps the other state when the view changes and drops defaults", async () => {
    const { client } = spiedClient();
    const changes = renderSurface(client, { initial: { thread: "21", q: "http" } });
    await screen.findByText(/14 threads/);
    fireEvent.click(screen.getByRole("radio", { name: "Name" }));
    fireEvent.click(screen.getByRole("button", { name: /^BLOCKED/ }));
    fireEvent.click(screen.getByRole("radio", { name: "CPU" }));
    expect(changes).toEqual([
      { thread: "21", q: "http", sort: "name" },
      { thread: "21", q: "http", sort: "name", states: "BLOCKED" },
      { thread: "21", q: "http", states: "BLOCKED" },
    ]);
  });

  it("writes the filter text and clears it with the states", async () => {
    const { client } = spiedClient();
    const changes = renderSurface(client, { initial: { thread: "21", states: "RUNNABLE" } });
    await screen.findByText(/14 threads/);
    fireEvent.change(screen.getByLabelText("Filter threads"), { target: { value: "exec" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(changes).toEqual([
      { thread: "21", states: "RUNNABLE", q: "exec" },
      { thread: "21" },
    ]);
  });

  it("explains a selected thread that has ended", async () => {
    const { client } = spiedClient({
      threadStack: async (id) => {
        throw new Error(`Thread ${id} has ended`);
      },
    });
    renderSurface(client, { initial: { thread: "99" } });
    expect(await screen.findByText("Stack for thread 99 unavailable")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Thread 99" })).toBeInTheDocument();
  });

  it("treats a malformed thread param as no selection", async () => {
    const { client, threadStack } = spiedClient();
    renderSurface(client, { initial: { thread: "abc" } });
    expect(await screen.findByText("Select a thread to read its stack.")).toBeInTheDocument();
    expect(threadStack).not.toHaveBeenCalled();
  });

  it("shows the failure when the snapshot cannot be read", async () => {
    const { client } = spiedClient({
      threads: async () => {
        throw new Error("agent unreachable");
      },
    });
    renderSurface(client);
    expect(await screen.findByText("Threads unavailable")).toBeInTheDocument();
  });

  it("keeps showing the last snapshot when a refresh fails", async () => {
    let calls = 0;
    const base = fakeJvmClient();
    const { client } = spiedClient({
      threads: async (request, options) => {
        if (++calls > 1) throw new Error("agent unreachable");
        return base.threads(request, options);
      },
    });
    renderSurface(client);
    await screen.findByText(/14 threads/);
    fireEvent.click(screen.getByRole("button", { name: /Refresh/ }));
    expect(await screen.findByText("Thread snapshot refresh failed")).toBeInTheDocument();
    expect(screen.getByText(/14 threads/)).toBeInTheDocument();
  });

  describe("polling", () => {
    it("refreshes on the interval until paused, and again after resuming", async () => {
      const { client, threads } = spiedClient();
      renderSurface(client, { pollMs: 40 });
      await waitFor(() => expect(threads.mock.calls.length).toBeGreaterThanOrEqual(3));
      fireEvent.click(screen.getByRole("button", { name: /Pause/ }));
      await new Promise((resolve) => setTimeout(resolve, 80));
      const paused = threads.mock.calls.length;
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(threads.mock.calls.length).toBe(paused);
      fireEvent.click(screen.getByRole("button", { name: /Resume/ }));
      await waitFor(() => expect(threads.mock.calls.length).toBeGreaterThan(paused));
    });

    it("Refresh fetches a new snapshot even while paused", async () => {
      const { client, threads } = spiedClient();
      renderSurface(client, { pollMs: 60_000 });
      await screen.findByText(/14 threads/);
      fireEvent.click(screen.getByRole("button", { name: /Pause/ }));
      const before = threads.mock.calls.length;
      fireEvent.click(screen.getByRole("button", { name: /Refresh/ }));
      await waitFor(() => expect(threads.mock.calls.length).toBe(before + 1));
    });
  });

  describe("downloads", () => {
    const blobs: Blob[] = [];
    const names: string[] = [];

    beforeEach(() => {
      blobs.length = 0;
      names.length = 0;
      URL.createObjectURL = (blob) => {
        blobs.push(blob as Blob);
        return "blob:mock";
      };
      URL.revokeObjectURL = () => {};
      vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (this: HTMLAnchorElement) {
        names.push(this.download);
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
      Reflect.deleteProperty(URL, "createObjectURL");
      Reflect.deleteProperty(URL, "revokeObjectURL");
    });

    it("saves the selected thread's stack text under a name derived from the thread", async () => {
      const { client } = spiedClient();
      renderSurface(client, { initial: { thread: "22" } });
      const button = await screen.findByRole("button", { name: /Download stack/ });
      await waitFor(() => expect(button).toBeEnabled());
      fireEvent.click(button);
      expect(names).toEqual(["http-nio-8080-exec-2-22.txt"]);
      expect(blobs[0]?.size).toBe(threadStackFixture(22).text.length);
      expect(blobs[0]?.type).toContain("text/plain");
    });

    it("saves the whole JVM's dump", async () => {
      const { client, threadDump } = spiedClient();
      renderSurface(client, { initial: { thread: "22" } });
      fireEvent.click(await screen.findByRole("button", { name: /Download full dump/ }));
      await waitFor(() => expect(names).toEqual(["jvm-threads-prod-1.txt"]));
      expect(threadDump).toHaveBeenCalledTimes(1);
      expect(blobs[0]?.size).toBe(threadDumpFixture().length);
    });

    it("hides both downloads when the host does not permit them", async () => {
      const { client } = spiedClient();
      renderSurface(client, { initial: { thread: "22" }, canDownload: false });
      await screen.findByText(/PriceCalculator|Ledger\.post/);
      expect(screen.queryByRole("button", { name: /Download/ })).toBeNull();
    });

    it("reports a failed dump without throwing away the stack", async () => {
      const { client } = spiedClient({
        threadDump: async () => {
          throw new Error("dump refused");
        },
      });
      renderSurface(client, { initial: { thread: "22" } });
      fireEvent.click(await screen.findByRole("button", { name: /Download full dump/ }));
      expect(await screen.findByText("Thread dump unavailable")).toBeInTheDocument();
      expect(screen.getAllByText(/Ledger\.post/).length).toBeGreaterThan(0);
    });
  });

  describe("slots", () => {
    it("renders host content in rows, the toolbar and the detail, and lets the host match and render stacks", async () => {
      const { client } = spiedClient();
      renderSurface(client, {
        initial: { thread: "21" },
        rowExtra: (thread) => (thread.id === 21 ? <span>hot path</span> : null),
        getSearchText: (thread) => (thread.id === 31 ? "scheduler-tag" : ""),
        toolbarActions: <button type="button">Analyze</button>,
        renderDetailExtra: (stack) => <p>analysis of {stack.thread.name}</p>,
        renderStack: (stack) => <pre>{stack.frames.length} frames</pre>,
      });
      expect(await screen.findByText("hot path")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Analyze" })).toBeInTheDocument();
      expect(await screen.findByText("analysis of http-nio-8080-exec-1")).toBeInTheDocument();
      expect(screen.getByText("6 frames")).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText("Filter threads"), { target: { value: "scheduler-tag" } });
      expect(row(31)).not.toBeNull();
      expect(row(21)).toBeNull();
    });
  });

  it("lists every thread of the fixture snapshot", async () => {
    const { client } = spiedClient();
    renderSurface(client);
    await screen.findByText(/14 threads/);
    const visible = THREADS_SNAPSHOT.threads.filter((thread) => thread.id !== 11 && thread.id !== 51);
    expect(document.querySelectorAll("[data-thread-row]")).toHaveLength(visible.length);
  });
});
