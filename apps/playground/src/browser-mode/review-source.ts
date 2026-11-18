import { parseEditableSource } from "@flanksource/page-runtime/markers";

export function reviewSourcePosition(source: string): { file: string; line: number; column: number } {
  if (source.includes("#")) return parseEditableSource(source);
  const match = /^(.+):([1-9]\d*):([1-9]\d*)$/.exec(source);
  if (!match) throw new Error(`Review source has no page position: ${source}`);
  const line = Number(match[2]); const column = Number(match[3]);
  if (!Number.isSafeInteger(line) || !Number.isSafeInteger(column)) throw new Error(`Review source position is unsafe: ${source}`);
  return { file: match[1]!, line, column };
}
