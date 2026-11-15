import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { THREADS, recursiveThreadText, threadStackFixture } from "../fixtures/threads";
import type { JvmThread, JvmThreadStack } from "../protocol/types";
import { DeadlockCallout } from "./DeadlockCallout";
import { ThreadDetail, type ThreadDetailProps } from "./ThreadDetail";

const byId = (id: number) => THREADS.find((thread) => thread.id === id) as JvmThread;
const blocked = byId(22);

function detail(overrides: Partial<ThreadDetailProps> = {}) {
  const props: ThreadDetailProps = {
    threadId: 22,
    thread: blocked,
    inSnapshot: true,
    cpuTimeEnabled: true,
    stack: threadStackFixture(22),
    stackError: null,
    refreshing: false,
    onRefresh: () => {},
    onSelectThread: () => {},
    ...overrides,
  };
  return render(<ThreadDetail {...props} />);
}

describe("ThreadDetail", () => {
  it("shows the thread's name, id, state and facts", () => {
    detail();
    expect(screen.getByRole("heading", { name: "http-nio-8080-exec-2" })).toBeInTheDocument();
    expect(screen.getByText("#22")).toBeInTheDocument();
    expect(screen.getByText("BLOCKED")).toBeInTheDocument();
    expect(screen.getByText("0.4%")).toBeInTheDocument();
    expect(screen.getByText("31× · 4200 ms")).toBeInTheDocument();
    expect(screen.getByText("com.example.orders.Inventory@7f31245a")).toBeInTheDocument();
  });

  it("renders the stack's frames", () => {
    detail();
    expect(screen.getAllByText(/Ledger\.post/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Inventory\.reserve/).length).toBeGreaterThan(0);
  });

  it("selects the lock owner from the facts", () => {
    const onSelectThread = vi.fn();
    detail({ onSelectThread });
    fireEvent.click(screen.getByRole("button", { name: "http-nio-8080-exec-3" }));
    expect(onSelectThread).toHaveBeenCalledWith(23);
  });

  it("hides facts that are not reported", () => {
    const { blockedCount: _c, blockedTimeMs: _t, priority: _p, ...bare } = byId(21);
    detail({ thread: { ...bare, daemon: false } as JvmThread, threadId: 21 });
    expect(screen.queryByText("Blocked")).toBeNull();
    expect(screen.queryByText("Priority")).toBeNull();
    expect(screen.queryByText("Waiting on")).toBeNull();
    expect(screen.getByText("Waited")).toBeInTheDocument();
  });

  it("says when contention time is not monitored", () => {
    const { blockedTimeMs: _unmonitored, ...withoutTime } = blocked;
    detail({ thread: withoutTime });
    expect(screen.getByText("31× (time not monitored)")).toBeInTheDocument();
  });

  it("notes that a thread missing from the snapshot may have ended", () => {
    detail({ inSnapshot: false });
    expect(screen.getByText(/not in the latest snapshot/)).toBeInTheDocument();
  });

  it("offers the downloads only when the host provides them", () => {
    const first = detail();
    expect(screen.queryByRole("button", { name: /Download/ })).toBeNull();
    first.unmount();
    const onDownloadStack = vi.fn();
    const onDownloadDump = vi.fn();
    detail({ onDownloadStack, onDownloadDump });
    fireEvent.click(screen.getByRole("button", { name: /Download stack/ }));
    fireEvent.click(screen.getByRole("button", { name: /Download full dump/ }));
    expect(onDownloadStack).toHaveBeenCalledTimes(1);
    expect(onDownloadDump).toHaveBeenCalledTimes(1);
  });

  it("disables Download stack until the stack has loaded", () => {
    detail({ stack: undefined, onDownloadStack: () => {} });
    expect(screen.getByRole("button", { name: /Download stack/ })).toBeDisabled();
  });

  it("explains a stack that failed to load, naming the thread", () => {
    detail({ stack: undefined, stackError: new Error("Thread 22 has ended") });
    expect(screen.getByText("Stack for thread 22 unavailable")).toBeInTheDocument();
  });

  it("lets the host replace the stack and add content above it", () => {
    detail({ renderStack: (stack: JvmThreadStack) => <p>custom stack of {stack.thread.name}</p>, extra: <p>host analysis</p> });
    expect(screen.getByText("custom stack of http-nio-8080-exec-2")).toBeInTheDocument();
    expect(screen.getByText("host analysis")).toBeInTheDocument();
    expect(screen.queryByText(/Ledger\.post/)).toBeNull();
  });

  it("folds a deep recursion into one copy and unfolds on request", () => {
    const worker = byId(21);
    const stack: JvmThreadStack = { thread: worker, text: recursiveThreadText(worker, 40), frames: [] };
    detail({ thread: worker, threadId: 21, stack });
    expect(screen.getByText(/block repeats 40× on this stack/)).toBeInTheDocument();
    expect(screen.getAllByText(/Ledger\.rollback/)).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /Show all 82 frames/ }));
    expect(screen.getAllByText(/Ledger\.rollback/)).toHaveLength(40);
    fireEvent.click(screen.getByRole("button", { name: "Fold repeats" }));
    expect(screen.getAllByText(/Ledger\.rollback/)).toHaveLength(1);
  });

  it("shows the raw text when it holds no thread block", () => {
    detail({ stack: { thread: blocked, text: "no header here", frames: [] } });
    expect(screen.getByText("no header here")).toBeInTheDocument();
  });
});

describe("DeadlockCallout", () => {
  it("renders nothing without a deadlock", () => {
    const { container } = render(<DeadlockCallout deadlocked={[]} threads={THREADS} onSelect={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("names each deadlocked thread and selects it on click", () => {
    const onSelect = vi.fn();
    render(<DeadlockCallout deadlocked={[22, 23, 99]} threads={THREADS} onSelect={onSelect} />);
    expect(screen.getByRole("alert")).toHaveTextContent("3 threads are each waiting on a lock another one holds");
    fireEvent.click(screen.getByRole("button", { name: "http-nio-8080-exec-3" }));
    expect(onSelect).toHaveBeenCalledWith(23);
    expect(screen.getByRole("button", { name: "#99 (not in this snapshot)" })).toBeInTheDocument();
  });
});
