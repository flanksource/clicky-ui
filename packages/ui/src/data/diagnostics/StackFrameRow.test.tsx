import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StackFrameRow } from "./StackFrameRow";
import { JvmStackTrace } from "./JvmStackTrace";
import { StackTrace } from "./RenderedStackTrace";
import type { ParsedThreadFrame } from "./jvm-stacktrace";

function frame(overrides: Partial<ParsedThreadFrame> = {}): ParsedThreadFrame {
  return {
    functionName: "com.example.App.run",
    displayName: "App.run",
    kind: "frame",
    runtime: false,
    nativeMethod: false,
    class: "com.example.App",
    method: "run",
    line: 42,
    location: "App.java:42",
    ...overrides,
  };
}

// StackFrameRow absorbed the lock/monitor rendering that used to live only in
// JvmStackFrameRow. Without these a thread dump silently regresses to rendering
// its annotation entries as ordinary method rows, dropping annotationText.
describe("StackFrameRow lock/monitor annotations", () => {
  const kinds = ["locked", "waiting_to_lock", "waiting_on", "parking"] as const;

  it.each(kinds)("renders a %s annotation with its text and no source window", (kind) => {
    render(
      <StackFrameRow
        index={0}
        frame={frame({
          kind,
          functionName: "- locked <0x000000076ab00000>",
          annotationText: "(a java.lang.Object)",
          sourceLines: ["should not render"],
          sourceStartLine: 41,
        })}
      />,
    );
    expect(screen.getByText("- locked <0x000000076ab00000>")).toBeInTheDocument();
    expect(screen.getByText("(a java.lang.Object)")).toBeInTheDocument();
    // An annotation is not a call site, so it never gets inline source.
    expect(screen.queryByText("should not render")).not.toBeInTheDocument();
  });

  it("renders an ordinary frame with its class and location", () => {
    render(<StackFrameRow index={0} frame={frame()} />);
    expect(screen.getByText("App.run")).toBeInTheDocument();
    expect(screen.getByText("com.example.App")).toBeInTheDocument();
    expect(screen.getByText("App.java:42")).toBeInTheDocument();
  });
});

describe("frameActions slot", () => {
  it("is invoked once per visible frame, with that frame", () => {
    const actions = vi.fn((f: ParsedThreadFrame) => <button type="button">go {f.method}</button>);
    render(
      <JvmStackTrace
        frames={[frame({ method: "one" }), frame({ method: "two" })]}
        frameActions={actions}
      />,
    );
    expect(actions).toHaveBeenCalledTimes(2);
    expect(screen.getByText("go one")).toBeInTheDocument();
    expect(screen.getByText("go two")).toBeInTheDocument();
  });

  it("is not invoked for frames filtered out of a stack trace", () => {
    const actions = vi.fn(() => <button type="button">act</button>);
    render(
      <StackTrace
        input={{
          causedBy: [],
          language: "java",
          frames: [
            frame({ class: "com.example.App", method: "keep" }),
            frame({ class: "java.util.Optional", method: "drop", runtime: true }),
          ],
        }}
        include={["com.example."]}
        frameActions={actions}
      />,
    );
    expect(actions).toHaveBeenCalledTimes(1);
    expect(screen.getAllByText("act")).toHaveLength(1);
  });

  it("renders no action cell when no slot is supplied", () => {
    render(<JvmStackTrace frames={[frame()]} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
