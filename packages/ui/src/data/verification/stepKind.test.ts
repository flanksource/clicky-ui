import { describe, expect, it } from "vitest";
import { clockTime, policySummary, readStepDetail, stepKindCopy, type StepDetail } from "./stepKind";

const STEP = { id: "plan", kind: "todo_prompt" };

const POLICY = {
  until: "todo.status == 'review'",
  failWhen: "todo.status in ['failed','ask']",
  interval: "1s",
  backoff: { factor: 1.5, max: "10s" },
  jitter: "20%",
  timeout: "3m",
};

const WAIT = {
  policy: POLICY,
  outcome: "satisfied",
  durationMs: 3250,
  outputs: { todo: { status: "review" } },
};

function stepOf(detail: unknown): StepDetail {
  const result = readStepDetail(detail);
  if (result.kind !== "step") throw new Error(`expected a step detail, got ${result.kind}`);
  return result.step;
}

describe("readStepDetail", () => {
  it.each([
    ["no detail", undefined],
    ["null detail", null],
    ["a detail without a step", { cel_trace: "cel: x == 1" }],
    ["an array", [{ step: STEP }]],
  ])("reports none for %s", (_name, detail) => {
    expect(readStepDetail(detail)).toEqual({ kind: "none" });
  });

  it("reads every contract field and leaves the rest of the detail untouched", () => {
    const detail = {
      step: STEP,
      outputs: { plan: { content: "greet/greet.go" } },
      exports: { TODO_ID: { value: "a1b2c3", step: "todo" }, TODO_URL: { value: "http://127.0.0.1:9092/todos/a1b2c3", step: "todo" } },
      wait: WAIT,
      attempts: [
        { attempt: 1, status: "failed", error: "admission refused", durationMs: 2100 },
        { attempt: 2, status: "passed", durationMs: 41000 },
      ],
      background: true,
      events: [{ type: "alert", text: "Session error", detail: "launch failed" }],
      cel_trace: "cel: plan.content.contains('greet/greet.go')",
      run: { id: "r1" },
    };
    expect(stepOf(detail)).toEqual({
      step: STEP,
      outputs: { plan: { content: "greet/greet.go" } },
      exports: [
        { name: "TODO_ID", value: "a1b2c3", step: "todo" },
        { name: "TODO_URL", value: "http://127.0.0.1:9092/todos/a1b2c3", step: "todo" },
      ],
      wait: WAIT,
      attempts: [
        { attempt: 1, status: "failed", error: "admission refused", durationMs: 2100 },
        { attempt: 2, status: "passed", durationMs: 41000 },
      ],
      events: [{ type: "alert", text: "Session error", detail: "launch failed" }],
      background: true,
      rest: { cel_trace: "cel: plan.content.contains('greet/greet.go')", run: { id: "r1" } },
    });
  });

  it("defaults the collections to empty and leaves outputs and wait unset", () => {
    expect(stepOf({ step: STEP })).toEqual({ step: STEP, exports: [], attempts: [], events: [], background: false, rest: {} });
  });

  it.each([
    ["a step without a kind", { step: { id: "x" } }, "detail.step.kind must be a string"],
    ["a wait outcome outside the contract", { step: STEP, wait: { ...WAIT, outcome: "stuck" } }, 'detail.wait.outcome must be one of satisfied, failed, timeout (got "stuck")'],
    ["a wait without elapsed time", { step: STEP, wait: { ...WAIT, durationMs: undefined } }, "detail.wait.durationMs must be a number"],
    ["a wait with negative elapsed time", { step: STEP, wait: { ...WAIT, durationMs: -1 } }, "detail.wait.durationMs must be non-negative"],
    ["an export without an origin step", { step: STEP, exports: { TODO_ID: { value: "a1" } } }, "detail.exports.TODO_ID.step must be a string"],
    ["an attempt without a status", { step: STEP, attempts: [{ attempt: 1 }] }, "detail.attempts[0].status must be a string"],
    ["duplicate attempt numbers", { step: STEP, attempts: [{ attempt: 1, status: "failed" }, { attempt: 1, status: "passed" }] }, "detail.attempts[1].attempt must be the sequence number 2"],
    ["an invalid attempt result", { step: STEP, attempts: [{ attempt: 1, status: "failed", result: { name: 4 } }] }, "detail.attempts[0].result.name must be a string"],
    ["an event of an unknown type", { step: STEP, events: [{ type: "toast" }] }, 'detail.events[0].type must be one of alert, console, pageerror, response (got "toast")'],
    ["a background flag that is not a boolean", { step: STEP, background: "yes" }, "detail.background must be a boolean"],
  ])("reports %s as invalid, naming the field", (_name, detail, error) => {
    expect(readStepDetail(detail)).toEqual({ kind: "invalid", error });
  });
});

describe("clockTime", () => {
  it.each([
    ["2026-10-14T09:00:04Z", "09:00:04"],
    ["2026-10-14T09:00:04.500+03:00", "09:00:04"],
    ["09:00", "09:00"],
  ])("reads %s as %s without converting the zone", (at, shown) => {
    expect(clockTime(at)).toBe(shown);
  });
});

describe("policySummary", () => {
  it("joins the schedule parts in reading order", () => {
    expect(policySummary(POLICY)).toBe("every 1s · backoff ×1.5 up to 10s · jitter ±20% · timeout 3m");
  });

  it("omits what the policy leaves unset", () => {
    expect(policySummary({ until: "x", timeout: "30s" })).toBe("timeout 30s");
  });
});

describe("stepKindCopy", () => {
  it("lays out wait, attempts, exports and events as brief sections", () => {
    const step = stepOf({
      step: STEP,
      wait: WAIT,
      attempts: [{ attempt: 1, status: "failed", error: "admission refused", durationMs: 2100 }],
      exports: { TODO_ID: { value: "a1b2c3", step: "todo" } },
      events: [{ type: "response", url: "/api/todos/item", status: 500 }],
    });
    expect(stepKindCopy(step)).toEqual([
      {
        title: "Wait",
        body: [
          "outcome: satisfied",
          "elapsed: 3.3s",
          "policy: every 1s · backoff ×1.5 up to 10s · jitter ±20% · timeout 3m",
          "until: todo.status == 'review'",
          "failWhen: todo.status in ['failed','ask']",
          'outputs: {"todo":{"status":"review"}}',
        ].join("\n"),
      },
      { title: "Attempts", body: "#1 failed 2.1s — admission refused" },
      { title: "Exports", body: "TODO_ID=a1b2c3 (from todo)" },
      { title: "Events", body: "[response] 500 /api/todos/item" },
    ]);
  });

  it("is empty for a step that carries none of them", () => {
    expect(stepKindCopy(stepOf({ step: STEP }))).toEqual([]);
  });
});
