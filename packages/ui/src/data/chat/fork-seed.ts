import type { UIMessage } from "ai";

export const FORK_SEED_PART_TYPE = "data-fork-seed";

export function isForkSeedMessage(message: Pick<UIMessage, "parts">): boolean {
  return message.parts.some((part) => part.type === FORK_SEED_PART_TYPE);
}

export function forkSeedProvenance(message: Pick<UIMessage, "parts">): {
  forkedFrom?: string;
  title?: string;
} {
  const marker = message.parts.find(
    (part) => part.type === FORK_SEED_PART_TYPE,
  ) as { data?: unknown } | undefined;
  if (!marker || typeof marker.data !== "object" || marker.data === null)
    return {};
  const data = marker.data as Record<string, unknown>;
  return {
    ...(typeof data.forkedFrom === "string"
      ? { forkedFrom: data.forkedFrom }
      : {}),
    ...(typeof data.title === "string" ? { title: data.title } : {}),
  };
}
