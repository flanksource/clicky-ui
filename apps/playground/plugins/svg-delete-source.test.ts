// @vitest-environment node
import { expect, it } from "vitest";
import { deleteSvgElement } from "./svg-delete-source";

it.each([
  ['const Page = () => <svg><rect width={20}/><circle r={4}/></svg>;', 'const Page = () => <svg><circle r={4}/></svg>;'],
  ['const Page = () => <svg><text>Label<tspan>Detail</tspan></text><text>Keep</text></svg>;', 'const Page = () => <svg><text>Keep</text></svg>;'],
  ['const Shape = () => <rect width={20}/>;', 'const Shape = () => null;'],
  ['const Page = () => <svg>{visible && <circle r={4}/>}</svg>;', 'const Page = () => <svg>{visible && null}</svg>;'],
  ['const Page = () => <svg>\n  <rect width={20}/>\n  <circle r={4}/>\n</svg>;', 'const Page = () => <svg>\n  <circle r={4}/>\n</svg>;'],
])("deletes the selected SVG subtree while preserving valid JSX: %s", (source, expected) => {
  expect(deleteSvgElement(source, 0)).toMatchObject({ status: "edited", source: expected });
});

it("refuses to delete a Facet component through the SVG operation", () => {
  expect(() => deleteSvgElement('import { BoxNode } from "@flanksource/facet"; const Page = () => <BoxNode title="Keep"/>;', 0)).toThrow(/SVG/);
});
