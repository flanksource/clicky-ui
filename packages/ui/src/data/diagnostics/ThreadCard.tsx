import { JvmStackTrace, type JvmFrameSourceResolver } from "./JvmStackTrace";
import type { ParsedThread } from "./jvm-stacktrace";
import { threadStateBadge, threadStateDot } from "./state-styles";

export type ThreadCardProps = {
  thread: ParsedThread;
  search: string;
  hideRuntimeOnly: boolean;
  resolveSource?: JvmFrameSourceResolver;
};

export function ThreadCard({ thread, search, hideRuntimeOnly, resolveSource }: ThreadCardProps) {
  const frames = hideRuntimeOnly
    ? thread.frames.filter((f) => f.kind !== "frame" || !f.runtime)
    : thread.frames;
  const defaultOpen = thread.state === "runnable" || thread.state === "blocked" || !!search;

  return (
    <details className="border-0 bg-transparent" open={defaultOpen}>
      <summary className="cursor-pointer list-none px-0 py-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-semibold text-foreground">#{thread.id}</span>
          <span className="truncate font-mono text-xs text-foreground">{thread.name}</span>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ${threadStateBadge(
              thread.state,
            )}`}
          >
            <span className={`h-2 w-2 rounded-full ${threadStateDot(thread.state)}`} />
            {thread.rawState || thread.state}
          </span>
          {thread.daemon && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              daemon
            </span>
          )}
          <span className="text-[11px] text-muted-foreground">{frames.length}f</span>
          {thread.userFrameCount > 0 && (
            <span className="text-[11px] text-muted-foreground">{thread.userFrameCount}u</span>
          )}
          {thread.topFunction && (
            <span className="truncate text-[11px] text-muted-foreground">{thread.topFunction}</span>
          )}
        </div>
      </summary>
      <JvmStackTrace
        frames={frames}
        className="space-y-0.5 py-1 pl-3"
        {...(resolveSource ? { resolveSource } : {})}
      />
    </details>
  );
}
