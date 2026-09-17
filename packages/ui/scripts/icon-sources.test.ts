import { describe, expect, it, vi } from "vitest";

import {
  iconSourceRequests,
  isIconifySpec,
  jetbrainsIconUrl,
  validateJetbrainsCatalog,
  validateJetbrainsSvg,
  readIconSource,
  type IconSourceIO,
} from "./icon-sources";

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

describe("JetBrains site sources", () => {
  const spec = "jb-site:DatabaseIcons/icons/expui/columnGoldKey";

  it("resolves a data.json icon path without sending it to Iconify", () => {
    expect(isIconifySpec(spec)).toBe(false);
    expect(jetbrainsIconUrl(spec)).toBe(
      "https://intellij-icons.jetbrains.design/icons/DatabaseIcons/icons/expui/columnGoldKey.svg",
    );
  });

  it("rejects invalid or traversal paths", () => {
    expect(() => jetbrainsIconUrl("jb-site:DatabaseIcons/../secret")).toThrow(
      "Invalid JetBrains icon source",
    );
  });

  it("includes site icons in the offline source manifest", () => {
    expect(
      iconSourceRequests({
        rows: [
          {
            consumerName: "sql-primary-key",
            group: "database",
            status: "NEW",
            outline: spec,
            filled: "skip",
            note: "",
          },
        ],
      }),
    ).toEqual([{ spec, consumerName: "sql-primary-key" }]);
  });

  it("requires the Apache header before vending a site SVG", () => {
    const licensed = "<!-- Licensed under the Apache 2.0 license -->\n<svg/>";
    expect(validateJetbrainsSvg(spec, licensed)).toBe(licensed);
    expect(() => validateJetbrainsSvg(spec, "<svg/>")).toThrow(
      `JetBrains icon "${spec}" has no Apache 2.0 license header`,
    );
    const io = sourceIO({
      "/icons/svg/remote/jb-site__DatabaseIcons__icons__expui__columnGoldKey.svg":
        "<svg/>",
    });
    return expect(
      readIconSource({ spec, consumerName: "sql-primary-key", io }),
    ).rejects.toThrow(
      `JetBrains icon "${spec}" has no Apache 2.0 license header`,
    );
  });

  it("accepts only SVG paths present in data.json", () => {
    const catalog = [
      {
        set: "DatabaseIcons",
        icons: [{ section: "icons/expui", name: "columnGoldKey", kind: "svg" }],
      },
    ];
    expect(() => validateJetbrainsCatalog([spec], catalog)).not.toThrow();
    expect(() =>
      validateJetbrainsCatalog(
        ["jb-site:DatabaseIcons/icons/expui/missing"],
        catalog,
      ),
    ).toThrow("not found in JetBrains data.json");
  });
});

describe("downloaded JetBrains sources", () => {
  const light = "jb-download:variable-alt-1";
  const dark = "jb-download:variable-alt-1-dark";
  const withoutHeader = "jb-download-unverified:message-queue";

  it("keeps theme variants in the offline source manifest", () => {
    expect(isIconifySpec(light)).toBe(false);
    expect(
      iconSourceRequests({
        rows: [
          {
            consumerName: "programming-variable-alt-1",
            group: "programming",
            status: "NEW",
            outline: light,
            filled: null,
            dark,
            note: "",
          },
        ],
      }),
    ).toEqual([
      { spec: light, consumerName: "programming-variable-alt-1" },
      { spec: dark, consumerName: "programming-variable-alt-1" },
    ]);
  });

  it("reads the exact licensed local file and rejects traversal", async () => {
    const svg = '<!-- Apache 2.0 license -->\n<svg><path d="M1 1h1"/></svg>';
    const io = sourceIO({ "/icons/svg/downloaded/variable-alt-1.svg": svg });
    await expect(
      readIconSource({
        spec: light,
        consumerName: "programming-variable-alt-1",
        io,
      }),
    ).resolves.toBe(svg);
    expect(io.read).toHaveBeenCalledWith(
      expect.stringMatching(/icons\/svg\/downloaded\/variable-alt-1\.svg$/),
    );
    await expect(
      readIconSource({
        spec: "jb-download:../secret",
        consumerName: "bad",
        io,
      }),
    ).rejects.toThrow("Invalid downloaded JetBrains icon source");
  });

  it("loads explicitly unverified artwork while retaining the verified header check", async () => {
    const svg = '<svg viewBox="0 0 16 16"><path d="M1 1h1"/></svg>';
    const io = sourceIO({ "/icons/svg/downloaded/message-queue.svg": svg });
    expect(isIconifySpec(withoutHeader)).toBe(false);
    await expect(
      readIconSource({
        spec: withoutHeader,
        consumerName: "programming-message-queue",
        io,
      }),
    ).resolves.toBe(svg);
    await expect(
      readIconSource({
        spec: "jb-download:message-queue",
        consumerName: "programming-message-queue",
        io,
      }),
    ).rejects.toThrow("has no Apache 2.0 license header");
    await expect(
      readIconSource({
        spec: "jb-download-unverified:../secret",
        consumerName: "bad",
        io,
      }),
    ).rejects.toThrow("Invalid downloaded JetBrains icon source");
  });

  it("rejects invalid unverified SVG artwork", async () => {
    const io = sourceIO({
      "/icons/svg/downloaded/message-queue.svg":
        "<svg><script>alert(1)</script></svg>",
    });
    await expect(
      readIconSource({
        spec: withoutHeader,
        consumerName: "programming-message-queue",
        io,
      }),
    ).rejects.toThrow("unsafe SVG artwork");
  });
});
