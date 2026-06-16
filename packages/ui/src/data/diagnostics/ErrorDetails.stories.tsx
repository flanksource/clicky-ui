import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorDetails } from "./ErrorDetails";
import type { ErrorDiagnostics } from "./error-diagnostics";

const STACK = [
  "com.acme.payments.ChargeService.charge(ChargeService.java:142)",
  "com.acme.payments.ChargeController.post(ChargeController.java:58)",
  "org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1067)",
  "java.base/java.lang.Thread.run(Thread.java:840)",
].join("\n  at ");

const DIAGNOSTICS: ErrorDiagnostics = {
  message: "charge declined: insufficient funds",
  trace: "a1b2c3d4e5f6",
  time: "2026-06-02T09:30:00Z",
  context: [
    ["customer", "cust_8842"],
    ["amount", "4200"],
    ["currency", "USD"],
    ["request", '{"id":"req_991","retries":2}'],
  ],
  stacktrace: `com.acme.payments.PaymentException: charge declined\n  at ${STACK}`,
};

const meta = {
  title: "Data/Diagnostics/ErrorDetails",
  component: ErrorDetails,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Collapsible error panel for normalized `ErrorDiagnostics` (use `normalizeErrorDiagnostics` to build it from ad-hoc payloads): message summary, copyable trace/time, scalar + JSON context badges, and a parsed stack trace that highlights application frames. `renderJsonContext` lets a host swap in a richer JSON view.",
      },
    },
  },
  argTypes: { diagnostics: { control: false }, renderJsonContext: { control: false } },
  args: { diagnostics: DIAGNOSTICS },
} satisfies Meta<typeof ErrorDetails>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-2xl">
      <ErrorDetails {...args} />
    </div>
  ),
};

export const MessageOnly: Story = {
  args: { diagnostics: { message: "connection reset by peer", context: [] } },
  render: (args) => (
    <div className="max-w-2xl">
      <ErrorDetails {...args} />
    </div>
  ),
};
