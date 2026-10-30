import ts from "typescript";

/** Project metadata without evaluating the page's component or side effects. */
export function extractPageMeta(file: string, text: string): string {
  const source = ts.createSourceFile(
    file,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const host = ts.createCompilerHost({});
  host.getSourceFile = (name) => (name === file ? source : undefined);
  const program = ts.createProgram(
    [file],
    { noResolve: true, noLib: true },
    host,
  );
  const checker = program.getTypeChecker();
  const module = checker.getSymbolAtLocation(source);
  const exported =
    module &&
    checker.getExportsOfModule(module).find(({ name }) => name === "meta");
  if (!exported) return "export default undefined;";
  const symbol =
    exported.flags & ts.SymbolFlags.Alias
      ? checker.getAliasedSymbol(exported)
      : exported;
  const selected = new Set<ts.Node>();
  const imports = new Set<string>();

  function fail(node: ts.Node, message: string): never {
    const { line, character } = source.getLineAndCharacterOfPosition(
      node.getStart(source),
    );
    throw new Error(`${file}:${line + 1}:${character + 1}: ${message}`);
  }

  function include(declaration: ts.Declaration): void {
    if (declaration.getSourceFile() !== source) return;
    let top: ts.Node = declaration;
    while (top.parent && top.parent !== source) top = top.parent;
    if (ts.isImportDeclaration(top)) {
      if (
        ts.isImportSpecifier(declaration) ||
        ts.isNamespaceImport(declaration)
      )
        imports.add(declaration.name.text);
      else if (ts.isImportClause(declaration) && declaration.name)
        imports.add(declaration.name.text);
      else fail(declaration, "unsupported metadata import");
      return;
    }
    if (ts.isVariableStatement(top)) {
      if (!(top.declarationList.flags & ts.NodeFlags.Const))
        fail(top, "metadata dependencies must be const");
      const variable = top.declarationList.declarations.find(
        (candidate) =>
          candidate.pos <= declaration.pos && candidate.end >= declaration.end,
      );
      if (!variable || !ts.isIdentifier(variable.name) || !variable.initializer)
        fail(top, "unsupported metadata binding");
      visit(variable);
    } else if (ts.isFunctionDeclaration(top) && top.body) {
      visit(top);
    } else if (
      !ts.isInterfaceDeclaration(top) &&
      !ts.isTypeAliasDeclaration(top)
    ) {
      fail(
        top,
        "metadata must depend only on const bindings, functions and imports",
      );
    }
  }

  function visit(node: ts.Node): void {
    if (selected.has(node)) return;
    selected.add(node);
    function walk(child: ts.Node): void {
      if (ts.isTypeNode(child)) return;
      if (ts.isIdentifier(child)) {
        for (const declaration of checker.getSymbolAtLocation(child)
          ?.declarations ?? [])
          include(declaration);
      }
      ts.forEachChild(child, walk);
    }
    ts.forEachChild(node, walk);
  }

  for (const declaration of symbol.declarations ?? []) include(declaration);
  if (selected.size === 0) fail(source, "cannot project declared metadata");
  const printer = ts.createPrinter();
  const statements: string[] = [];
  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) {
      const clause = statement.importClause;
      if (!clause || clause.isTypeOnly) continue;
      const name =
        clause.name && imports.has(clause.name.text) ? clause.name : undefined;
      const bindings = clause.namedBindings;
      const named =
        bindings && ts.isNamedImports(bindings)
          ? ts.factory.updateNamedImports(
              bindings,
              bindings.elements.filter(
                (entry) => imports.has(entry.name.text) && !entry.isTypeOnly,
              ),
            )
          : bindings && imports.has(bindings.name.text)
            ? bindings
            : undefined;
      if (
        !name &&
        (!named || (ts.isNamedImports(named) && named.elements.length === 0))
      )
        continue;
      const updated = ts.factory.updateImportDeclaration(
        statement,
        statement.modifiers,
        ts.factory.updateImportClause(clause, false, name, named),
        statement.moduleSpecifier,
        statement.attributes,
      );
      statements.push(
        printer.printNode(ts.EmitHint.Unspecified, updated, source),
      );
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (selected.has(declaration))
          statements.push(`const ${declaration.getText(source)};`);
      }
    } else if (selected.has(statement)) {
      statements.push(statement.getText(source));
    }
  }
  statements.push(
    `if (${symbol.name} === null || typeof ${symbol.name} !== "object" || Array.isArray(${symbol.name})) throw new Error(${JSON.stringify(`${file}: declared meta must be an object`)});`,
    `export default ${symbol.name};`,
  );
  return statements.join("\n");
}
