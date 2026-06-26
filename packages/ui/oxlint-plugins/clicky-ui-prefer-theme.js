// clicky-ui/prefer-theme-tokens — keep consumers on the theme + density system
// instead of bypassing it. Two anti-patterns:
//   1. Hardcoded colors (className `text-[#fff]`, `style={{ color: "#fff" }}`)
//      that don't flip with `[data-theme]` — use semantic tokens (text-foreground,
//      bg-background, border-border, …).
//   2. Re-reading the clicky theme/density localStorage keys by hand instead of
//      the `useTheme`/`useDensity` hooks (or ThemeProvider/DensityProvider).

import {
  attributeName,
  classTokens,
  collectStrings,
  literalString,
  propertyKey,
  styleObject,
} from "./clicky-ui-shared.js";

// Arbitrary Tailwind color class with a literal color, e.g. `text-[#fff]`,
// `bg-[rgb(0,0,0)]`, `hover:border-[#abc]`.
const ARBITRARY_COLOR_CLASS =
  /(?:^|:)(?:text|bg|border|ring|fill|stroke|from|via|to|outline|caret|decoration|accent|shadow|divide)-\[(?:#[0-9a-fA-F]{3,8}|(?:rgb|rgba|hsl|hsla)\()/;

// A literal CSS color value: hex, rgb()/rgba(), hsl()/hsla().
const HARDCODED_COLOR = /(?:#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\()/;

// CSS properties whose hardcoded color should be a theme token instead.
const COLOR_PROPS = new Set([
  "color",
  "backgroundColor",
  "background",
  "borderColor",
  "outlineColor",
  "caretColor",
  "textDecorationColor",
  "fill",
  "stroke",
]);

const STORAGE_KEYS = new Set(["clicky-ui-theme", "clicky-ui-density"]);
const STORAGE_OBJECTS = new Set(["localStorage", "sessionStorage"]);

/** True for a Tailwind class hardcoding a literal color (`text-[#fff]`). */
export function isArbitraryColorClass(token) {
  return typeof token === "string" && ARBITRARY_COLOR_CLASS.test(token);
}

/** True for a literal CSS color value (hex / rgb / hsl). */
export function isHardcodedColorValue(value) {
  return typeof value === "string" && HARDCODED_COLOR.test(value);
}

/** True for a clicky-ui theme/density localStorage key. */
export function isClickyStorageKey(value) {
  return typeof value === "string" && STORAGE_KEYS.has(value);
}

const TOKEN_HINT =
  "use a semantic theme token (text-foreground, bg-background, border-border, …) " +
  "so it tracks light/dark via [data-theme]";

function checkClassName(node, context) {
  if (attributeName(node) !== "className" && attributeName(node) !== "class") return;
  for (const token of classTokens(collectStrings(node.value))) {
    if (isArbitraryColorClass(token)) {
      context.report({ message: `Hardcoded color \`${token}\` — ${TOKEN_HINT}.`, node });
      return;
    }
  }
}

function checkStyleColor(node, context) {
  if (attributeName(node) !== "style") return;
  const object = styleObject(node);
  if (!object) return;
  for (const prop of object.properties) {
    const key = propertyKey(prop);
    if (!key || !COLOR_PROPS.has(key)) continue;
    if (isHardcodedColorValue(literalString(prop.value))) {
      context.report({
        message: `Hardcoded \`${key}\` color — ${TOKEN_HINT}.`,
        node: prop,
      });
    }
  }
}

/** `localStorage`, `window.localStorage`, `globalThis.sessionStorage`, … */
function isStorageObject(node) {
  if (node?.type === "Identifier") return STORAGE_OBJECTS.has(node.name);
  if (node?.type === "MemberExpression" && node.property?.type === "Identifier") {
    return STORAGE_OBJECTS.has(node.property.name);
  }
  return false;
}

function checkStorageCall(node, context) {
  const callee = node.callee;
  if (callee?.type !== "MemberExpression") return;
  if (!isStorageObject(callee.object)) return;
  for (const arg of node.arguments) {
    if (isClickyStorageKey(literalString(arg))) {
      context.report({
        message:
          `Reading "${arg.value}" from storage by hand. Use clicky-ui's useTheme()/` +
          "useDensity() hooks (or ThemeProvider/DensityProvider) instead.",
        node,
      });
      return;
    }
  }
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Use clicky-ui theme tokens and theme/density hooks instead of hardcoded colors or raw storage access",
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        checkClassName(node, context);
        checkStyleColor(node, context);
      },
      CallExpression(node) {
        checkStorageCall(node, context);
      },
    };
  },
};

export default rule;
