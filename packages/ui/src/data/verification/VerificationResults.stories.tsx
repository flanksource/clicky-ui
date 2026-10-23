import type { Meta, StoryObj } from "@storybook/react-vite";
import { VerificationResults } from "./VerificationResults";
import { summarizeVerifyNodes, type VerifyReport } from "./verify-report";

const meta: Meta<typeof VerificationResults> = {
  title: "Data/Verification",
  component: VerificationResults,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Renders a captain VerifyReport through the shared TestRunner, so the captain webapp and gavel pr/ui can drop it in without forking. Props-only — no data fetching or routing.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VerificationResults>;

// Every fixture is a report captain's `Validate` would accept: `summary`
// matches the `tests` leaves and `passed` matches `state === "passed"`.
function report(overrides: Partial<VerifyReport>): VerifyReport {
  const state = overrides.state ?? "passed";
  const tests = overrides.tests ?? [];
  return {
    kind: "fixture",
    ran: true,
    passed: state === "passed",
    summary: summarizeVerifyNodes(tests),
    state,
    ...overrides,
  };
}

export const Passing: Story = {
  render: () => (
    <div className="h-screen">
      <VerificationResults
        report={report({
          tests: [
            { name: "lint the repo", framework: "fixture", passed: true, duration: 820_000_000 },
            { name: "run unit tests", framework: "fixture", passed: true, duration: 4_100_000_000 },
          ],
          checklist: [{ item: "docs updated", passed: true }],
        })}
      />
    </div>
  ),
};

export const FailingWithCel: Story = {
  render: () => (
    <div className="h-screen">
      <VerificationResults
        report={report({
          passed: false,
          state: "failed",
          reason: "1 of 2 checks failed",
          tests: [
            { name: "lint the repo", framework: "fixture", passed: true, duration: 820_000_000 },
            {
              name: "assert no regressions",
              framework: "fixture",
              failed: true,
              duration: 1_250_000_000,
              context: {
                cel_expression: "results.failed == 0",
                cel_vars: { failed: 2, suite: "todos" },
                expected: 0,
                actual: 2,
              },
            },
          ],
        })}
      />
    </div>
  ),
};

/** A failed YAML step and a failed markdown block, each with the source lines gavel attaches as `detail.source`. */
export const FailedStepWithSource: Story = {
  render: () => (
    <div className="h-screen">
      <VerificationResults
        report={report({
          passed: false,
          state: "failed",
          reason: "2 of 3 checks failed",
          tests: [
            { name: "build", framework: "exec", passed: true, duration: 2_400_000_000 },
            {
              name: "render us-f5472",
              framework: "exec",
              failed: true,
              duration: 9_300_000_000,
              message: "expected exit code 0, got 1",
              stderr: "render failed: CALC_RATE target must be numeric\n",
              context: { command: "./xero-cli templates render us-f5472 --entity us", cwd: "/src/xero-cli", exit_code: 1 },
              detail: {
                step: { id: "us-f5472", kind: "exec" },
                source: {
                  file: "pkg/provider/demo/testdata/template-render.fixture.yaml",
                  line: 123,
                  end_line: 126,
                  language: "yaml",
                  text: [
                    "  - id: us-f5472",
                    "    kind: exec",
                    "    exec: ./xero-cli",
                    "    args: [templates, render, us-f5472, --entity, us]",
                  ].join("\n"),
                },
              },
            },
            {
              name: "markdown broken",
              framework: "exec",
              failed: true,
              duration: 10_000_000,
              message: "expected exit code 0, got 3",
              context: { command: "bash -c 'exit 3'", exit_code: 3 },
              detail: {
                source: {
                  file: "docs/checks.md",
                  line: 6,
                  end_line: 11,
                  language: "markdown",
                  text: "## command: markdown broken\n\n```bash\necho boom >&2\nexit 3\n```",
                },
              },
            },
          ],
        })}
      />
    </div>
  ),
};

export const RunningWithProgress: Story = {
  render: () => (
    <div className="h-screen">
      <VerificationResults
        report={report({
          state: "running",
          tests: [
            {
              name: "compile the fixture",
              framework: "fixture",
              running: true,
              progress: { phase: "build", done: 3, total: 10 },
            },
          ],
        })}
      />
    </div>
  ),
};

export const ChecklistOnly: Story = {
  render: () => (
    <div className="h-screen">
      <VerificationResults
        report={report({
          passed: false,
          state: "failed",
          checklist: [
            { item: "readme updated", passed: true },
            { item: "changelog entry added", passed: false, message: "missing entry for this change" },
            { item: "reviewed by a teammate", passed: null },
          ],
        })}
      />
    </div>
  ),
};

export const CmdFeedback: Story = {
  render: () => (
    <div className="h-screen">
      <VerificationResults
        report={report({
          kind: "cmd",
          state: "failed",
          reason: "1 of 2 checks failed",
          feedback: "checking config...\nFAIL: missing field 'name'",
        })}
      />
    </div>
  ),
};

export const ErroredWithNoTests: Story = {
  render: () => (
    <div className="h-screen">
      <VerificationResults
        report={report({ kind: "cmd", state: "errored", reason: "verifier crashed: exit status 1" })}
      />
    </div>
  ),
};

/** A typed `todo_prompt` step: a wait that polled three times, a retried launch, and its exports. */
export const TypedStepWithWait: Story = {
  render: () => {
    const plan = {
      name: "plan reaches review",
      framework: "todo_prompt",
      passed: true,
      duration: 41_000_000_000,
      detail: {
        step: { id: "plan", kind: "todo_prompt" },
        outputs: { plan: { content: "Add greet/greet.go with a Greeting helper" } },
        exports: { PLAN_ID: { value: "plan-3", step: "plan" } },
        attempts: [
          { attempt: 1, status: "failed", error: "launch refused: admission queue full", durationMs: 2100 },
          { attempt: 2, status: "passed", durationMs: 38900 },
        ],
        wait: {
          policy: {
            until: "todo.status == 'review'",
            failWhen: "todo.status in ['failed','ask']",
            interval: "1s",
            backoff: { factor: 1.5, max: "10s" },
            jitter: "20%",
            timeout: "3m",
          },
          outcome: "satisfied",
          durationMs: 3000, outputs: { todo: { status: "review" } },
        },
      },
    };
    const { attempts: _attempts, ...detail } = plan.detail;
    const attempts = [
      { ...plan.detail.attempts[0], result: { name: plan.name, framework: plan.framework, failed: true, message: "launch refused: admission queue full", detail: { step: detail.step, outputs: { launch: { failed: true } } } } },
      { ...plan.detail.attempts[1], result: { ...plan, detail } },
    ];
    const selected = { ...plan, detail: { ...detail, attempts } };
    return (
      <div className="h-screen">
        <VerificationResults
          report={report({ tests: [selected] })}
          selected={selected}
          onSelect={() => {}}
        />
      </div>
    );
  },
};

const FIXTURE_ORIGIN = {
  file: "pr/ui/testdata/todo-lifecycle/codex.fixture.yaml",
  section_path: "todo lifecycle (codex cli, aimock)",
  kind: "step",
  row_index: 8,
};

/** A background step whose result has not reached the node yet: only the execution header is known. */
export const ProgressOnlyFixtureStep: Story = {
  render: () => {
    const watch = {
      name: "watch",
      framework: "fixture",
      passed: true,
      detail: {
        name: "watch",
        kind: "command",
        state: "passed",
        origin: FIXTURE_ORIGIN,
        started_at: "2026-10-18T09:00:04Z",
        finished_at: "2026-10-18T09:00:08Z",
        duration: 4_583_837_958,
      },
    };
    return (
      <div className="h-screen">
        <VerificationResults report={report({ tests: [watch] })} selected={watch} onSelect={() => {}} />
      </div>
    );
  },
};

/** A wait that ended on its failWhen condition: the cause leads, the deciding condition carries the outcome. */
export const FailedWaitWithCause: Story = {
  render: () => {
    const failWhen = "run.state in ['failed', 'cancelled']";
    const cause = "aimock: no scenario rule matched this request\n  model: gpt-5\n  last message: triage this todo";
    const outputs = { run: { state: "failed", error: cause }, todo: { title: "greeting thing" } };
    const triaged = {
      name: "triaged",
      framework: "fixture",
      failed: true,
      message: `${cause}\n(wait failWhen ${failWhen} is true)`,
      context: { cel_expression: failWhen, cel_vars: { "run.state": "failed" } },
      detail: {
        step: { id: "triaged", kind: "todo" },
        kind: "todo",
        state: "failed",
        origin: { ...FIXTURE_ORIGIN, row_index: 9 },
        outputs,
        wait: {
          policy: {
            until: "run.state == 'completed' && todo.title != 'greeting thing'",
            failWhen,
            interval: "1s",
            backoff: { factor: 1.5, max: "5s" },
            jitter: "20%",
            timeout: "1m30s",
          },
          outcome: "failed",
          durationMs: 19,
          expression: failWhen,
          cause,
          outputs,
        },
      },
    };
    return (
      <div className="h-screen">
        <VerificationResults report={report({ passed: false, state: "failed", tests: [triaged] })} selected={triaged} onSelect={() => {}} />
      </div>
    );
  },
};

export const Empty: Story = {
  render: () => (
    <div className="h-screen">
      <VerificationResults report={null} />
    </div>
  ),
};
