import MagicString from "magic-string";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { Plugin } from "vite";

import { editableOpenings } from "./editable-jsx";
import { EDITABLE_SOURCE_ATTRIBUTE, formatEditableSource } from "./editable-source-marker";
import { sourceHash } from "./source-hash";

/**
 * Appends `data-editable-source` to every facet box/container opening in
 * `src/pages/**.tsx`, so rendered DOM can be traced back to the call site that
 * wrote it. Runs ahead of the JSX transform and appends after all attributes so
 * the marker wins over spreads.
 */
export function playgroundEditableSource(options: { pagesDir: string }): Plugin {
  const root = resolve(options.pagesDir);
  return {
    name: "playground-editable-source",
    enforce: "pre",
    transform(code, id) {
      if (id.includes("?") || !id.endsWith(".tsx") || !isAbsolute(id) || !id.startsWith(root + sep)) return null;
      if (!code.includes("@flanksource/facet")) return null;
      const openings = editableOpenings(code, id);
      if (openings.length === 0) return null;
      const file = relative(root, id).split(sep).join("/");
      const hash = sourceHash(code);
      const edited = new MagicString(code);
      for (const { insertAt, line, column, ordinal } of openings) {
        const marker = formatEditableSource({ file, line, column, ordinal, hash });
        edited.appendLeft(insertAt, ` ${EDITABLE_SOURCE_ATTRIBUTE}="${marker}"`);
      }
      return { code: edited.toString(), map: edited.generateMap({ hires: true, source: id, includeContent: true }) };
    },
  };
}
