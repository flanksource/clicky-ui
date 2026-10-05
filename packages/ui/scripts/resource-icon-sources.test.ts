import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
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
});
