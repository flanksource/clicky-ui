import { existsSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { buildIcons } from "./build-icons";
import * as iconSources from "./icon-sources";
import {
  cloudResourceRows,
  kubernetesResourceRows,
} from "./resource-icon-catalog";
import {
  iconSourceRequests,
  isIconifySpec,
  kubernetesCommunitySvgPath,
  packageRoot,
  readIconSelections,
  readIconSource,
} from "./icon-sources";

const podSource = "k8s-community:resources/unlabeled/pod";
const podPath = join(
  packageRoot,
  "icons/svg/kubernetes/resources/unlabeled/pod.svg",
);

describe("resource icon sources", () => {
  it("includes each resource source in the shared build and download selections", async () => {
    const selections = await readIconSelections();
    const resourceRequests = iconSourceRequests({
      rows: selections.rows.filter((row) => row.resource),
    });
    expect(resourceRequests).toEqual(
      [...cloudResourceRows, ...kubernetesResourceRows].map((row) => ({
        spec: row.outline,
        consumerName: row.consumerName,
      })),
    );
    expect(
      selections.rows.filter((row) => row.consumerName === "kube-pod"),
    ).toEqual([expect.objectContaining({ outline: podSource })]);
    expect(selections.rows).toContainEqual(
      expect.objectContaining({
        consumerName: "cloud-upload",
        outline: "ph:cloud-arrow-up-light",
      }),
    );
  });

  it("resolves a Kubernetes source to its vendored SVG", () => {
    expect(kubernetesCommunitySvgPath(podSource)).toBe(podPath);
  });

  it.each([
    "ph:pod-light",
    "k8s-community:../pod",
    "k8s-community:/resources/unlabeled/pod",
    "k8s-community:resources/../pod",
    "k8s-community:",
  ])("rejects invalid Kubernetes source %s", (spec) => {
    expect(() => kubernetesCommunitySvgPath(spec)).toThrow(
      "Invalid Kubernetes icon source",
    );
  });

  it("reads Kubernetes artwork offline and excludes it from Iconify requests", async () => {
    expect(isIconifySpec(podSource)).toBe(false);
    expect(
      await readIconSource({ spec: podSource, consumerName: "kube-pod" }),
    ).toBe(await readFile(podPath, "utf8"));
  });

  it("fails when a vendored Kubernetes source is missing", async () => {
    await expect(
      readIconSource({
        spec: "k8s-community:resources/unlabeled/missing-resource",
        consumerName: "kube-missing-resource",
      }),
    ).rejects.toThrow("Missing vendored SVG");
  });

  it("reports the missing resource source, removes staging, and preserves generated icons", async () => {
    const stagingPath = join(packageRoot, "src/icons.tmp");
    const barrelPath = join(packageRoot, "src/icons/index.ts");
    const originalBarrel = await readFile(barrelPath, "utf8");
    const missingSourceError = `Missing vendored SVG for kube-pod (${podSource}). Run download:icons.`;
    const readOriginalSource = iconSources.readIconSource;
    vi.spyOn(iconSources, "readIconSource").mockImplementation((request) => {
      if (request.spec === podSource)
        return Promise.reject(new Error(missingSourceError));
      return readOriginalSource(request);
    });
    try {
      await expect
        .soft(buildIcons({ force: true }))
        .rejects.toThrow(missingSourceError);
      expect.soft(existsSync(stagingPath)).toBe(false);
      expect(await readFile(barrelPath, "utf8")).toBe(originalBarrel);
    } finally {
      vi.restoreAllMocks();
      await rm(stagingPath, { recursive: true, force: true });
    }
  });
});
