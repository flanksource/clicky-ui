// Turns raw linter results into the selectable tree for each grouping. Ported
// from gavel's testrunner/ui utils.ts. Differences from the original:
//   - a linter that failed to run is shown under every grouping (gavel only
//     showed it in `summary`), so a broken linter never reads as a clean run;
//   - single-child folder chains are really collapsed ("pkg > sub > a.go");
//     gavel's collapser never fired because folder nodes always carry a
//     passed/failed flag;
//   - file-scoped rule leaves in `file-linter-rule` carry their work_dir, so
//     ignore actions on them are not sent without one.

import { matchesFilterState } from "../test-runner/filterState";
import { slugify } from "../test-runner/routePath";
import { collapsedPathSegments, decorateLintFile, normalizeLintPath, relPath } from "./paths";
import { isLinterErrored, linterErrorMessage, severityOf, worstSeverity } from "./stats";
import type {
  LintFilters,
  LintGrouping,
  LintNode,
  LinterResult,
  Violation,
} from "./types";

type Draft = Omit<LintNode, "route_path" | "children"> & { children?: Draft[] };

type FlatViolation = {
  linter: string;
  result: LinterResult;
  v: Violation;
  file: string | undefined;
  rawFile: string | undefined;
  workDir: string | undefined;
};

type FileBucket = { rawFile: string; workDir: string | undefined; violations: Violation[] };

type Trie<L> = {
  name: string;
  path: string | undefined;
  rawPath: string;
  folders: Map<string, Trie<L>>;
  leaves: Map<string, L>;
};

const NO_RULE = "(no rule)";
const SUMMARY_FILE_LIMIT = 5;

function ruleKeyFor(v: Violation): string {
  return v.rule?.method || NO_RULE;
}

function byLine(violations: readonly Violation[]): Violation[] {
  return violations.slice().sort((a, b) => (a.line ?? 0) - (b.line ?? 0));
}

function firstLine(s: string): string {
  const idx = s.indexOf("\n");
  return idx === -1 ? s : s.slice(0, idx);
}

function groupBy<T, K>(items: readonly T[], key: (item: T) => K): Map<K, T[]> {
  const out = new Map<K, T[]>();
  for (const item of items) {
    const list = out.get(key(item));
    if (list) list.push(item);
    else out.set(key(item), [item]);
  }
  return out;
}

function sortedKeys<V>(map: Map<string, V>): string[] {
  return Array.from(map.keys()).sort();
}

// ---------------------------------------------------------------------------
// Flattening

function flattenLint(results: readonly LinterResult[], filters: LintFilters): FlatViolation[] {
  const visible = results.filter((r) => matchesFilterState(r.linter, filters.linter));
  const multiRoot = new Set(visible.flatMap((r) => (r.work_dir ? [normalizeLintPath(r.work_dir)] : []))).size > 1;
  const out: FlatViolation[] = [];
  for (const result of visible) {
    for (const v of result.violations ?? []) {
      if (!matchesFilterState(severityOf(v), filters.severity)) continue;
      const rawFile = relPath(v.file, result.work_dir);
      const file = decorateLintFile(rawFile, result.work_dir, multiRoot);
      out.push({
        linter: result.linter,
        result,
        v: { ...v, raw_file: rawFile, file },
        file,
        rawFile,
        workDir: result.work_dir,
      });
    }
  }
  return out;
}

function linterMetaOf(results: readonly LinterResult[]): Map<string, LinterResult> {
  const meta = new Map<string, LinterResult>();
  for (const r of results) if (!meta.has(r.linter)) meta.set(r.linter, r);
  return meta;
}

// ---------------------------------------------------------------------------
// Path trie

function newTrie<L>(): Trie<L> {
  return { name: "", path: undefined, rawPath: "", folders: new Map(), leaves: new Map() };
}

/** The leaf for `file`, created through `create` on first sight; folders are made on the way. */
function trieLeaf<L>(root: Trie<L>, file: string, rawFile: string, create: () => L): L {
  const segments = collapsedPathSegments(file);
  const rawSegments = collapsedPathSegments(rawFile);
  if (segments.length === 0 || rawSegments.length === 0) {
    throw new Error(`lint: cannot place violation, empty path (file=${JSON.stringify(file)}, raw=${JSON.stringify(rawFile)})`);
  }
  const folderSegments = segments.slice(0, -1);
  const rawFolderSegments = rawSegments.slice(0, -1);
  // The decorated path may carry extra leading segments (the work dir label)
  // that the raw, work_dir-relative path does not.
  const rawOffset = folderSegments.length - rawFolderSegments.length;
  let current = root;
  folderSegments.forEach((segment, i) => {
    let child = current.folders.get(segment);
    if (!child) {
      const rawCount = Math.max(0, Math.min(rawFolderSegments.length, i + 1 - rawOffset));
      child = {
        name: segment,
        path: current.path ? `${current.path}/${segment}` : segment,
        rawPath: rawFolderSegments.slice(0, rawCount).join("/"),
        folders: new Map(),
        leaves: new Map(),
      };
      current.folders.set(segment, child);
    }
    current = child;
  });
  const basename = segments[segments.length - 1]!;
  let leaf = current.leaves.get(basename);
  if (!leaf) {
    leaf = create();
    current.leaves.set(basename, leaf);
  }
  return leaf;
}

// ---------------------------------------------------------------------------
// Node builders

function container(name: string, kind: Draft["kind"], children: Draft[]): Draft {
  const failed = children.some((c) => c.failed);
  return { name, kind, children, failed, passed: !failed, skipped: false };
}

function uniqueWorkDir(children: readonly Draft[]): string | undefined {
  const dirs = new Set(children.flatMap((c) => (c.work_dir ? [c.work_dir] : [])));
  return dirs.size === 1 ? Array.from(dirs)[0] : undefined;
}

function withNoFileViolations(node: Draft, noFile: readonly Violation[]): Draft {
  if (noFile.length === 0) return node;
  const failed = node.failed || worstSeverity(noFile) !== "info";
  return { ...node, noFileViolations: byLine(noFile), failed, passed: !failed };
}

function violationLeaf(args: {
  name: string;
  kind: "lint-file" | "lint-rule";
  file: string;
  rawFile: string;
  linterName: string;
  violations: readonly Violation[];
  workDir: string | undefined;
}): Draft {
  const failed = worstSeverity(args.violations) !== "info";
  return {
    name: args.name,
    kind: args.kind,
    file: args.file,
    target_path: args.rawFile,
    work_dir: args.workDir,
    linterName: args.linterName,
    violations: byLine(args.violations),
    failed,
    passed: !failed,
    skipped: false,
  };
}

function linterNode(
  linterName: string,
  result: LinterResult | undefined,
  children: Draft[],
  noFile: readonly Violation[] = [],
): Draft {
  return withNoFileViolations({ ...container(linterName, "linter", children), linter: result, linterName }, noFile);
}

function linterErrorNode(result: LinterResult): Draft {
  const message = linterErrorMessage(result);
  return {
    name: firstLine(message),
    kind: "linter-error",
    linterName: result.linter,
    linter: result,
    work_dir: result.work_dir,
    failed: true,
    passed: false,
    skipped: false,
    message,
  };
}

function fileNodes(trie: Trie<FileBucket>, linterName: string, ruleName?: string): Draft[] {
  const folders = sortedKeys(trie.folders).map((key) => {
    const folder = trie.folders.get(key)!;
    const node = container(folder.name, "lint-folder", fileNodes(folder, linterName, ruleName));
    return {
      ...node,
      file: folder.path,
      target_path: folder.rawPath,
      linterName,
      ...(ruleName ? { ruleName } : {}),
      work_dir: uniqueWorkDir(node.children!),
    };
  });
  const files = sortedKeys(trie.leaves).map((key) => {
    const bucket = trie.leaves.get(key)!;
    const fullPath = trie.path ? `${trie.path}/${key}` : key;
    const leaf = violationLeaf({
      name: key,
      kind: "lint-file",
      file: fullPath,
      rawFile: bucket.rawFile,
      linterName,
      violations: bucket.violations,
      workDir: bucket.workDir,
    });
    return ruleName ? { ...leaf, ruleName } : leaf;
  });
  return [...folders, ...files];
}

type FileLinters = Map<string, { workDir: string | undefined; rules: Map<string, Violation[]> }>;

function fileLinterNodes(trie: Trie<FileLinters>, linterMeta: Map<string, LinterResult>): Draft[] {
  const folders = sortedKeys(trie.folders).map((key) => {
    const folder = trie.folders.get(key)!;
    const node = container(folder.name, "lint-folder", fileLinterNodes(folder, linterMeta));
    return { ...node, file: folder.path, target_path: folder.rawPath, work_dir: uniqueWorkDir(node.children!) };
  });
  const files = sortedKeys(trie.leaves).map((key) => {
    const linters = trie.leaves.get(key)!;
    const fullPath = trie.path ? `${trie.path}/${key}` : key;
    const linterDrafts = sortedKeys(linters).map((linterName) => {
      const { workDir, rules } = linters.get(linterName)!;
      const ruleLeaves = sortedKeys(rules).map((rule) => {
        const violations = rules.get(rule)!;
        return {
          ...violationLeaf({
            name: rule,
            kind: "lint-rule",
            file: fullPath,
            rawFile: violations[0]?.raw_file ?? fullPath,
            linterName,
            violations,
            workDir,
          }),
          ruleName: rule,
        };
      });
      return {
        ...linterNode(linterName, linterMeta.get(linterName), ruleLeaves),
        file: fullPath,
        target_path: ruleLeaves[0]?.target_path,
        work_dir: workDir,
      };
    });
    return {
      ...container(key, "lint-file", linterDrafts),
      file: fullPath,
      target_path: linterDrafts[0]?.target_path,
      work_dir: uniqueWorkDir(linterDrafts),
    };
  });
  return [...folders, ...files];
}

// ---------------------------------------------------------------------------
// Groupings

function fileTrieFor(flat: readonly FlatViolation[]): Trie<FileBucket> {
  const trie = newTrie<FileBucket>();
  for (const f of flat) {
    if (!f.file) continue;
    trieLeaf(trie, f.file, f.rawFile ?? f.file, () => ({
      rawFile: f.rawFile ?? f.file!,
      workDir: f.workDir,
      violations: [],
    })).violations.push(f.v);
  }
  return trie;
}

function groupByLinterRuleFile(results: readonly LinterResult[], filters: LintFilters): Draft[] {
  const meta = linterMetaOf(results);
  const byLinter = groupBy(flattenLint(results, filters), (f) => f.linter);
  return Array.from(byLinter.keys())
    .sort()
    .map((linterName) => {
      const byRule = groupBy(byLinter.get(linterName)!, (f) => ruleKeyFor(f.v));
      const ruleNodes = Array.from(byRule.keys())
        .sort()
        .map((rule) => {
          const flats = byRule.get(rule)!;
          const children = fileNodes(fileTrieFor(flats), linterName, rule);
          const node = container(rule, "lint-rule-group", children);
          return withNoFileViolations(
            {
              ...node,
              linterName,
              ruleName: rule,
              work_dir: uniqueWorkDir(children) ?? meta.get(linterName)?.work_dir,
            },
            flats.filter((f) => !f.file).map((f) => f.v),
          );
        });
      return linterNode(linterName, meta.get(linterName), ruleNodes);
    });
}

function groupByLinterFile(results: readonly LinterResult[], filters: LintFilters): Draft[] {
  const meta = linterMetaOf(results);
  const byLinter = groupBy(flattenLint(results, filters), (f) => f.linter);
  return Array.from(byLinter.keys())
    .sort()
    .map((linterName) => {
      const flats = byLinter.get(linterName)!;
      return linterNode(
        linterName,
        meta.get(linterName),
        fileNodes(fileTrieFor(flats), linterName),
        flats.filter((f) => !f.file).map((f) => f.v),
      );
    });
}

function groupByFileLinterRule(results: readonly LinterResult[], filters: LintFilters): Draft[] {
  const meta = linterMetaOf(results);
  const flat = flattenLint(results, filters);
  const trie = newTrie<FileLinters>();
  for (const f of flat) {
    if (!f.file) continue;
    const linters = trieLeaf(trie, f.file, f.rawFile ?? f.file, () => new Map());
    let entry = linters.get(f.linter);
    if (!entry) {
      entry = { workDir: f.workDir, rules: new Map() };
      linters.set(f.linter, entry);
    }
    const rule = ruleKeyFor(f.v);
    entry.rules.set(rule, [...(entry.rules.get(rule) ?? []), f.v]);
  }

  const fileless = groupBy(flat.filter((f) => !f.file), (f) => f.linter);
  const filelessNodes = Array.from(fileless.keys())
    .sort()
    .map((linterName) => {
      const byRule = groupBy(fileless.get(linterName)!, (f) => ruleKeyFor(f.v));
      const workDir = meta.get(linterName)?.work_dir;
      const leaves = Array.from(byRule.keys())
        .sort()
        .map((rule) => ({
          ...violationLeaf({
            name: rule,
            kind: "lint-rule",
            file: "",
            rawFile: "",
            linterName,
            violations: byRule.get(rule)!.map((f) => f.v),
            workDir,
          }),
          ruleName: rule,
          file: undefined,
          target_path: undefined,
        }));
      return linterNode(linterName, meta.get(linterName), leaves);
    });

  return [...fileLinterNodes(trie, meta), ...filelessNodes];
}

function summaryFileLabel(file: string | undefined, violations: readonly Violation[]): string {
  if (!file) return "(no file)";
  if (violations.length > 1) return `${file} (${violations.length})`;
  const v = violations[0];
  if (v?.line) return v.column ? `${file}:${v.line}:${v.column}` : `${file}:${v.line}`;
  return file;
}

function summaryRuleNode(rule: string, linterName: string, flats: readonly FlatViolation[]): Draft {
  const byFile = groupBy(flats, (f) => f.file ?? "");
  const keys = Array.from(byFile.keys());
  const files: Draft[] = keys.slice(0, SUMMARY_FILE_LIMIT).map((key) => {
    const group = byFile.get(key)!;
    return {
      ...violationLeaf({
        name: summaryFileLabel(group[0]!.file, group.map((f) => f.v)),
        kind: "lint-file",
        file: group[0]!.file ?? "",
        rawFile: group[0]!.rawFile ?? "",
        linterName,
        violations: group.map((f) => f.v),
        workDir: group[0]!.workDir,
      }),
      file: group[0]!.file,
      target_path: group[0]!.rawFile,
      ruleName: rule,
    };
  });
  const remaining = keys.length - files.length;
  if (remaining > 0) {
    files.push({
      name: `… ${remaining} more file${remaining === 1 ? "" : "s"}`,
      kind: "lint-file",
      linterName,
      ruleName: rule,
      failed: false,
      passed: true,
      skipped: false,
    });
  }
  const firstMessage = flats.find((f) => f.v.message)?.v.message;
  const name = firstMessage ? `${rule} (${flats.length}) — ${firstMessage}` : `${rule} (${flats.length})`;
  return { ...container(name, "lint-rule-group", files), linterName, ruleName: rule };
}

function groupBySummary(results: readonly LinterResult[], filters: LintFilters): Draft[] {
  const meta = linterMetaOf(results);
  const flatByLinter = groupBy(flattenLint(results, filters), (f) => f.linter);
  const visible = results.filter((r) => matchesFilterState(r.linter, filters.linter));
  const skipped = new Map(visible.filter((r) => r.skipped).map((r) => [r.linter, r.error || "skipped"]));
  // Like the CLI --summary: every linter that ran is listed, even a clean one.
  return Array.from(new Set(visible.map((r) => r.linter)))
    .sort()
    .map((linterName) => {
      const flats = flatByLinter.get(linterName) ?? [];
      if (flats.length === 0 && skipped.has(linterName)) {
        return {
          name: linterName,
          kind: "linter" as const,
          linter: meta.get(linterName),
          linterName,
          skipped: true,
          passed: false,
          failed: false,
          message: `skipped: ${skipped.get(linterName)}`,
        };
      }
      const byRule = groupBy(flats, (f) => ruleKeyFor(f.v));
      const ruleOrder = Array.from(byRule.keys()).sort(
        (a, b) => byRule.get(b)!.length - byRule.get(a)!.length || a.localeCompare(b),
      );
      return linterNode(
        linterName,
        meta.get(linterName),
        ruleOrder.map((rule) => summaryRuleNode(rule, linterName, byRule.get(rule)!)),
      );
    });
}

/** Linters that failed to run get an error leaf in every grouping, merged into an existing linter node. */
function withLinterErrors(roots: Draft[], results: readonly LinterResult[], filters: LintFilters): Draft[] {
  const errors = groupBy(
    results.filter((r) => isLinterErrored(r) && matchesFilterState(r.linter, filters.linter)),
    (r) => r.linter,
  );
  if (errors.size === 0) return roots;
  const linters = new Map(roots.filter((n) => n.kind === "linter").map((n) => [n.name, n]));
  for (const [name, failed] of errors) {
    const errorNodes = failed.map(linterErrorNode);
    const existing = linters.get(name);
    linters.set(
      name,
      existing
        ? { ...existing, children: [...errorNodes, ...(existing.children ?? [])], failed: true, passed: false }
        : linterNode(name, failed[0], errorNodes),
    );
  }
  const others = roots.filter((n) => n.kind !== "linter");
  return [...others, ...sortedKeys(linters).map((name) => linters.get(name)!)];
}

// ---------------------------------------------------------------------------
// Collapsing, route paths, lookup

function joinChainNames(parent: string, child: string): string {
  const p = parent.trim();
  const c = child.trim();
  return p && c ? `${p} > ${c}` : p || c;
}

/** Folds a folder that has a single child into that child: `pkg > sub > a.go`. */
function collapseFolderChains(nodes: Draft[]): Draft[] {
  return nodes.map((node) => {
    if (!node.children || node.children.length === 0) return node;
    const children = collapseFolderChains(node.children);
    if (children.length === 1 && node.kind === "lint-folder") {
      const [child] = children;
      return { ...child!, name: joinChainNames(node.name, child!.name) };
    }
    return { ...node, children };
  });
}

/** Stable, unique route path per node: slug segments joined by `/`, siblings with equal slugs get `~N`. */
function annotateRoutePaths(nodes: Draft[], parentSegments: string[] = []): LintNode[] {
  const slugs = nodes.map((n) => slugify(n.name));
  const totals = groupBy(slugs, (s) => s);
  const seen = new Map<string, number>();
  return nodes.map((node, i) => {
    const slug = slugs[i]!;
    const ordinal = (seen.get(slug) ?? 0) + 1;
    seen.set(slug, ordinal);
    const segment = totals.get(slug)!.length > 1 ? `${slug}~${ordinal}` : slug;
    const segments = [...parentSegments, segment];
    const { children, ...rest } = node;
    return {
      ...rest,
      route_path: segments.join("/"),
      ...(children ? { children: annotateRoutePaths(children, segments) } : {}),
    };
  });
}

const GROUPERS: Record<LintGrouping, (results: readonly LinterResult[], filters: LintFilters) => Draft[]> = {
  "linter-rule-file": groupByLinterRuleFile,
  "linter-file": groupByLinterFile,
  "file-linter-rule": groupByFileLinterRule,
  summary: groupBySummary,
};

/** The tree for one grouping: filtered, with failed linters shown, ready for `Tree`. */
export function buildLintTree({
  results,
  grouping,
  filters,
}: {
  results: readonly LinterResult[];
  grouping: LintGrouping;
  filters: LintFilters;
}): LintNode[] {
  const grouped = withLinterErrors(GROUPERS[grouping](results, filters), results, filters);
  // Summary keeps its linter -> rule -> file branches as built.
  return annotateRoutePaths(grouping === "summary" ? grouped : collapseFolderChains(grouped));
}

/** Depth-first lookup of the node whose route_path equals `path`, or null. */
export function findLintNode(nodes: readonly LintNode[], path: string): LintNode | null {
  if (!path) return null;
  for (const node of nodes) {
    if (node.route_path === path) return node;
    const found = node.children ? findLintNode(node.children, path) : null;
    if (found) return found;
  }
  return null;
}
