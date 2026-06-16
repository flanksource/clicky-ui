import type { Meta, StoryObj } from "@storybook/react-vite";
import { JvmStackTrace } from "./JvmStackTrace";
import type { ParsedThreadFrame } from "./jvm-stacktrace";

function frame(partial: Partial<ParsedThreadFrame> & { functionName: string }): ParsedThreadFrame {
  return {
    displayName: partial.functionName,
    kind: "frame",
    runtime: false,
    nativeMethod: false,
    ...partial,
  };
}

const FRAMES: ParsedThreadFrame[] = [
  frame({ functionName: "com.acme.payments.ChargeService.charge", displayName: "ChargeService.charge", file: "ChargeService.java", line: 142 }),
  frame({ functionName: "com.acme.payments.ChargeController.post", displayName: "ChargeController.post", file: "ChargeController.java", line: 58 }),
  { functionName: "- locked <0x000000076ab>", displayName: "", kind: "locked", runtime: false, nativeMethod: false, annotationText: "(a com.acme.Ledger)" },
  frame({ functionName: "sun.nio.ch.SocketDispatcher.read0", displayName: "SocketDispatcher.read0", nativeMethod: true }),
  frame({ functionName: "org.springframework.web.servlet.DispatcherServlet.doDispatch", displayName: "DispatcherServlet.doDispatch", file: "DispatcherServlet.java", line: 1067, runtime: true }),
  frame({ functionName: "java.lang.Thread.run", displayName: "Thread.run", file: "Thread.java", line: 840, runtime: true }),
];

const meta = {
  title: "Data/Diagnostics/JvmStackTrace",
  component: JvmStackTrace,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Renders parsed JVM thread-dump frames (`ParsedThreadFrame[]` from `parseJvmThreadDump`) with per-frame icons for native/runtime/application methods and lock annotations (locked / waiting). `hideRuntimeOnly` collapses framework/JDK noise; `resolveSource` can inline decompiled source under each frame.",
      },
    },
  },
  argTypes: {
    hideRuntimeOnly: { control: "boolean" },
    frames: { control: false },
    resolveSource: { control: false },
  },
  args: { frames: FRAMES, hideRuntimeOnly: false },
} satisfies Meta<typeof JvmStackTrace>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="max-w-2xl rounded-md border border-border p-3">
      <JvmStackTrace {...args} />
    </div>
  ),
};

export const HideRuntime: Story = {
  args: { hideRuntimeOnly: true },
  render: (args) => (
    <div className="max-w-2xl rounded-md border border-border p-3">
      <JvmStackTrace {...args} />
    </div>
  ),
};
