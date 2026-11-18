import type { StoredStyleEdit } from "../../plugins/comments-store";

const code = (value: string | number | null) => value === null ? "(removed)" : `\`${value}\``;

/** The human text of the comment that asks an agent for a style edit Design mode could not write itself. */
export function styleEditBody({ tag, changes, refusal }: StoredStyleEdit): string {
  const list = changes
    .map(({ attribute, from, to }) => `${code(attribute)} ${from === null ? "(not set)" : `from ${code(from)}`} to ${code(to)}`)
    .join(", ");
  return `Change ${list} of ${code(`<${tag}>`)}. It cannot be edited in place: ${refusal.message} (${refusal.file}:${refusal.line}).`;
}
