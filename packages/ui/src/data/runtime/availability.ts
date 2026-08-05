import type { ChatModel, RuntimeAvailability } from "../chat/types";

export function availabilityText(
  availability: RuntimeAvailability | undefined
): string | undefined {
  if (!availability || availability.state === "available") return undefined;
  return [availability.reason, availability.remediation]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
}

export function isUnavailable(
  availability: RuntimeAvailability | undefined
): boolean {
  return Boolean(availability && availability.state !== "available");
}

export function isSelectableModel(model: ChatModel): boolean {
  return model.configured !== false && !isUnavailable(model.availability);
}

export function unsupportedAvailability(
  familyLabel: string,
  modeLabel: string,
  supportedLabels: string[]
): RuntimeAvailability {
  return {
    state: "unsupported",
    reason: `${familyLabel} does not provide ${modeLabel} mode.`,
    remediation: `Choose ${formatChoices(supportedLabels)}.`,
  };
}

function formatChoices(choices: string[]): string {
  if (choices.length === 0) return "a supported mode";
  if (choices.length === 1) return choices[0]!;
  return `${choices.slice(0, -1).join(", ")} or ${choices.at(-1)}`;
}
