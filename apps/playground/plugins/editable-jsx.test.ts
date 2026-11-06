// @vitest-environment node
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { editableOpenings, formatEditableSource, parseEditableSource } from "./editable-jsx";
import { playgroundEditableSource } from "./editable-source-plugin";
import { sourceHash } from "./source-hash";

const FILE = "page.tsx";
const tags = (source: string) => editableOpenings(source, FILE).map(({ tag, ordinal }) => `${ordinal}:${tag}`);

describe("editableOpenings", () => {
  it("resolves named, renamed and namespace imports from facet and its subpaths", () => {
    const source = `
import { BoxNode, ContainerNode as Group } from "@flanksource/facet";
import { Tile } from "@flanksource/facet/diagram";
import * as F from "@flanksource/facet";
export default () => (
  <Group>
    <BoxNode title="a" />
    <Tile title="b"></Tile>
    <F.Zone label="c" />
    <F.BrandBox />
  </Group>
);`;

    expect(tags(source)).toEqual(["0:ContainerNode", "1:BoxNode", "2:Tile", "3:Zone", "4:BrandBox"]);
  });

  it("ignores look-alike tags that are local or come from another module", () => {
    const source = `
import { Zone } from "./local-zone";
import { Tile as Other } from "some-other-lib";
import type { BoxNode } from "@flanksource/facet";
const ContainerNode = () => null;
export default () => (
  <div>
    <Zone />
    <Other />
    <BoxNode />
    <ContainerNode />
    <Facet.Tile />
  </div>
);`;

    expect(tags(source)).toEqual([]);
  });

  it("ignores JSX-looking text inside strings and template literals", () => {
    const source = `
import { BoxNode } from "@flanksource/facet";
const a = "<BoxNode title='x' />";
const b = \`<BoxNode title="y" />\`;
export default () => <BoxNode title="real" />;`;

    expect(editableOpenings(source, FILE)).toMatchObject([{ tag: "BoxNode", ordinal: 0, line: 5, column: 22 }]);
  });

  it("reports 1-based line and column of the opening '<' and source-ordered ordinals for nested elements", () => {
    const source = [
      'import { BoxNode, Zone } from "@flanksource/facet";',
      "export default () => (",
      "  <Zone label=\"outer\">",
      "    <BoxNode",
      '      title="inner"',
      "    />",
      "  </Zone>",
      ");",
    ].join("\n");

    expect(editableOpenings(source, FILE)).toMatchObject([
      { tag: "Zone", ordinal: 0, line: 3, column: 3 },
      { tag: "BoxNode", ordinal: 1, line: 4, column: 5 },
    ]);
  });

  it("inserts after the last attribute so it wins over spreads, and after the tag name when there are none", () => {
    const source = `import { BoxNode, Tile } from "@flanksource/facet";
const a = <BoxNode {...props} title="x" />;
const b = <Tile></Tile>;`;
    const [first, second] = editableOpenings(source, FILE);

    expect(source.slice(0, first!.insertAt).endsWith('title="x"')).toBe(true);
    expect(source.slice(0, second!.insertAt).endsWith("<Tile")).toBe(true);
  });

  it("marks intrinsic SVG shapes and interleaves them with facet tags in one source-ordered sequence", () => {
    const source = `
import { Zone } from "@flanksource/facet";
export default () => (
  <svg>
    <g>
      <rect x={1} />
      <Zone label="z" />
      <text>hi</text>
    </g>
    <circle r={2} /><ellipse /><line /><polyline /><polygon /><path d="M0 0" />
    <linearGradient /><defs /><div />
  </svg>
);`;

    expect(tags(source)).toEqual([
      "0:g",
      "1:rect",
      "2:Zone",
      "3:text",
      "4:circle",
      "5:ellipse",
      "6:line",
      "7:polyline",
      "8:polygon",
      "9:path",
    ]);
  });

  it("keeps facet ordinals stable when a shape is added after them but shifts later ones", () => {
    const facet = 'import { BoxNode } from "@flanksource/facet";\n';
    const before = `${facet}export default () => <><BoxNode /><BoxNode /></>;`;
    const after = `${facet}export default () => <><BoxNode /><rect /><BoxNode /></>;`;

    expect(tags(before)).toEqual(["0:BoxNode", "1:BoxNode"]);
    expect(tags(after)).toEqual(["0:BoxNode", "1:rect", "2:BoxNode"]);
  });

  it("marks SVG shapes in a module with no facet import, inserting after the last attribute", () => {
    const source = 'export default () => <svg><rect {...p} width="3" /><path /></svg>;';
    const [rect, path] = editableOpenings(source, FILE);

    expect(source.slice(0, rect!.insertAt).endsWith('width="3"')).toBe(true);
    expect(source.slice(0, path!.insertAt).endsWith("<path")).toBe(true);
  });

  it("throws when an SVG shape already authors data-editable-source", () => {
    expect(() => editableOpenings('export default () => <rect data-editable-source="x" />;', FILE)).toThrow(
      /page\.tsx:1:22 already authors data-editable-source/,
    );
  });

  it("throws when an element already authors data-editable-source", () => {
    const source = `import { BoxNode } from "@flanksource/facet";
const a = <BoxNode data-editable-source="hand" />;`;

    expect(() => editableOpenings(source, FILE)).toThrow(/page\.tsx:2:11 already authors data-editable-source/);
  });
});

describe("editable source marker grammar", () => {
  it("round-trips and rejects malformed values", () => {
    const parts = { file: "a/_b/c.tsx", line: 12, column: 5, ordinal: 3, hash: "0123456789ab" };

    expect(formatEditableSource(parts)).toBe("a/_b/c.tsx:12:5#3@0123456789ab");
    expect(parseEditableSource(formatEditableSource(parts))).toEqual(parts);
    expect(() => parseEditableSource("a.tsx:1:1#0")).toThrow(/malformed data-editable-source/);
    expect(() => parseEditableSource("a.tsx:1:1#0@xyz")).toThrow(/malformed/);
  });
});

function decodeMappings(mappings: string): number[][][] {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const state = [0, 0, 0, 0, 0];
  return mappings.split(";").map((line) => {
    state[0] = 0;
    return line === ""
      ? []
      : line.split(",").map((segment) => {
          const values: number[] = [];
          let shift = 0;
          let value = 0;
          for (const char of segment) {
            const digit = alphabet.indexOf(char);
            value += (digit & 31) << shift;
            if (digit & 32) shift += 5;
            else {
              values.push(value & 1 ? -(value >> 1) : value >> 1);
              value = 0;
              shift = 0;
            }
          }
          return values.map((delta, i) => (state[i] = state[i]! + delta));
        });
  });
}

describe("playgroundEditableSource", () => {
  const pagesDir = join(process.cwd(), ".tmp", "pages");
  const id = join(pagesDir, "flanksource", "_d", "diagram.tsx");
  const source = [
    'import { BoxNode, Tile } from "@flanksource/facet";',
    "export default () => (",
    "  <>",
    '    <BoxNode title="A" />',
    '    <Tile title="B">x</Tile>',
    "  </>",
    ");",
  ].join("\n");

  const transform = (code: string, file: string) =>
    (
      playgroundEditableSource({ pagesDir }).transform as unknown as (
        code: string,
        id: string,
      ) => { code: string; map: { mappings: string; sources: string[] } } | null
    )(code, file);

  it("appends the marker as the last attribute of every editable opening", () => {
    const hash = sourceHash(source);
    const out = transform(source, id)!;

    expect(out.code).toContain(
      `<BoxNode title="A" data-editable-source="flanksource/_d/diagram.tsx:4:5#0@${hash}" />`,
    );
    expect(out.code).toContain(
      `<Tile title="B" data-editable-source="flanksource/_d/diagram.tsx:5:5#1@${hash}">x</Tile>`,
    );
  });

  it("maps code after each injected attribute back to its original position", () => {
    const out = transform(source, id)!;
    const generated = out.code.split("\n");
    const decoded = decodeMappings(out.map.mappings);

    const lineIndex = generated.findIndex((line) => line.includes("<BoxNode"));
    const generatedColumn = generated[lineIndex]!.indexOf("/>");
    const original = source.split("\n")[lineIndex]!.indexOf("/>");
    const segment = decoded[lineIndex]!.find((s) => s[0] === generatedColumn);

    expect(out.map.sources).toEqual([id]);
    expect(segment?.slice(2)).toEqual([lineIndex, original]);
  });

  it("does not transform queries, non-tsx files, files outside pagesDir, or files without editable openings", () => {
    expect(transform(source, `${id}?raw`)).toBeNull();
    expect(transform(source, join(pagesDir, "x.ts"))).toBeNull();
    expect(transform(source, join(process.cwd(), "src", "x.tsx"))).toBeNull();
    expect(transform('import { BoxNode } from "other";\nexport const a = <BoxNode />;', id)).toBeNull();
    expect(transform('export const a = <svg><linearGradient /><div /></svg>;', id)).toBeNull();
  });

  describe("with intrinsic SVG shapes", () => {
    const svgSource = [
      'import { BoxNode } from "@flanksource/facet";',
      "export default () => (",
      "  <svg>",
      '    <rect x={1} />',
      '    <BoxNode title="A" />',
      '    <g><text>t</text></g>',
      "  </svg>",
      ");",
    ].join("\n");

    it("marks shapes in a file without any facet import", () => {
      const plain = 'export default () => <svg><rect x={1} /><path d="M0 0"></path></svg>;';
      const hash = sourceHash(plain);

      expect(transform(plain, id)!.code).toBe(
        'export default () => <svg><rect x={1} data-editable-source="flanksource/_d/diagram.tsx:1:27#0@' +
          `${hash}" /><path d="M0 0" data-editable-source="flanksource/_d/diagram.tsx:1:41#1@${hash}"></path></svg>;`,
      );
    });

    it("numbers shapes and facet tags in one sequence", () => {
      const hash = sourceHash(svgSource);
      const out = transform(svgSource, id)!.code;

      expect(out).toContain(`<rect x={1} data-editable-source="flanksource/_d/diagram.tsx:4:5#0@${hash}" />`);
      expect(out).toContain(`<BoxNode title="A" data-editable-source="flanksource/_d/diagram.tsx:5:5#1@${hash}" />`);
      expect(out).toContain(`<g data-editable-source="flanksource/_d/diagram.tsx:6:5#2@${hash}">`);
      expect(out).toContain(`<text data-editable-source="flanksource/_d/diagram.tsx:6:8#3@${hash}">t</text>`);
    });

    it("maps code after an injected SVG marker back to its original position", () => {
      const out = transform(svgSource, id)!;
      const generated = out.code.split("\n");
      const decoded = decodeMappings(out.map.mappings);
      const lineIndex = generated.findIndex((line) => line.includes("<rect"));
      const generatedColumn = generated[lineIndex]!.indexOf("/>");
      const original = svgSource.split("\n")[lineIndex]!.indexOf("/>");

      expect(decoded[lineIndex]!.find((s) => s[0] === generatedColumn)?.slice(2)).toEqual([lineIndex, original]);
    });

    it("still throws on a hand-written marker on an SVG shape", () => {
      expect(() => transform('export default () => <rect data-editable-source="x" />;', id)).toThrow(/already authors data-editable-source/);
    });
  });
});
