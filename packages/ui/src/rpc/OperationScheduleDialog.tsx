import { useEffect, useState } from "react";
import { Button } from "../components/button";
import { CopyButton } from "../components/CopyButton";
import { Field } from "../components/Field";
import { InputField } from "../components/InputField";
import { JsonSchemaForm } from "../components/JsonSchemaForm";
import { ScheduleEditor } from "../components/ScheduleEditor";
import { Modal } from "../overlay/Modal";
import {
  newOperationScheduleInput,
  operationByID,
  operationInputSchema,
  operationLabel,
  scheduleToInput,
} from "./operation-schedule-model";
import { operationCLICommand } from "./operation-cli-command";
import type {
  OperationSchedule,
  OperationScheduleCLI,
  OperationScheduleInput,
  OperationScheduleRunInput,
} from "./operation-schedule-types";
import type { ResolvedOperation } from "./types";
import { InlineError } from "./InlineError";
import { OperationPicker } from "./OperationPicker";

export interface OperationScheduleDialogProps {
  open: boolean;
  operations: readonly ResolvedOperation[];
  schedule?: OperationSchedule;
  cli?: OperationScheduleCLI;
  onClose: () => void;
  onSave: (input: OperationScheduleInput) => Promise<unknown>;
  onRunNow: (input: OperationScheduleRunInput) => Promise<unknown>;
}

export function OperationScheduleDialog(_props: OperationScheduleDialogProps) {
  const { open, operations, schedule, cli, onClose, onSave, onRunNow } = _props;
  const [input, setInput] = useState<OperationScheduleInput>(
    newOperationScheduleInput,
  );
  const [pending, setPending] = useState<"save" | "run">();
  const [error, setError] = useState<unknown>();
  const [confirmingRun, setConfirmingRun] = useState(false);

  useEffect(() => {
    if (!open) return;
    setInput(
      schedule ? scheduleToInput(schedule) : newOperationScheduleInput(),
    );
    setError(undefined);
    setConfirmingRun(false);
  }, [open, schedule]);

  const operation = operationByID(operations, input.operationId);
  const schema = operationInputSchema(operation);
  const suggestions =
    operation?.operation["x-clicky"]?.schedule?.suggestions ?? [];
  const destructive =
    operation?.operation["x-clicky"]?.toolHints?.destructiveHint === true;
  const cliCommand = operationCLICommand(operation, input.args, cli);

  const selectOperation = (operationId: string) => {
    const selected = operationByID(operations, operationId);
    setInput((current) => ({
      ...current,
      operationId,
      args: {},
      name: current.name || operationLabel(selected),
      cron:
        selected?.operation["x-clicky"]?.schedule?.suggestions?.[0]?.cron ??
        current.cron,
    }));
  };

  const save = async () => {
    setPending("save");
    setError(undefined);
    try {
      await onSave(input);
      onClose();
    } catch (nextError) {
      setError(nextError);
    } finally {
      setPending(undefined);
    }
  };

  const run = async () => {
    setPending("run");
    setError(undefined);
    try {
      await onRunNow({ operationId: input.operationId, args: input.args });
      setConfirmingRun(false);
      onClose();
    } catch (nextError) {
      setError(nextError);
      setConfirmingRun(false);
    } finally {
      setPending(undefined);
    }
  };

  const canSave = Boolean(
    input.name.trim() && input.operationId && input.cron.trim(),
  );
  const canRun = Boolean(input.operationId);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={schedule ? "Edit schedule" : "Add schedule"}
        size="xl"
        footer={
          <div className="flex w-full flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={destructive ? "destructive" : "secondary"}
              disabled={!canRun}
              loading={pending === "run"}
              onClick={() => setConfirmingRun(true)}
            >
              Run now
            </Button>
            <Button
              type="button"
              disabled={!canSave}
              loading={pending === "save"}
              onClick={save}
            >
              Save schedule
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Field
            label="Schedule name"
            htmlFor="operation-schedule-name"
            required
          >
            <InputField
              id="operation-schedule-name"
              value={input.name}
              onChange={(name) => setInput({ ...input, name })}
            />
          </Field>
          <OperationPicker
            id="operation-schedule-operation"
            operations={operations}
            value={input.operationId}
            onChange={selectOperation}
          />
          {operation ? (
            schema && Object.keys(schema.properties ?? {}).length > 0 ? (
              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Arguments</h3>
                <JsonSchemaForm
                  schema={schema}
                  value={input.args}
                  onChange={(args) => setInput({ ...input, args })}
                  idPrefix="operation-schedule-args"
                  showPreferencesMenu={false}
                />
              </section>
            ) : (
              <p className="text-sm text-muted-foreground">
                This operation has no arguments.
              </p>
            )
          ) : null}
          {cliCommand ? (
            <section className="space-y-1">
              <h3 className="text-sm font-semibold">Equivalent CLI command</h3>
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-xs">
                  {cliCommand}
                </code>
                <CopyButton value={cliCommand} label="Copy CLI command" />
              </div>
            </section>
          ) : null}
          <ScheduleEditor
            id="operation-schedule"
            value={input}
            onChange={(timing) => setInput({ ...input, ...timing })}
            cronSuggestions={suggestions}
            timezoneSuggestions={[input.timezone, "UTC"]}
          />
          {error ? (
            <InlineError title="Schedule action failed" error={error} />
          ) : null}
        </div>
      </Modal>
      <Modal
        open={confirmingRun}
        onClose={() => setConfirmingRun(false)}
        title={`Run ${operationLabel(operation)} now?`}
        size="sm"
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmingRun(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant={destructive ? "destructive" : "default"}
              loading={pending === "run"}
              onClick={run}
            >
              Run now
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          This runs the configured operation once without creating or changing a
          recurring schedule.
        </p>
      </Modal>
    </>
  );
}
