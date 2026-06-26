// clicky-ui/prefer-clicky-components — flag native DOM elements that re-implement
// a component clicky-ui already ships, so consumers reuse the library instead of
// rebuilding (and re-styling, re-theming) primitives by hand.

import { intrinsicElementName } from "./clicky-ui-shared.js";

// Intrinsic element → the clicky-ui component(s) that should replace it.
const REPLACEMENTS = {
  button: "Button or IconButton (@flanksource/clicky-ui/components)",
  select: "Select or Combobox (@flanksource/clicky-ui/components)",
  table: "DataTable (@flanksource/clicky-ui/data)",
  dialog: "Modal (@flanksource/clicky-ui/components)",
};

/** The clicky-ui replacement for an intrinsic element name, else undefined. */
export function clickyReplacementFor(elementName) {
  if (typeof elementName !== "string") return undefined;
  return REPLACEMENTS[elementName];
}

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Reuse clicky-ui components instead of rebuilding native DOM elements by hand",
    },
  },
  create(context) {
    return {
      JSXOpeningElement(node) {
        const element = intrinsicElementName(node);
        const replacement = clickyReplacementFor(element);
        if (!replacement) return;
        context.report({
          message:
            `Avoid rebuilding <${element}>. Reuse ${replacement} so styling, ` +
            "theming, density and accessibility stay consistent with clicky-ui.",
          node,
        });
      },
    };
  },
};

export default rule;
