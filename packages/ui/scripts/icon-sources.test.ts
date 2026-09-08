import { describe, expect, it, vi } from "vitest";

import { readIconSource, type IconSourceIO } from "./icon-sources";

function sourceIO(filesBySuffix: Record<string, string>): IconSourceIO {
  const find = (path: string) =>
    Object.entries(filesBySuffix).find(([suffix]) => path.endsWith(suffix));
  return {
    exists: (path) => find(path) !== undefined,
    read: vi.fn(async (path) => {
      const file = find(path);
      if (!file) throw new Error(`unexpected read: ${path}`);
      return file[1];
    }),
  };
}

describe("readIconSource", () => {
  it("reads Iconify sources exclusively from the vendored SVG path", async () => {
    const spec = "ph:identification-card-fill";
    const pathSuffix = "/icons/svg/remote/ph__identification-card-fill.svg";
    const io = sourceIO({ [pathSuffix]: "<svg>identification card</svg>" });

    await expect(
      readIconSource({ spec, consumerName: "identification-card", io }),
    ).resolves.toBe("<svg>identification card</svg>");
    expect(io.read).toHaveBeenCalledWith(
      expect.stringMatching(/ph__identification-card-fill\.svg$/),
    );
  });

  it("resolves an explicitly named incumbent from the vendored SVG directory", async () => {
    const io = sourceIO({
      "/icons/svg/fixture.svg": "<svg>fixture</svg>",
    });

    await expect(
      readIconSource({
        spec: "incumbent:fixture",
        consumerName: "change-fixture",
        io,
      }),
    ).resolves.toBe("<svg>fixture</svg>");
  });

  it("fails with the refresh command when a vendored source is missing", async () => {
    const spec = "ph:clipboard-text-light";

    await expect(
      readIconSource({
        spec,
        consumerName: "clipboard-text",
        io: sourceIO({}),
      }),
    ).rejects.toThrow(
      `Missing vendored SVG for "${spec}". Run "pnpm --filter @flanksource/clicky-ui download:icons" and commit the generated SVG files.`,
    );
  });
});
