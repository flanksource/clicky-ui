import { describe, expect, it } from "vitest";
import {
  activeSteps,
  describeTarget,
  displayPosition,
  nextStepIndex,
  resolveStepIndex,
  validateTourDefinition,
} from "./tour-model";
import type { TourDefinition, TourStep } from "./tour-types";

function step(id: string, extra: Partial<TourStep> = {}): TourStep {
  return { id, title: id, ...extra };
}

function tour(steps: TourStep[], extra: Partial<TourDefinition> = {}): TourDefinition {
  return { id: "demo", steps, ...extra };
}

describe("validateTourDefinition", () => {
  it("accepts a well-formed definition", () => {
    expect(() => validateTourDefinition(tour([step("a"), step("b")]))).not.toThrow();
  });

  it("rejects a tour with no steps", () => {
    expect(() => validateTourDefinition(tour([]))).toThrow(/has no steps/);
  });

  it("rejects duplicate step ids, which goTo and persistence both address by", () => {
    expect(() => validateTourDefinition(tour([step("a"), step("a")]))).toThrow(
      /duplicate step id "a"/,
    );
  });

  it("rejects a step that sets both body and markdown", () => {
    const both = step("a", { body: "node", markdown: "# md" });
    expect(() => validateTourDefinition(tour([both]))).toThrow(/both body and markdown/);
  });

  it("rejects a version below 1, which would make every completion stale", () => {
    expect(() => validateTourDefinition(tour([step("a")], { version: 0 }))).toThrow(
      /versions start at 1/,
    );
  });
});

describe("step traversal", () => {
  const disabled = () => false;

  it("moves to the adjacent step in each direction", () => {
    const steps = [step("a"), step("b"), step("c")];

    expect(nextStepIndex(steps, 0, "next")).toBe(1);
    expect(nextStepIndex(steps, 2, "back")).toBe(1);
  });

  it("skips over disabled steps in both directions", () => {
    const steps = [step("a"), step("b", { enabled: disabled }), step("c")];

    expect(nextStepIndex(steps, 0, "next")).toBe(2);
    expect(nextStepIndex(steps, 2, "back")).toBe(0);
  });

  it("returns null past either end", () => {
    const steps = [step("a"), step("b")];

    expect(nextStepIndex(steps, 1, "next")).toBeNull();
    expect(nextStepIndex(steps, 0, "back")).toBeNull();
  });

  it("counts only enabled steps, so the counter denominator matches what is shown", () => {
    const steps = [step("a"), step("b", { enabled: disabled }), step("c")];

    expect(activeSteps(steps)).toHaveLength(2);
    expect(displayPosition(steps, 2)).toBe(2);
  });
});

describe("resolveStepIndex", () => {
  const steps = [step("intro"), step("detail")];

  it("finds a step by id", () => {
    expect(resolveStepIndex(steps, "detail")).toBe(1);
  });

  it("passes a valid raw index through", () => {
    expect(resolveStepIndex(steps, 0)).toBe(0);
  });

  it("throws on an unknown id rather than starting somewhere arbitrary", () => {
    expect(() => resolveStepIndex(steps, "nope")).toThrow(/Unknown tour step id "nope"/);
  });

  it("throws on an out-of-range index", () => {
    expect(() => resolveStepIndex(steps, 5)).toThrow(/out of range/);
  });
});

describe("describeTarget", () => {
  it("labels every target form for warnings", () => {
    expect(describeTarget('[data-tour="x"]')).toBe('[data-tour="x"]');
    expect(describeTarget(() => null)).toBe("(resolver)");
    expect(describeTarget(document.createElement("button"))).toBe("<button>");
    expect(describeTarget(undefined)).toBe("(none)");
  });
});
