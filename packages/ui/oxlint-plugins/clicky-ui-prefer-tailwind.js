// clicky-ui/prefer-tailwind-classes — flag inline `style={{…}}` that hardcodes
// spacing/layout/typography with static values which have direct Tailwind
// utilities. Computed values (var()/calc()/clamp(), identifiers, expressions)
// are intentionally allowed — those legitimately cannot be a static class.
//
// Color properties are deliberately NOT handled here; they belong to the theme
// concern (clicky-ui/prefer-theme-tokens).

import { attributeName, propertyKey, styleObject } from "./clicky-ui-shared.js";

// CSS properties with a clean Tailwind utility equivalent (non-color).
const TAILWIND_MAPPABLE = new Set([
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "paddingInline",
  "paddingBlock",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "marginInline",
  "marginBlock",
  "gap",
  "rowGap",
  "columnGap",
  "display",
  "flexDirection",
  "justifyContent",
  "alignItems",
  "textAlign",
  "fontWeight",
  "fontSize",
  "lineHeight",
  "borderRadius",
]);

// Dynamic CSS functions whose result can't be a static utility class.
const DYNAMIC_CSS = /\b(?:var|calc|clamp|min|max|env)\(/;

/**
 * True when a style property should instead be a Tailwind class: it is a
 * mappable property AND its value is a static literal (number, or string with
 * no dynamic CSS function). `value` is the already-extracted literal value.
 */
export function isHandrolledStyleValue(property, value) {
  if (!TAILWIND_MAPPABLE.has(property)) return false;
  if (typeof value === "number") return true;
  if (typeof value !== "string") return false;
  return !DYNAMIC_CSS.test(value);
}

/** Extract a static literal value (string/number) from a Property value node. */
function staticValue(node) {
  if (node?.type === "Literal" && (typeof node.value === "string" || typeof node.value === "number")) {
    return node.value;
  }
  return undefined;
}

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Use Tailwind utility classes instead of hand-rolling static inline styles",
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (attributeName(node) !== "style") return;
        const object = styleObject(node);
        if (!object) return;
        for (const prop of object.properties) {
          const key = propertyKey(prop);
          if (!key) continue;
          const value = staticValue(prop.value);
          if (value === undefined) continue;
          if (isHandrolledStyleValue(key, value)) {
            context.report({
              message:
                `Hand-rolled inline style \`${key}\`. Use the equivalent Tailwind ` +
                "class (and density utilities like `p-density-4`/`gap-density-2`) " +
                "so spacing tracks the active density.",
              node: prop,
            });
          }
        }
      },
    };
  },
};

export default rule;
