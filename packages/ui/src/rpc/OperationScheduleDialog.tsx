import { useEffect, useState } from "react";
import { Button } from "../components/button";
import { Combobox } from "../components/Combobox";
import type { ComboboxOption } from "../components/combobox-types";
import { CopyButton } from "../components/CopyButton";
import { Field } from "../components/Field";
import { InputField } from "../components/InputField";
import { ScheduleEditor } from "../components/ScheduleEditor";
import { Modal } from "../overlay/Modal";
import {
  newOperationScheduleInput,
  operationByID,
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
import type { OperationsApiClient } from "./useOperations";
import { InlineError } from "./InlineError";
import { OperationArgsForm } from "./OperationArgsForm";
import { OperationPicker } from "./OperationPicker";

export interface OperationScheduleDialogProps {
  /** Client for the argument form's lookups (the operation's parameter pickers). */
  client: OperationsApiClient;
  open: boolean;
  operations: readonly ResolvedOperation[];
  targetOptions: ComboboxOption[];
  defaultTargets?: string[];
  targetLabel?: string;
  schedule?: OperationSchedule;
  cli?: OperationScheduleCLI;
  onClose: () => void;
  onSave: (input: OperationScheduleInput) => Promise<unknown>;
  onRunNow: (input: OperationScheduleRunInput) => Promise<unknown>;
}

export function OperationScheduleDialog(_props: OperationScheduleDialogProps) {
  const {
    client,
    open,
    operations,
    schedule,
    cli,
    targetOptions,
    defaultTargets,
    targetLabel = "Targets",
    onClose,
    onSave,
    onRunNow,
  } = _props;
  const [input, setInput] = useState<OperationScheduleInput>(
    newOperationScheduleInput,
  );
  const [pending, setPending] = useState<"save" | "run">();
  const [error, setError] = useState<unknown>();
  const [confirmingRun, setConfirmingRun] = useState(false);
  const [concurrencyText, setConcurrencyText] = useState("1");
  const [argsValid, setArgsValid] = useState(true);
  // Each opening remounts the argument form so it loads the args set below,
  // not the ones a previous opening left in input.
  const [argsSession, setArgsSession] = useState(0);

  useEffect(() => {
    if (!open) return;
    setArgsSession((session) => session + 1);
    setInput(
      schedule
        ? scheduleToInput(schedule)
        : {
            ...newOperationScheduleInput(),
            targets: [...(defaultTargets ?? [])],
          },
    );
    setConcurrencyText(String(schedule?.concurrency ?? 1));
    setError(undefined);
    setConfirmingRun(false);
  }, [open, schedule, defaultTargets]);

  const multiTarget = input.targets.length > 1;
  const concurrency = Number(concurrencyText);
  const concurrencyValid =
    !multiTarget ||
    (concurrencyText.trim() !== "" &&
      Number.isInteger(concurrency) &&
      concurrency >= 1 &&
      concurrency <= input.targets.length);
  const concurrencyPayload = multiTarget ? { concurrency } : {};

  const changeTargets = (targets: string[]) => {
    setInput({ ...input, targets });
    const limit = Math.max(1, targets.length);
    setConcurrencyText((current) =>
      Number(current) > limit ? String(limit) : current,
    );
  };

  const operation = operationByID(operations, input.operationId);
  const suggestions =
    operation?.operation["x-clicky"]?.schedule?.suggestions ?? [];
  const destructive =
    operation?.operation["x-clicky"]?.toolHints?.destructiveHint === true;
  const cliCommand = cli?.targetFlag
    ? input.targets
        .map((target) =>
          operationCLICommand(operation, input.args, {
            ...cli,
            globalFlags: { ...cli.globalFlags, [cli.targetFlag!]: target },
          }),
        )
        .join("\n")
    : operationCLICommand(operation, input.args, cli);

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
      await onSave({ ...input, ...concurrencyPayload });
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
      await onRunNow({
        operationId: input.operationId,
        args: input.args,
        targets: input.targets,
        ...concurrencyPayload,
      });
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
    input.name.trim() &&
    input.operationId &&
    input.cron.trim() &&
    input.targets.length &&
    concurrencyValid &&
    argsValid,
  );
  const canRun = Boolean(
    input.operationId && input.targets.length && concurrencyValid && argsValid,
  );

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
            label={targetLabel}
            htmlFor="operation-schedule-targets"
            required
          >
            <Combobox
              id="operation-schedule-targets"
              multiple
              variant="tags"
              ariaLabel={targetLabel}
              ariaRequired
              allowCustomValue={false}
              options={targetOptions}
              value={input.targets}
              onChange={changeTargets}
            />
          </Field>
          {multiTarget ? (
            <Field
              label={`${targetLabel} at once`}
              htmlFor="operation-schedule-concurrency"
              error={
                concurrencyValid
                  ? undefined
                  : `Enter a whole number from 1 to ${input.targets.length}.`
              }
              helper={`How many of the ${input.targets.length} selected run at the same time; the rest wait their turn.`}
            >
              <InputField
                id="operation-schedule-concurrency"
                type="number"
                inputMode="numeric"
                min={1}
                max={input.targets.length}
                step={1}
                invalid={!concurrencyValid}
                value={concurrencyText}
                onChange={setConcurrencyText}
              />
            </Field>
          ) : null}
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
            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Arguments</h3>
              <OperationArgsForm
                key={`${argsSession}:${input.operationId}`}
                client={client}
                operation={operation}
                args={input.args}
                onChange={(args) =>
                  setInput((current) => ({ ...current, args }))
                }
                onValidityChange={setArgsValid}
              />
            </section>
          ) : null}
          {cliCommand ? (
            <section className="space-y-1">
              <h3 className="text-sm font-semibold">Equivalent CLI command</h3>
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-pre text-xs">
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
        <p className="mt-2 text-sm">
          {targetLabel}: {input.targets.join(", ")}
          {multiTarget ? ` (${concurrency} at once)` : ""}
        </p>
      </Modal>
    </>
  );
}
