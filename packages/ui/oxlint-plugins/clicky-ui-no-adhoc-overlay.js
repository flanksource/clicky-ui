// clicky-ui/no-adhoc-overlay — keep overlays going through clicky-ui's Modal and
// its centralized z-index scale (overlay/zIndex.ts) instead of hand-rolled
// dialogs and arbitrary stacking values that silently fight the modal stack.

import {
  attributeName,
  classTokens,
  collectStrings,
  numericLiteral,
  propertyKey,
  styleObject,
} from "./clicky-ui-shared.js";

// `z-[999]`, `hover:z-[999]`, `md:z-[var(--x)]` — an arbitrary Tailwind z-index.
// Named utilities (`z-50`) are fine; only escape-hatch arbitrary values are flagged.
const ARBITRARY_Z_CLASS = /(?:^|:)z-\[[^\]]+\]$/;
const DIALOG_ROLES = new Set(["dialog", "alertdialog"]);

/** True for an arbitrary `z-[…]` Tailwind class token (variant prefixes allowed). */
export function isArbitraryZIndexClass(token) {
  return typeof token === "string" && ARBITRARY_Z_CLASS.test(token);
}

/** True for a `role` value that turns a plain element into an ad-hoc dialog. */
export function isDialogRole(value) {
  return typeof value === "string" && DIALOG_ROLES.has(value);
}

const Z_INDEX_MESSAGE =
  "Hardcoded z-index. Use clicky-ui's overlay components (Modal, DropdownMenu, " +
  "Toast) or the `zIndex` scale from @flanksource/clicky-ui so stacking stays " +
  "consistent — arbitrary z-[N] classes can also be dropped by a consumer's " +
  "Tailwind build.";

function checkClassName(node, context) {
  if (attributeName(node) !== "className" && attributeName(node) !== "class") return;
  for (const token of classTokens(collectStrings(node.value))) {
    if (isArbitraryZIndexClass(token)) {
      context.report({ message: Z_INDEX_MESSAGE, node });
      return;
    }
  }
}

function checkStyleZIndex(node, context) {
  if (attributeName(node) !== "style") return;
  const object = styleObject(node);
  if (!object) return;
  for (const prop of object.properties) {
    if (propertyKey(prop) === "zIndex" && numericLiteral(prop.value) !== undefined) {
      context.report({ message: Z_INDEX_MESSAGE, node: prop });
    }
  }
}

function checkDialogRole(node, context) {
  if (attributeName(node) !== "role") return;
  const value = node.value?.type === "Literal" ? node.value.value : undefined;
  if (isDialogRole(value)) {
    context.report({
      message:
        `role="${value}" builds an ad-hoc dialog. Use clicky-ui's Modal, which ` +
        "owns focus trapping and the modal z-index stack.",
      node,
    });
  }
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Use clicky-ui overlays and the centralized z-index scale instead of ad-hoc dialogs",
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        checkClassName(node, context);
        checkStyleZIndex(node, context);
        checkDialogRole(node, context);
      },
    };
  },
};

export default rule;
