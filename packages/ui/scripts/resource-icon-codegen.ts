import type { ResourceSelectionRow } from "./resource-icon-catalog";
import { resourceIconPalette } from "../src/resource-icon-palette";
import { composeWithBackground } from "./resource-icon-composition";

export type Glyph = { inner: string; viewBox: string; spec: string };

function component(
  name: string,
  inner: string,
  source: string,
  row: ResourceSelectionRow,
  consumerName: string,
): string {
  return [
    `// composed: ${source}`,
    `export const ${name}: React.FC<IconProps> & { __source: string; __viewBox: string; __group: string; __consumerName: string } = Object.assign(`,
    `  ({ size = "1em", className, title, ...props }: IconProps) => (`,
    `    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" role={title ? "img" : "presentation"} aria-label={title} aria-hidden={title ? undefined : true} className={className} {...props}>`,
    `      ${inner}`,
    `    </svg>`,
    `  ),`,
    `  { __source: ${JSON.stringify(source)}, __viewBox: "0 0 24 24", __group: ${JSON.stringify(row.group)}, __consumerName: ${JSON.stringify(consumerName)}, displayName: ${JSON.stringify(name)} },`,
    `);`,
    "",
  ].join("\n");
}

export function generateResourceVariants(options: {
  row: ResourceSelectionRow;
  baseName: string;
  base: Glyph;
  upstream?: Glyph;
}): { imports: string[]; parts: string[]; names: string[] } {
  const { row, baseName, base, upstream } = options;
  const imports: string[] = [];
  const parts: string[] = [];
  const names: string[] = [];
  const palette = resourceIconPalette[row.resource.category];
  const kubernetes = base.spec.startsWith("k8s-community:");

  for (const background of row.resource.backgrounds) {
    if (kubernetes && !upstream) {
      throw new Error(`${baseName} requires an upstream glyph for its octagon`);
    }
    const glyph = kubernetes ? upstream! : base;
    const colors = kubernetes
      ? { fill: "#326ce5", stroke: "#fff", glyph: "#fff" }
      : {
          fill: palette.accent,
          stroke: palette.primary,
          glyph: palette.primary,
        };
    const name = `${baseName}${background[0].toUpperCase()}${background.slice(1)}`;
    parts.push(
      component(
        name,
        composeWithBackground(glyph.inner, glyph.viewBox, background, colors),
        `${base.spec} + ${background} background`,
        row,
        `${row.consumerName}-${background}`,
      ),
    );
    names.push(name);
  }

  if (row.resource.providerBadges) {
    imports.push(
      'import { Aws, Azure, GoogleCloud } from "@flanksource/icons/mi";',
    );
    for (const { suffix, icon } of [
      { suffix: "Aws", icon: "Aws" },
      { suffix: "Azure", icon: "Azure" },
      { suffix: "Gcp", icon: "GoogleCloud" },
    ]) {
      const name = `${baseName}${suffix}`;
      const inner = `<svg x="1" y="1" width="20" height="20" viewBox="${base.viewBox}" color="${palette.primary}">${base.inner}</svg><circle cx="18" cy="18" r="5.5" fill="white"/><${icon} x={13} y={13} size={10} square aria-hidden />`;
      parts.push(
        component(
          name,
          inner,
          `${base.spec} + ${icon} badge`,
          row,
          `${row.consumerName}-${suffix.toLowerCase()}`,
        ),
      );
      names.push(name);
    }
  }

  return { imports, parts, names };
}
