// clicky-ui/no-direct-z-index — prevent local stacking fixes from bypassing
// clicky-ui's modal stack. Floating content should use DropdownMenu/Combobox/etc.
// or `useFloatingZIndex`; raw z-index values are reserved for overlay internals.

import {
  attributeName,
  classTokens,
  collectStrings,
  literalString,
  propertyKey,
  styleObject,
} from "./clicky-ui-shared.js";

// `z-[999]`, `hover:z-[999]`, `md:z-[var(--x)]` — overlay-scale or dynamic
// arbitrary Tailwind z-index values. Tiny local offsets (`z-[1]`) are allowed
// because they stay inside an isolated stacking context.
const ARBITRARY_Z_CLASS = /(?:^|:)z-\[([^\]]+)\]$/;
const FLOATING_Z_NAMES = new Set(["floatingZ", "floatingZIndex"]);

/** True for an overlay-scale/dynamic arbitrary `z-[…]` token (variants allowed). */
export function isArbitraryZIndexClass(token) {
  if (typeof token !== "string") return false;
  const match = token.match(ARBITRARY_Z_CLASS);
  if (!match) return false;
  const value = match[1]?.trim();
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return Math.abs(numeric) >= 50;
  return true;
}

/** True for imports of the raw zIndex scale, which should stay internal. */
export function isRawZIndexImport(source, importedName, localName) {
  if (importedName !== "zIndex" && localName !== "zIndex") return false;
  if (typeof source !== "string") return false;
  return source === "@flanksource/clicky-ui" || /(?:^|\/)zIndex$/.test(source);
}

function identifierName(node) {
  return node?.type === "Identifier" ? node.name : undefined;
}

function propertyName(node) {
  if (!node) return undefined;
  if (node.type === "Identifier") return node.name;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  return undefined;
}

function isFloatingZReference(node) {
  const name = identifierName(node);
  if (name && FLOATING_Z_NAMES.has(name)) return true;
  if (node?.type !== "MemberExpression" || node.computed) return false;
  return FLOATING_Z_NAMES.has(propertyName(node.property));
}

function isStaticLiteral(node) {
  return (
    node?.type === "Literal" &&
    (typeof node.value === "number" || typeof node.value === "string")
  );
}

/**
 * True when a `style={{ zIndex: … }}` value sets stacking directly instead of
 * flowing through the shared floating-layer hook.
 */
export function isDirectZIndexValue(node) {
  if (!node || isFloatingZReference(node)) return false;
  if (isStaticLiteral(node)) return true;
  if (node.type === "Identifier") return true;
  if (node.type === "MemberExpression") return true;
  return false;
}

const MESSAGE =
  "Direct z-index usage. Use clicky-ui overlay components or useFloatingZIndex " +
  "for floating content so menus and popovers stack above active modals.";

function report(context, node) {
  context.report({ message: MESSAGE, node });
}

function checkClassName(node, context) {
  if (attributeName(node) !== "className" && attributeName(node) !== "class") return;
  for (const token of classTokens(collectStrings(node.value))) {
    if (isArbitraryZIndexClass(token)) {
      report(context, node);
      return;
    }
  }
}

function checkStyleZIndex(node, context) {
  if (attributeName(node) !== "style") return;
  const object = styleObject(node);
  if (!object) return;
  for (const prop of object.properties) {
    if (propertyKey(prop) === "zIndex" && isDirectZIndexValue(prop.value)) {
      report(context, prop);
    }
  }
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Use clicky-ui overlay components or useFloatingZIndex instead of direct z-index values",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const source = literalString(node.source);
        for (const specifier of node.specifiers ?? []) {
          if (specifier.type !== "ImportSpecifier") continue;
          const importedName = propertyName(specifier.imported);
          const localName = identifierName(specifier.local);
          if (isRawZIndexImport(source, importedName, localName)) report(context, specifier);
        }
      },
      JSXAttribute(node) {
        checkClassName(node, context);
        checkStyleZIndex(node, context);
      },
    };
  },
};

export default rule;
