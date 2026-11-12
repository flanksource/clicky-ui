// @vitest-environment node
import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import { parse } from "yaml";

const root = new URL("../../../", import.meta.url);
type Step = { name?: string; run?: string; "working-directory"?: string; env?: Record<string, string>; with?: Record<string, unknown> };
type ReleasePackage = { name: string; directory: string; manifest: string; build_package: string; build_script: string; publish_directory: string };
const release = parse(readFileSync(new URL(".github/workflows/release.yml", root), "utf8")) as {
  on: { push: { branches: string[] } };
  jobs: { release: { strategy: { "max-parallel": number; matrix: { include: ReleasePackage[] } }; steps: Step[] } };
};

test("publishes the compiled builder through the parent repository main release", () => {
  expect(release.on.push.branches).toEqual(["main"]);
  expect(release.jobs.release.strategy["max-parallel"]).toBe(1);
  expect(release.jobs.release.strategy.matrix.include).toContainEqual(expect.objectContaining({
    name: "@flanksource/page-runtime-build", directory: "packages/page-runtime", manifest: "builder-package.json", build_package: "@flanksource/page-runtime", build_script: "build:builder", publish_directory: "packages/page-runtime/dist/build",
  }));
  const steps = release.jobs.release.steps;
  expect(steps.find(step => step.name === "Publish to npm")?.["working-directory"]).toBe("${{ matrix.publish_directory }}");
  expect(steps.find(step => step.name === "Publish to npm")?.run).toContain("--provenance");
  expect(steps.find(step => step.name === "Build library")?.run).toContain("${{ matrix.build_package }} run ${{ matrix.build_script }}");
  expect(steps.find(step => step.name === "Commit, tag, and push")?.env?.MANIFEST).toBe("${{ matrix.directory }}/${{ matrix.manifest }}");
});

test("validates and packs the builder in parent CI before release", () => {
  const ci = parse(readFileSync(new URL(".github/workflows/page-runtime.yml", root), "utf8")) as { jobs: Record<string, { steps: Step[] }> };
  const steps = ci.jobs.runtime?.steps ?? [];
  expect(steps.some(step => step.run?.includes("@flanksource/page-runtime build"))).toBe(true);
  expect(steps.some(step => step.run?.includes("vitest run"))).toBe(true);
  expect(steps.some(step => step.run?.includes("dist/build") && step.run.includes("pack --out"))).toBe(true);
  expect(steps.some(step => step.with?.["node-version"] === "24")).toBe(true);
});

test("releases the runtime and its picker dependency from the parent repository", () => {
  const packages = release.jobs.release.strategy.matrix.include;
  for (const name of ["@flanksource/page-runtime", "@flanksource/react-grab"]) {
    expect(packages).toContainEqual(expect.objectContaining({ name, manifest: "package.json" }));
  }
  const build = release.jobs.release.steps.find(step => step.name === "Build complete runtime")?.run;
  expect(build).toContain("@flanksource/clicky-ui build");
  expect(build).toContain("@flanksource/react-grab build");
  expect(build).toContain("@flanksource/page-runtime build");
});

test("attributes compiler provenance to the parent repository", () => {
  const manifest = JSON.parse(readFileSync(new URL("packages/page-runtime/builder-package.json", root), "utf8")) as { repository?: { url?: string; directory?: string }; private?: boolean };
  expect(manifest.repository).toEqual({ type: "git", url: "https://github.com/flanksource/clicky-ui.git", directory: "packages/page-runtime" });
  expect(manifest.private).not.toBe(true);
});
