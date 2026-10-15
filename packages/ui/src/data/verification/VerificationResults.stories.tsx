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

export const Empty: Story = {
  render: () => (
    <div className="h-screen">
      <VerificationResults report={null} />
    </div>
  ),
};
