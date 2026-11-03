import { optimize } from "svgo";

export type ResourceBackground = "square" | "circle" | "octagon" | "shield";

const SHAPES = new Set([
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
]);
const WHITE = /^(?:#fff(?:fff)?|white)$/i;
const BLUE = /^(?:#326ce5|#eee(?:eee)?)$/i;

function removeBackgroundAndLabels(source: string): string {
  if ((source.match(/\bid=["']g70["']/g) ?? []).length !== 1) {
    throw new Error("Expected exactly one Kubernetes octagon layer (g70)");
  }
  return optimize(source, {
    plugins: [
      { name: "removeElementsByAttr", params: { id: "g70" } },
      "removeEditorsNSData",
      "removeMetadata",
      "removeUselessDefs",
      "removeXMLProcInst",
      "removeDoctype",
      {
        name: "removeKubernetesLabels",
        fn: () => ({
          element: {
            enter(node, parent) {
              if (node.name === "text") {
                parent.children.splice(parent.children.indexOf(node), 1);
              }
            },
          },
        }),
      },
      "convertStyleToAttrs",
    ],
  }).data;
}

export function extractKubernetesGlyph(
  source: string,
  colors: { primary: string; accent: string } | "upstream",
): string {
  const stripped = removeBackgroundAndLabels(source);
  let paintedCount = 0;
  let accentUsed = false;
  const paintedShapes: Array<{
    node: {
      name: string;
      attributes: Record<string, string>;
      children: unknown[];
    };
    parent: { children: Array<unknown> };
  }> = [];
  const output = optimize(stripped, {
    plugins: [
      {
        name: "colorKubernetesGlyph",
        fn: () => ({
          element: {
            enter(node, parent) {
              for (const key of Object.keys(node.attributes)) {
                if (key.includes(":") || key === "pointer-events") {
                  delete node.attributes[key];
                }
              }
              if (node.name === "svg") node.attributes.viewBox = "4 3.75 10 10";
              if (!SHAPES.has(node.name) || colors === "upstream") return;
              const color =
                paintedCount % 2 === 0 ? colors.primary : colors.accent;
              let recolored = false;
              for (const key of ["fill", "stroke"] as const) {
                const original = node.attributes[key];
                if (!original) continue;
                if (WHITE.test(original)) {
                  node.attributes[key] = color;
                  recolored = true;
                  if (color === colors.accent) accentUsed = true;
                } else if (BLUE.test(original)) {
                  node.attributes[key] = colors.accent;
                  recolored = true;
                  accentUsed = true;
                }
              }
              if (recolored) {
                paintedCount++;
                paintedShapes.push({ node, parent });
              }
            },
          },
          root: {
            exit() {
              if (colors === "upstream" || accentUsed) return;
              const shape = paintedShapes[0];
              if (!shape)
                throw new Error("Kubernetes glyph has no paintable foreground");
              if (shape.node.attributes.fill !== "none") {
                shape.node.attributes.stroke = colors.accent;
                shape.node.attributes["stroke-width"] = "0.2";
              } else {
                const index = shape.parent.children.indexOf(shape.node);
                shape.parent.children.splice(index, 0, {
                  name: shape.node.name,
                  type: "element",
                  attributes: {
                    ...shape.node.attributes,
                    stroke: colors.accent,
                    "stroke-width": String(
                      Number(shape.node.attributes["stroke-width"] ?? 1) + 0.35,
                    ),
                  },
                  children: [],
                });
              }
            },
          },
        }),
      },
    ],
  }).data;
  if (!/<(?:path|rect|circle|ellipse|line|polyline|polygon)\b/.test(output)) {
    throw new Error("Kubernetes glyph has no foreground geometry");
  }
  return output;
}

export function composeWithBackground(
  inner: string,
  viewBox: string,
  background: ResourceBackground,
  colors: { fill: string; stroke: string; glyph: string },
): string {
  const bounds: Record<ResourceBackground, string> = {
    square: '<rect x="1.5" y="1.5" width="21" height="21" rx="3"/>',
    circle: '<circle cx="12" cy="12" r="10.5"/>',
    octagon: '<path d="M8 1.5h8L22.5 8v8L16 22.5H8L1.5 16V8z"/>',
    shield: '<path d="M12 1.5 21 5v6.5c0 5.3-3.5 9-9 11-5.5-2-9-5.7-9-11V5z"/>',
  };
  return `<g data-background="${background}" fill="${colors.fill}" stroke="${colors.stroke}" strokeWidth="1">${bounds[background]}</g><svg x="4" y="4" width="16" height="16" viewBox="${viewBox}" color="${colors.glyph}">${inner}</svg>`;
}
