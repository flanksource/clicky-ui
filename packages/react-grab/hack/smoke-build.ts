import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const exportsToCheck = new Map([
  ["index.js", ["init", "getStack", "formatElementInfo"]],
  ["core/index.js", ["init", "formatElementInfo", "generateSnippet"]],
  ["primitives.js", ["getElementAtPoint", "getElementContext", "freeze", "unfreeze"]],
]);
for (const [path, names] of exportsToCheck) {
  const module = await import(pathToFileURL(resolve("dist", path)).href);
  for (const name of names) assert.equal(typeof module[name], "function", `${path} exports ${name}`);
  if (path === "index.js") assert.equal(module.commentPlugin.name, "comment");
  assert.ok(readFileSync(resolve("dist", path.replace(/\.js$/, ".d.ts")), "utf8").length > 0);
}
const css = readFileSync("dist/styles.css", "utf8");
assert.ok(css.includes(":host"), "Shadow root styles must be present");
assert.doesNotMatch(css, /\d(?:\.\d+)?rem\b/, "CSS units must be converted to px");
const bundles = readdirSync("dist", { recursive: true, encoding: "utf8" })
  .filter((path) => path.endsWith(".js"))
  .map((path) => readFileSync(resolve("dist", path), "utf8")).join("\n");
assert.match(bundles, /from["']bippy(?:\/[^"']*)?["']/, "bippy must remain external");
assert.doesNotMatch(bundles, /from["']solid-js(?:\/[^"']*)?["']/, "Solid must be bundled");
assert.ok(readFileSync("dist/solid-js.LICENSE", "utf8").includes("MIT License"));
process.stdout.write("Built ESM exports, declarations, shadow CSS, dependency boundaries and Solid license verified.\n");
