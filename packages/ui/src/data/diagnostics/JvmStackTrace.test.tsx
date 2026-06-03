import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { JvmStackTrace } from "./JvmStackTrace";
import type { ParsedThreadFrame } from "./jvm-stacktrace";

function frame(overrides: Partial<ParsedThreadFrame>): ParsedThreadFrame {
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

describe("JvmStackTrace resolveSource", () => {
  it("renders inline source under a frame when the resolver returns a window", () => {
    const frames = [frame({})];
    render(
      <JvmStackTrace
        frames={frames}
        resolveSource={(f) =>
          f.class === "com.example.App" && f.line === 42
            ? { sourceLines: ["before", "boom", "after"], sourceLineNumbers: [41, 42, 43] }
            : undefined
        }
      />,
    );
    expect(screen.getByText("boom")).toBeInTheDocument();
    expect(screen.getByText("before")).toBeInTheDocument();
    expect(screen.getByText("after")).toBeInTheDocument();
    // The focal line (42) is marked with a ">" gutter prefix.
    expect(screen.getByText(/^>42$/)).toBeInTheDocument();
  });

  it("leaves frames untouched when the resolver returns undefined", () => {
    render(<JvmStackTrace frames={[frame({})]} resolveSource={() => undefined} />);
    expect(screen.queryByText("boom")).not.toBeInTheDocument();
    // Frame header still rendered.
    expect(screen.getByText("App.run")).toBeInTheDocument();
  });

  it("renders no source window without a resolver", () => {
    render(<JvmStackTrace frames={[frame({})]} />);
    expect(screen.getByText("App.run")).toBeInTheDocument();
    expect(screen.queryByText("boom")).not.toBeInTheDocument();
  });
});
