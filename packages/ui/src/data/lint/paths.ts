// Path handling shared by the groupings and the ignore actions. Violations
// report absolute paths; groupings and `.gavel.yaml` ignore patterns work on
// paths relative to the linter's work_dir.

export function normalizeLintPath(path: string): string {
  return path.replace(/\\/g, "/").replace(/\/+/g, "/").replace(/\/$/, "");
}

/** `file` relative to `workDir` when it lives under it, else the normalised path. */
export function relPath(file: string | undefined, workDir: string | undefined): string | undefined {
  if (!file) return undefined;
  const normalizedFile = normalizeLintPath(file);
  if (!workDir) return normalizedFile;
  const prefix = normalizeLintPath(workDir).replace(/\/?$/, "/");
  return normalizedFile.startsWith(prefix) ? normalizedFile.slice(prefix.length) : normalizedFile;
}

/**
 * Path segments of a file, with gavel's `.shell/checkout/<name>` working
 * checkout prefix kept as a single folder so it does not add two empty levels.
 */
export function collapsedPathSegments(path: string): string[] {
  const parts = normalizeLintPath(path).split("/").filter(Boolean);
  if (parts.length >= 3 && parts[0] === ".shell" && parts[1] === "checkout") {
    return [`${parts[0]}/${parts[1]}/${parts[2]}`, ...parts.slice(3)];
  }
  return parts;
}

/** The last two segments of a work dir, e.g. `/repo/gavel/web` -> `gavel/web`. */
export function workDirLabel(workDir: string): string {
  const parts = normalizeLintPath(workDir).split("/").filter(Boolean);
  if (parts.length >= 2) return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  if (parts.length === 1) return parts[0]!;
  return normalizeLintPath(workDir);
}

/** Prefix a file with its work dir label when the results span several roots. */
export function decorateLintFile(
  file: string | undefined,
  workDir: string | undefined,
  multiRoot: boolean,
): string | undefined {
  if (!file || !multiRoot || !workDir) return file;
  return `${workDirLabel(workDir)}/${file}`;
}
