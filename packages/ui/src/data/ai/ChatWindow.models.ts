import type { ChatModel } from "../chat/types";

export function selectConfiguredChatModel(
  current: string | undefined,
  models: ChatModel[]
): string | undefined {
  if (
    current &&
    models.some((model) => model.id === current && model.configured !== false)
  ) {
    return current;
  }
  return models.find((model) => model.configured !== false)?.id;
}
