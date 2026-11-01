import type { DropdownMenuItem } from "../../overlay/DropdownMenu";
import { UiEyeClosed } from "../../icons";
import type { LintAction } from "./types";

export type IgnoreHandler = (action: LintAction) => void | Promise<void>;

export function isIgnoreActionDisabled(action: LintAction, busy: boolean): boolean {
  return busy || (Boolean(action.disabledWithoutWorkDir) && !action.req.work_dir);
}

export function ignoreMenuItems(actions: readonly LintAction[], onIgnore: IgnoreHandler, busy: boolean): DropdownMenuItem[] {
  return actions.map((action) => ({
    label: action.label,
    icon: UiEyeClosed,
    title: action.title,
    disabled: isIgnoreActionDisabled(action, busy),
    onSelect: () => void onIgnore(action),
  }));
}
