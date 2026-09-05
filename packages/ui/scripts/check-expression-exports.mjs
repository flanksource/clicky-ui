import { access, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const packageJson = JSON.parse(
  await readFile(resolve(packageRoot, "package.json"), "utf8"),
);
const expressionExports = ["./expressions", "./expressions/playground"];

for (const subpath of expressionExports) {
  const targets = packageJson.exports[subpath];
  if (!targets)
    throw new Error(`package.json is missing the ${subpath} export`);

  for (const condition of ["types", "import", "require"]) {
    const target = targets[condition];
    if (!target)
      throw new Error(`${subpath} is missing its ${condition} target`);
    await access(resolve(packageRoot, target));
  }
}

const esm = await import("@flanksource/clicky-ui/expressions");
const cjs = createRequire(import.meta.url)(
  "@flanksource/clicky-ui/expressions",
);

for (const [format, module] of [
  ["ESM", esm],
  ["CommonJS", cjs],
]) {
  if (typeof module.registerGomplateLanguages !== "function") {
    throw new Error(
      `${format} expressions export is missing registerGomplateLanguages`,
    );
  }
  if (!Array.isArray(module.LANGUAGE_IDS) || module.LANGUAGE_IDS.length === 0) {
    throw new Error(`${format} expressions export has no language IDs`);
  }
}
