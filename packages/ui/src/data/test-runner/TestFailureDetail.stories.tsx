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
