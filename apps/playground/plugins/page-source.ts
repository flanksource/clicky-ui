import ts from "typescript";

export function rewritePageTitle(source: string, title: string): string {
  if (title.trim() === "") throw new Error("a non-empty page title is required");

  const file = ts.createSourceFile(
    "page.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  for (const statement of file.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    if (!statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== "meta") continue;
      if (!declaration.initializer || !ts.isObjectLiteralExpression(declaration.initializer)) break;

      const titleProperty = declaration.initializer.properties.find(
        (property): property is ts.PropertyAssignment =>
          ts.isPropertyAssignment(property) &&
          ((ts.isIdentifier(property.name) && property.name.text === "title") ||
            (ts.isStringLiteral(property.name) && property.name.text === "title")),
      );
      if (!titleProperty || !ts.isStringLiteralLike(titleProperty.initializer)) break;

      return `${source.slice(0, titleProperty.initializer.getStart(file))}${JSON.stringify(title)}${source.slice(titleProperty.initializer.getEnd())}`;
    }
  }

  throw new Error(
    "page rename requires an exported object with a simple string-literal meta.title",
  );
}
