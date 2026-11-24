import { extname } from "node:path";

/**
 * The executable and arguments that run pnpm with `args`. Under a pnpm script
 * `npm_execpath` names pnpm's own entry, which runs through Node (a .cjs/.js/.mjs
 * file) or directly (the standalone binary). That avoids spawning a bare `pnpm`,
 * which on Windows is a `pnpm.cmd` shim Node cannot spawn without a shell.
 */
export function pnpmInvocation(args: string[], env: NodeJS.ProcessEnv = process.env, node = process.execPath): { command: string; args: string[] } {
  const entry = env.npm_execpath;
  if (!entry || !/pnpm/i.test(entry)) return { command: "pnpm", args };
  if ([".cjs", ".js", ".mjs"].includes(extname(entry).toLowerCase())) return { command: node, args: [entry, ...args] };
  return { command: entry, args };
}
