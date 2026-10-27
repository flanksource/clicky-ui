import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import {
  MATRIX_MARKS,
  formatMatrixDuration,
  matrixBarClass,
  matrixMarkKey,
  repeatsMark,
  type MatrixEnvCounts,
} from "./matrix-marks";
import {
  EmptyMatrixCell,
  EnvChip,
  MatrixElapsed,
  MatrixEnvHeader,
  MatrixLegend,
  MatrixMark,
  MatrixMix,
  MatrixUnavailableEnvHeader,
} from "./MatrixMarks";

const ENV = "dev";
const RUNNING_ENV: MatrixEnvCounts = { passed: 2, warned: 1, failed: 0, error: 0, running: 1, queued: 1, total: 5 };

const mixOutcomes = (container: HTMLElement) =>
  [...container.querySelectorAll("[data-mix-outcome]")].map((el) => [el.getAttribute("data-mix-outcome"), el.getAttribute("aria-label")]);

describe("MatrixLegend", () => {
  it("lists every mark in matrix order with its legend text, then the elapsed key", () => {
    const { container } = render(<MatrixLegend />);
    const entries = [...container.querySelectorAll("[data-batch-legend] > span")].map((el) => [el.getAttribute("data-legend-mark"), el.textContent]);
    expect(entries).toEqual([
      ["passed", "passed"],
      ["warned", "warned"],
      ["skipped", "skipped"],
      ["running", "running"],
      ["aborted", "aborted"],
      ["failed", "failed"],
      ["error", "error · never started"],
      ["pending", "pending · queued"],
      ["absent", "not in this run"],
      [null, "elapsed · total duration"],
    ]);
  });
});

describe("matrixMarkKey", () => {
  it.each(["passed", "error", "absent"])("keys outcome %s to its own mark", (outcome) => {
    expect(matrixMarkKey(outcome)).toBe(outcome);
  });

  it.each(["queued", "unavailable", "Passed", "", "toString", "constructor"])("throws on outcome %j the matrix has no mark for", (outcome) => {
    expect(() => matrixMarkKey(outcome)).toThrow(`matrix has no mark for outcome "${outcome}"`);
  });
});

describe("repeatsMark", () => {
  it.each([
    { counts: { failed: 3 }, mark: "failed", want: true },
    { counts: { failed: 3, passed: 0 }, mark: "failed", want: true },
    { counts: { failed: 3, passed: 1 }, mark: "failed", want: false },
    { counts: { passed: 2 }, mark: "failed", want: false },
    { counts: {}, mark: "passed", want: false },
  ] as const)("is $want for $counts beside a $mark mark", ({ counts, mark, want }) => {
    expect(repeatsMark(counts, mark)).toBe(want);
  });
});

describe("MatrixMix", () => {
  it("drops zero counts, keeping matrix order", () => {
    const { container } = render(<MatrixMix counts={{ failed: 0, running: 1, passed: 3, warned: 0 }} unit="plans" />);
    expect(mixOutcomes(container)).toEqual([
      ["passed", "3 passed plans"],
      ["running", "1 running plans"],
    ]);
  });

  it("keeps a zero count listed in always", () => {
    const { container } = render(<MatrixMix counts={{ passed: 3 }} unit="steps" always={["failed"]} />);
    expect(mixOutcomes(container)).toEqual([
      ["passed", "3 passed steps"],
      ["failed", "0 failed steps"],
    ]);
  });
});

describe("static (print) mode", () => {
  const animated = (container: HTMLElement) => container.innerHTML.match(/animate-[a-z]+/g) ?? [];
  const everything = (isStatic: boolean) => (
    <div>
      <MatrixMark mark="running" static={isStatic} />
      <MatrixMix counts={{ running: 2, passed: 1 }} unit="steps" static={isStatic} />
      <MatrixLegend static={isStatic} />
      <MatrixEnvHeader context={ENV} counts={RUNNING_ENV} durationMs={61_000} running static={isStatic} />
    </div>
  );

  it("animates the running mark and bar when live", () => {
    expect(new Set(animated(render(everything(false)).container))).toEqual(new Set(["animate-spin", "animate-pulse"]));
  });

  it("draws no animate-* class at all", () => {
    expect(animated(render(everything(true)).container)).toEqual([]);
  });

  it("drops animate-* from a bar class but keeps its colour", () => {
    expect([matrixBarClass("running", true), matrixBarClass("running", false), matrixBarClass("passed", true)]).toEqual([
      "bg-blue-500",
      "bg-blue-500 animate-pulse",
      "bg-emerald-500",
    ]);
  });

  it("never renders the chip link slot", () => {
    const { container } = render(
      <MatrixEnvHeader context={ENV} counts={RUNNING_ENV} durationMs={0} running={false} static renderChip={(chip) => <a href="/run">{chip}</a>} />,
    );
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector(`[data-env-chip="${ENV}"]`)).not.toBeNull();
  });
});

describe("formatMatrixDuration", () => {
  it.each([
    { ms: 0, want: "0s" },
    { ms: 499, want: "0s" },
    { ms: 500, want: "1s" },
    { ms: 42_000, want: "42s" },
    { ms: 59_499, want: "59s" },
    { ms: 59_500, want: "1m 00s" },
    { ms: 252_000, want: "4m 12s" },
    { ms: 3_599_000, want: "59m 59s" },
    { ms: 3_600_000, want: "1h 00m" },
    { ms: 3_780_000, want: "1h 03m" },
  ])("formats $ms ms as $want", ({ ms, want }) => {
    expect(formatMatrixDuration(ms)).toBe(want);
  });
});

describe("MatrixElapsed", () => {
  it("reads blue and 'elapsed so far' only while running", () => {
    const running = render(<MatrixElapsed ms={252_000} running />).container.querySelector("[data-duration]")!;
    const done = render(<MatrixElapsed ms={252_000} running={false} />).container.querySelector("[data-duration]")!;
    expect([running.textContent, running.getAttribute("title"), running.className.includes("text-blue-700")]).toEqual(["4m 12s", "elapsed so far", true]);
    expect([done.textContent, done.getAttribute("title"), done.className.includes("text-muted-foreground")]).toEqual(["4m 12s", "total duration", true]);
  });
});

describe("EmptyMatrixCell", () => {
  it.each([
    { outcome: "error", detail: "never started", mark: "error", text: "never started" },
    { outcome: "queued", detail: undefined, mark: "pending", text: "pending" },
    { outcome: "absent", detail: undefined, mark: "absent", text: "not in this run" },
  ])("draws $outcome ($detail) as the $mark mark", ({ outcome, detail, mark, text }) => {
    const { container } = render(<EmptyMatrixCell outcome={outcome} {...(detail ? { detail } : {})} title="plan.yaml in dev" />);
    const cell = container.querySelector("[data-empty-cell]")!;
    expect([cell.getAttribute("data-empty-cell"), cell.getAttribute("title"), cell.textContent]).toEqual([mark, "plan.yaml in dev", text]);
  });

  it("draws the glyph alone when bare", () => {
    const { container } = render(<EmptyMatrixCell outcome="queued" title="t" bare />);
    expect(container.querySelector("[data-empty-cell]")!.textContent).toBe("");
  });

  it.each(["passed", "failed", "error"])("throws on a %s cell that has a run", (outcome) => {
    expect(() => render(<EmptyMatrixCell outcome={outcome} title="plan.yaml in dev" />)).toThrow(`unexpected empty matrix cell ${outcome}: plan.yaml in dev`);
  });
});

describe("MatrixEnvHeader", () => {
  it("shows the chip, finished/total plans with the elapsed time, and the plan verdict", () => {
    const { container } = render(<MatrixEnvHeader context={ENV} counts={RUNNING_ENV} durationMs={61_000} running />);
    const progress = container.querySelector("[data-env-progress]")!;
    expect(progress.getAttribute("title")).toBe("3 of 5 plans finished");
    expect(progress.textContent).toBe("3/5 plans1m 01s");
    expect(mixOutcomes(container.querySelector("[data-env-verdict]")!)).toEqual([
      ["passed", "2 passed plans"],
      ["warned", "1 warned plans"],
      ["running", "1 running plans"],
      ["failed", "0 failed plans"],
      ["pending", "1 pending plans"],
    ]);
  });

  it("colours the progress bar in plan-bar order", () => {
    const counts: MatrixEnvCounts = { passed: 1, warned: 1, failed: 1, error: 1, running: 1, queued: 0, total: 5 };
    const { container } = render(<MatrixEnvHeader context={ENV} counts={counts} durationMs={0} running={false} />);
    const fills = [...container.querySelectorAll("[role=progressbar] > div")].map((el) => el.getAttribute("title"));
    expect(fills).toEqual(["1 passed plans", "1 warned plans", "1 failed plans", "1 error plans", "1 running plans"]);
  });

  it("wraps the chip in the host's link and puts the aside beside it", () => {
    const { container } = render(
      <MatrixEnvHeader
        context={ENV}
        counts={RUNNING_ENV}
        durationMs={0}
        running={false}
        renderChip={(chip) => <a href="/run/1">{chip}</a>}
        aside={<span data-aside="">retried 2×</span>}
      />,
    );
    expect(container.querySelector(`a[href="/run/1"] [data-env-chip="${ENV}"]`)).not.toBeNull();
    expect(container.querySelector("[data-aside]")!.textContent).toBe("retried 2×");
  });

  it("says an unavailable environment did not load, in the same three rows", () => {
    const { container } = render(<MatrixUnavailableEnvHeader context={ENV} />);
    const rows = [...container.querySelector(`[data-env-header="${ENV}"]`)!.children].map((el) => el.textContent);
    expect(rows).toEqual([ENV, "did not load", ""]);
    expect(container.querySelector('[data-mark="error"]')).not.toBeNull();
  });
});

describe("MatrixMark", () => {
  it("titles the glyph with its label unless label is empty", () => {
    const titled = render(<MatrixMark mark="absent" />).container.querySelector("svg")!;
    const untitled = render(<MatrixMark mark="absent" label="" />).container.querySelector("svg")!;
    expect([titled.getAttribute("aria-label"), untitled.getAttribute("aria-label")]).toEqual([MATRIX_MARKS.absent.label, null]);
  });
});

describe("EnvChip", () => {
  it("names the context in a chip", () => {
    const chip = render(<EnvChip context={ENV} />).container.querySelector("[data-env-chip]")!;
    expect([chip.getAttribute("data-env-chip"), chip.textContent]).toEqual([ENV, ENV]);
  });
});
