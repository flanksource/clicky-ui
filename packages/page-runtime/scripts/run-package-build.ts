import { runPackageBuild, publishPackage } from "../src/publication/index.ts";

const args = process.argv.slice(2);
if (args.length > 1 || (args[0] !== undefined && args[0] !== "--publish-only")) throw new Error("Usage: run-package-build.ts [--publish-only]");
const publication = args[0] === "--publish-only"
  ? await publishPackage({ libraryDir: process.cwd() })
  : await runPackageBuild({ libraryDir: process.cwd(), command: "pnpm", args: ["run", "build:artifacts"] });
process.stdout.write(`Published ${publication.name}@${publication.version} build ${publication.build}\n`);
