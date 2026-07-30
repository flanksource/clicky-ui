import type { ChatModel } from "./types";

/**
 * The id a picker seeds with when the caller names no model: the row the served
 * catalog declared as its default, else the first row that is configured.
 *
 * Deriving it from the menu is what keeps an app from hardcoding a model id that
 * rots on the next release — or that names a model the catalog no longer offers
 * because the user switched it off.
 */
export function defaultChatModelId(models: ChatModel[]): string | undefined {
  return (
    models.find((model) => model.default && model.configured !== false)?.id ??
    models.find((model) => model.configured !== false)?.id
  );
}
