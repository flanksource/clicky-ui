import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../components/button";
import { SegmentedControl } from "../../components/SegmentedControl";
import { UiPause, UiPlay, UiSkipForward } from "../../icons";
import { cn } from "../../lib/utils";
import { AnsiHtml } from "../AnsiHtml";
import { Badge } from "../Badge";
import { Icon } from "../Icon";
import { parseCast } from "./cast";
import { screenToAnsi } from "./terminal-screen";
import {
  buildTimeline,
  replayTo,
  stepCountAt,
  type ScreenReplay,
  type TerminalTimeline,
} from "./terminal-timeline";
import type { TerminalEvent } from "./types";

const TICK_MS = 50;
const SPEEDS = ["1", "2", "4"] as const;
type Speed = (typeof SPEEDS)[number];
type View = "replay" | "settled";

const SPEED_OPTIONS = SPEEDS.map((speed) => ({ id: speed, label: `${speed}x` }));
const VIEW_OPTIONS: { id: View; label: string }[] = [
  { id: "replay", label: "Replay" },
  { id: "settled", label: "Settled screen" },
];

export type TerminalCastPlayerProps = {
  /** `terminal` trace records. Give this or `castText`. */
  events?: TerminalEvent[];
  /** An asciinema v2 cast, such as a downloaded `.cast`. Give this or `events`. */
  castText?: string;
  /** Start playing on mount. */
  autoPlay?: boolean;
  /** Shown when the session recorded no events. */
  emptyLabel?: string;
  /** Classes applied to the player root. */
  className?: string;
};

function resolveEvents(events: TerminalEvent[] | undefined, castText: string | undefined): TerminalEvent[] {
  if ((events === undefined) === (castText === undefined)) {
    throw new Error("TerminalCastPlayer takes either events or castText, not both or neither");
  }
  return events ?? parseCast(castText!);
}

function seconds(value: number): string {
  return `${value.toFixed(1)}s`;
}

function ExitBadge({ exit }: { exit: TerminalEvent }) {
  if (exit.exitCode === undefined) return <Badge variant="outline" tone="neutral" size="sm">exited</Badge>;
  return (
    <Badge variant="soft" tone={exit.exitCode === 0 ? "success" : "danger"} size="sm" className="font-mono">
      {`exit ${exit.exitCode}`}
    </Badge>
  );
}

/** Feeds the timeline to a screen as the position moves, reusing the screen while moving forward. */
function useReplayScreen(timeline: TerminalTimeline, position: number) {
  const cache = useRef<{ timeline: TerminalTimeline; replay: ScreenReplay } | undefined>(undefined);
  const count = stepCountAt(timeline.steps, position);
  return useMemo(() => {
    const previous = cache.current?.timeline === timeline ? cache.current.replay : undefined;
    const replay = replayTo(previous, timeline, count);
    cache.current = { timeline, replay };
    return { ansi: screenToAnsi(replay.screen), cols: replay.screen.width, rows: replay.screen.height };
  }, [timeline, count]);
}

/**
 * Replays a `terminal` trace: output events over time with play/pause, a
 * scrubber, 1x/2x/4x speed and jump-to-end, honouring resizes. A downloaded
 * asciinema cast renders the same way through `castText`. When the capture
 * settled a screen, it is offered as the "Settled screen" view.
 */
export function TerminalCastPlayer({
  events,
  castText,
  autoPlay = false,
  emptyLabel = "No terminal output recorded",
  className,
}: TerminalCastPlayerProps) {
  const timeline = useMemo(() => buildTimeline(resolveEvents(events, castText)), [events, castText]);
  const [position, setPosition] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState<Speed>("1");
  const [view, setView] = useState<View>("replay");
  const replay = useReplayScreen(timeline, position);

  useEffect(() => {
    if (!playing) return;
    let last = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - last) / 1000;
      last = now;
      setPosition((current) => Math.min(timeline.duration, current + elapsed * Number(speed)));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [playing, speed, timeline.duration]);

  useEffect(() => {
    if (playing && position >= timeline.duration) setPlaying(false);
  }, [playing, position, timeline.duration]);

  if (timeline.steps.length === 0 && timeline.settled === undefined) {
    return <div className="p-density-6 text-center text-muted-foreground text-sm">{emptyLabel}</div>;
  }

  const hasSettled = timeline.settled !== undefined;
  const showSettled = view === "settled" && hasSettled;
  const play = () => {
    if (position >= timeline.duration) setPosition(0);
    setPlaying(true);
  };

  return (
    <div className={cn("flex min-h-0 flex-col gap-density-2", className)}>
      <div className="flex flex-wrap items-center gap-density-2 text-xs text-muted-foreground">
        {timeline.exit?.command ? <code className="font-mono text-foreground">{timeline.exit.command}</code> : null}
        {timeline.exit ? <ExitBadge exit={timeline.exit} /> : null}
        {timeline.exit?.truncated ? (
          <span title="Size caps or a full buffer stopped some output events being recorded">
            <Badge variant="soft" tone="warning" size="sm">output truncated</Badge>
          </span>
        ) : null}
        <span className="tabular-nums">{`${timeline.width}x${timeline.height}`}</span>
        <span className="flex-1" />
        {hasSettled && timeline.steps.length > 0 ? (
          <SegmentedControl size="sm" aria-label="Screen view" value={view} options={VIEW_OPTIONS} onChange={setView} />
        ) : null}
      </div>

      <div
        role="region"
        aria-label="Terminal screen"
        data-cols={showSettled ? undefined : replay.cols}
        className="overflow-auto rounded border bg-black p-density-2"
      >
        <AnsiHtml
          text={showSettled ? timeline.settled! : replay.ansi}
          className="font-mono text-xs leading-5 whitespace-pre text-gray-100"
        />
      </div>

      {timeline.steps.length > 0 && !showSettled ? (
        <div className="flex items-center gap-density-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={playing ? "Pause" : "Play"}
            onClick={playing ? () => setPlaying(false) : play}
          >
            <Icon icon={playing ? UiPause : UiPlay} />
          </Button>
          <input
            type="range"
            aria-label="Seek"
            className="min-w-0 flex-1 accent-primary"
            min={0}
            max={timeline.duration}
            step="any"
            value={position}
            onChange={(event) => setPosition(Number(event.target.value))}
          />
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {`${seconds(position)} / ${seconds(timeline.duration)}`}
          </span>
          <SegmentedControl
            size="sm"
            aria-label="Playback speed"
            value={speed}
            options={SPEED_OPTIONS}
            onChange={setSpeed}
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Jump to end"
            onClick={() => {
              setPlaying(false);
              setPosition(timeline.duration);
            }}
          >
            <Icon icon={UiSkipForward} />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
