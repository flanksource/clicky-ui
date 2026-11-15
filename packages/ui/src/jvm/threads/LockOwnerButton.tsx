import { Button } from "../../components/button";
import type { JvmThread } from "../protocol/types";

export type LockOwnerButtonProps = {
  thread: JvmThread;
  onSelect: (id: number) => void;
};

/** The thread that holds the lock `thread` waits on; selecting it jumps to the owner. */
export function LockOwnerButton({ thread, onSelect }: LockOwnerButtonProps) {
  const ownerId = thread.lockOwnerId;
  if (ownerId === null) throw new Error(`thread ${thread.id} has no lock owner to jump to`);
  return (
    <Button
      type="button"
      variant="link"
      data-lock-owner={ownerId}
      title={`Select thread ${ownerId}, which holds this lock`}
      className="h-auto min-h-0 p-0 align-baseline text-[11px]"
      onClick={(event) => {
        // A tree row selects itself on click; the owner, not the waiter, is the target.
        event.stopPropagation();
        onSelect(ownerId);
      }}
    >
      {thread.lockOwnerName ?? `#${ownerId}`}
    </Button>
  );
}
