import type { ContextMenuAction, ContextMenuActionContext } from "../types.js";
import { executeContextMenuAction } from "../utils/execute-context-menu-action.js";

export function runElementAction({ actionId, actions, context }: {
  actionId: string;
  actions: readonly ContextMenuAction[];
  context: ContextMenuActionContext;
}): boolean {
  const action = actions.find(candidate => candidate.id === actionId);
  return action ? executeContextMenuAction(action, context) : false;
}
