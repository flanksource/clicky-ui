import { useMemo } from "react";
import { cn } from "../../lib/utils";
import {
  createTurnPalette,
  shortSessionId,
  type TurnPalette,
} from "./SessionInspector.model";
import {
  SessionViewer,
  type SessionEvent,
  type SessionViewerProps,
} from "./SessionViewer";
import type { SessionTurn, UnifiedSessionInput } from "./SessionViewer.unified";

type TurnBadge = {
  id: string;
  label: string;
  color: TurnPalette;
  className: string;
};

const TURN_COLOR_CLASS: Record<TurnPalette, string> = {
  sky: "border-sky-300 bg-sky-100 text-sky-800 [[data-theme=dark]_&]:border-sky-700 [[data-theme=dark]_&]:bg-sky-950/60 [[data-theme=dark]_&]:text-sky-300",
  violet:
    "border-violet-300 bg-violet-100 text-violet-800 [[data-theme=dark]_&]:border-violet-700 [[data-theme=dark]_&]:bg-violet-950/60 [[data-theme=dark]_&]:text-violet-300",
  emerald:
    "border-emerald-300 bg-emerald-100 text-emerald-800 [[data-theme=dark]_&]:border-emerald-700 [[data-theme=dark]_&]:bg-emerald-950/60 [[data-theme=dark]_&]:text-emerald-300",
  orange:
    "border-orange-300 bg-orange-100 text-orange-800 [[data-theme=dark]_&]:border-orange-700 [[data-theme=dark]_&]:bg-orange-950/60 [[data-theme=dark]_&]:text-orange-300",
  rose: "border-rose-300 bg-rose-100 text-rose-800 [[data-theme=dark]_&]:border-rose-700 [[data-theme=dark]_&]:bg-rose-950/60 [[data-theme=dark]_&]:text-rose-300",
  indigo:
    "border-indigo-300 bg-indigo-100 text-indigo-800 [[data-theme=dark]_&]:border-indigo-700 [[data-theme=dark]_&]:bg-indigo-950/60 [[data-theme=dark]_&]:text-indigo-300",
  teal: "border-teal-300 bg-teal-100 text-teal-800 [[data-theme=dark]_&]:border-teal-700 [[data-theme=dark]_&]:bg-teal-950/60 [[data-theme=dark]_&]:text-teal-300",
  fuchsia:
    "border-fuchsia-300 bg-fuchsia-100 text-fuchsia-800 [[data-theme=dark]_&]:border-fuchsia-700 [[data-theme=dark]_&]:bg-fuchsia-950/60 [[data-theme=dark]_&]:text-fuchsia-300",
};

export function SessionTranscript({
  session,
  viewerProps,
}: {
  session: UnifiedSessionInput;
  viewerProps?: Omit<SessionViewerProps, "session">;
}) {
  const turns = session.turns ?? [];
  const palette = useMemo(
    () =>
      createTurnPalette(
        session.id,
        turns.map((turn) => turn.id),
      ),
    [session.id, turns],
  );
  const turnBadges = useMemo(
    () => buildTurnBadges(turns, palette),
    [palette, turns],
  );
  const turnBadgeById = useMemo(
    () => new Map(turnBadges.map((badge) => [badge.id, badge])),
    [turnBadges],
  );
  const viewerClassName = cn("min-h-0 flex-1", viewerProps?.className);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SessionViewer
        session={session}
        scrollable
        {...viewerProps}
        className={viewerClassName}
        showHeader={false}
        showContextMeter={false}
        showRowMetadata={false}
        renderMessageBadge={(event: SessionEvent) => {
          const badge = event.turnId
            ? turnBadgeById.get(event.turnId)
            : undefined;
          return badge ? (
            <TranscriptTurnBadge badge={badge} placement="message" />
          ) : null;
        }}
        headerActions={
          <>
            {viewerProps?.headerActions}
            <TurnBadgeLegend badges={turnBadges} />
          </>
        }
      />
    </div>
  );
}

function buildTurnBadges(
  turns: SessionTurn[],
  palette: Record<string, TurnPalette>,
) {
  return turns.map((turn): TurnBadge => {
    const color = palette[turn.id] ?? "sky";
    return {
      id: turn.id,
      label: shortSessionId(turn.id),
      color,
      className: TURN_COLOR_CLASS[color],
    };
  });
}

function TurnBadgeLegend({ badges }: { badges: TurnBadge[] }) {
  return (
    <div className="flex max-w-full flex-wrap gap-1" aria-label="Turn colors">
      {badges.map((badge) => (
        <TranscriptTurnBadge key={badge.id} badge={badge} placement="legend" />
      ))}
    </div>
  );
}

function TranscriptTurnBadge({
  badge,
  placement,
}: {
  badge: TurnBadge;
  placement: "legend" | "message";
}) {
  return (
    <span
      data-testid={
        placement === "legend" ? "transcript-turn-badge" : "message-turn-badge"
      }
      data-turn-color={badge.color}
      title={`Turn ${badge.id}`}
      className={cn(
        "inline-flex shrink-0 rounded border px-1 py-px font-mono text-[9px] font-semibold leading-none",
        placement === "message" && "mt-1",
        badge.className,
      )}
    >
      {badge.label}
    </span>
  );
}
