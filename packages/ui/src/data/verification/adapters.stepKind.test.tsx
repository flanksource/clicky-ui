// The typed step-kind sections of the fixture detail (wait timeline, retry
// attempts, exports, outputs, watcher events), rendered through the detail
// panel the way a host shows them.

import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import {
  buildNodeBrief,
  emptyTestFilters,
  TestDetailPanel,
  TestRunnerProvider,
  type Test,
  type TestRunnerContext,
} from "../test-runner";
import { verificationAdapters } from "./adapters";

function runnerContext(selected: Test): TestRunnerContext {
  return {
    tests: [selected],
    selected,
    done: true,
    filters: emptyTestFilters(),
    expandAll: null,
    busy: {},
    adapters: verificationAdapters(),
    onSelect: () => {},
    onFiltersChange: () => {},
    onExpandAllChange: () => {},
  };
}

function renderDetail(selected: Test) {
  return render(
    <TestRunnerProvider value={runnerContext(selected)}>
      <TestDetailPanel />
    </TestRunnerProvider>,
  );
}

const section = (name: string) => {
  const el = document.querySelector<HTMLElement>(`[data-step-section="${name}"]`);
  if (!el) throw new Error(`no ${name} section rendered`);
  return within(el);
};

const POLICY = {
  until: "todo.status == 'review'",
  failWhen: "todo.status in ['failed','ask']",
  interval: "1s",
  backoff: { factor: 1.5, max: "10s" },
  jitter: "20%",
  timeout: "3m",
};

const planStep: Test = {
  name: "plan reaches review",
  framework: "todo_prompt",
  passed: true,
  detail: {
    step: { id: "plan", kind: "todo_prompt" },
    wait: {
      policy: POLICY,
      outcome: "satisfied",
      durationMs: 3100, outputs: { todo: { status: "review" } },
    },
  },
};

describe("verificationAdapters: wait timeline", () => {
  it("summarises the polling policy and shows the until and failWhen expressions", () => {
    renderDetail(planStep);
    const wait = section("wait");
    expect(wait.getByText("every 1s · backoff ×1.5 up to 10s · jitter ±20% · timeout 3m")).toBeInTheDocument();
    expect(wait.getByText("todo.status == 'review'")).toBeInTheDocument();
    expect(wait.getByText("todo.status in ['failed','ask']")).toBeInTheDocument();
  });

  it("shows elapsed time on the summary row and marks only the deciding condition with the outcome", () => {
    renderDetail(planStep);
    expect(document.querySelector("[data-wait-summary]")).toHaveTextContent("Wait3.1s");
    expect(document.querySelector("[data-wait-observation]")).toBeNull();
    expect(document.querySelector("[data-wait-output]")).toBeNull();
    expect(document.querySelector("[data-wait-condition=until]")).toHaveTextContent("Satisfied");
    expect(document.querySelector("[data-wait-condition=failWhen]")).not.toHaveTextContent("Satisfied");
  });

  it("keeps the schedule behind a closed disclosure", () => {
    renderDetail(planStep);
    const disclosure = document.querySelector<HTMLDetailsElement>('[data-step-section="wait"] details')!;
    expect(disclosure.open).toBe(false);
    expect(within(disclosure).getByText(/every 1s/)).toBeInTheDocument();
  });

  it("shows timeout elapsed time and terminal diagnostics", () => {
    renderDetail({
      name: "plan reaches review",
      framework: "todo_prompt",
      failed: true,
      timed_out: true,
      detail: {
        step: { id: "plan", kind: "todo_prompt" },
        wait: {
          policy: POLICY,
          outcome: "timeout",
          durationMs: 180000, outputs: { todo: { status: "in_progress" } }, error: "deadline reached",
        },
      },
    });
    const wait = section("wait");
    expect(wait.getByText("Timed out")).toBeInTheDocument();
    expect(wait.getByText("deadline reached")).toBeInTheDocument();
  });

  it("hides the failWhen badge when the policy has none and no observation tripped it", () => {
    renderDetail({
      ...planStep,
      detail: {
        step: { id: "plan", kind: "todo_prompt" },
        wait: { policy: { until: "x", interval: "1s" }, outcome: "satisfied", durationMs: 0, outputs: { todo: { status: "review" } } },
      },
    });
    expect(screen.queryByText(/failWhen: /)).not.toBeInTheDocument();
  });
});

describe("verificationAdapters: retry attempts", () => {
  it("lists statuses and durations in the header chooser and reports unavailable historical evidence", () => {
    renderDetail({
      name: "run launches",
      framework: "todo_prompt",
      passed: true,
      detail: {
        step: { id: "run", kind: "todo_prompt" },
        attempts: [
          { attempt: 1, status: "failed", error: "launch refused: admission queue full", durationMs: 2100 },
          { attempt: 2, status: "passed", durationMs: 41000 },
        ],
      },
    });
    const chooser = screen.getByRole("combobox", { name: "Attempt" });
    expect(within(chooser).getAllByRole("option").map((o) => o.textContent)).toEqual(["Attempt 1/2 · failed · 2.1s", "Attempt 2/2 · passed · 41.0s"]);
    fireEvent.change(chooser, { target: { value: "1" } });
    expect(screen.getByText("Attempt 1: execution evidence was not stored in this report.")).toBeInTheDocument();
  });
});

describe("verificationAdapters: exports and outputs", () => {
  const node: Test = {
    name: "create the todo",
    framework: "todo",
    passed: true,
    detail: {
      step: { id: "todo", kind: "todo" },
      exports: {
        TODO_ID: { value: "a1b2c3d4", step: "todo" },
        TODO_URL: { value: "http://127.0.0.1:9092/todos/a1b2c3d4", step: "todo" },
      },
      outputs: { todo: { title: "Add Greeting helper", labels: ["enhancement"] } },
    },
  };

  it("tabulates each exported variable with its value and origin step", () => {
    renderDetail(node);
    const table = section("exports").getByRole("table");
    const rows = [...table.querySelectorAll("tbody tr")].map((tr) =>
      [...tr.querySelectorAll("td")].map((td) => td.textContent),
    );
    expect(rows).toEqual([
      ["TODO_ID", "a1b2c3d4", "todo"],
      ["TODO_URL", "http://127.0.0.1:9092/todos/a1b2c3d4", "todo"],
    ]);
    expect([...table.querySelectorAll("th")].map((th) => th.textContent)).toEqual(["Name", "Value", "Step"]);
  });

  it("renders the outputs as a structured tree in the Outputs tab", () => {
    renderDetail(node);
    fireEvent.click(screen.getByRole("tab", { name: "Outputs" }));
    const outputs = section("outputs");
    expect(outputs.getByText(/title/)).toBeInTheDocument();
    expect(outputs.getByText(/Add Greeting helper/)).toBeInTheDocument();
  });

  it("omits the step keys from the raw Detail block but keeps the rest", () => {
    renderDetail({ ...node, detail: { ...(node.detail as object), run: { id: "run-7" } } });
    const detail = screen.getByText(/run-7/).closest('[data-format="yaml"]')!;
    expect(within(detail).getByText(/run-7/)).toBeInTheDocument();
    expect(within(detail).queryByText(/TODO_URL/)).not.toBeInTheDocument();
    expect(within(detail).queryByText(/enhancement/)).not.toBeInTheDocument();
  });

  it("drops the raw Detail block when the step keys were all there was", () => {
    renderDetail(node);
    expect(document.querySelectorAll('[data-format="yaml"]')).toHaveLength(0);
  });
});

describe("verificationAdapters: watcher events", () => {
  const watcher: Test = {
    name: "watch the session tab",
    framework: "playwright",
    failed: true,
    detail: {
      step: { id: "watch", kind: "playwright" },
      events: [
        { type: "console", text: "hydrated" },
        { type: "response", url: "/api/todos/session/detail", status: 500 },
        { type: "alert", text: "Session error", detail: "Failed to load the session transcript: 500" },
      ],
    },
  };

  it("lists events in order and paints an alert red with its details text", () => {
    renderDetail(watcher);
    const events = [...document.querySelectorAll<HTMLElement>("[data-event-type]")];
    expect(events.map((e) => e.dataset.eventType)).toEqual(["console", "response", "alert"]);
    const alert = events[2]!;
    expect(alert.className).toMatch(/text-red-/);
    expect(within(alert).getByText("Session error")).toBeInTheDocument();
    expect(within(alert).getByText("Failed to load the session transcript: 500")).toBeInTheDocument();
    expect(events[0]!.className).not.toMatch(/text-red-/);
  });

  it("shows a failing response's status and url", () => {
    renderDetail(watcher);
    const response = document.querySelector<HTMLElement>('[data-event-type="response"]')!;
    expect(within(response).getByText("500")).toBeInTheDocument();
    expect(within(response).getByText("/api/todos/session/detail")).toBeInTheDocument();
  });
});

describe("verificationAdapters: step identity", () => {
  it("names the step kind and id for a node with no fixture context", () => {
    renderDetail({
      name: "stack",
      framework: "services",
      passed: true,
      detail: { step: { id: "stack", kind: "services" } },
    });
    const ref = document.querySelector("[data-step-ref]")!;
    expect(ref.textContent).toBe("services · stack");
  });

  it("claims a playwright node carrying detail.step but not a playwright test", () => {
    renderDetail({ name: "watch", framework: "playwright", passed: true, detail: { step: { id: "watch", kind: "playwright" } } });
    expect(document.querySelector("[data-step-ref]")).not.toBeNull();
    document.body.innerHTML = "";
    renderDetail({ name: "checkout › pays", framework: "playwright", passed: true, detail: { trace: "t.zip" } });
    expect(document.querySelector("[data-step-ref]")).toBeNull();
  });

  it("says so, with the offending field, when the step detail breaks the contract", () => {
    renderDetail({
      name: "plan",
      framework: "todo_prompt",
      failed: true,
      detail: { step: { id: "plan", kind: "todo_prompt" }, wait: { policy: {}, outcome: "stuck", observations: [] } },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      'Malformed step detail: detail.wait.outcome must be one of satisfied, failed, timeout (got "stuck")',
    );
    expect(screen.getByText("Raw detail")).toBeInTheDocument();
  });
});

describe("verificationAdapters: step copy brief", () => {
  it("adds the wait trace to a typed step's brief", () => {
    const brief = buildNodeBrief(planStep, verificationAdapters().resolveCopy(planStep, runnerContext(planStep)));
    expect(brief).toContain("## Wait");
    expect(brief).toContain('outputs: {"todo":{"status":"review"}}');
    expect(brief).toContain("elapsed: 3.1s");
  });
});
