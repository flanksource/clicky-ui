import ts from "typescript";

import { editableOpeningNodes, parseTsx, type EditableOpeningNode } from "./editable-jsx";
import { validSource } from "./reviewable-source";

export type VisualRefusalReason = "computed" | "spread" | "not-found" | "unchanged" | "entity";

export type VisualEdited = { status: "edited"; source: string; line: number; column: number };
export type VisualRefused = { status: "refused"; reason: VisualRefusalReason; line: number; column: number };
export type TextCandidate = { id: string; file: string; line: number; column: number; context: string };
export type VisualAmbiguous = { status: "ambiguous"; candidates: TextCandidate[] };

export type SetTextInput = {
  /** Every module of the page's graph, keyed by an opaque stable path (the server uses paths relative to `src/pages`). */
  files: ReadonlyMap<string, string>;
  callSiteFile: string;
  ordinal: number;
  prop: string;
  from: string;
  to: string;
  /** A candidate id from an earlier `ambiguous` outcome. */
  choose?: string;
};

export type SetTextOutcome =
  | (VisualEdited & { file: string })
  | (VisualRefused & { file: string })
  | VisualAmbiguous;

type TextEdit = { start: number; end: number; text: string };
type Literal = ts.StringLiteral | ts.NoSubstitutionTemplateLiteral;
type TextNode = Literal | ts.JsxText;

const ENTITY = /&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);/i;
const BRAND_COMPONENTS = new Set(["BrandBox", "BrandContainer"]);
const normalise = (text: string) => text.trim().replace(/\s+/g, " ");
const NAMED_ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Decodes the entities JSX text commonly carries, so rendered text can be matched back to source. */
function decodeEntities(text: string): string {
  return text.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z][a-z0-9]*));/gi, (match, dec, hex, name) =>
    dec ? String.fromCodePoint(Number(dec)) : hex ? String.fromCodePoint(parseInt(hex, 16)) : (NAMED_ENTITIES[name] ?? match),
  );
}

export function assertStyleValue(value: unknown): string {
  if (typeof value !== "string" || value.trim() === "" || /["'`\\\r\n]/.test(value)) {
    throw new Error(`invalid style value ${JSON.stringify(value)}: expected a non-empty string without quotes, backslashes or newlines`);
  }
  return value;
}

function splice(source: string, { start, end, text }: TextEdit): string {
  return `${source.slice(0, start)}${text}${source.slice(end)}`;
}

function position(sourceFile: ts.SourceFile, offset: number): { line: number; column: number } {
  const { line, character } = sourceFile.getLineAndCharacterOfPosition(offset);
  return { line: line + 1, column: character + 1 };
}

function openingAt(sourceFile: ts.SourceFile, ordinal: number): EditableOpeningNode {
  const opening = editableOpeningNodes(sourceFile)[ordinal];
  if (!opening) throw new Error(`${sourceFile.fileName} has no editable element with ordinal ${ordinal}`);
  return opening;
}

function isLiteral(node: ts.Node | undefined): node is Literal {
  return node !== undefined && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node));
}

/** The literal a JSX attribute holds as `a="x"`, `a={"x"}` or ``a={`x`}``; undefined when it is computed. */
function attributeLiteral(attribute: ts.JsxAttribute): Literal | undefined {
  const value = attribute.initializer;
  if (isLiteral(value)) return value;
  return value && ts.isJsxExpression(value) && isLiteral(value.expression) ? value.expression : undefined;
}

function findAttribute(opening: EditableOpeningNode, sourceFile: ts.SourceFile, name: string) {
  const properties = opening.node.attributes.properties;
  const index = properties.findIndex((p) => ts.isJsxAttribute(p) && p.name.getText(sourceFile) === name);
  return { index, attribute: index >= 0 ? (properties[index] as ts.JsxAttribute) : undefined, properties };
}

function quoteLiteral(value: string, quote: string): string {
  if (quote === '"') return JSON.stringify(value);
  const escaped = value
    .replace(/\\/g, "\\\\")
    .replace(/\r/g, "\\r")
    .replace(/\n/g, "\\n")
    .replace(quote === "`" ? /`|\$\{/g : /'/g, (match) => `\\${match}`);
  return `${quote}${escaped}${quote}`;
}

/** An attribute value: the original quote when it can hold `to` verbatim, else `{"…"}`. */
function attributeValue(to: string, quote: string): string {
  return to.includes(quote) || /["\\\r\n]/.test(to) || ENTITY.test(to) ? `{${JSON.stringify(to)}}` : `${quote}${to}${quote}`;
}

function replaceLiteral(sourceFile: ts.SourceFile, literal: Literal, to: string): TextEdit | "entity" {
  const start = literal.getStart(sourceFile);
  const quote = sourceFile.text[start]!;
  const isAttributeValue = ts.isJsxAttribute(literal.parent) && literal.parent.initializer === literal;
  if (isAttributeValue && ENTITY.test(literal.text)) return "entity";
  return { start, end: literal.end, text: isAttributeValue ? attributeValue(to, quote) : quoteLiteral(to, quote) };
}

function edited(sourceFile: ts.SourceFile, edit: TextEdit, at: number): VisualEdited {
  return { status: "edited", source: validSource(splice(sourceFile.text, edit)), ...position(sourceFile, at) };
}

function refused(sourceFile: ts.SourceFile, reason: VisualRefusalReason, at: number): VisualRefused {
  return { status: "refused", reason, ...position(sourceFile, at) };
}

/** Sets a literal `variant`/`role` on the `ordinal`-th editable element, adding it when absent. */
export function setStyleProp(source: string, ordinal: number, prop: "variant" | "role", value: string): VisualEdited | VisualRefused {
  assertStyleValue(value);
  const sourceFile = parseTsx(source, "page.tsx");
  const opening = openingAt(sourceFile, ordinal);
  const { index, attribute, properties } = findAttribute(opening, sourceFile, prop);
  const spread = properties.find((p, i) => ts.isJsxSpreadAttribute(p) && i > index);
  if (spread) return refused(sourceFile, "spread", spread.getStart(sourceFile));
  if (!attribute) return edited(sourceFile, { start: opening.insertAt, end: opening.insertAt, text: ` ${prop}="${value}"` }, opening.start);

  const literal = attributeLiteral(attribute);
  if (!literal) return refused(sourceFile, "computed", attribute.getStart(sourceFile));
  if (literal.text === value) return refused(sourceFile, "unchanged", attribute.getStart(sourceFile));
  const edit = replaceLiteral(sourceFile, literal, value);
  return edit === "entity" ? refused(sourceFile, "entity", literal.getStart(sourceFile)) : edited(sourceFile, edit, literal.getStart(sourceFile));
}

function isNonDisplayLiteral(node: Literal): boolean {
  const parent = node.parent;
  if (
    ts.isImportDeclaration(parent) ||
    ts.isExportDeclaration(parent) ||
    ts.isExternalModuleReference(parent) ||
    ts.isLiteralTypeNode(parent) ||
    (ts.isPropertyAssignment(parent) && parent.name === node) ||
    (ts.isElementAccessExpression(parent) && parent.argumentExpression === node)
  ) {
    return true;
  }
  if (ts.isCallExpression(parent)) {
    const callee = parent.expression;
    if (callee.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(callee) && callee.text === "require")) return true;
  }
  const attribute = ts.isJsxAttribute(parent) ? parent : ts.isJsxExpression(parent) && ts.isJsxAttribute(parent.parent) ? parent.parent : undefined;
  const name = attribute?.name.getText();
  return name !== undefined && (name.startsWith("data-") || name === "className");
}

type FoundText = { file: string; sourceFile: ts.SourceFile; node: TextNode; start: number; end: number };

/** Span of a JsxText without its surrounding whitespace; other nodes span themselves. */
function textSpan(sourceFile: ts.SourceFile, node: TextNode): { start: number; end: number } {
  if (!ts.isJsxText(node)) return { start: node.getStart(sourceFile), end: node.end };
  const raw = sourceFile.text.slice(node.pos, node.end);
  return { start: node.pos + raw.length - raw.trimStart().length, end: node.pos + raw.trimEnd().length };
}

function findTexts(file: string, sourceFile: ts.SourceFile, from: string): FoundText[] {
  const wanted = normalise(from);
  const found: FoundText[] = [];
  const visit = (node: ts.Node): void => {
    const matches = ts.isJsxText(node)
      ? !node.containsOnlyTriviaWhiteSpaces && normalise(decodeEntities(node.text)) === wanted
      : isLiteral(node) && node.text === from && !isNonDisplayLiteral(node);
    if (matches) found.push({ file, sourceFile, node: node as TextNode, ...textSpan(sourceFile, node as TextNode) });
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

function toCandidate({ file, sourceFile, start }: FoundText): TextCandidate {
  const { line, column } = position(sourceFile, start);
  const context = sourceFile.text.split("\n")[line - 1]!.trim();
  return { id: `${file}:${start}`, file, line, column, context: context.length > 160 ? `${context.slice(0, 157)}...` : context };
}

/** Where `from` appears as displayable text in `files`, whitespace-normalised for JSX text. Backs the "external" diagnosis too. */
export function findTextCandidates(files: ReadonlyMap<string, string>, from: string): TextCandidate[] {
  return [...files].flatMap(([file, text]) => findTexts(file, parseTsx(text, file), from).map(toCandidate));
}

function editFound({ sourceFile, node, start, end }: FoundText, to: string): TextEdit | "entity" {
  if (!ts.isJsxText(node)) return replaceLiteral(sourceFile, node, to);
  if (ENTITY.test(sourceFile.text.slice(start, end))) return "entity";
  return { start, end, text: /[{}<>\r\n]/.test(to) || ENTITY.test(to) ? `{${JSON.stringify(to)}}` : to };
}

/**
 * Rewrites the text `from` shown by an editable element. Ranked: a literal
 * `prop` attribute on the call site; a missing brand `title`; then any
 * displayable text equal to `from` in the page's modules, the call-site file first.
 */
export function setText(input: SetTextInput): SetTextOutcome {
  const { files, callSiteFile, ordinal, prop, from, to, choose } = input;
  const callSource = files.get(callSiteFile);
  if (callSource === undefined) throw new Error(`call-site file ${callSiteFile} is not among the page's modules`);
  const callSite = parseTsx(callSource, callSiteFile);
  const opening = openingAt(callSite, ordinal);
  const refuse = (reason: VisualRefusalReason, at = opening.start): SetTextOutcome => ({ ...refused(callSite, reason, at), file: callSiteFile });
  const done = (sourceFile: ts.SourceFile, file: string, edit: TextEdit | "entity", at: number): SetTextOutcome =>
    edit === "entity"
      ? { ...refused(sourceFile, "entity", at), file }
      : { ...edited(sourceFile, edit, at), file };

  if (from === to) return refuse("unchanged");

  const { attribute } = findAttribute(opening, callSite, prop);
  const literal = attribute && attributeLiteral(attribute);
  if (literal && literal.text === from) return done(callSite, callSiteFile, replaceLiteral(callSite, literal, to), literal.getStart(callSite));

  if (prop === "title" && BRAND_COMPONENTS.has(opening.tag) && !attribute) {
    const text = ` title=${attributeValue(to, '"')}`;
    return done(callSite, callSiteFile, { start: opening.insertAt, end: opening.insertAt, text }, opening.start);
  }

  const here = findTexts(callSiteFile, callSite, from);
  const elsewhere = [...files]
    .filter(([file]) => file !== callSiteFile)
    .flatMap(([file, text]) => findTexts(file, parseTsx(text, file), from));
  if (choose !== undefined) {
    const chosen = [...here, ...elsewhere].find((found) => toCandidate(found).id === choose);
    if (!chosen) return refuse("not-found");
    return done(chosen.sourceFile, chosen.file, editFound(chosen, to), chosen.start);
  }
  const best = here.length > 0 ? here : elsewhere;
  if (best.length === 0) return refuse("not-found");
  if (best.length > 1) return { status: "ambiguous", candidates: best.map(toCandidate) };
  return done(best[0]!.sourceFile, best[0]!.file, editFound(best[0]!, to), best[0]!.start);
}
