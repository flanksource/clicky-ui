import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, "..");
const repoRoot = join(pkgRoot, "..", "..");
const generatedRoot = join(pkgRoot, "src", "generated", "storybook");

type CommandSpec = {
  label: string;
  cmd: string;
  args: string[];
  cwd?: string;
  shell?: boolean;
};

type SchemaOutput = {
  file: string;
  command: CommandSpec;
};

const gavelRepo = resolve(repoRoot, "..", "gavel");
const captainRepo = resolve(repoRoot, "..", "captain");

const outputs: SchemaOutput[] = [
  {
    file: "gavel-fixtures.schema.json",
    command: resolveSchemaCommand({
      label: "gavel fixtures --schema",
      env: "GAVEL_FIXTURES_SCHEMA_CMD",
      siblingRepo: gavelRepo,
      goArgs: ["run", "./cmd/gavel", "fixtures", "--schema"],
      binary: "gavel",
      binaryArgs: ["fixtures", "--schema"],
    }),
  },
  {
    file: "captain-prompt.schema.json",
    command: resolveSchemaCommand({
      label: "captain prompt --schema",
      env: "CAPTAIN_PROMPT_SCHEMA_CMD",
      siblingRepo: captainRepo,
      goArgs: ["run", "./cmd/captain", "prompt", "--schema"],
      binary: "captain",
      binaryArgs: ["prompt", "--schema"],
    }),
  },
];

await mkdir(generatedRoot, { recursive: true });

for (const output of outputs) {
  const target = join(generatedRoot, output.file);
  const result = runJSONCommand(output.command);
  if (!result.ok) {
    // The schemas are committed artifacts; the generator only refreshes them
    // from the sibling Go tools when those are available. Where the CLI is
    // absent (CI, contributors without gavel/captain installed) keep the
    // committed copy rather than failing the whole Storybook build.
    if (existsSync(target)) {
      console.warn(`${output.command.label}: ${result.reason}; keeping committed ${output.file}`);
      continue;
    }
    throw new Error(
      `${output.command.label}: ${result.reason}; no committed ${output.file} to fall back to`,
    );
  }
  await writeIfChanged(target, `${JSON.stringify(result.data, null, 2)}\n`);
  console.log(`Generated ${target}`);
}

function resolveSchemaCommand({
  label,
  env,
  siblingRepo,
  goArgs,
  binary,
  binaryArgs,
}: {
  label: string;
  env: string;
  siblingRepo: string;
  goArgs: string[];
  binary: string;
  binaryArgs: string[];
}): CommandSpec {
  const override = process.env[env];
  if (override?.trim()) {
    return { label, cmd: override, args: [], shell: true };
  }
  if (existsSync(join(siblingRepo, "go.mod"))) {
    return { label, cmd: "go", args: goArgs, cwd: siblingRepo };
  }
  return { label, cmd: binary, args: binaryArgs };
}

type CommandResult =
  | { ok: true; data: unknown }
  | { ok: false; reason: string };

function runJSONCommand(command: CommandSpec): CommandResult {
  const result = spawnSync(command.cmd, command.args, {
    cwd: command.cwd,
    encoding: "utf8",
    shell: command.shell,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.error) {
    // ENOENT means the tool itself is not installed; treat as unavailable so
    // the caller can fall back to the committed schema. Any other spawn error
    // is a genuine failure.
    if ((result.error as NodeJS.ErrnoException).code === "ENOENT") {
      return { ok: false, reason: `${command.cmd} not found` };
    }
    throw new Error(`${command.label}: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      [
        `${command.label} exited ${result.status}`,
        result.stderr.trim(),
        result.stdout.trim(),
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
  try {
    return { ok: true, data: JSON.parse(result.stdout) };
  } catch (error) {
    throw new Error(
      `${command.label} did not print valid JSON: ${
        error instanceof Error ? error.message : String(error)
      }\n${result.stdout.slice(0, 2000)}`,
    );
  }
}

async function writeIfChanged(path: string, content: string) {
  const existing = await readFile(path, "utf8").catch(() => undefined);
  if (existing === content) return;
  await writeFile(path, content);
}
