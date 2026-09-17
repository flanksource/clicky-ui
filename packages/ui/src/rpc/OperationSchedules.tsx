import { useState } from "react";
import { Button } from "../components/button";
import { Loading } from "../components/loading";
import { Modal } from "../overlay/Modal";
import {
  formatScheduleTimestamp,
  operationByID,
  operationLabel,
} from "./operation-schedule-model";
import type { OperationSchedule } from "./operation-schedule-types";
import type { OperationSchedulesProps } from "./operation-schedule-types";
import { OperationScheduleDialog } from "./OperationScheduleDialog";
import { InlineError } from "./InlineError";

export function OperationSchedules(_props: OperationSchedulesProps) {
  const {
    operations,
    schedules,
    disabled,
    loading,
    onCreate,
    onUpdate,
    onDelete,
    onRunSaved,
    onRunDraft,
    cli,
  } = _props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OperationSchedule>();
  const [confirmRun, setConfirmRun] = useState<OperationSchedule>();
  const [confirmDelete, setConfirmDelete] = useState<OperationSchedule>();
  const [pending, setPending] = useState<"run" | "delete">();
  const [error, setError] = useState<unknown>();

  const openAdd = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };
  const openEdit = (schedule: OperationSchedule) => {
    setEditing(schedule);
    setDialogOpen(true);
  };

  const runSaved = async () => {
    if (!confirmRun) return;
    setPending("run");
    setError(undefined);
    try {
      await onRunSaved(confirmRun.id);
      setConfirmRun(undefined);
    } catch (nextError) {
      setError(nextError);
    } finally {
      setPending(undefined);
    }
  };

  const deleteSaved = async () => {
    if (!confirmDelete) return;
    setPending("delete");
    setError(undefined);
    try {
      await onDelete(confirmDelete.id);
      setConfirmDelete(undefined);
    } catch (nextError) {
      setError(nextError);
    } finally {
      setPending(undefined);
    }
  };

  if (loading) return <Loading variant="centered" label="Loading schedules…" />;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" disabled={disabled} onClick={openAdd}>
          Add schedule
        </Button>
      </div>
      {error ? (
        <InlineError title="Schedule action failed" error={error} />
      ) : null}
      {schedules.length === 0 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
          No schedules yet. Add one to run an operation automatically.
        </div>
      ) : (
        <div
          role="list"
          aria-label="Schedules"
          className="divide-y rounded-lg border bg-card"
        >
          {schedules.map((schedule) => {
            const operation = operationByID(operations, schedule.operationId);
            return (
              <div
                key={schedule.id}
                role="listitem"
                className="grid gap-3 px-4 py-3 lg:grid-cols-[minmax(12rem,1.1fr)_minmax(12rem,1fr)_minmax(14rem,1fr)_auto] lg:items-center"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">{schedule.name}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {operationLabel(operation)}
                  </div>
                </div>
                <div className="min-w-0 text-sm">
                  <code>{schedule.cron}</code>
                  <div className="text-xs text-muted-foreground">
                    {schedule.timezone}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  <div>
                    {schedule.enabled
                      ? `Next: ${formatScheduleTimestamp(schedule.nextRun)}`
                      : "Paused"}
                  </div>
                  {schedule.lastRun ? (
                    <div>Last: {formatScheduleTimestamp(schedule.lastRun)}</div>
                  ) : null}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    aria-label={`Run ${schedule.name} now`}
                    onClick={() => setConfirmRun(schedule)}
                  >
                    Run now
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={disabled}
                    onClick={() => openEdit(schedule)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={disabled}
                    onClick={() => setConfirmDelete(schedule)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <OperationScheduleDialog
        open={dialogOpen}
        operations={operations}
        {...(editing ? { schedule: editing } : {})}
        onClose={() => setDialogOpen(false)}
        onSave={(input) =>
          editing ? onUpdate(editing.id, input) : onCreate(input)
        }
        onRunNow={onRunDraft}
        {...(cli ? { cli } : {})}
      />
      <Modal
        open={Boolean(confirmRun)}
        onClose={() => setConfirmRun(undefined)}
        title={confirmRun ? `Run ${confirmRun.name} now?` : "Run schedule now?"}
        size="sm"
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmRun(undefined)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              loading={pending === "run"}
              onClick={runSaved}
            >
              Run now
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          The recurring schedule is unchanged.
        </p>
      </Modal>
      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(undefined)}
        title={
          confirmDelete ? `Delete ${confirmDelete.name}?` : "Delete schedule?"
        }
        size="sm"
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDelete(undefined)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              loading={pending === "delete"}
              onClick={deleteSaved}
            >
              Delete schedule
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          This removes the recurring definition. Previous run history is
          retained.
        </p>
      </Modal>
    </div>
  );
}
