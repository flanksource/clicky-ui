/** A run of plain log lines, or a collapsible group of them. */
export type LogSection =
  | { kind: "text"; text: string }
  | { kind: "group"; name: string; lines: number; closed: boolean; children: LogSection[] };

const GROUP_START = /^(?:::group::|##\[group\])(.*)$/;
const GROUP_END = /^(?:::endgroup::|##\[endgroup\])\s*$/;

/**
 * Splits log text into sections at GitHub Actions group markers:
 * `::group::name` / `::endgroup::` as a step prints them, or `##[group]name` /
 * `##[endgroup]` as GitHub's downloaded logs carry them. Groups nest. An
 * `endgroup` with no open group is dropped (a tail cut its start off); a group
 * still open at the end is returned unclosed (its output is still arriving).
 */
export function parseLogSections(logs: string): LogSection[] {
  const root: LogSection[] = [];
  const stack: Extract<LogSection, { kind: "group" }>[] = [];
  let text: string[] = [];
  const target = () => stack[stack.length - 1]?.children ?? root;
  const flush = () => {
    if (text.length > 0) target().push({ kind: "text", text: text.join("\n") });
    text = [];
  };
  for (const raw of logs.split("\n")) {
    const line = raw.replace(/\r$/, "");
    const start = GROUP_START.exec(line);
    if (start) {
      flush();
      const group = { kind: "group" as const, name: start[1]?.trim() ?? "", lines: 0, closed: false, children: [] };
      target().push(group);
      stack.push(group);
      continue;
    }
    if (GROUP_END.test(line)) {
      flush();
      const group = stack.pop();
      if (group) group.closed = true;
      continue;
    }
    for (const group of stack) group.lines++;
    text.push(raw);
  }
  flush();
  return root;
}
