import path from "node:path";

import ts from "typescript";

export type GuidanceHost = {
  read(file: string): string | undefined;
  resolve(importer: string, specifier: string): string | undefined;
};

export type StaticBindings = Map<string, unknown>;

type ImportBinding = {
  file: string;
  name: string;
};

type ModuleRecord = {
  source: ts.SourceFile;
  declarations: Map<string, ts.Expression>;
  functions: Map<string, ts.FunctionLikeDeclaration>;
  imports: Map<string, ImportBinding>;
  defaultExport?: ts.FunctionLikeDeclaration;
};

export type ResolvedComponent = {
  file: string;
  declaration: ts.FunctionLikeDeclaration;
};

export function memoryGuidanceHost(files: Record<string, string>): GuidanceHost {
  const normalized = new Map(
    Object.entries(files).map(([file, source]) => [path.posix.normalize(file), source]),
  );
  const extensions = ["", ".tsx", ".ts", ".jsx", ".js"];

  return {
    read: (file) => normalized.get(path.posix.normalize(file)),
    resolve(importer, specifier) {
      if (!specifier.startsWith(".")) return undefined;
      const base = path.posix.resolve(path.posix.dirname(importer), specifier);
      for (const extension of extensions) {
        const direct = path.posix.normalize(`${base}${extension}`);
        if (normalized.has(direct)) return direct;
      }
      for (const extension of extensions.slice(1)) {
        const index = path.posix.join(base, `index${extension}`);
        if (normalized.has(index)) return index;
      }
      return undefined;
    },
  };
}

export class StaticModuleGraph {
  readonly dependencies = new Set<string>();
  private readonly modules = new Map<string, ModuleRecord>();

  constructor(private readonly host: GuidanceHost) {}

  source(file: string): ts.SourceFile {
    return this.module(file).source;
  }

  defaultComponent(file: string): ResolvedComponent {
    const declaration = this.module(file).defaultExport;
    if (!declaration) throw new Error(`${file}: missing a statically analyzable default component`);
    return { file, declaration };
  }

  resolveComponent(file: string, name: string): ResolvedComponent | undefined {
    const module = this.module(file);
    const local = module.functions.get(name);
    if (local) return { file, declaration: local };

    const imported = module.imports.get(name);
    if (!imported) return undefined;
    const target = this.module(imported.file);
    const declaration =
      imported.name === "default" ? target.defaultExport : target.functions.get(imported.name);
    return declaration ? { file: imported.file, declaration } : undefined;
  }

  evaluate(file: string, node: ts.Node | undefined, bindings: StaticBindings): unknown {
    if (!node) return undefined;
    const expression = unwrapExpression(node);
    if (ts.isStringLiteralLike(expression) || ts.isNumericLiteral(expression)) {
      return ts.isNumericLiteral(expression) ? Number(expression.text) : expression.text;
    }
    if (expression.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (expression.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (expression.kind === ts.SyntaxKind.NullKeyword) return null;

    if (ts.isIdentifier(expression)) {
      if (bindings.has(expression.text)) return bindings.get(expression.text);
      return this.evaluateIdentifier(file, expression.text, bindings);
    }
    if (ts.isArrayLiteralExpression(expression)) {
      return expression.elements.flatMap((element) => {
        if (ts.isSpreadElement(element)) {
          const value = this.evaluate(file, element.expression, bindings);
          if (!Array.isArray(value)) this.fail(file, element, "array spread is not static");
          return value;
        }
        return [this.evaluate(file, element, bindings)];
      });
    }
    if (ts.isObjectLiteralExpression(expression)) {
      const result: Record<string, unknown> = {};
      for (const property of expression.properties) {
        if (ts.isSpreadAssignment(property)) {
          const value = this.evaluate(file, property.expression, bindings);
          if (!isRecord(value)) this.fail(file, property, "object spread is not static");
          Object.assign(result, value);
          continue;
        }
        if (ts.isShorthandPropertyAssignment(property)) {
          result[property.name.text] = this.evaluate(file, property.name, bindings);
          continue;
        }
        if (!ts.isPropertyAssignment(property)) this.fail(file, property, "unsupported object member");
        result[propertyName(property.name)] = this.evaluate(file, property.initializer, bindings);
      }
      return result;
    }
    if (ts.isPropertyAccessExpression(expression)) {
      const owner = this.evaluate(file, expression.expression, bindings);
      if (!isRecord(owner) && !Array.isArray(owner)) return undefined;
      return owner[expression.name.text as keyof typeof owner];
    }
    if (ts.isElementAccessExpression(expression)) {
      const owner = this.evaluate(file, expression.expression, bindings);
      const key = this.evaluate(file, expression.argumentExpression, bindings);
      if ((!isRecord(owner) && !Array.isArray(owner)) || (typeof key !== "string" && typeof key !== "number")) {
        return undefined;
      }
      return owner[key as keyof typeof owner];
    }
    if (ts.isTemplateExpression(expression)) {
      let value = expression.head.text;
      for (const span of expression.templateSpans) {
        value += `${this.evaluate(file, span.expression, bindings) ?? ""}${span.literal.text}`;
      }
      return value;
    }
    if (ts.isNoSubstitutionTemplateLiteral(expression)) return expression.text;
    if (ts.isConditionalExpression(expression)) {
      return this.evaluate(file, this.truthy(file, expression.condition, bindings) ? expression.whenTrue : expression.whenFalse, bindings);
    }
    if (ts.isPrefixUnaryExpression(expression) && expression.operator === ts.SyntaxKind.ExclamationToken) {
      return !this.truthy(file, expression.operand, bindings);
    }
    if (ts.isBinaryExpression(expression)) return this.evaluateBinary(file, expression, bindings);
    if (
      ts.isCallExpression(expression) &&
      ts.isPropertyAccessExpression(expression.expression) &&
      expression.expression.name.text === "map"
    ) {
      const values = this.evaluate(file, expression.expression.expression, bindings);
      if (!Array.isArray(values)) return undefined;
      const callback = expression.arguments[0];
      if (!callback || (!ts.isArrowFunction(callback) && !ts.isFunctionExpression(callback))) {
        return values.map(() => undefined);
      }
      return values.map((value, index) => {
        const callbackBindings = new Map(bindings);
        callback.parameters.forEach((parameter, parameterIndex) => {
          this.bindName(
            parameter.name,
            [value, index, values][parameterIndex],
            callbackBindings,
          );
        });
        const body = ts.isBlock(callback.body)
          ? callback.body.statements.find(ts.isReturnStatement)?.expression
          : callback.body;
        return this.evaluate(file, body, callbackBindings);
      });
    }
    if (ts.isJsxElement(expression) || ts.isJsxFragment(expression) || ts.isJsxSelfClosingElement(expression)) {
      return this.jsxText(file, expression, bindings);
    }
    return undefined;
  }

  jsxText(file: string, node: ts.Node, bindings: StaticBindings): string {
    if (ts.isJsxText(node)) return normalizeText(node.text);
    if (ts.isJsxExpression(node)) {
      const value = this.evaluate(file, node.expression, bindings);
      return scalarText(value);
    }
    if (ts.isJsxSelfClosingElement(node)) return "";
    if (ts.isJsxElement(node)) {
      return node.children.map((child) => this.jsxText(file, child, bindings)).filter(Boolean).join(" ");
    }
    if (ts.isJsxFragment(node)) {
      return node.children.map((child) => this.jsxText(file, child, bindings)).filter(Boolean).join(" ");
    }
    return scalarText(this.evaluate(file, node, bindings));
  }

  returnExpression(declaration: ts.FunctionLikeDeclaration): ts.Expression | undefined {
    if (!declaration.body) return undefined;
    if (!ts.isBlock(declaration.body)) return declaration.body;
    for (const statement of declaration.body.statements) {
      if (ts.isReturnStatement(statement)) return statement.expression;
    }
    return undefined;
  }

  bindParameters(
    declaration: ts.FunctionLikeDeclaration,
    props: Record<string, unknown>,
  ): StaticBindings {
    const bindings: StaticBindings = new Map();
    const parameter = declaration.parameters[0];
    if (!parameter) return bindings;
    if (ts.isIdentifier(parameter.name)) {
      bindings.set(parameter.name.text, props);
      return bindings;
    }
    if (ts.isObjectBindingPattern(parameter.name)) {
      for (const element of parameter.name.elements) {
        if (!ts.isIdentifier(element.name)) continue;
        const key = element.propertyName ? propertyName(element.propertyName) : element.name.text;
        const value = props[key];
        bindings.set(
          element.name.text,
          value === undefined && element.initializer
            ? this.evaluate(declaration.getSourceFile().fileName, element.initializer, bindings)
            : value,
        );
      }
    }
    return bindings;
  }

  location(file: string, node: ts.Node): string {
    const source = this.source(file);
    return `${file}:${source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1}`;
  }

  private evaluateIdentifier(file: string, name: string, bindings: StaticBindings): unknown {
    const module = this.module(file);
    const declaration = module.declarations.get(name);
    if (declaration) return this.evaluate(file, declaration, bindings);
    const imported = module.imports.get(name);
    if (!imported) return undefined;
    const target = this.module(imported.file);
    const initializer = target.declarations.get(imported.name);
    return initializer ? this.evaluate(imported.file, initializer, new Map()) : undefined;
  }

  private bindName(name: ts.BindingName, value: unknown, bindings: StaticBindings) {
    if (ts.isIdentifier(name)) {
      bindings.set(name.text, value);
      return;
    }
    if (ts.isObjectBindingPattern(name) && isRecord(value)) {
      for (const element of name.elements) {
        const key = element.propertyName
          ? propertyName(element.propertyName)
          : ts.isIdentifier(element.name)
            ? element.name.text
            : "";
        this.bindName(element.name, value[key], bindings);
      }
      return;
    }
    if (ts.isArrayBindingPattern(name) && Array.isArray(value)) {
      name.elements.forEach((element, index) => {
        if (ts.isBindingElement(element)) this.bindName(element.name, value[index], bindings);
      });
    }
  }

  private truthy(file: string, node: ts.Node, bindings: StaticBindings): boolean {
    return Boolean(this.evaluate(file, node, bindings));
  }

  private evaluateBinary(file: string, expression: ts.BinaryExpression, bindings: StaticBindings) {
    const left = this.evaluate(file, expression.left, bindings);
    const right = this.evaluate(file, expression.right, bindings);
    switch (expression.operatorToken.kind) {
      case ts.SyntaxKind.PlusToken:
        return typeof left === "number" && typeof right === "number"
          ? left + right
          : `${scalarText(left)}${scalarText(right)}`;
      case ts.SyntaxKind.EqualsEqualsEqualsToken:
      case ts.SyntaxKind.EqualsEqualsToken:
        return left === right;
      case ts.SyntaxKind.ExclamationEqualsEqualsToken:
      case ts.SyntaxKind.ExclamationEqualsToken:
        return left !== right;
      case ts.SyntaxKind.AmpersandAmpersandToken:
        return left && right;
      case ts.SyntaxKind.BarBarToken:
        return left || right;
      default:
        return undefined;
    }
  }

  private module(file: string): ModuleRecord {
    const cached = this.modules.get(file);
    if (cached) return cached;
    const text = this.host.read(file);
    if (text === undefined) throw new Error(`cannot read guidance source ${file}`);
    this.dependencies.add(file);
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, scriptKind(file));
    const record: ModuleRecord = {
      source,
      declarations: new Map(),
      functions: new Map(),
      imports: new Map(),
    };
    this.modules.set(file, record);

    for (const statement of source.statements) {
      if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
        this.indexImport(file, record, statement);
      } else if (ts.isVariableStatement(statement)) {
        for (const declaration of statement.declarationList.declarations) {
          if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
          record.declarations.set(declaration.name.text, declaration.initializer);
          if (ts.isArrowFunction(declaration.initializer) || ts.isFunctionExpression(declaration.initializer)) {
            record.functions.set(declaration.name.text, declaration.initializer);
          }
        }
      } else if (ts.isFunctionDeclaration(statement) && statement.name) {
        record.functions.set(statement.name.text, statement);
        if (hasModifier(statement, ts.SyntaxKind.DefaultKeyword)) record.defaultExport = statement;
      } else if (ts.isExportAssignment(statement)) {
        const target = unwrapExpression(statement.expression);
        if (ts.isIdentifier(target)) {
          const declaration = record.functions.get(target.text);
          if (declaration) record.defaultExport = declaration;
        }
        if (ts.isArrowFunction(target) || ts.isFunctionExpression(target)) record.defaultExport = target;
      }
    }
    return record;
  }

  private indexImport(file: string, record: ModuleRecord, declaration: ts.ImportDeclaration) {
    if (!ts.isStringLiteral(declaration.moduleSpecifier)) return;
    const resolved = this.host.resolve(file, declaration.moduleSpecifier.text);
    if (!resolved || !declaration.importClause) return;
    if (declaration.importClause.name) {
      record.imports.set(declaration.importClause.name.text, { file: resolved, name: "default" });
    }
    const bindings = declaration.importClause.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) return;
    for (const element of bindings.elements) {
      record.imports.set(element.name.text, {
        file: resolved,
        name: element.propertyName?.text ?? element.name.text,
      });
    }
  }

  private fail(file: string, node: ts.Node, message: string): never {
    throw new Error(`${message} at ${this.location(file, node)}`);
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function scalarText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  return "";
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function propertyName(name: ts.PropertyName | ts.BindingName): string {
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  throw new Error(`unsupported computed property ${name.getText()}`);
}

function unwrapExpression(node: ts.Node): ts.Node {
  let current = node;
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isNonNullExpression(current) ||
    ts.isTypeAssertionExpression(current)
  ) {
    current = current.expression;
  }
  return current;
}

function hasModifier(node: ts.Node, kind: ts.SyntaxKind): boolean {
  return ts.canHaveModifiers(node) && ts.getModifiers(node)?.some((modifier) => modifier.kind === kind) === true;
}

function scriptKind(file: string): ts.ScriptKind {
  if (file.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (file.endsWith(".jsx")) return ts.ScriptKind.JSX;
  if (file.endsWith(".js")) return ts.ScriptKind.JS;
  return ts.ScriptKind.TS;
}
