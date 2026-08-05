import { describe, expect, it } from "vitest";
import {
  buildPathTree,
  foldersFirst,
  isPathTreeFolder,
  splitPath,
  type PathTreeNode,
} from "./path-tree";

const DOT_SLASH = "./";

// Mirrors the shape the profile surfaces arrive in: a flat list of names whose
// hierarchy is encoded in the name itself.
interface Named {
  name: string;
}

function named(...names: string[]): Named[] {
  return names.map((name) => ({ name }));
}

function tree(names: string[], delimiters = DOT_SLASH): PathTreeNode<Named>[] {
  return buildPathTree(named(...names), (item) =>
    splitPath(item.name, delimiters),
  );
}

function labels<T>(nodes: PathTreeNode<T>[]): string[] {
  return nodes.map((node) => node.label);
}

function find<T>(nodes: PathTreeNode<T>[], key: string): PathTreeNode<T> {
  for (const node of nodes) {
    if (node.key === key) return node;
    const nested = findOrNull(node.children, key);
    if (nested) return nested;
  }
  throw new Error(`no node with key ${key}`);
}

function findOrNull<T>(
  nodes: PathTreeNode<T>[],
  key: string,
): PathTreeNode<T> | null {
  for (const node of nodes) {
    if (node.key === key) return node;
    const nested = findOrNull(node.children, key);
    if (nested) return nested;
  }
  return null;
}

describe("splitPath", () => {
  it("returns one segment for a name with no delimiter", () => {
    expect(splitPath("jaeger", DOT_SLASH)).toEqual(["jaeger"]);
  });

  it("splits on every declared delimiter", () => {
    expect(splitPath("jms.incoming.disbursements", DOT_SLASH)).toEqual([
      "jms",
      "incoming",
      "disbursements",
    ]);
    expect(splitPath("logs/api", DOT_SLASH)).toEqual(["logs", "api"]);
    expect(splitPath("a.b/c", DOT_SLASH)).toEqual(["a", "b", "c"]);
  });

  // A hyphen is an ordinary name character. Splitting it would shatter
  // "remote-debugger" into a hierarchy that does not exist.
  it("leaves characters outside the delimiter set alone", () => {
    expect(splitPath("remote-debugger.sql-xevent", DOT_SLASH)).toEqual([
      "remote-debugger",
      "sql-xevent",
    ]);
  });

  it("drops empty segments from repeated, leading and trailing separators", () => {
    expect(splitPath("a//b", DOT_SLASH)).toEqual(["a", "b"]);
    expect(splitPath(".a.b.", DOT_SLASH)).toEqual(["a", "b"]);
    expect(splitPath("...", DOT_SLASH)).toEqual([]);
  });

  it("has no path for an empty name, and no split with no delimiters", () => {
    expect(splitPath("", DOT_SLASH)).toEqual([]);
    expect(splitPath("jms.incoming", "")).toEqual(["jms.incoming"]);
  });
});

describe("buildPathTree", () => {
  it("nests to arbitrary depth", () => {
    const roots = tree(["arthas.activity.process"]);
    expect(labels(roots)).toEqual(["arthas"]);
    expect(labels(roots[0]!.children)).toEqual(["activity"]);
    expect(labels(roots[0]!.children[0]!.children)).toEqual(["process"]);
    expect(find(roots, "arthas/activity/process").path).toEqual([
      "arthas",
      "activity",
      "process",
    ]);
  });

  // The central case: `jms` is a runnable profile AND the parent of others, so
  // it must be one node that is both selectable and expandable.
  it("binds an item to a node its own descendants already created", () => {
    const roots = tree(["jms.incoming", "jms"]);
    expect(labels(roots)).toEqual(["jms"]);
    const jms = find(roots, "jms");
    expect(jms.items).toEqual([{ name: "jms" }]);
    expect(labels(jms.children)).toEqual(["incoming"]);
  });

  it("binds an item to a node created before its descendants", () => {
    const roots = tree(["jms", "jms.incoming"]);
    expect(find(roots, "jms").items).toEqual([{ name: "jms" }]);
    expect(find(roots, "jms/incoming").items).toEqual([
      { name: "jms.incoming" },
    ]);
  });

  it("marks a node nothing binds to as a folder", () => {
    const roots = tree(["logs.api", "logs.cycle"]);
    expect(isPathTreeFolder(find(roots, "logs"))).toBe(true);
    expect(isPathTreeFolder(find(roots, "logs/api"))).toBe(false);
  });

  it("keys every node by its joined path", () => {
    const roots = tree(["jms.incoming.disbursements"]);
    expect(find(roots, "jms").key).toBe("jms");
    expect(find(roots, "jms/incoming").key).toBe("jms/incoming");
  });

  it("collects every item that shares a path", () => {
    const roots = buildPathTree(
      [
        { file: "src/app.ts", access: "read" },
        { file: "src/app.ts", access: "written" },
      ],
      (item) => splitPath(item.file, "/"),
    );
    expect(find(roots, "src/app.ts").items).toEqual([
      { file: "src/app.ts", access: "read" },
      { file: "src/app.ts", access: "written" },
    ]);
  });

  it("preserves input order by default", () => {
    expect(labels(tree(["zeta", "alpha", "mid"]))).toEqual([
      "zeta",
      "alpha",
      "mid",
    ]);
  });

  it("orders folders before leaves at every depth with foldersFirst", () => {
    const roots = buildPathTree(
      named("zeta", "alpha.two", "alpha.one", "beta"),
      (item) => splitPath(item.name, DOT_SLASH),
      { compare: foldersFirst },
    );
    expect(labels(roots)).toEqual(["alpha", "beta", "zeta"]);
    expect(labels(find(roots, "alpha").children)).toEqual(["one", "two"]);
  });

  it("skips items with no path rather than inventing a root", () => {
    expect(tree(["", "jms"])).toHaveLength(1);
  });
});
