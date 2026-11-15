import { useState } from "react";
import { Button } from "../../components/button";
import { Select } from "../../components/select";
import { Modal } from "../../overlay/Modal";
import { JUL_LEVELS, type LoggerRow } from "../model/loggers";

export type LoggerLevelDialogProps = {
  logger: LoggerRow;
  /** Receives the chosen level, or null to inherit the parent's. */
  onSave: (level: string | null) => Promise<void>;
  onClose: () => void;
};

const INHERIT = "__inherit__";

/** Sets one logger's java.util.logging level. Stays open with the agent's error when the write fails. */
export function LoggerLevelDialog({ logger, onSave, onClose }: LoggerLevelDialogProps) {
  const [choice, setChoice] = useState(logger.level ?? INHERIT);
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const levels: string[] = [...JUL_LEVELS];
  if (logger.level !== null && !levels.includes(logger.level)) levels.push(logger.level);

  const submit = async () => {
    setError(undefined);
    setPending(true);
    try {
      await onSave(choice === INHERIT ? null : choice);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Set logger level"
      subtitle={
        <span className="break-all font-mono text-xs text-muted-foreground">
          {logger.displayName} · currently {logger.levelLabel}
        </span>
      }
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={pending} onClick={() => void submit()}>
            Set level
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2 text-xs">
        <label className="flex flex-col gap-1">
          New level
          <Select value={choice} onChange={(event) => setChoice(event.target.value)} options={[{ value: INHERIT, label: "(inherit)" }, ...levels.map((level) => ({ value: level, label: level }))]} />
        </label>
        {error ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
