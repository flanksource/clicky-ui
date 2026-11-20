import type { ReactNode } from "react";
import { Button } from "../../components/button";
import { UiCheck } from "../../icons";
import { DropdownMenu } from "../../overlay/DropdownMenu";
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
  /** Disables the input and shows this reason in it (e.g. while the session
   *  it continues is still loading, or could not be read). */
  disabledReason?: string;
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
  disabledReason,
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
    disabledReason !== undefined ||
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
  const composedAccessory =
    picker || inputAccessory ? (
      <>
        {inputAccessory}
        {picker}
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
        {...(disabledReason !== undefined ? { disabledReason } : {})}
        allowSubmitWhileStreaming={canSubmitWhileActive}
        stopLabel="Interrupt"
        placeholder={
          status === "idle" ? "Continue this session…" : "Add a follow-up…"
        }
        onSubmit={(text) => onSubmit(text)}
        {...(composedAccessory ? { inputAccessory: composedAccessory } : {})}
        {...(toolbar ? { toolbar } : {})}
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
  const name = `Permission mode: ${visual.label}`;
  return (
    <DropdownMenu
      align="right"
      menuLabel="Permission mode"
      trigger={
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={name}
          title={name}
          disabled={readOnly}
          className="[&_svg]:size-5"
        >
          <Icon icon={visual.icon} className={`size-5 ${sessionTone(visual.tone).text}`} />
        </Button>
      }
      items={modes.map((candidate) => {
        const option = permissionModeVisual(family, candidate);
        const description = descriptionFor(family, candidate);
        return {
          label: (
            <span className="inline-flex w-full items-center gap-2">
              {option.label}
              {candidate === mode && (
                <span data-current-mode className="ml-auto inline-flex">
                  <Icon icon={UiCheck} title="Current mode" className="size-3.5" />
                </span>
              )}
            </span>
          ),
          icon: option.icon,
          iconClassName: sessionTone(option.tone).text,
          ...(description ? { title: description } : {}),
          onSelect: () => onChange?.(candidate),
        };
      })}
    />
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
