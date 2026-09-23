import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));

async function exists(path) {
  try {
    await readFile(path);
    return true;
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

async function runtimeSpecifier(declarationPath, specifier) {
  if (!specifier.startsWith(".")) return specifier;
  if (/\.(?:[cm]?js|jsx|json|css)$/.test(specifier)) return specifier;

  const sourceExtension = extname(specifier);
  if ([".ts", ".tsx", ".mts", ".cts"].includes(sourceExtension)) {
    const withoutExtension = specifier.slice(0, -sourceExtension.length);
    const runtimeExtension =
      sourceExtension === ".mts"
        ? ".mjs"
        : sourceExtension === ".cts"
          ? ".cjs"
          : ".js";
    return `${withoutExtension}${runtimeExtension}`;
  }

  const target = resolve(dirname(declarationPath), specifier);
  if (await exists(`${target}.d.ts`)) return `${specifier}.js`;
  if (await exists(join(target, "index.d.ts"))) return `${specifier}/index.js`;

  throw new Error(
    `cannot resolve declaration import ${specifier} from ${declarationPath}`,
  );
}

async function rewriteDeclaration(path) {
  const source = await readFile(path, "utf8");
  const imports = ts.preProcessFile(source, true, true).importedFiles;
  let rewritten = source;

  for (const imported of imports.reverse()) {
    const specifier = await runtimeSpecifier(path, imported.fileName);
    if (specifier === imported.fileName) continue;
    rewritten = `${rewritten.slice(0, imported.pos + 1)}${specifier}${rewritten.slice(imported.end + 1)}`;
  }

  if (rewritten !== source) await writeFile(path, rewritten);
}

async function rewriteDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await rewriteDirectory(path);
    else if (path.endsWith(".d.ts")) await rewriteDeclaration(path);
  }
}

await rewriteDirectory(dist);
