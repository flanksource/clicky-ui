import { describe, expect, it } from "vitest";
import { pnpmInvocation } from "./pnpm.ts";

const node = "/usr/bin/node";
const args = ["run", "build:artifacts"];

describe("pnpmInvocation", () => {
  it.each([
    { name: "runs pnpm's JS entry through Node", execpath: "C:\\pnpm\\bin\\pnpm.cjs", want: { command: node, args: ["C:\\pnpm\\bin\\pnpm.cjs", ...args] } },
    { name: "runs the standalone pnpm binary directly", execpath: "C:\\pnpm\\pnpm.exe", want: { command: "C:\\pnpm\\pnpm.exe", args } },
    { name: "falls back to pnpm on PATH outside a pnpm script", execpath: undefined, want: { command: "pnpm", args } },
    { name: "ignores an npm entry", execpath: "/usr/lib/node_modules/npm/bin/npm-cli.js", want: { command: "pnpm", args } },
  ])("$name", ({ execpath, want }) => {
    expect(pnpmInvocation(args, { npm_execpath: execpath }, node)).toEqual(want);
  });
});
