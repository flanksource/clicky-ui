// @vitest-environment node
import { describe, expect, it } from "vitest";

import { editableOpenings } from "./editable-jsx";
import { findTextCandidates, setAttributes, setStyleProp, setText } from "./visual-edit-source";

const IMPORT = 'import { BoxNode, BrandBox, ContainerNode as Group, Tile } from "@flanksource/facet";\n';
const page = (body: string) => `${IMPORT}${body}`;
const edited = (outcome: { status: string; source?: string }) => {
  if (outcome.status !== "edited") throw new Error(`expected an edit, got ${JSON.stringify(outcome)}`);
  return outcome.source!;
};

describe("setStyleProp", () => {
  it.each([
    ['variant="primary"', 'variant="danger"'],
    ["variant='primary'", "variant='danger'"],
    ['variant={"primary"}', 'variant={"danger"}'],
    ["variant={`primary`}", "variant={`danger`}"],
  ])("replaces %s preserving its quote style", (before, after) => {
    const source = page(`export default () => <BoxNode title="T" ${before} />;`);

    expect(edited(setStyleProp(source, 0, "variant", "danger"))).toBe(page(`export default () => <BoxNode title="T" ${after} />;`));
  });

  it("adds the attribute after the last attribute when absent, targeting the ordinal-th element", () => {
    const source = page(`export default () => <Group><BoxNode title="T" /><Tile role="new" title="U"></Tile></Group>;`);

    expect(edited(setStyleProp(source, 1, "variant", "info"))).toBe(
      page(`export default () => <Group><BoxNode title="T" variant="info" /><Tile role="new" title="U"></Tile></Group>;`),
    );
    expect(edited(setStyleProp(source, 2, "role", "future"))).toContain('<Tile role="future" title="U">');
  });

  it("refuses a computed attribute with its location", () => {
    const source = page(`export default () => (\n  <BoxNode\n    variant={pick()}\n  />\n);`);

    expect(setStyleProp(source, 0, "variant", "x")).toEqual({ status: "refused", reason: "computed", line: 4, column: 5 });
  });

  it("refuses a spread after the attribute, or any spread when the attribute is absent, but not a spread before it", () => {
    const after = page('export default () => <BoxNode variant="a" {...props} />;');
    const absent = page("export default () => <BoxNode {...props} />;");
    const before = page('export default () => <BoxNode {...props} variant="a" />;');

    expect(setStyleProp(after, 0, "variant", "b")).toMatchObject({ status: "refused", reason: "spread", line: 2, column: 43 });
    expect(setStyleProp(absent, 0, "variant", "b")).toMatchObject({ status: "refused", reason: "spread" });
    expect(edited(setStyleProp(before, 0, "variant", "b"))).toContain('{...props} variant="b"');
  });

  it("refuses an unchanged value and throws on an invalid one", () => {
    const source = page('export default () => <BoxNode variant="a" />;');

    expect(setStyleProp(source, 0, "variant", "a")).toMatchObject({ status: "refused", reason: "unchanged" });
    expect(() => setStyleProp(source, 0, "variant", 'a"b')).toThrow(/invalid style value/);
    expect(() => setStyleProp(source, 0, "variant", "")).toThrow(/invalid style value/);
  });

  it("keeps ordinals stable after an edit", () => {
    const source = page('export default () => <Group><BoxNode title="T" /><Tile title="U" /></Group>;');
    const out = edited(setStyleProp(source, 1, "variant", "info"));
    const tags = (text: string) => editableOpenings(text, "page.tsx").map(({ tag, ordinal }) => `${ordinal}:${tag}`);

    expect(tags(out)).toEqual(tags(source));
  });
});

describe("setAttributes", () => {
  const svg = (shape: string) => `export default () => <svg>${shape}</svg>;`;

  it.each([
    ['fill="#fff"', { fill: "#eef" }, 'fill="#eef"'],
    ["fill='#fff'", { fill: "#eef" }, "fill='#eef'"],
    ['fill={"#fff"}', { fill: "#eef" }, 'fill={"#eef"}'],
    ["fill={`#fff`}", { fill: "#eef" }, "fill={`#eef`}"],
    ["width={12}", { width: 40 }, "width={40}"],
    ["width={-3.5}", { width: 0.25 }, "width={0.25}"],
    ['width="12"', { width: 40 }, "width={40}"],
    ['width={"12"}', { width: -7.5 }, "width={-7.5}"],
    ["fill={true}", { fill: "red" }, 'fill="red"'],
    ["opacity={1}", { opacity: 0.5 }, "opacity={0.5}"],
  ])("replaces the literal in %s with %j", (before, values, after) => {
    const out = edited(setAttributes(svg(`<rect ${before} />`), 0, values));

    expect(out).toBe(svg(`<rect ${after} />`));
  });

  it("replaces several attributes and inserts missing ones after the last attribute in one edit", () => {
    const source = svg('<rect x={1} fill="#000" /><circle r={2} />');

    expect(edited(setAttributes(source, 0, { x: 5, fill: "#111", y: 9, stroke: "#222" }))).toBe(
      svg('<rect x={5} fill="#111" y={9} stroke="#222" /><circle r={2} />'),
    );
    expect(edited(setAttributes(source, 1, { cx: 3 }))).toBe(svg('<rect x={1} fill="#000" /><circle r={2} cx={3} />'));
  });

  it("inserts after the tag name when there are no attributes, and on a non-self-closing shape", () => {
    expect(edited(setAttributes(svg("<g></g>"), 0, { opacity: 0.5 }))).toBe(svg("<g opacity={0.5}></g>"));
  });

  it("targets the ordinal-th element in the sequence shared with facet tags", () => {
    const source = page('export default () => <><BoxNode title="T" /><svg><rect width={1} /></svg></>;');

    expect(edited(setAttributes(source, 1, { width: 2 }))).toBe(page('export default () => <><BoxNode title="T" /><svg><rect width={2} /></svg></>;'));
  });

  it.each([
    ["x={zone.x}", { x: 3 }, "computed", "x"],
    ["x={zone.x} fill=\"#000\"", { fill: "#fff", x: 3 }, "computed", "x"],
    ['fill="#000" {...rest}', { fill: "#fff" }, "spread", "fill"],
    ["{...rest}", { opacity: 0.5 }, "spread", "opacity"],
    ['fill="R&amp;D"', { fill: "red" }, "entity", "fill"],
    ["x", { x: 3 }, "computed", "x"],
  ])("refuses `%s` for %j as %s naming %s", (attributes, values, reason, attribute) => {
    expect(setAttributes(svg(`<rect ${attributes} />`), 0, values)).toMatchObject({ status: "refused", reason, attribute, line: 1 });
  });

  it("refuses the whole edit at the first refused attribute, even after other attributes could change", () => {
    const source = svg('<rect fill="#000" x={zone.x} />');

    expect(setAttributes(source, 0, { fill: "#fff", x: 3 })).toMatchObject({ status: "refused", reason: "computed", attribute: "x", column: 45 });
  });

  it("allows a spread before the attribute but not after it", () => {
    expect(edited(setAttributes(svg('<rect {...p} fill="a" />'), 0, { fill: "b" }))).toBe(svg('<rect {...p} fill="b" />'));
  });

  it("skips attributes that already hold the value, and refuses as unchanged when nothing would change", () => {
    const source = svg('<rect x={1} width="12" />');

    expect(edited(setAttributes(source, 0, { x: 1, width: 12, y: 2 }))).toBe(svg('<rect x={1} width="12" y={2} />'));
    expect(setAttributes(source, 0, { x: 1, width: 12 })).toMatchObject({ status: "refused", reason: "unchanged", attribute: "x" });
  });

  it("throws on invalid names and values", () => {
    const source = svg("<rect />");

    expect(() => setAttributes(source, 0, {})).toThrow(/at least one attribute/);
    expect(() => setAttributes(source, 0, { 'x" onload="': 1 })).toThrow(/invalid attribute name/);
    expect(() => setAttributes(source, 0, { x: Number.NaN })).toThrow(/finite number/);
    expect(() => setAttributes(source, 0, { fill: "" })).toThrow(/non-empty string/);
    expect(() => setAttributes(source, 5, { x: 1 })).toThrow(/no editable element with ordinal 5/);
  });

  it("keeps ordinals stable after an edit", () => {
    const source = page('export default () => <svg><rect x={1} /><Group><BoxNode /></Group><circle /></svg>;');
    const tags = (text: string) => editableOpenings(text, "page.tsx").map(({ tag, ordinal }) => `${ordinal}:${tag}`);

    expect(tags(edited(setAttributes(source, 0, { x: 2, y: 3 })))).toEqual(tags(source));
  });
});

describe("setText", () => {
  const input = (source: string, from: string, to: string, extra: Partial<Parameters<typeof setText>[0]> = {}) => ({
    files: new Map([["page.tsx", source]]),
    callSiteFile: "page.tsx",
    ordinal: 0,
    prop: "title",
    from,
    to,
    ...extra,
  });

  it.each([
    ['title="Auth"', "Gate", 'title="Gate"'],
    ["title='Auth'", "Gate", "title='Gate'"],
    ['title={"Auth"}', "Say \"hi\"", 'title={"Say \\"hi\\""}'],
    ['title="Auth"', "Say \"hi\"", 'title={"Say \\"hi\\""}'],
    ['title="Auth"', "back\\slash", 'title={"back\\\\slash"}'],
    ["title='Auth'", "it's", `title={"it's"}`],
    ['title="Auth"', "R&amp;D", 'title={"R&amp;D"}'],
    ["title={`Auth`}", "Gate `x`", "title={`Gate \\`x\\``}"],
  ])("edits the call-site attribute %s to %j", (attribute, to, expected) => {
    const outcome = setText(input(page(`export default () => <BoxNode ${attribute} />;`), "Auth", to));

    expect(edited(outcome)).toBe(page(`export default () => <BoxNode ${expected} />;`));
  });

  it("adds a title to a BrandBox that has none (brand-name fallback)", () => {
    const source = page('export default () => <BrandBox brand="acme" />;');

    expect(edited(setText(input(source, "Acme", "Acme Corp")))).toBe(page('export default () => <BrandBox brand="acme" title="Acme Corp" />;'));
  });

  it("edits a string in a .map array literal", () => {
    const source = page(
      'const names = ["Alpha", \'Beta\'];\nexport default () => <>{names.map((n) => <BoxNode key={n} title={n} />)}</>;',
    );

    expect(edited(setText(input(source, "Beta", "It's Gamma")))).toContain(`const names = ["Alpha", 'It\\'s Gamma'];`);
  });

  it("edits the JSX text a wrapper passes through title={children}", () => {
    const cell = `${IMPORT}export const Cell = ({ children }: { children: string }) => <BoxNode title={children} />;`;
    const pageSource = 'import { Cell } from "./_cell";\nexport default () => <Cell>\n  Auth   service\n</Cell>;';
    const files = new Map([
      ["page.tsx", pageSource],
      ["_cell.tsx", cell],
    ]);

    const outcome = setText({ files, callSiteFile: "_cell.tsx", ordinal: 0, prop: "title", from: "Auth service", to: "Gate" });

    expect(outcome).toMatchObject({ status: "edited", file: "page.tsx" });
    expect(edited(outcome)).toBe('import { Cell } from "./_cell";\nexport default () => <Cell>\n  Gate\n</Cell>;');
  });

  it("writes JSX text containing braces or angle brackets as an expression", () => {
    const source = page("export default () => <Group><BoxNode />Hello</Group>;");

    expect(edited(setText(input(source, "Hello", "a {b} <c>", { ordinal: 1 })))).toContain('{"a {b} <c>"}');
  });

  it("refuses JSX text whose source holds an HTML entity", () => {
    const source = page("export default () => <Group><BoxNode />R&amp;D</Group>;");

    expect(setText(input(source, "R&D", "Research", { ordinal: 1 }))).toMatchObject({ status: "refused", reason: "entity", file: "page.tsx" });
  });

  it("ranks the call-site file above other modules, and reports ambiguity with stable candidate ids", () => {
    const source = page('export default () => <><BoxNode title={t} />{["Dup", "Dup"]}</>;');
    const other = 'export const label = "Dup";\n';
    const files = new Map([
      ["page.tsx", source],
      ["_other.ts", other],
    ]);

    const first = setText({ files, callSiteFile: "page.tsx", ordinal: 0, prop: "title", from: "Dup", to: "Uno" });
    const second = setText({ files, callSiteFile: "page.tsx", ordinal: 0, prop: "title", from: "Dup", to: "Uno" });

    expect(first).toEqual(second);
    expect(first).toMatchObject({
      status: "ambiguous",
      candidates: [
        { file: "page.tsx", line: 2, context: expect.stringContaining('["Dup", "Dup"]') },
        { file: "page.tsx", line: 2 },
      ],
    });
    const ids = (first as { candidates: { id: string }[] }).candidates.map((c) => c.id);
    expect(new Set(ids).size).toBe(2);
    const chosen = setText({ files, callSiteFile: "page.tsx", ordinal: 0, prop: "title", from: "Dup", to: "Uno", choose: ids[1]! });
    expect(edited(chosen)).toContain('["Dup", "Uno"]');
  });

  it("falls back to other modules when the call-site file has no match, and can choose a candidate there", () => {
    const files = new Map([
      ["page.tsx", page("export default () => <BoxNode title={t} />;")],
      ["_a.ts", 'export const a = "Dup";\n'],
      ["_b.ts", 'export const b = "Dup";\n'],
    ]);
    const base = { files, callSiteFile: "page.tsx", ordinal: 0, prop: "title", from: "Dup", to: "Uno" };

    const ambiguous = setText(base);
    const chosen = setText({ ...base, choose: `_b.ts:${'export const b = '.length}` });

    expect(ambiguous).toMatchObject({ status: "ambiguous", candidates: [{ file: "_a.ts" }, { file: "_b.ts" }] });
    expect(chosen).toMatchObject({ status: "edited", file: "_b.ts", source: 'export const b = "Uno";\n' });
  });

  it("ignores module specifiers, literal types, dynamic imports, keys, className and data-* values", () => {
    const source = page(
      [
        'import "Dup";',
        'export * from "Dup";',
        'type Kind = "Dup";',
        'const lazyDup = () => import("Dup");',
        'const o = { "Dup": 1 }[ "Dup" ];',
        "export default () => <BoxNode title={t} className=\"Dup\" data-x=\"Dup\" />;",
      ].join("\n"),
    );

    expect(findTextCandidates(new Map([["page.tsx", source]]), "Dup")).toEqual([]);
    expect(setText(input(source, "Dup", "Uno"))).toMatchObject({ status: "refused", reason: "not-found" });
  });

  it("refuses an unchanged text and keeps ordinals stable after an edit", () => {
    const source = page('export default () => <Group><BoxNode title="Auth" /></Group>;');
    const tags = (text: string) => editableOpenings(text, "page.tsx").map(({ tag, ordinal }) => `${ordinal}:${tag}`);

    expect(setText(input(source, "Auth", "Auth", { ordinal: 1 }))).toMatchObject({ status: "refused", reason: "unchanged" });
    expect(tags(edited(setText(input(source, "Auth", "Gate", { ordinal: 1 }))))).toEqual(tags(source));
  });
});
