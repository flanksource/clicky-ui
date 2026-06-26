// Shared AST helpers for the `clicky-ui` oxlint plugin (see ./clicky-ui.js).
// Kept free of rule-specific logic so each predicate can be unit-tested in
// isolation (clicky-ui.test.ts).

/** Returns the string value of a string `Literal` node, else undefined. */
export function literalString(node) {
  if (node && node.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }
  return undefined;
}

/**
 * Returns the numeric value of a numeric `Literal` (incl. a unary `-` prefix,
 * e.g. `-1`), else undefined. Used to detect hardcoded `zIndex`/spacing values.
 */
export function numericLiteral(node) {
  if (node && node.type === "Literal" && typeof node.value === "number") {
    return node.value;
  }
  if (
    node &&
    node.type === "UnaryExpression" &&
    node.operator === "-" &&
    node.argument?.type === "Literal" &&
    typeof node.argument.value === "number"
  ) {
    return -node.argument.value;
  }
  return undefined;
}

/** Name of a JSX attribute (`className`, `style`, `role`, …) or undefined. */
export function attributeName(node) {
  return node?.name?.name;
}

/** Name of an intrinsic (lowercase) JSX element, else undefined. */
export function intrinsicElementName(opening) {
  const name = opening?.name;
  if (name?.type !== "JSXIdentifier") return undefined;
  const text = name.name;
  // Intrinsic DOM elements are lowercase; components are PascalCase.
  return typeof text === "string" && /^[a-z]/.test(text) ? text : undefined;
}

/**
 * Recursively collect every static string reachable from a JSX attribute value
 * — handles `"a b"`, `{`a ${x}`}`, and `{cn("a", cond && "b")}` so className
 * token rules see the same tokens regardless of how they are composed.
 */
export function collectStrings(node, out = []) {
  if (!node) return out;
  switch (node.type) {
    case "Literal":
      if (typeof node.value === "string") out.push(node.value);
      break;
    case "JSXExpressionContainer":
      collectStrings(node.expression, out);
      break;
    case "TemplateLiteral":
      for (const quasi of node.quasis) out.push(quasi.value.cooked ?? quasi.value.raw);
      break;
    case "CallExpression":
      for (const arg of node.arguments) collectStrings(arg, out);
      break;
    case "ArrayExpression":
      for (const el of node.elements) collectStrings(el, out);
      break;
    case "ObjectExpression":
      // clsx/cn object form: keys are the class names.
      for (const prop of node.properties) {
        if (prop.type === "Property") {
          if (prop.key?.type === "Literal") collectStrings(prop.key, out);
          else if (prop.key?.type === "Identifier") out.push(prop.key.name);
        }
      }
      break;
    case "LogicalExpression":
      collectStrings(node.left, out);
      collectStrings(node.right, out);
      break;
    case "ConditionalExpression":
      collectStrings(node.consequent, out);
      collectStrings(node.alternate, out);
      break;
    default:
      break;
  }
  return out;
}

/** Split collected className strings into individual class tokens. */
export function classTokens(strings) {
  const tokens = [];
  for (const str of strings) {
    for (const token of str.split(/\s+/)) {
      if (token) tokens.push(token);
    }
  }
  return tokens;
}

/** The object literal passed to a `style={{…}}` attribute, else undefined. */
export function styleObject(attribute) {
  const value = attribute?.value;
  if (value?.type !== "JSXExpressionContainer") return undefined;
  const expr = value.expression;
  return expr?.type === "ObjectExpression" ? expr : undefined;
}

/** Static property key (`color`, `zIndex`, …) of an object Property, else undefined. */
export function propertyKey(prop) {
  if (prop?.type !== "Property" || prop.computed) return undefined;
  if (prop.key?.type === "Identifier") return prop.key.name;
  if (prop.key?.type === "Literal" && typeof prop.key.value === "string") return prop.key.value;
  return undefined;
}

// Known iconify icon-set prefixes used in this codebase. An allowlist (rather
// than a generic `a:b` match) so non-icon namespaced strings aren't flagged.
const ICON_SET_PREFIXES = ["ph", "lucide", "codicon", "tabler", "mdi", "svg-spinners"];
// `jb-expui-<category>` (nodes, general, actions, json, status, toolwindows,
// breakpoints, run, …) — JetBrains expui sets, whose prefix carries hyphens.
const ICONIFY_NAME = new RegExp(
  `^(?:${ICON_SET_PREFIXES.join("|")}|jb-expui-[a-z]+):[a-z0-9][a-z0-9-]*$`,
);

/** True when a string is a known icon-set name (e.g. "codicon:clock"). */
export function isIconifyName(value) {
  return typeof value === "string" && ICONIFY_NAME.test(value);
}
