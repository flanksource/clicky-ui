import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import { EXTENSION_ICON_SIZES } from "../src/bookmarklet/gavel-icon";
import { writeExtensionIcons } from "./extension-icons";

let dir: string | undefined;
afterEach(async () => {
  if (dir) await rm(dir, { recursive: true, force: true });
  dir = undefined;
});

/** Width and height from a PNG's IHDR chunk, after checking its signature. */
function pngSize(bytes: Buffer): { width: number; height: number } {
  expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

it("writes the gavel icon as a square PNG at every size the manifest names", async () => {
  dir = await mkdtemp(join(tmpdir(), "grabber-icons-"));
  await writeExtensionIcons(dir);
  expect((await readdir(join(dir, "icons"))).sort()).toEqual(EXTENSION_ICON_SIZES.map((size) => `icon-${size}.png`).sort());
  for (const size of EXTENSION_ICON_SIZES) expect(pngSize(await readFile(join(dir, "icons", `icon-${size}.png`)))).toEqual({ width: size, height: size });
});

it("draws something: the gavel's white strokes differ from the blue background", async () => {
  dir = await mkdtemp(join(tmpdir(), "grabber-icons-"));
  await writeExtensionIcons(dir);
  const sharp = (await import("sharp")).default;
  const { data } = await sharp(join(dir, "icons", "icon-128.png")).raw().toBuffer({ resolveWithObject: true });
  const colors = new Set<string>();
  for (let offset = 0; offset < data.length; offset += 4) colors.add(`${data[offset]},${data[offset + 1]},${data[offset + 2]}`);
  expect(colors.has("37,99,235")).toBe(true);
  expect(colors.has("255,255,255")).toBe(true);
});
