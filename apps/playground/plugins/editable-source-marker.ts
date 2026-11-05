/**
 * The `data-editable-source` grammar, shared by the compile-time injector and the
 * browser. Free of `node:` and `typescript` imports so the client can import it.
 */
export type EditableSourceMarker = {
  /** Module path relative to `src/pages`, forward slashes. */
  file: string;
  line: number;
  column: number;
  ordinal: number;
  hash: string;
};

export const EDITABLE_SOURCE_ATTRIBUTE = "data-editable-source";

const MARKER = /^(.+):(\d+):(\d+)#(\d+)@([0-9a-f]{12})$/;

export function formatEditableSource({ file, line, column, ordinal, hash }: EditableSourceMarker): string {
  if (file === "" || /["\\\r\n]/.test(file)) {
    throw new Error(`cannot mark editable source in ${JSON.stringify(file)}: unsupported file name`);
  }
  if (!/^[0-9a-f]{12}$/.test(hash)) throw new Error(`invalid source hash ${JSON.stringify(hash)}`);
  return `${file}:${line}:${column}#${ordinal}@${hash}`;
}

export function parseEditableSource(value: string): EditableSourceMarker {
  const match = MARKER.exec(value);
  if (!match) {
    throw new Error(
      `malformed ${EDITABLE_SOURCE_ATTRIBUTE} ${JSON.stringify(value)}; expected <file>:<line>:<column>#<ordinal>@<hash>`,
    );
  }
  const [, file, line, column, ordinal, hash] = match as unknown as [string, string, string, string, string, string];
  return { file, line: Number(line), column: Number(column), ordinal: Number(ordinal), hash };
}
