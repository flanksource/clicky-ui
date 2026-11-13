// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";

const root = new URL("../../../", import.meta.url);
const workflow: {
  env: Record<string, string>;
  jobs: Record<
    string,
    { steps: { uses?: string; with: Record<string, string> }[] }
  >;
} = parse(readFileSync(new URL(".github/workflows/ci.yml", root), "utf8"));

const EVENTS = ["pull_request", "push"] as const;

// A step's args as the given event runs them. The one expression supported is
// the event choice `${{ github.event_name == '<event>' && '<a>' || '<b>' }}`.
function argsFor(raw: string, event: (typeof EVENTS)[number]): string[] {
  const choice = raw.match(
    /^\$\{\{\s*github\.event_name == '([a-z_]+)' && '([^']+)' \|\| '([^']+)'\s*\}\}$/,
  );
  if (raw.includes("${{") && !choice)
    throw new Error(`unsupported expression in gavel args: ${raw}`);
  return (choice ? (choice[1] === event ? choice[2]! : choice[3]!) : raw).split(/\s+/);
}

function gavelStep(job: string) {
  const actions = (workflow.jobs[job]?.steps ?? []).filter((step) =>
    step.uses?.startsWith("flanksource/gavel@"),
  );
  expect(actions).toHaveLength(1);
  return actions[0]!;
}

describe("CI suite isolation", () => {
  it.each([
    { job: "test", command: "test", framework: "vitest" },
    { job: "lint", command: "lint", framework: undefined },
    { job: "e2e", command: "test", framework: "playwright" },
  ])(
    "runs $job through Gavel without overlapping suites",
    ({ job, command, framework }) => {
      const step = gavelStep(job);
      for (const event of EVENTS) {
        const args = argsFor(step.with.args!, event);
        expect(args[0]).toBe(command);
        expect(args).not.toContain("--lint");
        if (framework)
          expect(
            args.slice(
              args.indexOf("--framework"),
              args.indexOf("--framework") + 2,
            ),
          ).toEqual(["--framework", framework]);
      }
      expect(step.with["comment-header"]).toBe(`gavel-${job}`);
      expect(step.with["artifact-name"]).toBe(`gavel-${job}-results`);
    },
  );

  it("lints only the changed files on pull requests and every file on pushes to main", () => {
    const raw = gavelStep("lint").with.args!;
    expect(EVENTS.map((event) => argsFor(raw, event))).toEqual([["lint", "--changed"], ["lint"]]);
  });

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
    // Imported directly rather than through Vite's loadConfigFromFile: its
    // loaders hand plugin objects to rolldown's native binding (rejected inside
    // a vmThreads worker's vm realm) or need module.registerHooks (unavailable
    // under Vitest). The config only needs to be evaluated, not bundled.
    const { default: config } = await import("../../../apps/storybook/vitest.config.ts");
    const browserProject = config.test.projects.find(
      (project: { test: { name: string } }) => project.test.name === "storybook-browser",
    );
    expect(browserProject.test.browser).toMatchObject({
      provider: { name: "playwright", options: { launchOptions: { channel: "chrome" } } },
      instances: [{ browser: "chromium" }],
    });
  });
});
