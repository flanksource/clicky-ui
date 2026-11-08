import { compile } from "@mdx-js/mdx";
import rehypeRaw from "rehype-raw";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "remark-github-blockquote-alert";
import { describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { transform } from "sucrase";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement, type ReactElement } from "react";
import { compileMdx, compileScript, compileSource, DEV_SHIM_URL, type MdxPlugins } from "./compile.ts";
import { checkMarkers, insertSourceMarkers } from "./markers.ts";

const PATH = "kitchen-sink/Card.tsx";
type SourceElement<P = { children: SourceElement[] }> = ReactElement<P> & { _source?: unknown };
const CARD = [
  'import type { ReactNode } from "react";',
  'import { Badge } from "@flanksource/facet";',
  "export function Card({ title }: { title: ReactNode }) {",
  '  return <section className="card">',
  "    <h2>{title}</h2>",
  "    <Badge label={String(title)} /><motion.div /><>{null}</>",
  "  </section>;",
  "}",
].join("\n");

// The redact plugin is facet's; with no regions in the document it leaves the tree alone.
const PLUGINS: MdxPlugins = { remarkFrontmatter, remarkGfm, remarkAlert, facetRedact: () => () => undefined, rehypeRaw };

describe("insertSourceMarkers", () => {
  it("marks host tags at their `<` and leaves components, member tags and fragments alone", () => {
    const { sites } = insertSourceMarkers(CARD, PATH, true);
    expect(sites).toEqual([
      { line: 4, column: 10, tag: "section" },
      { line: 5, column: 5, tag: "h2" },
    ]);
  });
});

describe("compileScript", () => {
  const require = createRequire(import.meta.url);
  function page<P = { children: SourceElement[] }>(code: string, extension = ".tsx") {
    const output: { default?: () => SourceElement<P> } = {};
    const compiled = compileScript({ path: PATH, extension, code });
    new Function("require", "exports", transform(compiled, { transforms: ["imports"] }).code)(require, output);
    if (!output.default) throw new Error("fixture has no page export");
    return output.default();
  }

  it.each([".tsx", ".jsx"])("retains original columns for nested, same-line and member component calls in %s", (extension) => {
    const element = page('const Card = () => null; const UI = { Card };\nexport default () => <Card><UI.Card /><Card /></Card>;', extension);
    expect([element._source, ...element.props.children.map((child) => child._source)]).toEqual([
      { fileName: PATH, lineNumber: 2, columnNumber: 22 },
      { fileName: PATH, lineNumber: 2, columnNumber: 28 },
      { fileName: PATH, lineNumber: 2, columnNumber: 39 },
    ]);
  });

  it("preserves columns when a key expression moves and when a spread before key uses createElement", () => {
    const element = page<{ other: SourceElement; children: SourceElement }>('const Card = () => null;\nexport default () => <Card key={<Card />} other={<Card />}><Card {...{}} key="child" /></Card>;');
    expect([element._source, element.props.other._source, element.props.children._source]).toEqual([
      { fileName: PATH, lineNumber: 2, columnNumber: 22 },
      { fileName: PATH, lineNumber: 2, columnNumber: 50 },
      { fileName: PATH, lineNumber: 2, columnNumber: 60 },
    ]);
  });

  it.each(["Card<Item>", "UI.Card<Item>", "Card<Map<string, Item[]>>", "card<Item>", "card<Map<string, Item[]>>"].flatMap((tag) => [
    { tag, jsx: `<${tag} />` },
    { tag, jsx: `<${tag} title="item">child</${tag.slice(0, tag.indexOf("<"))}>` },
  ]))("preserves source positions after type arguments in $jsx", ({ tag, jsx }) => {
    const source = `type Item = { value: string }; const Card = () => null; const card = "card"; const UI = { Card };\nexport default () => ${jsx};`;
    const element = page(source);
    if (tag.startsWith("card")) expect(element.props).toMatchObject({ "data-source": `${PATH}:2:22` });
    else expect(element._source).toEqual({ fileName: PATH, lineNumber: 2, columnNumber: 22 });
  });

  it("keeps clean rendered HTML identical to unmarked HTML apart from host markers", () => {
    const source = 'const Card = ({children, ...props}) => <section {...props}>{children}</section>;\nexport default () => <Card><span>Revenue</span></Card>;';
    expect(renderToStaticMarkup(page(source)).replace(/ data-source="[^"]+"/g, "")).toBe(renderToStaticMarkup(createElement("section", null, createElement("span", null, "Revenue"))));
  });

  it("preserves host markers and original component columns after same-line marker insertions", () => {
    const code = compileScript({ path: PATH, extension: ".tsx", code: 'const Card = () => null; export default () => <main><Card /></main>;' });
    expect(code).toContain('data-source\': "kitchen-sink/Card.tsx:1:47"');
    expect(code).toMatch(/fileName:\s*"kitchen-sink\/Card.tsx",\s*lineNumber:\s*1,\s*columnNumber:\s*53/);
    expect(code).not.toContain("__pageRuntimeSource");
  });

  it("leaves source-like user strings and properties intact", () => {
    const element = page<{ __pageRuntimeSource: string }>('const Card = () => null; export default () => <Card __pageRuntimeSource="{fileName: _jsxFileName, lineNumber: 1}" />;');
    expect(element.props).toEqual({ __pageRuntimeSource: "{fileName: _jsxFileName, lineNumber: 1}" });
    expect(element._source).toEqual({ fileName: PATH, lineNumber: 1, columnNumber: 47 });
  });

  it("compiles TSX to the development automatic runtime, dropping type-only imports", () => {
    const code = compileScript({ path: PATH, extension: ".tsx", code: CARD });
    expect({ runtime: code.includes('from "react/jsx-dev-runtime"'), typeImport: code.includes("ReactNode"), marker: code.includes("data-source") }).toEqual({
      runtime: true,
      typeImport: false,
      marker: true,
    });
  });

  it("writes each host tag's position into the development output", () => {
    const code = compileScript({ path: PATH, extension: ".tsx", code: CARD });
    const markers = [...code.matchAll(/'data-source': "([^"]+)"/g)].map((match) => match[1]);
    expect(markers).toEqual([`${PATH}:4:10`, `${PATH}:5:5`]);
  });
});

describe("checkMarkers", () => {
  it("accepts markers at host tags and rejects positions without one", () => {
    const sources = new Map([[PATH, CARD]]);
    expect(checkMarkers([`${PATH}:4:10`, `${PATH}:6:5`, "other.tsx:1:1"], sources)).toEqual({
      valid: 1,
      invalid: [`${PATH}:6:5: no host tag starts there`, "other.tsx:1:1: not a known <path>:<line>:<column>"],
    });
  });
});

describe("compileMdx", () => {
  const MDX = ["# Report", "", "| a | b |", "| - | - |", "| 1 | 2 |", ""].join("\n");

  it("compiles Markdown front matter, fences and images with original source positions", async () => {
    const path = "reports/revenue.md";
    const source = ['---', 'title: Revenue', '---', '', '# Revenue', '', '```ts', 'const total = 3;', '```', '', '![Revenue chart](/src/pages/chart.svg)'].join("\n");
    const code = await compileSource({ path, extension: ".md", code: source }, { compile, plugins: PLUGINS });
    const output: { default?: () => ReactElement } = {};
    const require = createRequire(import.meta.url);
    new Function("require", "exports", transform(code.replaceAll(DEV_SHIM_URL, "react/jsx-dev-runtime"), { transforms: ["imports"] }).code)(require, output);
    if (!output.default) throw new Error("Markdown fixture has no page export");
    expect(renderToStaticMarkup(createElement(output.default))).toBe('<h1>Revenue</h1>\n<pre><code class="language-ts">const total = 3;\n</code></pre>\n<p><img src="/src/pages/chart.svg" alt="Revenue chart"/></p>');
    expect(code).toContain('fileName: "reports/revenue.md"');
    expect(code).toMatch(/lineNumber: 5,\s*columnNumber: 1/);
    expect(checkMarkers([`${path}:5:1`, `${path}:11:1`], new Map([[path, source]]))).toEqual({ valid: 2, invalid: [] });
  });

  it("routes the development output's jsxDEV calls through the marker shim, with columns", async () => {
    const code = await compileMdx({ path: "kitchen-sink/Report.mdx", extension: ".mdx", code: MDX }, compile, PLUGINS);
    expect({ shim: code.includes(`"${DEV_SHIM_URL}"`), columns: code.includes("columnNumber: 1"), runtime: code.includes('"react/jsx-dev-runtime"') }).toEqual({
      shim: true,
      columns: true,
      runtime: false,
    });
  });

  it("renders GFM tables with facet's plugins", async () => {
    const code = await compileMdx({ path: "kitchen-sink/Report.mdx", extension: ".mdx", code: MDX }, compile, PLUGINS);
    expect(code.includes("_components.table")).toBe(true);
  });
});
