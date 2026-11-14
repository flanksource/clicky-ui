import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const dist = fileURLToPath(new URL("../../dist/react-grab", import.meta.url));
const exportsToCheck = new Map([
  ["index.js", ["init", "getStack", "formatElementInfo", "getGrabContext", "formatGrabContext"]],
  ["core/index.js", ["init", "formatElementInfo", "generateSnippet", "getGrabContext", "formatGrabContext"]],
  ["primitives.js", ["getElementAtPoint", "getElementContext", "freeze", "unfreeze"]],
]);
for (const [path, names] of exportsToCheck) {
  const module = await import(pathToFileURL(resolve(dist, path)).href);
  for (const name of names) assert.equal(typeof module[name], "function", `${path} exports ${name}`);
  if (path === "index.js") assert.equal(module.commentPlugin.name, "comment");
  assert.ok(readFileSync(resolve(dist, path.replace(/\.js$/, ".d.ts")), "utf8").length > 0);
}
const css = readFileSync(resolve(dist, "styles.css"), "utf8");
assert.ok(css.includes(":host"), "Shadow root styles must be present");
assert.doesNotMatch(css, /\d(?:\.\d+)?rem\b/, "CSS units must be converted to px");
const bundles = readdirSync(dist, { recursive: true, encoding: "utf8" })
  .filter((path) => path.endsWith(".js"))
  .map((path) => readFileSync(resolve(dist, path), "utf8")).join("\n");
assert.match(bundles, /from["']bippy(?:\/[^"']*)?["']/, "bippy must remain external");
assert.doesNotMatch(bundles, /from["']solid-js(?:\/[^"']*)?["']/, "Solid must be bundled");
assert.doesNotMatch(bundles, /from["'](?:react|react-dom|@preact\/signals[^"']*)(?:\/[^"']*)?["']/, "The picker must not render with React or Preact Signals");
for (const file of ["LICENSE", "NOTICE.md", "FORK.md", "UPSTREAM"]) assert.ok(readFileSync(resolve(dist, file), "utf8").length > 0, `${file} ships with the picker`);
assert.ok(readFileSync(resolve(dist, "solid-js.LICENSE"), "utf8").includes("MIT License"));
process.stdout.write("Built ESM exports, declarations, shadow CSS, dependency boundaries and licenses verified.\n");
