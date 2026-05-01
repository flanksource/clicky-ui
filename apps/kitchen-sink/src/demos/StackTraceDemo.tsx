import { useMemo, useState } from "react";
import {
  StackTrace,
  parseJavaStackTrace,
  type ParsedStackFrame,
  type StackTraceSourceResolver,
} from "@flanksource/clicky-ui";
import { DemoSection, DemoRow } from "./Section";

const javaSample = `java.lang.NullPointerException: name must not be null
    at com.example.hello.Greeter.greet(Greeter.java:14)
    at com.example.hello.HelloWorld.main(HelloWorld.java:7)
    at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    at java.util.concurrent.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:628)`;

const sourceFixtures: Record<string, { startLine: number; lines: string[] }> = {
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
  const fx = sourceFixtures[frame.class];
  if (!fx) return undefined;
  return { lines: fx.lines, startLine: fx.startLine, language: "java" };
};

export function StackTraceDemo() {
  const [hideRuntime, setHideRuntime] = useState(true);
  const [withSources, setWithSources] = useState(true);
  const [filterApp, setFilterApp] = useState(false);

  const parsed = useMemo(() => parseJavaStackTrace(javaSample), []);

  return (
    <div className="space-y-density-4">
      <DemoSection
        id="stacktrace-controls"
        title="Controls"
        description="Toggle runtime-frame muting, source resolution, and the app-only include filter."
      >
        <DemoRow label="Toggles">
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={hideRuntime}
              onChange={(e) => setHideRuntime(e.target.checked)}
            />
            hideRuntimeOnly
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={withSources}
              onChange={(e) => setWithSources(e.target.checked)}
            />
            attach SourceResolver
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={filterApp}
              onChange={(e) => setFilterApp(e.target.checked)}
            />
            include="com.example.hello."
          </label>
        </DemoRow>
      </DemoSection>

      <DemoSection
        id="stacktrace-raw"
        title="Raw exception string"
        description="Pass a free-form Java stack-trace string and StackTrace parses + renders it."
      >
        <StackTrace
          input={javaSample}
          hideRuntimeOnly={hideRuntime}
          {...(withSources ? { resolver: fixtureResolver } : {})}
          {...(filterApp ? { include: ["com.example.hello."] } : {})}
          contextLines={3}
          className="space-y-density-2"
        />
      </DemoSection>

      <DemoSection
        id="stacktrace-prefiltered"
        title="Excluded JDK + framework"
        description="exclude prop drops java.* / sun.* / com.sun.* frames before render."
      >
        <StackTrace
          input={javaSample}
          exclude={["java.", "sun.", "com.sun."]}
          resolver={fixtureResolver}
          className="space-y-density-2"
        />
      </DemoSection>

      <DemoSection
        id="stacktrace-preparsed"
        title="Pre-parsed input"
        description="When a Go backend has already parsed the trace via clicky.StackTrace, hand the ParsedStackTrace straight to <StackTrace input={…}>."
      >
        <StackTrace input={parsed} className="space-y-density-2" />
      </DemoSection>

      <DemoSection
        id="stacktrace-empty"
        title="Empty input"
        description="No frames or exception headers → component renders nothing (no chrome, no fallback)."
      >
        <div className="text-xs text-muted-foreground">(renders nothing below this line)</div>
        <StackTrace input="just a log line, not an exception" />
      </DemoSection>
    </div>
  );
}
