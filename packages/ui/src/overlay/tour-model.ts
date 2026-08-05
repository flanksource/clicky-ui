import type { TourDefinition, TourLabels, TourStep, TourTarget } from "./tour-types";

/**
 * Pure sequencing for a tour: validation, step arithmetic, and default copy. No
 * DOM and no React, so the whole traversal is testable without rendering — the
 * counter and skip rules are where the subtle bugs live.
 */

export const DEFAULT_TOUR_LABELS: TourLabels = {
  back: "Back",
  next: "Next",
  done: "Done",
  skip: "Skip tour",
  close: "Close tour",
  counter: (current, total) => `${current} of ${total}`,
  announce: (current, total, title) => `Step ${current} of ${total}: ${title}`,
};

/**
 * Rejects a definition that cannot run, at registration rather than mid-render in
 * front of a user. Duplicate ids are fatal because `goTo` and the persistence key
 * both address steps by id.
 */
export function validateTourDefinition(definition: TourDefinition): void {
  const where = `tour "${definition.id}"`;
  if (!definition.id) throw new Error("Tour definition is missing an id");
  if (definition.steps.length === 0) throw new Error(`${where} has no steps`);
  if (definition.version !== undefined && definition.version < 1) {
    throw new Error(`${where} has version ${definition.version}; versions start at 1`);
  }

  const seen = new Set<string>();
  for (const step of definition.steps) {
    if (!step.id) throw new Error(`${where} has a step with no id`);
    if (seen.has(step.id)) throw new Error(`${where} has duplicate step id "${step.id}"`);
    seen.add(step.id);
    if (step.body !== undefined && step.markdown !== undefined) {
      throw new Error(`${where} step "${step.id}" sets both body and markdown; pick one`);
    }
  }
}

function isEnabled(step: TourStep): boolean {
  return step.enabled ? step.enabled() : true;
}

/** Steps whose `enabled()` passes — the denominator for "2 of 6". */
export function activeSteps(steps: TourStep[]): TourStep[] {
  return steps.filter(isEnabled);
}

/**
 * Index of the first enabled step at or after `from` when moving forward, or at
 * or before it when moving back. `null` means the tour has run off that end.
 */
export function seekEnabledIndex(
  steps: TourStep[],
  from: number,
  direction: "next" | "back",
): number | null {
  const delta = direction === "next" ? 1 : -1;
  for (let index = from; index >= 0 && index < steps.length; index += delta) {
    const step = steps[index];
    if (step && isEnabled(step)) return index;
  }
  return null;
}

/** Next/previous enabled index, skipping the step at `from`. `null` past either end. */
export function nextStepIndex(
  steps: TourStep[],
  from: number,
  direction: "next" | "back",
): number | null {
  return seekEnabledIndex(steps, direction === "next" ? from + 1 : from - 1, direction);
}

/** Resolve a step id or raw index to a raw index, throwing on an unknown id. */
export function resolveStepIndex(steps: TourStep[], at: string | number): number {
  if (typeof at === "number") {
    if (at < 0 || at >= steps.length) {
      throw new Error(`Tour step index ${at} is out of range (0..${steps.length - 1})`);
    }
    return at;
  }
  const index = steps.findIndex((step) => step.id === at);
  if (index === -1) throw new Error(`Unknown tour step id "${at}"`);
  return index;
}

/** 1-based position of a raw index among the enabled steps, for the counter. */
export function displayPosition(steps: TourStep[], index: number): number {
  let position = 0;
  for (let cursor = 0; cursor <= index && cursor < steps.length; cursor += 1) {
    const step = steps[cursor];
    if (step && isEnabled(step)) position += 1;
  }
  return Math.max(position, 1);
}

/** Human-readable target, for warnings and `TourStepErrorInfo.target`. */
export function describeTarget(target: TourTarget | undefined): string {
  if (target === undefined) return "(none)";
  if (typeof target === "string") return target;
  if (typeof target === "function") return "(resolver)";
  return `<${target.tagName.toLowerCase()}>`;
}
