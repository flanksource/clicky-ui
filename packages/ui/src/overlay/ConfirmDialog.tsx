import { useEffect, useState, type ReactNode } from "react";
import { Button } from "../components/button";
import { Callout } from "../data/Callout";
import { Modal } from "./Modal";
import { canRememberConfirm, rememberConfirm } from "./confirmMemory";

export type ConfirmOptions = {
  /** Heading, and the dialog's accessible label when it is a string. */
  title: ReactNode;
  /** What proceeding does. */
  message?: ReactNode;
  /** The risk, drawn as a warning banner above the message. */
  warning?: ReactNode;
  /** Defaults to "Confirm". */
  confirmLabel?: string;
  /** Defaults to "Cancel". */
  cancelLabel?: string;
  variant?: "default" | "destructive";
  /**
   * Offers "Remember my choice". Only a confirmation is remembered — a
   * remembered cancel would block the action with no prompt left to undo it —
   * and a remembered key makes `useConfirm` resolve without asking. The key is
   * the scope of the answer, so include whatever it must not leak across (an
   * environment, a tenant).
   */
  remember?: { key: string; label?: string };
};

export type ConfirmDialogProps = ConfirmOptions & {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * "Are you sure", with an optional warning banner and remember-my-choice.
 *
 * Escape and the close button cancel. Checking the box and confirming persists
 * the answer to localStorage before `onConfirm` fires. Pair with `useConfirm`
 * for a promise-returning prompt and `useConfirmMemory` for the banner that
 * offers to ask again.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  warning,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  remember,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    if (open) setChecked(false);
  }, [open]);
  const rememberable = remember !== undefined && canRememberConfirm();

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      expandable={false}
      footer={
        <div className="flex justify-end gap-density-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant}
            size="sm"
            onClick={() => {
              if (rememberable && checked) rememberConfirm(remember.key);
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-density-3">
        {warning ? (
          <Callout variant="warning" className="my-0">
            {warning}
          </Callout>
        ) : null}
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        {rememberable ? (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 shrink-0 rounded border-input"
              checked={checked}
              onChange={(event) => setChecked(event.target.checked)}
            />
            {remember.label ?? "Remember my choice"}
          </label>
        ) : null}
      </div>
    </Modal>
  );
}
