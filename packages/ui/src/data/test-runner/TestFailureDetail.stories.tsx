import type { Meta, StoryObj } from "@storybook/react-vite";
import { TestFailureDetail } from "./TestFailureDetail";
import type { FailureDetail } from "./types";

const FAILURE: FailureDetail = {
  kind: "go_test",
  summary: "login should reject an incorrect password",
  expected: "status 401 Unauthorized",
  actual: "status 200 OK",
  location: "auth/login_test.go:88",
  stack: "auth/login_test.go:88 +0x1a4\nauth/login_test.go:71 +0x90\ntesting.tRunner +0xff",
};

const meta = {
  title: "Data/TestRunner/TestFailureDetail",
  component: TestFailureDetail,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Structured failure view for a failed test: summary, an expected-vs-actual diff, the source location, and the stack trace. Driven by the node's `failure_detail` (`FailureDetail`).",
      },
    },
  },
  argTypes: { failure: { control: false } },
  args: { failure: FAILURE },
} satisfies Meta<typeof TestFailureDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-2xl">
      <TestFailureDetail {...args} />
    </div>
  ),
};

export const Gomega: Story = {
  args: {
    failure: {
      kind: "gomega",
      summary: "Expected the response to contain a session cookie",
      expected: "Set-Cookie: session=…",
      actual: "<no Set-Cookie header>",
      location: "billing/checkout_test.go:142",
    },
  },
  render: (args) => (
    <div className="max-w-2xl">
      <TestFailureDetail {...args} />
    </div>
  ),
};

const PANIC_STACK = `goroutine 18 [running]:
testing.tRunner.func1.2({0x1, 0x2})
\t/usr/local/go1.22/src/testing/testing.go:1631 +0x24a
billing.TestCharge(0xc000)
\t/app/billing/charge_test.go:44 +0x1a
created by testing.(*T).Run
\t/usr/local/go1.22/src/testing/testing.go:1742 +0x390
`;

/** A panic stack is a Go goroutine dump, shown as a goroutine card instead of a log. */
export const GoPanic: Story = {
  args: {
    failure: {
      kind: "panic",
      summary: "panic: runtime error: invalid memory address or nil pointer dereference",
      location: "billing/charge_test.go:44",
      stack: PANIC_STACK,
    },
  },
  render: (args) => (
    <div className="max-w-2xl">
      <TestFailureDetail {...args} />
    </div>
  ),
};

/** Several goroutines keep the search, state chips and hide-runtime filter. */
export const GoPanicWithManyGoroutines: Story = {
  args: {
    failure: {
      kind: "panic",
      summary: "panic: send on closed channel",
      stack: `${PANIC_STACK}
goroutine 1 [chan receive]:
main.main()
\t/app/main.go:9 +0x20
`,
    },
  },
  render: (args) => (
    <div className="max-w-2xl">
      <TestFailureDetail {...args} />
    </div>
  ),
};
