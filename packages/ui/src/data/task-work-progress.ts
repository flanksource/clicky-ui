import type { TaskRunMeta, TaskSnapshot } from "./TaskSnapshot";

export function taskWorkProgress(run: TaskSnapshot | TaskRunMeta) {
  const work = run.work;
  const total = work?.total ?? run.total ?? 0;
  const completed = work ? work.completed + work.cached : run.completed ?? 0;
  const failed = work?.failed ?? run.failed ?? 0;
  const running = work?.running ?? run.running ?? 0;
  const canceled = work?.canceled ?? run.canceled ?? 0;
  const unstarted = work?.unstarted ?? 0;
  return {
    total, completed, failed, running, canceled, unstarted,
    done: completed + failed,
    label: `${completed + failed}/${total} done${failed ? `, ${failed} failed` : ""}${work?.cached ? `, ${work.cached} cached` : ""}${canceled ? `, ${canceled} canceled` : ""}${unstarted ? `, ${unstarted} unstarted` : ""}`,
    counts: { ok: completed, warn: 0, fail: failed, run: running, canceled, unstarted, pending: Math.max(0, total - completed - failed - running - canceled - unstarted) },
  };
}
