import MagicString from "magic-string";
import ts from "typescript";
import { isAbsolute, relative, resolve, sep } from "node:path";
import type { Plugin } from "vite";

import { SVG_EDITABLE_TAGS } from "../src/visual-edit/svg-schemas";
import { editableOpeningNodes, parseTsx } from "./editable-jsx";
import { EDITABLE_SOURCE_ATTRIBUTE, formatEditableSource } from "@flanksource/page-runtime/markers";
import { sourceHash } from "./source-hash";

/** Cheap pre-check ahead of the parse: an intrinsic SVG shape opening anywhere in the file. */
const INTRINSIC_SVG_OPENING = new RegExp(`<(?:${SVG_EDITABLE_TAGS.join("|")})(?=[\\s/>])`);

/**
 * Appends `data-source` to every facet box/container opening and every
 * intrinsic SVG shape opening in `src/pages/**.tsx`, so rendered DOM can be
 * traced back to the call site that wrote it. Runs ahead of the JSX transform
 * and appends after all attributes so the marker wins over spreads.
 */
export function playgroundEditableSource(options: { pagesDir: string }): Plugin {
  const root = resolve(options.pagesDir);
  return {
    name: "playground-editable-source",
    enforce: "pre",
    transform(code, id) {
      if (id.includes("?") || !id.endsWith(".tsx") || !isAbsolute(id) || !id.startsWith(root + sep)) return null;
      if (!code.includes("data-review-id") && !code.includes("@flanksource/facet") && !INTRINSIC_SVG_OPENING.test(code)) return null;
      const ast = parseTsx(code, id);
      const openings = editableOpeningNodes(ast);
      const file = relative(root, id).split(sep).join("/");
      const hash = sourceHash(code);
      const edited = new MagicString(code);
      const targets = new Set<ts.Node>(openings.map(opening => ts.isJsxOpeningElement(opening.node) ? opening.node.parent : opening.node));
      const visit = (node: ts.Node) => {
        if ((ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) && node.attributes.properties.some(prop => ts.isJsxAttribute(prop) && prop.name.getText(ast) === "data-review-id")) targets.add(ts.isJsxOpeningElement(node) ? node.parent : node);
        ts.forEachChild(node, visit);
      };
      visit(ast);
      if (targets.size === 0) return null;
      let helper = "__playgroundEditableElement";
      while (code.includes(helper)) helper += "_";
      edited.prepend(`import { editableElement as ${helper} } from "@flanksource/page-runtime/editing";`);
      for (const node of targets) {
        const child = ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent);
        edited.appendLeft(node.getStart(ast), `${child ? "{" : ""}${helper}(`);
        edited.appendLeft(node.end, `)${child ? "}" : ""}`);
      }
      for (const { insertAt, line, column, ordinal } of openings) {
        const marker = formatEditableSource({ file, line, column, ordinal, hash });
        edited.appendLeft(insertAt, ` ${EDITABLE_SOURCE_ATTRIBUTE}="${marker}"`);
      }
      return { code: edited.toString(), map: edited.generateMap({ hires: true, source: id, includeContent: true }) };
    },
  };
}
