import type { JvmThread, JvmThreadStack, JvmThreadsSnapshot } from "../protocol/types";

function thread(overrides: Partial<JvmThread> & Pick<JvmThread, "id" | "name" | "state">): JvmThread {
  return {
    daemon: true,
    priority: 5,
    cpuPercent: 0,
    cpuTimeMs: 120,
    blockedCount: 0,
    blockedTimeMs: 0,
    waitedCount: 4,
    waitedTimeMs: 1800,
    lockName: null,
    lockOwnerId: null,
    lockOwnerName: null,
    inNative: false,
    suspended: false,
    ...overrides,
  };
}

export const THREADS: JvmThread[] = [
  thread({ id: 1, name: "main", state: "WAITING", daemon: false, cpuTimeMs: 2400, lockName: "java.lang.Object@1b6d3586" }),
  thread({ id: 2, name: "Reference Handler", state: "RUNNABLE", priority: 10, cpuTimeMs: 12 }),
  thread({ id: 3, name: "Finalizer", state: "WAITING", priority: 8, lockName: "java.lang.ref.ReferenceQueue$Lock@4554617c" }),
  thread({ id: 4, name: "Signal Dispatcher", state: "RUNNABLE", priority: 9, cpuTimeMs: 0 }),
  thread({ id: 11, name: "Attach Listener", state: "RUNNABLE", priority: 9, cpuTimeMs: 3 }),
  thread({ id: 21, name: "http-nio-8080-exec-1", state: "RUNNABLE", cpuPercent: 42.5, cpuTimeMs: 18_420 }),
  thread({ id: 22, name: "http-nio-8080-exec-2", state: "BLOCKED", cpuPercent: 0.4, cpuTimeMs: 9_310, blockedCount: 31, blockedTimeMs: 4_200, lockName: "com.example.orders.Inventory@7f31245a", lockOwnerId: 23, lockOwnerName: "http-nio-8080-exec-3" }),
  thread({ id: 23, name: "http-nio-8080-exec-3", state: "BLOCKED", cpuPercent: 0.1, cpuTimeMs: 7_880, blockedCount: 12, blockedTimeMs: 3_900, lockName: "com.example.orders.Ledger@6d06d69c", lockOwnerId: 22, lockOwnerName: "http-nio-8080-exec-2" }),
  thread({ id: 24, name: "http-nio-8080-exec-4", state: "TIMED_WAITING", cpuTimeMs: 6_020, lockName: "java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject@15db9742" }),
  thread({ id: 25, name: "http-nio-8080-exec-5", state: "WAITING", cpuTimeMs: 5_870, lockName: "java.util.concurrent.locks.AbstractQueuedSynchronizer$ConditionObject@15db9742" }),
  thread({ id: 31, name: "orders-scheduler-1", state: "TIMED_WAITING", cpuPercent: 1.2, cpuTimeMs: 840 }),
  thread({ id: 32, name: "orders-scheduler-2", state: "TIMED_WAITING", cpuTimeMs: 790 }),
  thread({ id: 41, name: "HikariPool-1 housekeeper", state: "TIMED_WAITING", cpuTimeMs: 66 }),
  thread({ id: 51, name: "arthas-command-execute", state: "RUNNABLE", cpuPercent: 3.1, cpuTimeMs: 210 }),
];

export const THREADS_SNAPSHOT: JvmThreadsSnapshot = { sampledMs: 200, cpuTimeEnabled: true, deadlocked: [22, 23], threads: THREADS };

const frames: Record<number, JvmThreadStack["frames"]> = {
  21: [
    { className: "java.util.HashMap", methodName: "putVal", fileName: "HashMap.java", lineNumber: 631 },
    { className: "com.example.orders.PriceCalculator", methodName: "total", fileName: "PriceCalculator.java", lineNumber: 48 },
    { className: "com.example.orders.OrderService", methodName: "checkout", fileName: "OrderService.java", lineNumber: 18 },
    { className: "com.example.orders.OrderController", methodName: "post", fileName: "OrderController.java", lineNumber: 33 },
    { className: "org.apache.catalina.core.ApplicationFilterChain", methodName: "doFilter", fileName: "ApplicationFilterChain.java", lineNumber: 166 },
    { className: "java.lang.Thread", methodName: "run", fileName: "Thread.java", lineNumber: 840 },
  ],
  22: [
    { className: "com.example.orders.Ledger", methodName: "post", fileName: "Ledger.java", lineNumber: 72 },
    { className: "com.example.orders.Inventory", methodName: "reserve", fileName: "Inventory.java", lineNumber: 24 },
    { className: "com.example.orders.OrderService", methodName: "checkout", fileName: "OrderService.java", lineNumber: 21 },
    { className: "java.lang.Thread", methodName: "run", fileName: "Thread.java", lineNumber: 840 },
  ],
};

function frameLines(stack: JvmThreadStack["frames"]): string {
  return stack.map((frame) => `\tat ${frame.className}.${frame.methodName}(${frame.fileName ?? "Unknown Source"}:${frame.lineNumber})`).join("\n");
}

/** A jstack-format block for one thread. */
export function threadText(item: JvmThread): string {
  const header = `"${item.name}" #${item.id}${item.daemon ? " daemon" : ""} prio=${item.priority ?? 5} tid=0x${item.id.toString(16).padStart(12, "0")} nid=0x${(item.id + 4096).toString(16)}`;
  const state = `   java.lang.Thread.State: ${item.state}`;
  const stack = frames[item.id] ?? [
    { className: "java.lang.Object", methodName: "wait", fileName: "Object.java", lineNumber: -2 },
    { className: "java.lang.Thread", methodName: "run", fileName: "Thread.java", lineNumber: 840 },
  ];
  const lock = item.lockName ? `\n\t- ${item.state === "BLOCKED" ? "waiting to lock" : "parking to wait for"} <${item.lockName}>` : "";
  return `${header}\n${state}\n${frameLines(stack)}${lock}\n`;
}

/**
 * A jstack block for `item` whose stack is a two-frame recursion `depth` levels
 * deep between a small entry and exit, as a retrying worker produces.
 */
export function recursiveThreadText(item: JvmThread, depth: number): string {
  const entry: JvmThreadStack["frames"] = [{ className: "com.example.orders.RetryService", methodName: "undo", fileName: "RetryService.java", lineNumber: 61 }];
  const unit: JvmThreadStack["frames"] = [
    { className: "com.example.orders.Ledger", methodName: "rollback", fileName: "Ledger.java", lineNumber: 112 },
    { className: "com.example.orders.RetryService", methodName: "undo", fileName: "RetryService.java", lineNumber: 61 },
  ];
  const exit: JvmThreadStack["frames"] = [{ className: "java.lang.Thread", methodName: "run", fileName: "Thread.java", lineNumber: 840 }];
  const stack = [...entry, ...Array.from({ length: depth }, () => unit).flat(), ...exit];
  const header = `"${item.name}" #${item.id}${item.daemon ? " daemon" : ""} prio=${item.priority ?? 5}`;
  return `${header}\n   java.lang.Thread.State: ${item.state}\n${frameLines(stack)}\n`;
}

export function threadStackFixture(id: number): JvmThreadStack {
  const item = THREADS.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Thread ${id} has ended`);
  const stack = frames[id] ?? [
    { className: "java.lang.Object", methodName: "wait", fileName: "Object.java", lineNumber: -2 },
    { className: "java.lang.Thread", methodName: "run", fileName: "Thread.java", lineNumber: 840 },
  ];
  return { thread: item, text: threadText(item), frames: stack };
}

export function threadDumpFixture(): string {
  return `Full thread dump OpenJDK 64-Bit Server VM (21.0.5+11):\n\n${THREADS.map(threadText).join("\n")}`;
}
