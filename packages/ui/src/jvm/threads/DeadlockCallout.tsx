import { Button } from "../../components/button";
import { Callout } from "../../data/Callout";
import type { JvmThread } from "../protocol/types";

export type DeadlockCalloutProps = {
  /** Ids of the threads in the deadlock. */
  deadlocked: number[];
  /** The snapshot's threads, to name the deadlocked ones. */
  threads: JvmThread[];
  onSelect: (id: number) => void;
};

/** Names every deadlocked thread as a button that selects it. Renders nothing without a deadlock. */
export function DeadlockCallout({ deadlocked, threads, onSelect }: DeadlockCalloutProps) {
  if (deadlocked.length === 0) return null;
  const names = new Map(threads.map((thread) => [thread.id, thread.name]));
  return (
    <div role="alert">
      <Callout variant="caution" label="Deadlock" emphasis className="my-0">
        <span className="flex flex-wrap items-center gap-2">
          <span>{deadlocked.length} threads are each waiting on a lock another one holds.</span>
          {deadlocked.map((id) => (
            <Button key={id} type="button" size="xs" variant="outline" title={`Thread ${id}`} className="font-mono" onClick={() => onSelect(id)}>
              {names.get(id) ?? `#${id} (not in this snapshot)`}
            </Button>
          ))}
        </span>
      </Callout>
    </div>
  );
}
