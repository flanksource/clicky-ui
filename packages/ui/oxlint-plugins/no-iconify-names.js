// Custom OxLint rule: disallow iconify-style icon name strings (e.g. "lucide:maximize-2")
// anywhere in clicky-ui source — as a value, argument, or prop. Icons must be imported as
// generated components and passed via the `icon` prop. The `name` fallback prop on <Icon>
// exists only for external consumers of the published library. The generated icon pipeline
// (src/icons/components/** and scripts/build-icons.ts), which legitimately maps these names,
// is exempted via config; stories/tests are exempted via .oxlintrc overrides.

import { isIconifyName } from "./clicky-ui-shared.js";

function message(value) {
  return (
    `Iconify-style icon name "${value}" is not allowed in clicky-ui source. ` +
    "Import the generated icon component from \"../icons\" (e.g. UiFullscreen) and pass it " +
    "via the `icon` prop."
  );
}

const rule = {
  meta: {
    type: "problem",
    docs: { description: "Disallow iconify-style icon name strings in clicky-ui source" },
  },
  create(context) {
    return {
      Literal(node) {
        if (isIconifyName(node.value)) {
          context.report({ message: message(node.value), node });
        }
      },
    };
  },
};

export default {
  meta: { name: "clicky-icons" },
  rules: { "no-iconify-names": rule },
};
