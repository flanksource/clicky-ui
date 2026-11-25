import { describe, expect, it } from "vitest";
import { resourceIconPalette } from "../src/resource-icon-palette";
import {
  cloudResourceRows,
  kubernetesResourceRows,
} from "./resource-icon-catalog";

describe("resource icon catalog", () => {
  it("covers the chosen cloud resources and all unique Kubernetes sources", () => {
    expect(cloudResourceRows).toHaveLength(12);
    expect(kubernetesResourceRows).toHaveLength(39);
    expect(new Set(kubernetesResourceRows.map((row) => row.outline)).size).toBe(
      39,
    );
    expect(
      new Set(
        [...cloudResourceRows, ...kubernetesResourceRows].map(
          (row) => row.consumerName,
        ),
      ).size,
    ).toBe(51);
    expect(cloudResourceRows.every((row) => row.resource.providerBadges)).toBe(
      true,
    );
    expect(
      kubernetesResourceRows.every((row) =>
        row.resource.backgrounds.includes("octagon"),
      ),
    ).toBe(true);
  });

  it("uses a defined two-tone palette category for every resource", () => {
    for (const row of [...cloudResourceRows, ...kubernetesResourceRows]) {
      const { primary, accent } = resourceIconPalette[row.resource.category];
      expect(primary).toMatch(/^#[0-9A-F]{6}$/);
      expect(accent).toMatch(/^#[0-9A-F]{6}$/);
      expect(primary).not.toBe(accent);
    }
  });
});
