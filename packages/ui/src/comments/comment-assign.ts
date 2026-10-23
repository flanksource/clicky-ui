import type { DropdownMenuItem } from "../overlay/DropdownMenu";
import { UiRobotAi, UiUser, UiUserCheck, UiUserMinus, UiUserPlus } from "../icons";
import { resolveCommentStage } from "../lib/comment-stage";
import type { Comment, CommentAuthor, CommentConfig } from "./comment-types";

/** Runs a card action and reports a failure against `verb` instead of swallowing it. */
export type CommentActionRunner = (
  verb: string,
  action: () => void | Promise<void>,
) => void;

export type CommentAssignmentOptions = {
  comment: Comment;
  config: CommentConfig;
  /** Claim the root for the current user or agent; omit to hide Acknowledge. */
  onAcknowledge?: () => void | Promise<void>;
  /** Hand the root to `assignee`, or clear it with `null`; omit to hide the people list. */
  onAssign?: (assignee: CommentAuthor | null) => void | Promise<void>;
  /**
   * Caller-owned entries appended to the Assign menu (for example "Run agent"),
   * computed per comment so they can reflect its state.
   */
  extraAssignItems?: (comment: Comment) => DropdownMenuItem[];
  run: CommentActionRunner;
};

function isSameAssignee(left: CommentAuthor, right: CommentAuthor): boolean {
  return left.name === right.name && (left.kind ?? "user") === (right.kind ?? "user");
}

/**
 * The targets of an assignment: each configured person or agent, "Unassign"
 * while someone holds the root, then the caller's extra items. The dashboard
 * mounts these directly under its own trigger; cards nest them under "Assign…".
 */
export function assignTargetItems(
  options: CommentAssignmentOptions,
): DropdownMenuItem[] {
  const { comment, config, onAssign, extraAssignItems, run } = options;
  const items: DropdownMenuItem[] = [];
  if (onAssign) {
    for (const { id, name, kind } of config.assignees ?? []) {
      const target: CommentAuthor = { id, name, kind };
      const current =
        comment.assignee !== undefined &&
        isSameAssignee(comment.assignee, target);
      items.push({
        label: name,
        icon: kind === "agent" ? UiRobotAi : UiUser,
        disabled: current,
        title: current ? `Already assigned to ${name}` : `Assign to ${name}`,
        onSelect: () => run("assign", () => onAssign(target)),
      });
    }
    if (comment.assignee) {
      items.push({
        label: "Unassign",
        icon: UiUserMinus,
        onSelect: () => run("assign", () => onAssign(null)),
      });
    }
  }
  items.push(...(extraAssignItems?.(comment) ?? []));
  return items;
}

/**
 * The root-only entries of a card's actions menu: Acknowledge while nobody
 * holds an active root, and an "Assign…" submenu of its targets. Empty for
 * resolved or closed roots, which are no longer being worked on.
 */
export function assignmentMenuItems(
  options: CommentAssignmentOptions,
): DropdownMenuItem[] {
  const { comment, config, onAcknowledge, run } = options;
  if (comment.parentId) return [];
  if (resolveCommentStage(config, comment.status) !== "active") return [];
  const items: DropdownMenuItem[] = [];
  if (onAcknowledge && !comment.assignee) {
    items.push({
      label: "Acknowledge",
      icon: UiUserCheck,
      onSelect: () => run("acknowledge", onAcknowledge),
    });
  }
  const targets = assignTargetItems(options);
  if (targets.length > 0) {
    items.push({
      label: "Assign…",
      icon: UiUserPlus,
      // Opening the submenu is the whole action; the parent never fires it.
      onSelect: () => {},
      children: targets,
    });
  }
  return items;
}
