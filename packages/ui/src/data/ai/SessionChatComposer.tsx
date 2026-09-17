import type { ReactNode } from "react";
import { Select } from "../../components";
import { PromptInput } from "../chat/PromptInput";
import { CLAUDE_PERMISSION_MODE_OPTIONS } from "../chat/types";
import { Icon } from "../Icon";
import { sessionTone } from "./session-tones";
import { permissionModeVisual } from "./SpecRuntimeEditor/permission-mode-visuals";
import type { SpecPermissionMode } from "./SpecRuntimeEditor.model";

export type SessionChatCapabilities = {
  interrupt: boolean;
  steer: boolean;
  followUp: boolean;
  resume: boolean;
  /** True when the live run's runtime can switch permission posture mid-session. */
  setPermissionMode?: boolean;
};

export type SessionChatQueuedMessage = {
  messageId: string;
  text: string;
};

export type SessionChatComposerProps = {
  status: "starting" | "running" | "interrupting" | "idle" | "stopping";
  capabilities: SessionChatCapabilities;
  queued?: SessionChatQueuedMessage[];
  error?: string;
  onSubmit: (text: string) => void;
  onInterrupt?: () => void;
  toolbar?: ReactNode;
  inputAccessory?: ReactNode;
  className?: string;
  /** Current permission posture, when the host tracks one for this session. */
  permissionMode?: SpecPermissionMode;
  /** Modes the run's runtime honours, canonical order. */
  permissionModes?: SpecPermissionMode[];
  /** Agent family ("claude", "codex", "gemini") whose vocabulary labels the modes. */
  permissionFamily?: string;
  /** Omit to render the picker read-only. */
  onPermissionModeChange?: (mode: SpecPermissionMode) => void;
};

export function SessionChatComposer({
  status,
  capabilities,
  queued = [],
  error,
  onSubmit,
  onInterrupt,
  toolbar,
  inputAccessory,
  className,
  permissionMode,
  permissionModes,
  permissionFamily,
  onPermissionModeChange,
}: SessionChatComposerProps) {
  const active = status === "running" || status === "interrupting";
  const canSubmitWhileActive = capabilities.steer || capabilities.followUp;
  const disabled =
    status === "starting" ||
    status === "interrupting" ||
    status === "stopping" ||
    (status === "running" && !canSubmitWhileActive);
  const pickerReadOnly =
    !onPermissionModeChange ||
    status === "starting" ||
    status === "interrupting" ||
    status === "stopping";
  const picker =
    permissionMode && permissionModes && permissionModes.length > 0 ? (
      <PermissionModePicker
        mode={permissionMode}
        modes={permissionModes}
        family={permissionFamily}
        readOnly={pickerReadOnly}
        {...(onPermissionModeChange ? { onChange: onPermissionModeChange } : {})}
      />
    ) : null;
  const composedToolbar =
    picker || toolbar ? (
      <>
        {picker}
        {toolbar}
      </>
    ) : undefined;

  return (
    <div className={className}>
      {queued.length > 0 && (
        <div
          className="mb-density-2 flex flex-wrap gap-density-1"
          aria-label="Queued messages"
        >
          {queued.map((message) => (
            <span
              key={message.messageId}
              className="max-w-full truncate rounded-full border border-border bg-muted px-density-2 py-1 text-xs text-muted-foreground"
            >
              Queued: {message.text}
            </span>
          ))}
        </div>
      )}
      {error && (
        <div className="mb-density-2 text-xs text-destructive">{error}</div>
      )}
      <PromptInput
        status={active ? "streaming" : "ready"}
        disabled={disabled}
        allowSubmitWhileStreaming={canSubmitWhileActive}
        stopLabel="Interrupt"
        placeholder={
          status === "idle" ? "Continue this session…" : "Add a follow-up…"
        }
        onSubmit={(text) => onSubmit(text)}
        {...(inputAccessory ? { inputAccessory } : {})}
        {...(composedToolbar ? { toolbar: composedToolbar } : {})}
        {...(capabilities.interrupt && status === "running" && onInterrupt
          ? { onStop: onInterrupt }
          : {})}
      />
    </div>
  );
}

function PermissionModePicker({
  mode,
  modes,
  family,
  readOnly,
  onChange,
}: {
  mode: SpecPermissionMode;
  modes: SpecPermissionMode[];
  family: string | undefined;
  readOnly: boolean;
  onChange?: (mode: SpecPermissionMode) => void;
}) {
  const visual = permissionModeVisual(family, mode);
  const tone = sessionTone(visual.tone);
  return (
    <div className="inline-flex items-center gap-1.5">
      <Icon
        icon={visual.icon}
        title={visual.label}
        className={`size-3.5 ${tone.text}`}
      />
      <Select
        aria-label="Permission mode"
        value={mode}
        disabled={readOnly}
        onChange={(event) =>
          onChange?.(event.target.value as SpecPermissionMode)
        }
        className="h-7 w-auto min-w-24 py-0 text-xs"
      >
        {modes.map((candidate) => (
          <option
            key={candidate}
            value={candidate}
            title={descriptionFor(family, candidate)}
          >
            {permissionModeVisual(family, candidate).label}
          </option>
        ))}
      </Select>
    </div>
  );
}

// The option descriptions document Claude's postures, so other families get none.
function descriptionFor(
  family: string | undefined,
  mode: SpecPermissionMode,
): string | undefined {
  if (family && family !== "claude") return undefined;
  return CLAUDE_PERMISSION_MODE_OPTIONS.find(
    (option) => option.value === mode,
  )?.description;
}
