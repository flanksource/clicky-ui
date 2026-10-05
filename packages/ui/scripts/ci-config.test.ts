// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { loadConfigFromFile } from "vite";

const root = new URL("../../../", import.meta.url);
const workflow: {
  env: Record<string, string>;
  jobs: Record<
    string,
    { steps: { uses?: string; with: Record<string, string> }[] }
  >;
} = parse(readFileSync(new URL(".github/workflows/ci.yml", root), "utf8"));

describe("CI suite isolation", () => {
  it.each([
    { job: "test", command: "test", framework: "vitest" },
    { job: "lint", command: "lint", framework: undefined },
    { job: "e2e", command: "test", framework: "playwright" },
  ])(
    "runs $job through Gavel without overlapping suites",
    ({ job, command, framework }) => {
      const steps = workflow.jobs[job]?.steps ?? [];
      const actions = steps.filter((step) =>
        step.uses?.startsWith("flanksource/gavel@"),
      );
      expect(actions).toHaveLength(1);
      const args = actions[0].with.args.split(/\s+/);
      expect(args[0]).toBe(command);
      expect(args).not.toContain("--lint");
      if (framework)
        expect(
          args.slice(
            args.indexOf("--framework"),
            args.indexOf("--framework") + 2,
          ),
        ).toEqual(["--framework", framework]);
      expect(actions[0].with["comment-header"]).toBe(`gavel-${job}`);
      expect(actions[0].with["artifact-name"]).toBe(`gavel-${job}-results`);
    },
  );

  it("disables dependency browser downloads and removes browser install hooks", () => {
    expect(workflow.env.PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD).toBe("1");
    const config: { pre: { run: string }[] } = parse(
      readFileSync(new URL(".gavel.yaml", root), "utf8"),
    );
    expect(config.pre.map((hook) => hook.run).join("\n")).not.toMatch(
      /playwright\s+install/,
    );
  });

  it("runs Storybook browser tests with system Chrome", async () => {
    const config = await loadConfigFromFile(
      { command: "serve", mode: "test" },
      new URL("apps/storybook/vitest.config.ts", root).pathname,
    );
    expect(config?.config.test.projects[0].test.browser.instances).toEqual([
      { browser: "chromium", launch: { channel: "chrome" } },
    ]);
  });
});
