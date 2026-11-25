import { describe, expect, it } from "vitest";
import {
  cloudResourceRows,
  kubernetesResourceRows,
} from "./resource-icon-catalog";
import { generateResourceVariants } from "./resource-icon-codegen";

const glyph = {
  inner: '<path d="M4 4h16v16H4z" fill="currentColor"/>',
  viewBox: "0 0 24 24",
  spec: "ph:example-light",
};
const kubernetesGlyph = { ...glyph, spec: kubernetesResourceRows[0].outline! };

describe("resource icon generation", () => {
  it("emits the requested cloud background and three offline provider badges", () => {
    const generated = generateResourceVariants({
      row: cloudResourceRows[0],
      baseName: "UiCloudVm",
      base: glyph,
    });
    expect(generated.names).toEqual([
      "UiCloudVmSquare",
      "UiCloudVmAws",
      "UiCloudVmAzure",
      "UiCloudVmGcp",
    ]);
    expect(generated.imports.join("\n")).toContain("@flanksource/icons/mi");
    expect(generated.parts.join("\n")).toContain('data-background="square"');
    expect(generated.parts.join("\n")).toContain("#2563EB");
    expect(generated.parts.join("\n")).toContain(
      '__consumerName: "cloud-vm-aws"',
    );
  });

  it("recreates the Kubernetes blue and white octagon from the upstream glyph", () => {
    const generated = generateResourceVariants({
      row: kubernetesResourceRows[0],
      baseName: "UiKubeClusterRole",
      base: kubernetesGlyph,
      upstream: {
        ...kubernetesGlyph,
        inner: '<path fill="#fff" d="M5 5h14v14H5z"/>',
      },
    });
    expect(generated.names).toEqual(["UiKubeClusterRoleOctagon"]);
    expect(generated.parts.join("\n")).toContain("#326ce5");
    expect(generated.parts.join("\n")).toContain('fill="#fff"');
    expect(generated.imports).toEqual([]);
    expect(generated.parts.join("\n")).toContain(
      '__consumerName: "kube-cluster-role-octagon"',
    );
  });

  it("fails when an upstream Kubernetes glyph is required but missing", () => {
    expect(() =>
      generateResourceVariants({
        row: kubernetesResourceRows[0],
        baseName: "UiKubeClusterRole",
        base: kubernetesGlyph,
      }),
    ).toThrow("upstream glyph");
  });
});
