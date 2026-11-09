import type { TaskSessionRef } from "./TaskSnapshot";

const CHIP_CLASS =
  "inline-flex max-w-full items-center truncate rounded-full border border-border px-1.5 py-0 text-[10px] text-muted-foreground";

/** `type · id`, linked to the session when it has an href. */
export function TaskSessionChip({ session }: { session: TaskSessionRef }) {
  const label = `${session.type} · ${session.id}`;
  return session.href ? (
    <a
      href={session.href}
      title={label}
      className={`${CHIP_CLASS} hover:text-foreground hover:underline`}
      onClick={(event) => event.stopPropagation()}
    >
      {label}
    </a>
  ) : (
    <span title={label} className={CHIP_CLASS}>
      {label}
    </span>
  );
}
