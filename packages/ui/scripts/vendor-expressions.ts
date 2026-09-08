/**
 * Vendors the language definitions from gomplate.
 *
 * The tokenizers are generated from cel-go's ANTLR grammar, `text/template`'s
 * lexer and gomplate's live function registries — none of which exist outside a
 * Go toolchain. Rather than reimplement any of that here, this clones gomplate,
 * runs its generator, and commits the result. gomplate stays the single source
 * of truth; the clicky-ui expressions subpath is how it reaches npm.
 *
 * The whole `src` tree is copied, not just the generated files: the completion,
 * hover and path-expression runtime changes with the generated shape, and
 * maintaining a second copy of it here would drift within a release.
 *
 *   pnpm vendor:expressions                          # from github.com/flanksource/gomplate@main
 *   pnpm vendor:expressions --ref v3.2.0             # from a tag
 *   pnpm vendor:expressions --from ../../../gomplate # from a local checkout
 *   pnpm vendor:expressions:check                    # compare with the recorded upstream commit
 */
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { resolveVendorRef } from "./vendor-expressions-ref";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = resolve(packageRoot, "../..");
const scratchRoot = join(repositoryRoot, ".tmp");
const target = join(packageRoot, "src", "expressions", "lang");
const stamp = join(packageRoot, "src", "expressions", "VENDOR");

const DEFAULT_REMOTE = "https://github.com/flanksource/gomplate.git";
/** Where the generator writes, and where the runtime lives, inside gomplate. */
const SOURCE_SUBPATH = join("web", "packages", "lang", "src");
const GENERATED_SUBPATH = join(SOURCE_SUBPATH, "generated");

interface ParsedArgs {
  from: string;
  ref?: string;
  check: boolean;
}

interface Args extends ParsedArgs {
  ref: string;
}

interface VendorOptions {
  args: Args;
  destination: string;
  generate: boolean;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args: ParsedArgs = { from: DEFAULT_REMOTE, check: false };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    if (flag === "--check") args.check = true;
    else if (flag === "--from") {
      const value = argv[(i += 1)];
      if (!value) throw new Error("--from requires a repository URL or local path");
      args.from = value;
    } else if (flag === "--ref") {
      const value = argv[(i += 1)];
      if (!value) throw new Error("--ref requires a branch, tag, or commit");
      args.ref = value;
    } else throw new Error(`unknown argument ${flag}`);
  }
  return args;
}

function run(command: string, commandArgs: string[], cwd: string) {
  execFileSync(command, commandArgs, { cwd, stdio: "inherit" });
}

function capture(command: string, commandArgs: string[], cwd: string) {
  return execFileSync(command, commandArgs, { cwd, encoding: "utf8" }).trim();
}

function scratchDirectory(prefix: string): string {
  mkdirSync(scratchRoot, { recursive: true });
  return mkdtempSync(join(scratchRoot, prefix));
}

/** Returns the checkout to generate from, and a cleanup for it. */
function checkout(args: Args): { dir: string; cleanup: () => void } {
  const local = resolve(packageRoot, args.from);
  if (existsSync(join(local, "go.mod"))) {
    // A local checkout is used in place, not copied: the point of --from is to
    // see uncommitted generator changes before they are pushed.
    console.log(`[vendor] using local checkout ${local}`);
    return { dir: local, cleanup: () => {} };
  }

  const dir = scratchDirectory("gomplate-vendor-");
  console.log(`[vendor] checking out ${args.from}@${args.ref}`);
  run("git", ["init", "--quiet", dir], packageRoot);
  run("git", ["-C", dir, "remote", "add", "origin", args.from], packageRoot);
  run("git", ["-C", dir, "fetch", "--depth", "1", "origin", args.ref], packageRoot);
  run("git", ["-C", dir, "checkout", "--quiet", "--detach", "FETCH_HEAD"], packageRoot);
  return { dir, cleanup: () => rmSync(dir, { recursive: true, force: true }) };
}

function describe(dir: string): string {
  const sha = capture("git", ["rev-parse", "HEAD"], dir);
  const dirty = capture("git", ["status", "--porcelain"], dir) !== "";
  return dirty ? `${sha} (dirty working tree)` : sha;
}

function vendor({ args, destination, generate }: VendorOptions) {
  const { dir, cleanup } = checkout(args);
  try {
    if (generate) {
      console.log("[vendor] running genmonarch");
      run(
        "go",
        ["run", "./cmd/genmonarch", "-out", join(dir, GENERATED_SUBPATH)],
        dir,
      );
    }

    rmSync(destination, { recursive: true, force: true });
    cpSync(join(dir, SOURCE_SUBPATH), destination, { recursive: true });
    return describe(dir);
  } finally {
    cleanup();
  }
}

function stampFor(source: string, args: Args) {
  return [
    "# Generated by scripts/vendor-expressions.ts. Do not edit src/expressions/lang by hand.",
    `source: ${args.from}`,
    `commit: ${source}`,
    "",
  ].join("\n");
}

const parsedArgs = parseArgs(process.argv.slice(2));
const args: Args = {
  ...parsedArgs,
  ref: resolveVendorRef({
    check: parsedArgs.check,
    stamp: parsedArgs.check ? readFileSync(stamp, "utf8") : "",
    ...(parsedArgs.ref ? { explicitRef: parsedArgs.ref } : {}),
  }),
};

if (!args.check) {
  const source = vendor({ args, destination: target, generate: true });
  writeFileSync(stamp, stampFor(source, args));
  console.log(`[vendor] vendored ${source}`);
} else {
  // Compare with the source tree committed at the recorded revision, so a
  // hand-edit or mismatched VENDOR stamp fails independently of Go versions.
  const scratch = scratchDirectory("gomplate-vendor-check-");
  try {
    const fresh = join(scratch, "lang");
    vendor({ args, destination: fresh, generate: false });

    const diff = diffTrees(target, fresh);
    if (diff.length > 0) {
      console.error(
        "[vendor] src/expressions/lang is out of date or has been edited by hand:",
      );
      for (const path of diff.slice(0, 20)) console.error(`  ${path}`);
      if (diff.length > 20) console.error(`  … and ${diff.length - 20} more`);
      console.error(
        "[vendor] run `pnpm vendor:expressions` and commit the result.",
      );
      process.exit(1);
    }
    console.log("[vendor] src/expressions/lang is up to date");
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

/** Paths that differ between two trees, in either direction. */
function diffTrees(a: string, b: string): string[] {
  const files = new Set([...listFiles(a), ...listFiles(b)]);
  const differing: string[] = [];
  for (const relative of [...files].sort()) {
    const left = readIfPresent(join(a, relative));
    const right = readIfPresent(join(b, relative));
    if (left !== right) differing.push(relative);
  }
  return differing;
}

function listFiles(root: string, prefix = ""): string[] {
  if (!existsSync(root)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory())
      out.push(...listFiles(join(root, entry.name), relative));
    else out.push(relative);
  }
  return out;
}

function readIfPresent(path: string): string | null {
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}
