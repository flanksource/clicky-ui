// Custom OxLint rule: disallow iconify-style icon name strings (e.g. "lucide:maximize-2")
// anywhere in clicky-ui source. Icons must be imported as generated components and passed
// via the `icon` prop. The `name` fallback prop on <Icon> exists only for external
// consumers of the published library. The generated icon pipeline (src/icons/components/**
// and scripts/build-icons.ts), which legitimately maps these names, is exempted via config.

const ICONIFY = /^[a-z][a-z0-9]*:[a-z0-9][a-z0-9-]*$/;
const ICON_KEYS = new Set(["icon", "name"]);

export function isIconifyName(value) {
  return typeof value === "string" && ICONIFY.test(value);
}

function message(value) {
  return (
    `Iconify-style icon name "${value}" is not allowed in clicky-ui source. ` +
    "Import the generated icon component from \"../icons\" (e.g. UiFullscreen) and pass it " +
    "via the `icon` prop."
  );
}

function literalString(node) {
  if (node && node.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }
  return undefined;
}

const rule = {
  meta: {
    type: "problem",
    docs: { description: "Disallow iconify-style icon name strings in clicky-ui source" },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (!ICON_KEYS.has(node.name?.name)) return;
        const value = literalString(node.value);
        if (isIconifyName(value)) {
          context.report({ message: message(value), node });
        }
      },
      Property(node) {
        const key = node.key?.name ?? node.key?.value;
        if (!ICON_KEYS.has(key)) return;
        const value = literalString(node.value);
        if (isIconifyName(value)) {
          context.report({ message: message(value), node });
        }
      },
    };
  },
};

export default {
  meta: { name: "clicky-icons" },
  rules: { "no-iconify-names": rule },
};
