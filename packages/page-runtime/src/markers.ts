export type EditableSourceMarker = { file: string; line: number; column: number; ordinal: number; hash: string };
export const EDITABLE_SOURCE_ATTRIBUTE = "data-source";
const MARKER = /^(.+):(\d+):(\d+)#(\d+)@([0-9a-f]{12})$/;

export function formatEditableSource({ file, line, column, ordinal, hash }: EditableSourceMarker): string {
  if (!file || /["\\\r\n]/.test(file)) throw new Error(`cannot mark editable source in ${JSON.stringify(file)}: unsupported file name`);
  if (![line, column].every((value) => Number.isSafeInteger(value) && value > 0) || !Number.isSafeInteger(ordinal) || ordinal < 0) throw new Error("invalid editable source position or ordinal");
  if (!/^[0-9a-f]{12}$/.test(hash)) throw new Error(`invalid source hash ${JSON.stringify(hash)}`);
  return `${file}:${line}:${column}#${ordinal}@${hash}`;
}

export function parseEditableSource(value: string): EditableSourceMarker {
  const match = MARKER.exec(value);
  if (!match) throw new Error(`malformed ${EDITABLE_SOURCE_ATTRIBUTE} ${JSON.stringify(value)}; expected <file>:<line>:<column>#<ordinal>@<hash>`);
  const marker = { file: match[1]!, line: Number(match[2]), column: Number(match[3]), ordinal: Number(match[4]), hash: match[5]! };
  formatEditableSource(marker);
  return marker;
}
