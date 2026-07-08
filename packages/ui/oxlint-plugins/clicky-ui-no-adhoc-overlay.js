// clicky-ui/no-adhoc-overlay — keep dialogs going through clicky-ui's Modal
// instead of hand-rolled dialog markup. Z-index guardrails live in
// clicky-ui/no-direct-z-index.

import { attributeName } from "./clicky-ui-shared.js";

const DIALOG_ROLES = new Set(["dialog", "alertdialog"]);

/** True for a `role` value that turns a plain element into an ad-hoc dialog. */
export function isDialogRole(value) {
  return typeof value === "string" && DIALOG_ROLES.has(value);
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
      description: "Use clicky-ui Modal instead of hand-rolled dialog markup",
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        checkDialogRole(node, context);
      },
    };
  },
};

export default rule;
