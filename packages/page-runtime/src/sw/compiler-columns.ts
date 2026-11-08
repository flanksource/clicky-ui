import { parse } from "sucrase/dist/parser";
import { TokenType } from "sucrase/dist/parser/tokenizer/types";

// Carry original component positions through Sucrase's prop/key reordering, then move them into
// React's source argument. The temporary property never reaches a component or the DOM.
export function completeCompositeSources(options: { code: string; sourceProperty: string }): string {
  const { code, sourceProperty } = options;
  const { tokens } = parse(code, false, false, false);
  const stack: number[] = [];
  const parents = new Map<number, number>();
  const ends = new Map<number, number>();
  tokens.forEach((token, index) => {
    if (stack.length) parents.set(index, stack.at(-1)!);
    if ([TokenType.parenL, TokenType.braceL, TokenType.bracketL, TokenType.dollarBraceL].includes(token.type)) stack.push(index);
    else if ([TokenType.parenR, TokenType.braceR, TokenType.bracketR].includes(token.type)) {
      const start = stack.pop();
      if (start === undefined) throw new Error("unbalanced compiled JSX delimiters");
      ends.set(start, index);
    }
  });
  const edits: Array<{ start: number; end: number; text: string }> = [];
  tokens.forEach((token, index) => {
    if (code.slice(token.start, token.end) !== sourceProperty || tokens[index + 1]?.type !== TokenType.colon) return;
    const props = parents.get(index);
    const call = props === undefined ? undefined : parents.get(props);
    const sourceStart = tokens[index + 2];
    const sourceEnd = ends.get(index + 2);
    const callEnd = call === undefined ? undefined : ends.get(call);
    if (props === undefined || call === undefined || callEnd === undefined || sourceStart?.type !== TokenType.braceL || sourceEnd === undefined) throw new Error("compiled JSX lost its component source property");
    const sources = tokens.slice(index + 3, callEnd).flatMap((candidate, offset) => {
      const at = index + 3 + offset;
      const end = ends.get(at);
      if (candidate.type !== TokenType.braceL || end === undefined || (parents.get(at) !== call && parents.get(at) !== props)) return [];
      if (!/^\{fileName: [\w$]+, lineNumber: \d+\}$/.test(code.slice(candidate.start, tokens[end]!.end))) return [];
      return [{ start: candidate.start, end: tokens[end]!.end }];
    });
    if (sources.length !== 1) throw new Error(`expected one generated JSX source, received ${sources.length}`);
    edits.push({ ...sources[0]!, text: code.slice(sourceStart.start, tokens[sourceEnd]!.end) });
    const comma = tokens[sourceEnd + 1];
    if (comma?.type !== TokenType.comma) throw new Error("compiled JSX source property has no separator");
    edits.push({ start: token.start, end: comma.end, text: "" });
  });
  return edits.sort((a, b) => b.start - a.start).reduce((output, edit) => `${output.slice(0, edit.start)}${edit.text}${output.slice(edit.end)}`, code);
}
