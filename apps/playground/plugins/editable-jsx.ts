import ts from "typescript";

import { EDITABLE_SOURCE_ATTRIBUTE } from "./editable-source-marker";

export {
  EDITABLE_SOURCE_ATTRIBUTE,
  formatEditableSource,
  parseEditableSource,
  type EditableSourceMarker,
} from "./editable-source-marker";

export const EDITABLE_COMPONENTS = ["BoxNode", "ContainerNode", "BrandBox", "BrandContainer", "Tile", "Zone"] as const;
export type EditableComponent = (typeof EDITABLE_COMPONENTS)[number];

export type EditableOpening = {
  /** The facet component the tag resolves to, whatever it is renamed to locally. */
  tag: EditableComponent;
  ordinal: number;
  line: number;
  column: number;
  /** Offset of the opening tag's `<`. */
  start: number;
  /** Offset just after the last attribute (or tag name): inserting here wins over every spread. */
  insertAt: number;
};

export type EditableOpeningNode = EditableOpening & {
  node: ts.JsxOpeningElement | ts.JsxSelfClosingElement;
};

const FACET_MODULE = /^@flanksource\/facet(\/.*)?$/;

function isEditableComponent(name: string): name is EditableComponent {
  return (EDITABLE_COMPONENTS as readonly string[]).includes(name);
}

export function parseTsx(sourceText: string, fileName: string): ts.SourceFile {
  return ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
}

function facetBindings(sourceFile: ts.SourceFile) {
  const named = new Map<string, EditableComponent>();
  const namespaces = new Set<string>();
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
    if (!FACET_MODULE.test(statement.moduleSpecifier.text)) continue;
    const clause = statement.importClause;
    if (!clause || clause.isTypeOnly || !clause.namedBindings) continue;
    if (ts.isNamespaceImport(clause.namedBindings)) {
      namespaces.add(clause.namedBindings.name.text);
      continue;
    }
    for (const element of clause.namedBindings.elements) {
      const imported = (element.propertyName ?? element.name).text;
      if (!element.isTypeOnly && isEditableComponent(imported)) named.set(element.name.text, imported);
    }
  }
  return { named, namespaces };
}

/** Every editable facet opening in source order, with the AST node for callers that edit it. */
export function editableOpeningNodes(sourceFile: ts.SourceFile): EditableOpeningNode[] {
  const { named, namespaces } = facetBindings(sourceFile);
  const found: EditableOpeningNode[] = [];

  const resolveTag = (name: ts.JsxTagNameExpression): EditableComponent | undefined => {
    if (ts.isIdentifier(name)) return named.get(name.text);
    if (ts.isPropertyAccessExpression(name) && ts.isIdentifier(name.expression) && ts.isIdentifier(name.name)) {
      return namespaces.has(name.expression.text) && isEditableComponent(name.name.text) ? name.name.text : undefined;
    }
    return undefined;
  };

  const visit = (node: ts.Node): void => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = resolveTag(node.tagName);
      if (tag) {
        const start = node.getStart(sourceFile);
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(start);
        if (node.attributes.properties.some((p) => ts.isJsxAttribute(p) && p.name.getText(sourceFile) === EDITABLE_SOURCE_ATTRIBUTE)) {
          throw new Error(
            `${sourceFile.fileName}:${line + 1}:${character + 1} already authors ${EDITABLE_SOURCE_ATTRIBUTE}; it is injected at compile time, remove it`,
          );
        }
        const insertAt = node.attributes.properties.length > 0 ? node.attributes.end : (node.typeArguments?.end ?? node.tagName.end);
        found.push({ tag, ordinal: found.length, line: line + 1, column: character + 1, start, insertAt, node });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

export function editableOpenings(sourceText: string, fileName: string): EditableOpening[] {
  return editableOpeningNodes(parseTsx(sourceText, fileName)).map(({ node: _node, ...opening }) => opening);
}
