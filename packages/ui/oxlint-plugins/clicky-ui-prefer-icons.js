// clicky-ui/prefer-clicky-icons — icons must come from an approved source, and
// must be real icon components rather than emoji/text "labels".
//
// Approved sources:
//   - @flanksource/clicky-ui/icons  (generated Ui* components, e.g. UiFullscreen)
//   - @flanksource/icons/mi         (Material/brand glyphs)
//   - @iconify/react                (the <Icon> primitive / iconify icons)
//
// Anti-patterns this flags:
//   1. Importing icons from any other icon library (lucide, react-icons,
//      heroicons, @mui/icons-material, phosphor, tabler, font-awesome, …).
//   2. Using an emoji as an icon — a bare emoji JSX child, or an emoji passed to
//      an `icon` prop — instead of a real icon component.
//   3. Passing a raw iconify name string (e.g. "codicon:clock", "lucide:activity")
//      as a value/argument instead of importing the generated Ui* component.

import { attributeName, isIconifyName, literalString } from "./clicky-ui-shared.js";

// Sources that are always fine (never flagged), even if a denylist pattern overlaps.
const APPROVED_SOURCES = [
  /^@iconify\/react(\/|$)/,
  /^@iconify-icons\//,
  /^@flanksource\/clicky-ui\/icons(\/|$)/,
  /^@flanksource\/icons(\/|$)/,
];

// Third-party icon libraries consumers should not pull icons from directly.
const ICON_LIBRARIES = [
  /^lucide-react$/,
  /^lucide$/,
  /^react-icons(\/|$)/,
  /^@heroicons\/react(\/|$)/,
  /^@mui\/icons-material(\/|$)/,
  /^@phosphor-icons\/react(\/|$)/,
  /^@radix-ui\/react-icons$/,
  /^@tabler\/icons-react$/,
  /^react-feather$/,
  /^feather-icons$/,
  /^@fortawesome\//,
  /^@ant-design\/icons(\/|$)/,
  /^react-bootstrap-icons$/,
  /^@primer\/octicons-react$/,
  /^grommet-icons$/,
];

// A single emoji glyph: a pictographic code point plus its modifiers - ZWJ
// (\u200d), variation selector (\uFE0F), combining enclosing keycap (\u20E3).
// Expressed as alternation (not a character class) to avoid combining marks
// inside `[...]` (oxlint no-misleading-character-class).
const HAS_EMOJI = /\p{Extended_Pictographic}/u;
const ALLOWED_GLYPH = /\s|\u200d|\uFE0F|\u20E3|\p{Extended_Pictographic}/gu;

/** True when an import source is a disallowed third-party icon library. */
export function isUnapprovedIconImport(source) {
  if (typeof source !== "string") return false;
  if (APPROVED_SOURCES.some((re) => re.test(source))) return false;
  return ICON_LIBRARIES.some((re) => re.test(source));
}

/** True when a string is only emoji (used as a stand-in for a real icon). */
export function isEmojiOnly(text) {
  if (typeof text !== "string") return false;
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (!HAS_EMOJI.test(trimmed)) return false;
  // Emoji-only ⇔ nothing remains after removing every emoji glyph + modifier.
  return trimmed.replace(ALLOWED_GLYPH, "") === "";
}

const APPROVED_HINT =
  "Import icons from @flanksource/clicky-ui/icons (Ui* components), " +
  "@flanksource/icons/mi, or @iconify/react";

const rule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Import icons from approved sources and use real icon components, not emoji/text labels",
    },
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        if (isUnapprovedIconImport(node.source?.value)) {
          context.report({
            message: `"${node.source.value}" is not an approved icon source. ${APPROVED_HINT}.`,
            node,
          });
        }
      },
      Literal(node) {
        if (isIconifyName(node.value)) {
          context.report({
            message: `Iconify icon name "${node.value}" passed as a string. ${APPROVED_HINT} and pass the component.`,
            node,
          });
        }
      },
      JSXText(node) {
        if (isEmojiOnly(node.value)) {
          context.report({
            message: `Emoji used as an icon. ${APPROVED_HINT}.`,
            node,
          });
        }
      },
      JSXAttribute(node) {
        if (attributeName(node) !== "icon") return;
        if (isEmojiOnly(literalString(node.value))) {
          context.report({
            message: `Emoji passed to \`icon\`. ${APPROVED_HINT} and pass the component.`,
            node,
          });
        }
      },
    };
  },
};

export default rule;
