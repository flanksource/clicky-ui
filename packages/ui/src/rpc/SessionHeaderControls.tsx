import { useState, type ReactNode } from "react";
import { Button } from "../components/button";
import { Icon } from "../data/Icon";
import { UiClockCountdown, UiRestart, UiStop } from "../icons";
import { Modal } from "../overlay/Modal";
import {
  formatSessionDuration,
  sessionControls,
  type SessionControls,
} from "./sessionHeaderModel";
import { sessionParamsDurationMs, type SessionInfo } from "./sessionTypes";
import type { SessionAction } from "./useSession";

export type SessionConfirmRenderArgs = {
  action: SessionAction;
  session: SessionInfo;
  /** The duration an extend or restart will send; absent for stop. */
  durationMs?: number;
  confirm: () => void;
  cancel: () => void;
};

export type SessionHeaderControlsProps = {
  session: SessionInfo;
  onStop: () => void;
  onExtend: (durationMs: number) => void;
  onRestart: (options: { durationMs: number }) => void;
  mutating: boolean;
  renderConfirm: ((args: SessionConfirmRenderArgs) => ReactNode) | undefined;
  durationPresetsMs: readonly number[];
  pendingAction: SessionAction | null;
};

type PendingRequest = { action: SessionAction; durationMs?: number };

const ACTION_LABELS: Record<SessionAction, string> = {
  stop: "Stop",
  extend: "Extend",
  restart: "Restart",
};

function offersAction(controls: SessionControls, action: SessionAction): boolean {
  if (action === "restart") return controls.restart.visible;
  return controls[action].visible && !controls[action].disabled;
}

export function SessionHeaderControls({
  session,
  onStop,
  onExtend,
  onRestart,
  mutating,
  renderConfirm,
  durationPresetsMs,
  pendingAction,
}: SessionHeaderControlsProps) {
  const controls = sessionControls(session);
  const [prompt, setPrompt] = useState<"extend" | "restart" | null>(null);
  const [confirming, setConfirming] = useState<PendingRequest | null>(null);

  // A prompt or confirmation opened for an action the session no longer offers
  // (it turned terminal, or started stopping) would send a request the server
  // refuses, so it closes the render the session changes.
  if (prompt && !offersAction(controls, prompt)) setPrompt(null);
  if (confirming && !offersAction(controls, confirming.action)) setConfirming(null);

  const perform = ({ action, durationMs }: PendingRequest) => {
    setConfirming(null);
    if (action === "stop") return onStop();
    if (durationMs === undefined) throw new Error(`session ${action} was requested without a duration`);
    if (action === "extend") return onExtend(durationMs);
    return onRestart({ durationMs });
  };
  const request = (next: PendingRequest) => (mutating ? setConfirming(next) : perform(next));

  const onRestartClick = () => {
    const durationMs = sessionParamsDurationMs(session);
    if (durationMs === undefined) setPrompt("restart");
    else request({ action: "restart", durationMs });
  };

  if (!controls.stop.visible && !controls.extend.visible && !controls.restart.visible) return null;

  return (
    <div className="flex flex-col items-end gap-2" data-slot="session-header-controls">
      <div className="flex flex-wrap items-center gap-2">
        {controls.extend.visible && (
          <Button
            size="sm"
            variant="outline"
            disabled={controls.extend.disabled}
            loading={pendingAction === "extend"}
            onClick={() => setPrompt("extend")}
          >
            <Icon icon={UiClockCountdown} className="size-4" />
            Extend
          </Button>
        )}
        {controls.stop.visible && (
          <Button
            size="sm"
            variant="destructive"
            disabled={controls.stop.disabled}
            loading={pendingAction === "stop"}
            onClick={() => request({ action: "stop" })}
          >
            <Icon icon={UiStop} className="size-4" />
            Stop
          </Button>
        )}
        {controls.restart.visible && (
          <Button
            size="sm"
            variant="outline"
            loading={pendingAction === "restart"}
            onClick={onRestartClick}
          >
            <Icon icon={UiRestart} className="size-4" />
            Restart
          </Button>
        )}
      </div>
      {prompt && (
        <div
          role="group"
          aria-label={`${ACTION_LABELS[prompt]} duration`}
          className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-muted/40 p-1 text-xs"
        >
          <span className="px-1 text-muted-foreground">
            {prompt === "extend" ? "Extend by" : "Run for"}
          </span>
          {durationPresetsMs.map((durationMs) => (
            <Button
              key={durationMs}
              size="sm"
              variant="ghost"
              onClick={() => {
                setPrompt(null);
                request({ action: prompt, durationMs });
              }}
            >
              {formatSessionDuration(durationMs)}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setPrompt(null)}>
            Cancel
          </Button>
        </div>
      )}
      {confirming &&
        (renderConfirm ? (
          renderConfirm({
            action: confirming.action,
            session,
            ...(confirming.durationMs !== undefined ? { durationMs: confirming.durationMs } : {}),
            confirm: () => perform(confirming),
            cancel: () => setConfirming(null),
          })
        ) : (
          <DefaultSessionConfirm
            request={confirming}
            onConfirm={() => perform(confirming)}
            onCancel={() => setConfirming(null)}
          />
        ))}
    </div>
  );
}

function DefaultSessionConfirm({
  request,
  onConfirm,
  onCancel,
}: {
  request: PendingRequest;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const label = ACTION_LABELS[request.action];
  return (
    <Modal
      open
      onClose={onCancel}
      size="sm"
      title={`${label} this session?`}
      footer={
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="sm" variant="destructive" onClick={onConfirm}>
            {label}
          </Button>
        </div>
      }
    >
      <p className="text-sm">
        This session changes the target's behaviour.
        {request.durationMs !== undefined &&
          (request.action === "extend"
            ? ` Its deadline moves ${formatSessionDuration(request.durationMs)} later.`
            : ` It will run for ${formatSessionDuration(request.durationMs)}.`)}
      </p>
    </Modal>
  );
}
