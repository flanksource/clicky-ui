import { existsSync, globSync, readFileSync, realpathSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import ts from "typescript";

type Scope = Map<string, () => unknown>;
type MetadataModule = { scope: Scope; exports: Scope };
export type MetadataGlob = { directory: string; pattern: string };
type Options = { file: string; roots: readonly string[]; names?: readonly string[]; onRead?: (file: string) => void; onGlob?: (glob: MetadataGlob) => void };

/** Reads only the expressions reachable from metadata exports; page and preview code never executes. */
export function readStaticExports(options: Options): Record<string, unknown> {
  const reader = new MetadataReader(options);
  const exports = reader.module(options.file).exports;
  return Object.fromEntries((options.names ?? [...exports.keys()]).filter(name => exports.has(name)).map(name => [name, exports.get(name)!()]));
}

class MetadataReader {
  private readonly modules = new Map<string, MetadataModule>();
  private readonly roots: string[];
  private remaining = 100_000;

  constructor(private readonly options: Options) {
    this.roots = options.roots.map(root => realpathSync(root));
  }

  private authorize(file: string): string {
    const path = realpathSync(file);
    if (!this.roots.some(root => path === root || path.startsWith(root + sep))) throw new Error(`metadata source outside declared roots: ${path}`);
    return path;
  }

  private resolveFile(file: string, specifier: string): string {
    if (!specifier.startsWith(".") && !isAbsolute(specifier)) throw new Error(`${file}: metadata cannot import ${specifier}`);
    const path = resolve(dirname(file), specifier);
    const found = [path, ...[".ts", ".tsx", ".js", ".json", "/index.ts", "/index.tsx"].map(extension => path + extension)].find(candidate => existsSync(candidate) && statSync(candidate).isFile());
    if (!found) throw new Error(`${file}: metadata import not found: ${specifier}`);
    return this.authorize(found);
  }

  module(input: string): MetadataModule {
    const file = this.authorize(input);
    const cached = this.modules.get(file);
    if (cached) return cached;
    this.options.onRead?.(file);
    const module: MetadataModule = { scope: new Map(), exports: new Map() };
    this.modules.set(file, module);
    if (file.endsWith(".json")) {
      const value: unknown = JSON.parse(readFileSync(file, "utf8"));
      module.exports.set("default", () => value);
      return module;
    }
    const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    for (const statement of source.statements) this.index(statement, module);
    return module;
  }

  private index(statement: ts.Statement, module: MetadataModule): void {
    const exported = ts.canHaveModifiers(statement) && ts.getModifiers(statement)?.some(modifier => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
        const getter = this.lazy(declaration.initializer, module.scope);
        module.scope.set(declaration.name.text, getter);
        if (exported) module.exports.set(declaration.name.text, getter);
      }
    } else if (ts.isFunctionDeclaration(statement) && statement.name) {
      const getter = () => this.callable(statement, module.scope);
      module.scope.set(statement.name.text, getter);
      if (exported) module.exports.set(statement.name.text, getter);
    } else if (ts.isExportAssignment(statement)) {
      module.exports.set("default", this.lazy(statement.expression, module.scope));
    } else if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const entry of statement.exportClause.elements) {
        module.exports.set(entry.name.text, () => this.lookup(module.scope, entry.propertyName?.text ?? entry.name.text, entry));
      }
    } else if (ts.isImportDeclaration(statement) && statement.importClause && !statement.importClause.isTypeOnly && ts.isStringLiteral(statement.moduleSpecifier)) {
      const specifier = statement.moduleSpecifier.text;
      const clause = statement.importClause;
      const bind = (local: string, name: string) => module.scope.set(local, () => {
        if (specifier === "@flanksource/clicky-ui/icons") return name;
        const target = this.module(this.resolveFile(statement.getSourceFile().fileName, specifier)).exports;
        return this.lookup(target, name, statement);
      });
      if (clause.name) bind(clause.name.text, "default");
      if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const entry of clause.namedBindings.elements) if (!entry.isTypeOnly) bind(entry.name.text, entry.propertyName?.text ?? entry.name.text);
      }
    }
  }

  private lazy(node: ts.Expression, scope: Scope): () => unknown {
    let state: "new" | "reading" | "done" = "new";
    let value: unknown;
    return () => {
      if (state === "reading") this.fail(node, "cyclic metadata binding");
      if (state === "new") {
        state = "reading";
        value = this.evaluate(node, scope);
        state = "done";
      }
      return value;
    };
  }

  private lookup(scope: Scope, name: string, node: ts.Node): unknown {
    const getter = scope.get(name);
    if (!getter) this.fail(node, `unknown metadata binding ${name}`);
    return getter();
  }

  private evaluate(node: ts.Expression, scope: Scope): unknown {
    if (--this.remaining < 0) this.fail(node, "metadata evaluation budget exceeded");
    if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isSatisfiesExpression(node) || ts.isNonNullExpression(node) || ts.isTypeAssertionExpression(node)) return this.evaluate(node.expression, scope);
    if (ts.isStringLiteralLike(node)) return node.text;
    if (ts.isNumericLiteral(node)) return Number(node.text);
    if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
    if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
    if (node.kind === ts.SyntaxKind.NullKeyword) return null;
    if (ts.isIdentifier(node)) {
      if (node.text === "undefined") return undefined;
      return this.lookup(scope, node.text, node);
    }
    if (ts.isObjectLiteralExpression(node)) return this.object(node, scope);
    if (ts.isArrayLiteralExpression(node)) return node.elements.flatMap(element => {
      if (!ts.isSpreadElement(element)) return [this.evaluate(element, scope)];
      const values = this.evaluate(element.expression, scope);
      if (!Array.isArray(values)) this.fail(element, "metadata array spread requires an array");
      return values;
    });
    if (ts.isPropertyAccessExpression(node)) return this.property(this.evaluate(node.expression, scope), node.name.text, node);
    if (ts.isElementAccessExpression(node)) return this.property(this.evaluate(node.expression, scope), this.evaluate(node.argumentExpression, scope), node);
    if (ts.isTemplateExpression(node)) return node.head.text + node.templateSpans.map(span => String(this.evaluate(span.expression, scope)) + span.literal.text).join("");
    if (ts.isConditionalExpression(node)) return this.evaluate(this.evaluate(node.condition, scope) ? node.whenTrue : node.whenFalse, scope);
    if (ts.isPrefixUnaryExpression(node)) {
      const value = this.evaluate(node.operand, scope);
      if (node.operator === ts.SyntaxKind.ExclamationToken) return !value;
      if (node.operator === ts.SyntaxKind.MinusToken && typeof value === "number") return -value;
    }
    if (ts.isBinaryExpression(node)) return this.binary(node, scope);
    if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) return this.callable(node, scope);
    if (ts.isCallExpression(node)) return this.call(node, scope);
    this.fail(node, `unsupported metadata expression ${ts.SyntaxKind[node.kind]}`);
  }

  private object(node: ts.ObjectLiteralExpression, scope: Scope): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const entry of node.properties) {
      if (ts.isSpreadAssignment(entry)) {
        const value = this.evaluate(entry.expression, scope);
        if (value !== null && typeof value === "object" && !Array.isArray(value)) Object.assign(result, value);
        else this.fail(entry, "metadata object spread requires an object");
      } else if (ts.isShorthandPropertyAssignment(entry)) {
        result[entry.name.text] = this.lookup(scope, entry.name.text, entry);
      } else if (ts.isPropertyAssignment(entry)) {
        const key = ts.isComputedPropertyName(entry.name) ? this.evaluate(entry.name.expression, scope) : entry.name.getText().replace(/^["']|["']$/g, "");
        if (typeof key !== "string" && typeof key !== "number") this.fail(entry, "invalid metadata property");
        Object.defineProperty(result, key, { value: this.evaluate(entry.initializer, scope), enumerable: true, configurable: true, writable: true });
      } else this.fail(entry, "unsupported metadata object member");
    }
    return result;
  }

  private property(value: unknown, key: unknown, node: ts.Node): unknown {
    if ((typeof key !== "string" && typeof key !== "number") || value === null || value === undefined) this.fail(node, "invalid metadata property access");
    if (key === "length" && (Array.isArray(value) || typeof value === "string")) return value.length;
    if (typeof value !== "object") this.fail(node, "metadata property requires an object");
    return Object.hasOwn(value, key) ? (value as Record<string | number, unknown>)[key] : undefined;
  }

  private binary(node: ts.BinaryExpression, scope: Scope): unknown {
    const left = this.evaluate(node.left, scope);
    const right = () => this.evaluate(node.right, scope);
    switch (node.operatorToken.kind) {
      case ts.SyntaxKind.AmpersandAmpersandToken: return left && right();
      case ts.SyntaxKind.BarBarToken: return left || right();
      case ts.SyntaxKind.QuestionQuestionToken: return left ?? right();
      case ts.SyntaxKind.EqualsEqualsEqualsToken: return left === right();
      case ts.SyntaxKind.ExclamationEqualsEqualsToken: return left !== right();
      case ts.SyntaxKind.PlusToken: { const value = right(); return typeof left === "number" && typeof value === "number" ? left + value : String(left) + String(value); }
      case ts.SyntaxKind.InKeyword: { const value = right(); if (typeof left === "string" && value && typeof value === "object") return Object.hasOwn(value, left); break; }
    }
    this.fail(node, "unsupported metadata operator");
  }

  private bind(name: ts.BindingName, value: unknown, scope: Scope): void {
    if (ts.isIdentifier(name)) { scope.set(name.text, () => value); return; }
    name.elements.forEach((entry, index) => {
      if (!ts.isBindingElement(entry)) return;
      const key = ts.isArrayBindingPattern(name) ? index : entry.propertyName?.getText() ?? entry.name.getText();
      this.bind(entry.name, this.property(value, key, entry), scope);
    });
  }

  private callable(node: ts.FunctionLikeDeclaration, outer: Scope): (...args: unknown[]) => unknown {
    return (...args) => {
      const scope = new Map(outer);
      node.parameters.forEach((parameter, index) => this.bind(parameter.name, args[index] === undefined && parameter.initializer ? this.evaluate(parameter.initializer, scope) : args[index], scope));
      if (!node.body) this.fail(node, "metadata function has no body");
      return ts.isBlock(node.body) ? this.block(node.body.statements, scope).value : this.evaluate(node.body, scope);
    };
  }

  private block(statements: readonly ts.Statement[], scope: Scope): { returned: boolean; value?: unknown } {
    for (const statement of statements) {
      if (ts.isReturnStatement(statement)) return { returned: true, value: statement.expression ? this.evaluate(statement.expression, scope) : undefined };
      if (ts.isVariableStatement(statement)) this.index(statement, { scope, exports: new Map() });
      else if (ts.isThrowStatement(statement)) this.fail(statement, `metadata assertion failed: ${statement.expression.getText()}`);
      else if (ts.isIfStatement(statement)) {
        const branch = this.evaluate(statement.expression, scope) ? statement.thenStatement : statement.elseStatement;
        if (branch) { const result = this.block(ts.isBlock(branch) ? branch.statements : [branch], scope); if (result.returned) return result; }
      } else if (!ts.isVariableStatement(statement)) this.fail(statement, "unsupported metadata function statement");
    }
    return { returned: false };
  }

  private call(node: ts.CallExpression, scope: Scope): unknown {
    const callee = node.expression;
    if (ts.isPropertyAccessExpression(callee)) {
      if (callee.expression.getText() === "import.meta" && callee.name.text === "glob") return this.glob(node, scope);
      const args = node.arguments.map(argument => this.evaluate(argument, scope));
      if (callee.expression.getText() === "Object" && callee.name.text === "entries" && args[0] && typeof args[0] === "object") return Object.entries(args[0]);
      const owner = this.evaluate(callee.expression, scope);
      const method = callee.name.text;
      if (Array.isArray(owner)) {
        const callback = args[0];
        if (["map", "flatMap", "filter", "find", "every", "some", "sort"].includes(method) && typeof callback === "function") {
          switch (method) {
            case "map": return owner.map((...values) => callback(...values));
            case "flatMap": return owner.flatMap((...values) => callback(...values));
            case "filter": return owner.filter((...values) => callback(...values));
            case "find": return owner.find((...values) => callback(...values));
            case "every": return owner.every((...values) => callback(...values));
            case "some": return owner.some((...values) => callback(...values));
            case "sort": return [...owner].sort((a, b) => Number(callback(a, b)));
          }
        }
        if (method === "includes") return owner.includes(args[0]);
        if (method === "join" && typeof args[0] === "string") return owner.join(args[0]);
      }
      if (typeof owner === "string" && method === "localeCompare" && typeof args[0] === "string") return owner.localeCompare(args[0]);
      this.fail(node, `unsupported metadata method ${method}`);
    }
    const fn = this.evaluate(callee, scope);
    if (typeof fn !== "function") this.fail(node, "metadata call requires a static function");
    return fn(...node.arguments.map(argument => this.evaluate(argument, scope)));
  }

  private glob(node: ts.CallExpression, scope: Scope): Record<string, unknown> {
    const pattern = node.arguments[0] && this.evaluate(node.arguments[0], scope);
    if (typeof pattern !== "string" || !pattern.startsWith(".")) this.fail(node, "metadata glob requires a relative literal pattern");
    const options = node.arguments[1] ? this.evaluate(node.arguments[1], scope) : {};
    const eager = options && typeof options === "object" && "eager" in options && options.eager === true;
    const cwd = dirname(node.getSourceFile().fileName);
    this.options.onGlob?.({ directory: cwd, pattern });
    const files = globSync(pattern, { cwd }).sort();
    return Object.fromEntries(files.map(file => {
      const absolute = this.authorize(resolve(cwd, file));
      this.options.onRead?.(absolute);
      const key = relative(cwd, absolute).split(sep).join("/");
      const value = eager ? this.module(absolute).exports.get("default")?.() : { source: absolute };
      return [key.startsWith(".") ? key : `./${key}`, value];
    }));
  }

  private fail(node: ts.Node, message: string): never {
    const source = node.getSourceFile();
    const location = source.getLineAndCharacterOfPosition(node.getStart(source));
    throw new Error(`${source.fileName}:${location.line + 1}:${location.character + 1}: ${message}`);
  }
}
