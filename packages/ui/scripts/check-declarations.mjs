import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const dist = fileURLToPath(new URL("../dist/", import.meta.url));
const leakedImports = [];

async function checkDirectory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await checkDirectory(path);
    } else if (path.endsWith(".d.ts")) {
      const source = await readFile(path, "utf8");
      if (source.includes("node_modules/")) leakedImports.push(path);
    }
  }
}

await checkDirectory(dist);
if (leakedImports.length > 0) {
  throw new Error(
    `generated declarations contain workspace-relative dependency imports:\n${leakedImports.join("\n")}`,
  );
}
