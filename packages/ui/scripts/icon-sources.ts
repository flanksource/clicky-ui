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
  dark?: string;
  componentName?: string;
  label?: string;
  family?: string;
  concept?: string;
  variation?: string;
  tone?: string;
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
export const downloadedSvgDir = join(svgSourceDir, "downloaded");
export const DOWNLOAD_ICONS_COMMAND =
  "pnpm --filter @flanksource/clicky-ui download:icons";

export function pascalCase(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join("");
}

export function stripUirPrefix(name: string): string {
  if (name.startsWith("uir-sql-"))
    return "sql-" + name.slice("uir-sql-".length);
  if (name.startsWith("uir-")) return name.slice("uir-".length);
  return name;
}

export function componentNameForSelection(row: SelectionRow): string {
  if (row.group === "programming") {
    if (
      !row.componentName ||
      !/^Ui[A-Z][A-Za-z0-9]*$/.test(row.componentName) ||
      row.componentName.startsWith("UiProgramming")
    )
      throw new Error(`Invalid component name for "${row.consumerName}"`);
    return row.componentName;
  }
  return `Ui${pascalCase(
    stripUirPrefix(resolveAliasTarget(row.consumerName) ?? row.consumerName),
  )}`;
}

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

export function downloadedSvgPath(spec: string): string {
  const name = spec.startsWith("jb-download:")
    ? spec.slice("jb-download:".length)
    : spec.startsWith("jb-download-unverified:")
      ? spec.slice("jb-download-unverified:".length)
      : "";
  if (!/^[a-z][a-z0-9-]*$/.test(name)) {
    throw new Error(`Invalid downloaded JetBrains icon source "${spec}"`);
  }
  return join(downloadedSvgDir, `${name}.svg`);
}

export function jetbrainsIconUrl(spec: string): string {
  const path = spec.startsWith("jb-site:") ? spec.slice("jb-site:".length) : "";
  if (
    !/^[A-Za-z][A-Za-z0-9]*\/[A-Za-z0-9@_-]+(?:\/[A-Za-z0-9@_-]+)+$/.test(path)
  ) {
    throw new Error(`Invalid JetBrains icon source "${spec}"`);
  }
  return `https://intellij-icons.jetbrains.design/icons/${path}.svg`;
}

export function validateJetbrainsSvg(spec: string, svg: string): string {
  if (!hasJetbrainsApacheHeader(svg)) {
    throw new Error(
      `JetBrains icon "${spec}" has no Apache 2.0 license header`,
    );
  }
  return svg;
}

export function hasJetbrainsApacheHeader(svg: string): boolean {
  return /Apache(?: License,? Version| 2\.0 license)/i.test(svg);
}

export function validateDownloadedSvg(spec: string, svg: string): string {
  if (!/<svg\b[^>]*>[\s\S]*<\/svg>\s*$/i.test(svg)) {
    throw new Error(`JetBrains icon "${spec}" is not complete SVG artwork`);
  }
  if (
    /<(?:script|foreignObject|iframe)\b|\bon[a-z]+\s*=|(?:href|xlink:href)\s*=\s*["']\s*javascript:/i.test(
      svg,
    )
  ) {
    throw new Error(`JetBrains icon "${spec}" contains unsafe SVG artwork`);
  }
  return svg;
}

export function validateJetbrainsCatalog(
  specs: string[],
  catalog: Array<{
    set: string;
    icons: Array<{ section: string; name: string; kind: string }>;
  }>,
): void {
  const paths = new Set(
    catalog.flatMap(({ set, icons }) =>
      icons
        .filter(({ kind }) => kind === "svg")
        .map(({ section, name }) => `${set}/${section}/${name}`),
    ),
  );
  for (const spec of specs) {
    const path = spec.slice("jb-site:".length);
    jetbrainsIconUrl(spec);
    if (!paths.has(path))
      throw new Error(
        `JetBrains icon "${spec}" not found in JetBrains data.json`,
      );
  }
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
  if (spec.startsWith("jb-site:")) return false;
  if (spec.startsWith("jb-download:")) return false;
  if (spec.startsWith("jb-download-unverified:")) return false;
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
      return [row.outline, row.filled, row.dark]
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
    spec.startsWith("jb-download:") ||
    spec.startsWith("jb-download-unverified:")
      ? [downloadedSvgPath(spec)]
      : spec === "incumbent" || spec.startsWith("incumbent:")
        ? incumbentSvgPaths(spec, consumerName)
        : [remoteSvgPath(spec)];
  const path = paths.find(io.exists);
  if (path) {
    const svg = await io.read(path);
    if (spec.startsWith("jb-download:"))
      return validateDownloadedSvg(spec, validateJetbrainsSvg(spec, svg));
    if (spec.startsWith("jb-download-unverified:"))
      return validateDownloadedSvg(spec, svg);
    return spec.startsWith("jb-site:") ? validateJetbrainsSvg(spec, svg) : svg;
  }
  throw new Error(
    `Missing vendored SVG for "${spec}". Run "${DOWNLOAD_ICONS_COMMAND}" and commit the generated SVG files.`,
  );
}
