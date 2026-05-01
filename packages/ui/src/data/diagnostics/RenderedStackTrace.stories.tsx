import type { Meta, StoryObj } from "@storybook/react-vite";
import { StackTrace, type StackTraceSourceResolver } from "./RenderedStackTrace";
import { parseJavaStackTrace, type ParsedStackFrame } from "./stacktrace-parse";

const meta: Meta<typeof StackTrace> = {
  title: "Data/Diagnostics/StackTrace",
  component: StackTrace,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Parses and renders a free-form Java stack trace. Pass `resolver` to attach inline source context (±N lines) under each frame. Pass `include`/`exclude` to filter frames by package prefix; `hideRuntimeOnly` mutes JDK/framework frames.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof StackTrace>;

const sample = `java.lang.NullPointerException: name must not be null
    at com.example.hello.Greeter.greet(Greeter.java:14)
    at com.example.hello.HelloWorld.main(HelloWorld.java:7)
    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628)`;

const fixtureSources: Record<string, { startLine: number; lines: string[] }> = {
  "com.example.hello.Greeter": {
    startLine: 10,
    lines: [
      "public class Greeter {",
      "    private final String prefix;",
      "    public Greeter(String prefix) { this.prefix = prefix; }",
      "",
      "    public String greet(String name) {",
      '        return prefix + ", " + name.toUpperCase() + "!";',
      "    }",
      "}",
    ],
  },
  "com.example.hello.HelloWorld": {
    startLine: 4,
    lines: [
      "public class HelloWorld {",
      "    public static void main(String[] args) {",
      '        Greeter g = new Greeter("Hello");',
      "        System.out.println(g.greet(null));",
      "    }",
      "}",
    ],
  },
};

const fixtureResolver: StackTraceSourceResolver = (frame: ParsedStackFrame) => {
  if (!frame.class) return undefined;
  const fx = fixtureSources[frame.class];
  if (!fx) return undefined;
  return { lines: fx.lines, startLine: fx.startLine, language: "java" };
};

export const Default: Story = {
  args: { input: sample },
};

export const WithSourceResolver: Story = {
  args: {
    input: sample,
    resolver: fixtureResolver,
    contextLines: 3,
  },
};

export const HideRuntimeOnly: Story = {
  args: {
    input: sample,
    hideRuntimeOnly: true,
    resolver: fixtureResolver,
  },
};

export const IncludeFilter: Story = {
  args: {
    input: sample,
    include: ["com.example.hello."],
    resolver: fixtureResolver,
  },
};

export const ExcludeFilter: Story = {
  args: {
    input: sample,
    exclude: ["java.", "sun.", "com.sun."],
    resolver: fixtureResolver,
  },
};

export const PreParsedInput: Story = {
  args: {
    input: parseJavaStackTrace(sample),
  },
};

export const NotAStackTrace: Story = {
  args: {
    input: "POST /api/v1/things → 200 in 42ms",
  },
};
