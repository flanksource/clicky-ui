import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { kubernetesResourceRows } from "./resource-icon-catalog";
import { kubernetesCommunitySvgPath } from "./icon-sources";
import { resourceIconPalette } from "../src/resource-icon-palette";
import {
  composeWithBackground,
  extractKubernetesGlyph,
  type ResourceBackground,
} from "./resource-icon-composition";

const UPSTREAM_RESOURCE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18"><g id="layer1"><g id="g70"><path fill="#326ce5" d="M2 2h14v14H2z"/><path fill="#fff" d="M3 3h12v12H3z"/></g><g id="glyph"><path fill="#ffffff" d="M6 6h6v6H6z"/><path fill="#ffffff" d="M7 7h4v4H7z"/></g></g></svg>`;

describe("Kubernetes glyph extraction", () => {
  it.each(kubernetesResourceRows)(
    "extracts both semantic colors from $consumerName without its octagon",
    (row) => {
      const source = readFileSync(
        kubernetesCommunitySvgPath(row.outline!),
        "utf8",
      );
      const colors = resourceIconPalette[row.resource.category];
      const output = extractKubernetesGlyph(source, colors);
      expect(output).toContain(colors.primary);
      expect(output).toContain(colors.accent);
      expect(output).not.toContain("#326ce5");
      expect(output).not.toContain("<text");
      expect(output).not.toMatch(/(?:inkscape:|sodipodi:|<defs\s*\/?>)/);
      expect(extractKubernetesGlyph(source, "upstream")).not.toContain("<text");
    },
  );
  it("removes the common octagon and assigns both resource colors", () => {
    const output = extractKubernetesGlyph(UPSTREAM_RESOURCE, {
      primary: "#2563EB",
      accent: "#60A5FA",
    });
    expect(output).not.toContain('id="g70"');
    expect(output).not.toContain("#326ce5");
    expect(output).toContain("#2563EB");
    expect(output).toContain("#60A5FA");
  });

  it("keeps white foreground for an octagon reproduction and removes labels", () => {
    const labeled = UPSTREAM_RESOURCE.replace(
      "</g></g></svg>",
      "<text>API</text></g></g></svg>",
    );
    const output = extractKubernetesGlyph(labeled, "upstream");
    expect(output).toContain("#ffffff");
    expect(output).not.toContain("<text");
  });

  it("fails when the expected source background is missing", () => {
    expect(() => extractKubernetesGlyph("<svg/>", "upstream")).toThrow(
      "Kubernetes octagon layer",
    );
  });
});

describe("resource backgrounds", () => {
  it.each<ResourceBackground>(["square", "circle", "octagon", "shield"])(
    "composes a %s background with the original glyph viewBox",
    (shape) => {
      const output = composeWithBackground(
        '<path d="M4 4h16v16H4z"/>',
        "0 0 24 24",
        shape,
        { fill: "#DBEAFE", stroke: "#2563EB", glyph: "#2563EB" },
      );
      expect(output).toContain(`data-background="${shape}"`);
      expect(output).toContain('viewBox="0 0 24 24"');
      expect(output).toContain("#2563EB");
      expect(output).toContain('<path d="M4 4h16v16H4z"/>');
    },
  );
});
