import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const source = path.join(repoRoot, "apps/storybook/storybook-static");
const destination = path.join(repoRoot, "apps/docs/dist/storybook");

await fs.access(path.join(source, "iframe.html"));
await fs.rm(destination, { recursive: true, force: true });
await fs.cp(source, destination, { recursive: true });
console.log("Copied Storybook into apps/docs/dist/storybook");
