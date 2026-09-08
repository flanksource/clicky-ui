import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export type IconSourceIO = {
  exists: (path: string) => boolean;
  read: (path: string) => Promise<string>;
};

export type SelectionRow = {
  consumerName: string;
  group: string;
  status: "NEW" | "EXISTS" | "ALIAS";
  outline: string | null;
  filled: string | null;
  note: string;
};

export type Selections = { rows: SelectionRow[] };

export type IconSourceRequest = { spec: string; consumerName: string };

const here = dirname(fileURLToPath(import.meta.url));

export const packageRoot = join(here, "..");
export const selectionsPath = join(
  packageRoot,
  "icons",
  "icon-selections.json",
);
export const svgSourceDir = join(packageRoot, "icons", "svg");
export const remoteSvgDir = join(svgSourceDir, "remote");
export const DOWNLOAD_ICONS_COMMAND =
  "pnpm --filter @flanksource/clicky-ui download:icons";

export function resolveAliasTarget(consumerName: string): string | null {
  const arrow = consumerName.indexOf(" -> ");
  if (arrow < 0) return null;
  return consumerName
    .slice(arrow + 4)
    .replace(/\s*\(.*\)\s*$/, "")
    .trim();
}

export function cacheFileName(spec: string): string {
  return spec.replace(/[^a-zA-Z0-9._-]+/g, "__") + ".svg";
}

export function remoteSvgPath(spec: string): string {
  return join(remoteSvgDir, cacheFileName(spec));
}

export function incumbentSvgPaths(
  spec: string,
  consumerName: string,
): string[] {
  const explicit = spec.startsWith("incumbent:")
    ? spec.slice("incumbent:".length)
    : null;
  const candidates = explicit
    ? [explicit]
    : [
        consumerName,
        consumerName.replace(/^change-/, "").replace(/^uir-(sql-)?/, ""),
      ];
  return [...new Set(candidates)].map((candidate) =>
    join(svgSourceDir, `${candidate}.svg`),
  );
}

export function isIconifySpec(spec: string): boolean {
  if (spec === "incumbent" || spec.startsWith("incumbent:")) return false;
  const colon = spec.indexOf(":");
  return colon > 0 && !spec.slice(0, colon).startsWith("jb-expui-");
}

export function iconSourceRequests(
  selections: Selections,
): IconSourceRequest[] {
  return selections.rows
    .filter((row) => row.group !== "change-types")
    .flatMap((row) => {
      const consumerName =
        resolveAliasTarget(row.consumerName) ?? row.consumerName;
      return [row.outline, row.filled]
        .filter(
          (spec): spec is string =>
            !!spec && spec !== "skip" && spec !== "maintain",
        )
        .map((spec) => ({ spec, consumerName }));
    });
}

const localSourceIO: IconSourceIO = {
  exists: existsSync,
  read: (path) => readFile(path, "utf8"),
};

export async function readIconSource(options: {
  spec: string;
  consumerName: string;
  io?: IconSourceIO;
}): Promise<string> {
  const { spec, consumerName, io = localSourceIO } = options;
  const paths =
    spec === "incumbent" || spec.startsWith("incumbent:")
      ? incumbentSvgPaths(spec, consumerName)
      : [remoteSvgPath(spec)];
  const path = paths.find(io.exists);
  if (path) return io.read(path);
  throw new Error(
    `Missing vendored SVG for "${spec}". Run "${DOWNLOAD_ICONS_COMMAND}" and commit the generated SVG files.`,
  );
}
