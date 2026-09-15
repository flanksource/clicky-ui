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

  it("renders application-owned frame parts and details", () => {
    render(
      <StackTrace
        input={{ causedBy: [], language: "java", frames: [frame()] }}
        renderFramePart={(part, value) => <a href={`/${part}`}>{value[part]}</a>}
        renderFrameDetail={() => <div>decompiled source</div>}
      />,
    );
    expect(screen.getByRole("link", { name: "run" })).toHaveAttribute("href", "/method");
    expect(screen.getByRole("link", { name: "com.example.App" })).toHaveAttribute(
      "href",
      "/class",
    );
    expect(screen.getByRole("link", { name: "App.java:42" })).toHaveAttribute(
      "href",
      "/location",
    );
    expect(screen.getByText("decompiled source")).toBeInTheDocument();
  });

  it("keeps actions visible when requested", () => {
    const { container } = render(
      <StackTrace
        input={{ causedBy: [], language: "java", frames: [frame()] }}
        frameActions={() => <button type="button">trace</button>}
        frameActionsVisibility="always"
      />,
    );
    expect(screen.getByRole("button", { name: "trace" }).parentElement).toHaveClass("opacity-100");
    expect(container.querySelector(".group-hover\\:opacity-100")).toBeNull();
  });

  it("filters frames with the application predicate before invoking slots", () => {
    const actions = vi.fn(() => <button type="button">trace</button>);
    render(
      <StackTrace
        input={{
          causedBy: [],
          language: "java",
          frames: [frame({ method: "keep" }), frame({ method: "aspectOf" })],
        }}
        frameFilter={(value) => value.method !== "aspectOf"}
        frameActions={actions}
      />,
    );
    expect(actions).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Showing 1 of 2 frames")).toBeInTheDocument();
  });

  it("renders application-owned detail below the cause it belongs to", () => {
    const causes = ["java.lang.RuntimeException: boom", "RuleElementLocation: 17"];
    render(
      <StackTrace
        input={{
          exceptionClass: "java.lang.RuntimeException",
          causedBy: causes,
          language: "java",
          frames: [],
        }}
        renderCauseDetail={(cause, index) =>
          cause.startsWith("RuleElementLocation") ? <pre>{`#${index} <MathVariable/>`}</pre> : null
        }
      />,
    );
    const detail = screen.getByText("#1 <MathVariable/>");
    const causeRow = screen.getByText(causes[1]!).closest("[data-cause-index]");
    expect(causeRow).toHaveAttribute("data-cause-index", "1");
    expect(causeRow).toContainElement(detail);
    expect(causeRow?.firstElementChild).not.toContainElement(detail);
    expect(screen.getByText(causes[0]!).closest("[data-cause-index]")?.querySelector("pre")).toBeNull();
  });
});
