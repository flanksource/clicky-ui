import { describe, expect, it } from "vitest";
import { createLazyJSONPathTree, type JSONPathNode } from "../../components/jsonPathTree";
import { celFieldAccess, celPathFor } from "./celPath";

/** A node as the tree hands one over, with only the parts celPathFor reads. */
function node(part: Partial<JSONPathNode> & Pick<JSONPathNode, "path">): JSONPathNode {
  return { key: part.path, value: undefined, kind: "scalar", summary: "", childCount: 0, ...part };
}

describe("celPathFor", () => {
  it.each([
    ["a plain column", node({ path: "$.duration" }), "row.duration"],
    ["a dotted column name", node({ path: '$["process.tags"]' }), 'row["process.tags"]'],
    ["a key that is not an identifier", node({ path: '$["@timestamp"]' }), 'row["@timestamp"]'],
    ["an array element of a plain column", node({ path: "$.refs[2]" }), "row.refs[2]"],
    ["the row itself", node({ path: "$" }), "row"],
  ])("reads %s straight off the row", (_label, input, expected) => {
    expect(celPathFor(input)).toBe(expected);
  });

  // Inside a decoded column the inner path restarts at `$`, so the accessor is
  // rebuilt from the origin chain + a decoder + that inner path.
  it.each([
    [
      "an array element, by index",
      node({
        path: "$[0].key",
        root: "process.tags",
        origin: { path: '$["process.tags"]', kind: "array" },
      }),
      'row["process.tags"].JSONArray()[0].key',
    ],
    [
      "an object property, by key",
      node({ path: "$.name", root: "metadata", origin: { path: "$.metadata", kind: "object" } }),
      "row.metadata.JSON().name",
    ],
    [
      "a nested encoded value, whose column name alone would lose the chain",
      node({ path: "$.b", root: "a", origin: { path: "$.a.payload", kind: "object" } }),
      "row.a.payload.JSON().b",
    ],
    [
      "a key inside a decoded array that is not an identifier",
      node({ path: '$[0]["@id"]', root: "tags", origin: { path: "$.tags", kind: "array" } }),
      'row.tags.JSONArray()[0]["@id"]',
    ],
    [
      "JSON encoded inside JSON, one decoder per boundary",
      node({
        path: "$[0]",
        root: "envelope",
        origin: {
          path: "$.body",
          kind: "array",
          outer: { path: "$.envelope", kind: "object" },
        },
      }),
      "row.envelope.JSON().body.JSONArray()[0]",
    ],
  ])("decodes %s", (_label, input, expected) => {
    expect(celPathFor(input)).toBe(expected);
  });

  it("rebases onto another bound name, for a batch-scope expression", () => {
    expect(celPathFor(node({ path: "$.level" }), "first")).toBe("first.level");
  });

  // The bug this module exists for: .JSON() on an array root fails with a Go
  // type name, so selecting the column has to offer .JSONArray() instead.
  it.each([
    ['[{"key":"host.arch","value":"amd64"}]', 'row["process.tags"].JSONArray()'],
    ['{"name":"activemq"}', 'row["process.tags"].JSON()'],
    ["not json at all", 'row["process.tags"]'],
    ["[unclosed", 'row["process.tags"]'],
  ])("picks the decoder an encoded column actually needs: %s", (value, expected) => {
    expect(celPathFor(node({ path: '$["process.tags"]', value }))).toBe(expected);
  });
});

// The tree is what produces these nodes in the editor, so the contract is
// asserted against real ones rather than against hand-written fixtures alone.
describe("celPathFor, against the tree that builds the nodes", () => {
  const row = {
    duration: 397,
    "process.tags": JSON.stringify([
      { key: "host.name", type: "string", value: "activemq-848946d5d6-qg2hd" },
    ]),
  };

  async function childOf(parent: JSONPathNode, tree: ReturnType<typeof createLazyJSONPathTree>) {
    return await tree.loadChildren(parent);
  }

  it("reaches a tag's key through the decoder the value requires", async () => {
    const tree = createLazyJSONPathTree(row, { keyPrefix: "row-0" });
    const columns = await childOf(tree.roots[0]!, tree);
    const tags = columns.find((column) => column.path === '$["process.tags"]')!;

    expect(celPathFor(tags)).toBe('row["process.tags"].JSONArray()');

    const [element] = await childOf(tags, tree);
    const fields = await childOf(element!, tree);
    const key = fields.find((field) => field.key.endsWith(".key"))!;

    expect(celPathFor(key)).toBe('row["process.tags"].JSONArray()[0].key');
  });

  it("leaves a scalar column undecoded", async () => {
    const tree = createLazyJSONPathTree(row, { keyPrefix: "row-0" });
    const columns = await childOf(tree.roots[0]!, tree);
    const duration = columns.find((column) => column.path === "$.duration")!;

    expect(celPathFor(duration)).toBe("row.duration");
  });

  // The chain has to survive a second boundary, which a single "which column
  // was this" field cannot record.
  it("emits one decoder per boundary for JSON encoded inside JSON", async () => {
    const stacked = { envelope: JSON.stringify({ body: JSON.stringify([{ a: 1 }]) }) };
    const tree = createLazyJSONPathTree(stacked, { keyPrefix: "row-0" });

    const [envelope] = await childOf(tree.roots[0]!, tree);
    const [body] = await childOf(envelope!, tree);
    const [element] = await childOf(body!, tree);
    const [a] = await childOf(element!, tree);

    expect(celPathFor(a!)).toBe("row.envelope.JSON().body.JSONArray()[0].a");
  });
});

describe("celFieldAccess", () => {
  it("dots an identifier and indexes anything else", () => {
    expect(celFieldAccess("duration")).toEqual({
      reference: "row.duration",
      presence: "has(row.duration)",
    });
    expect(celFieldAccess("process.tags")).toEqual({
      reference: 'row["process.tags"]',
      presence: '"process.tags" in row',
    });
  });

  it("quotes a key that hand-rolled escaping would break", () => {
    expect(celFieldAccess('a"b')).toEqual({
      reference: 'row["a\\"b"]',
      presence: '"a\\"b" in row',
    });
  });
});
