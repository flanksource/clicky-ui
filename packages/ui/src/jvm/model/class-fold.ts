import type { JvmMethodRange } from "../protocol/types";
import { rowForLine } from "./source-lines";

/**
 * Locating the method a reader means inside a decompiled class. The agent
 * reports each method's first and last source line, so no brace scanning is
 * needed; this module resolves a selector to one method and decides what the
 * view shows for a selection.
 */

/** 1-based and inclusive, the way an editor's fold and reveal actions want it. */
export type LineRange = { startLine: number; endLine: number };

export type ClassFocus = {
  /** 0-based row to highlight and scroll to, -1 for none. */
  highlightRow: number;
  /** The method to fold the class down to. */
  range: LineRange | null;
  /** Why the selection was not honoured, when it was not. */
  note?: string;
};

/** The method name a selector names, with or without a descriptor. */
export function bareMethodName(selector: string): string {
  const open = selector.indexOf("(");
  return (open < 0 ? selector : selector.slice(0, open)).trim();
}

/** The selector that identifies one overload: name and JVM descriptor. */
export function methodKey(method: JvmMethodRange): string {
  return `${method.name}${method.descriptor}`;
}

/**
 * Picks the method a selector names. A bare name shared by several overloads
 * resolves to nothing rather than the first match, so the view never folds
 * open one of two overloads and teaches the reader the wrong method is in view.
 */
export function selectMethod(methods: readonly JvmMethodRange[], selector: string): JvmMethodRange | null {
  const wanted = selector.trim();
  if (wanted === "") return null;
  const exact = methods.filter((method) => methodKey(method) === wanted);
  if (exact.length === 1) return exact[0] ?? null;
  const byName = methods.filter((method) => method.name === bareMethodName(wanted));
  return byName.length === 1 ? (byName[0] ?? null) : null;
}

const PRIMITIVES: Record<string, string> = { Z: "boolean", B: "byte", C: "char", S: "short", I: "int", J: "long", F: "float", D: "double" };

function simpleTypeName(internalName: string): string {
  return internalName.slice(internalName.lastIndexOf("/") + 1).replaceAll("$", ".");
}

function parameterTypes(descriptor: string): string[] {
  const invalid = () => new Error(`Invalid JVM method descriptor "${descriptor}"`);
  if (!descriptor.startsWith("(")) throw invalid();
  const types: string[] = [];
  let index = 1;
  while (descriptor[index] !== ")") {
    let dimensions = 0;
    while (descriptor[index] === "[") {
      dimensions++;
      index++;
    }
    const code = descriptor[index];
    if (code === undefined) throw invalid();
    let name: string;
    if (code === "L") {
      const end = descriptor.indexOf(";", index);
      if (end < 0) throw invalid();
      name = simpleTypeName(descriptor.slice(index + 1, end));
      index = end + 1;
    } else {
      const primitive = PRIMITIVES[code];
      if (primitive === undefined) throw invalid();
      name = primitive;
      index++;
    }
    types.push(name + "[]".repeat(dimensions));
  }
  return types;
}

/** A readable signature such as `checkout(String, int[])`; constructors take their class's simple name. */
export function methodSignature(method: JvmMethodRange, className: string): string {
  if (method.name === "<clinit>") return "static {}";
  const name = method.name === "<init>" ? className.slice(Math.max(className.lastIndexOf("."), className.lastIndexOf("$")) + 1) : method.name;
  return `${name}(${parameterTypes(method.descriptor).join(", ")})`;
}

export type ClassSelection = {
  className: string;
  /** A method selector, or "" for none. */
  method: string;
  /** A bytecode line to reveal, or 0 for none. */
  line: number;
};

export type ClassFocusInput = ClassSelection & {
  methods: readonly JvmMethodRange[];
  sourceLineCount: number;
  sourceLineNumbers: readonly number[];
};

function placeable(method: JvmMethodRange, sourceLineCount: number): boolean {
  return method.line >= 1 && method.endLine >= method.line && method.endLine <= sourceLineCount;
}

function methodFocus({ className, method, methods, sourceLineCount }: ClassFocusInput): ClassFocus {
  const selected = selectMethod(methods, method);
  if (selected) {
    if (placeable(selected, sourceLineCount)) return { highlightRow: -1, range: { startLine: selected.line, endLine: selected.endLine } };
    return {
      highlightRow: -1,
      range: null,
      note: `${selected.name} is placed at lines ${selected.line}-${selected.endLine}, outside the ${sourceLineCount} decompiled lines.`,
    };
  }
  const name = bareMethodName(method);
  const overloads = methods.filter((candidate) => candidate.name === name);
  if (overloads.length > 1) {
    const starts = overloads.filter((overload) => placeable(overload, sourceLineCount)).map((overload) => overload.line);
    return {
      highlightRow: starts.length > 0 ? Math.min(...starts) - 1 : -1,
      range: null,
      note: `${name} has ${overloads.length} overloads, so none is folded open; the first is highlighted. Pick one from the method list.`,
    };
  }
  return { highlightRow: -1, range: null, note: `${className} has no method ${method} that the decompiler could place.` };
}

/**
 * What the class view shows for a selection: the named method folded open, or
 * the linked line highlighted. A method wins when a link carries both.
 */
export function classFocus(input: ClassFocusInput): ClassFocus {
  if (input.method.trim() !== "") return methodFocus(input);
  if (input.line <= 0) return { highlightRow: -1, range: null };
  const row = rowForLine(input.sourceLineNumbers, input.line);
  if (row < 0 || row >= input.sourceLineCount) {
    return { highlightRow: -1, range: null, note: `Line ${input.line} is not in the decompiled source of ${input.className}.` };
  }
  return { highlightRow: row, range: null };
}
