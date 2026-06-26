// The `clicky-ui` oxlint plugin — guardrails for projects that consume
// @flanksource/clicky-ui. Reference it from a downstream `.oxlintrc.json`:
//
//   {
//     "jsPlugins": [
//       { "name": "clicky-ui", "specifier": "@flanksource/clicky-ui/oxlint-plugins" }
//     ],
//     "rules": {
//       "clicky-ui/prefer-clicky-components": "warn",
//       "clicky-ui/no-adhoc-overlay": "error",
//       "clicky-ui/prefer-tailwind-classes": "warn",
//       "clicky-ui/prefer-theme-tokens": "error",
//       "clicky-ui/prefer-clicky-icons": "warn"
//     }
//   }
//
// See packages/ui/oxlint-plugins/README.md for the full guide.

import preferClickyComponents from "./clicky-ui-prefer-components.js";
import noAdhocOverlay from "./clicky-ui-no-adhoc-overlay.js";
import preferTailwindClasses from "./clicky-ui-prefer-tailwind.js";
import preferThemeTokens from "./clicky-ui-prefer-theme.js";
import preferClickyIcons from "./clicky-ui-prefer-icons.js";

export default {
  meta: { name: "clicky-ui" },
  rules: {
    "prefer-clicky-components": preferClickyComponents,
    "no-adhoc-overlay": noAdhocOverlay,
    "prefer-tailwind-classes": preferTailwindClasses,
    "prefer-theme-tokens": preferThemeTokens,
    "prefer-clicky-icons": preferClickyIcons,
  },
};
