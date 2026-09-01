import type { TaskSnapshot } from "./TaskSnapshot";
import { bucketTasks } from "./task-status";

// Builders that flatten a task run into pasteable text. Deliberately free of
// React and of the clipboard so the exact output is unit-testable, and so the
// rendered card and the copied text cannot drift apart.

// isFailedOrWarn marks the statuses TaskGroupCard always keeps visible. Also
// drives "copy errors only", so the two can never disagree.
export function isFailedOrWarn(t: TaskSnapshot): boolean {
  return (
    t.status === "failed" || t.status === "FAIL" || t.status === "ERR" || t.status === "warning"
  );
}

// A task counts as errored for copy purposes when it either rests in a failing
// status or carries an error string (a canceled dependency does the latter).
function isErrored(t: TaskSnapshot): boolean {
  return isFailedOrWarn(t) || Boolean(t.error);
}

export function taskGroupErrorCount(tasks: TaskSnapshot[]): number {
  return tasks.filter(isErrored).length;
}

function fence(label: string, body: string, language = ""): string[] {
  return [`${label}:`, "```" + language, body.replace(/\n+$/, ""), "```"];
}

function streamBlock(label: string, text: string, truncated: boolean | undefined): string[] {
  // Mirrors the "showing latest 1 MiB" note TaskStream renders.
  return fence(truncated ? `${label} (showing latest 1 MiB)` : label, text);
}

function taskSection(t: TaskSnapshot): string[] {
  const lines = [`## ${t.name} — ${t.status}${t.duration ? ` (${t.duration})` : ""}`];
  if (t.description) lines.push(t.description);
  if (t.error) lines.push(`error: ${t.error}`);
  // `message` carries the latest log line; only worth repeating when it differs.
  if (t.message && t.message !== t.error) lines.push(`message: ${t.message}`);
  const logs = t.logs ?? [];
  if (logs.length > 0) {
    lines.push("logs:");
    for (const l of logs) lines.push(`  ${l.level} ${l.message}`);
  }
  if (t.stdout) lines.push(...streamBlock("stdout", t.stdout, t.stdoutTruncated));
  if (t.stderr) lines.push(...streamBlock("stderr", t.stderr, t.stderrTruncated));
  // `details` is an open shape (TaskExecDetails carries arbitrary domain keys),
  // so serialize it whole rather than narrowing to a known variant.
  if (t.details !== undefined) {
    lines.push(...fence("details", JSON.stringify(t.details, null, 2), "json"));
  }
  return lines;
}

function groupHeader(group: TaskSnapshot, tasks: TaskSnapshot[]): string[] {
  const counts = bucketTasks(tasks);
  const total = group.total ?? tasks.length;
  const summary = [`status: ${group.status}`];
  if (total > 0) summary.push(`${counts.ok + counts.warn + counts.fail}/${total}`);
  if (group.kind) summary.push(`kind: ${group.kind}`);

  const lines = [`# ${group.name}`, summary.join(" · ")];
  const labels = Object.entries(group.labels ?? {});
  if (labels.length > 0) {
    lines.push(`labels: ${labels.map(([k, v]) => `${k}=${v}`).join(", ")}`);
  }
  const timing: string[] = [];
  if (group.startedAt) timing.push(`started ${group.startedAt}`);
  if (group.finishedAt) timing.push(`finished ${group.finishedAt}`);
  if (timing.length > 0) lines.push(timing.join(" · "));
  if (group.error) lines.push(`error: ${group.error}`);
  return lines;
}

function joinBlocks(blocks: string[][]): string {
  return `${blocks.map((block) => block.join("\n")).join("\n\n")}\n`;
}

/** The whole run — group context followed by every task, with logs, streams and details. */
export function taskGroupMarkdown(group: TaskSnapshot, tasks: TaskSnapshot[]): string {
  return joinBlocks([groupHeader(group, tasks), ...tasks.map(taskSection)]);
}

/** Group context followed by only the failing/warning tasks. */
export function taskGroupErrors(group: TaskSnapshot, tasks: TaskSnapshot[]): string {
  return joinBlocks([groupHeader(group, tasks), ...tasks.filter(isErrored).map(taskSection)]);
}

/** The raw snapshots, for feeding a tool rather than a human. */
export function taskGroupJson(group: TaskSnapshot, tasks: TaskSnapshot[]): string {
  return JSON.stringify({ group, tasks }, null, 2);
}

/** A single task, for the per-row copy affordance. */
export function taskMarkdown(task: TaskSnapshot): string {
  return joinBlocks([taskSection(task)]);
}
