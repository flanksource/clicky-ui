import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { readIconSource } from "../scripts/icon-sources";
import {
  UiAuditLog,
  UiDatabaseEventStream,
  UiMemoryProfile,
  UiProfiler,
  UiStackTrace,
} from "./icons";

const ICONS = [
  { file: "stack-trace", component: UiStackTrace, title: "Stack trace" },
  { file: "cpu-profile", component: UiProfiler, title: "CPU profile" },
  {
    file: "memory-profile",
    component: UiMemoryProfile,
    title: "Memory profile",
  },
  { file: "audit-log", component: UiAuditLog, title: "Audit log" },
  {
    file: "database-event-stream",
    component: UiDatabaseEventStream,
    title: "Database event stream",
  },
];

const PRESENTATION = {
  "stroke-width": "1.5",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
};

const STROKES = ["#3574F0", "#6C707E"];
const FILLS = ["none", "#E7EFFD", "#EBECF0"];

describe("observability icon sources", () => {
  it.each(ICONS)(
    "$file uses the reference palette with only simple SVG geometry",
    async ({ file }) => {
      const source = await readIconSource({
        spec: `incumbent:${file}`,
        consumerName: file,
      });
      const document = new DOMParser().parseFromString(source, "image/svg+xml");
      const svg = document.documentElement;

      expect(document.querySelector("parsererror")).toBeNull();
      expect(svg.localName).toBe("svg");
      expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
      expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg");
      expect(svg.getAttribute("fill")).toBe("none");
      expect(STROKES).toContain(svg.getAttribute("stroke"));
      expect(svg.querySelector('[fill="#E7EFFD"], [fill="#EBECF0"]')).not.toBeNull();
      expect(
        Object.fromEntries(
          Object.keys(PRESENTATION).map((key) => [key, svg.getAttribute(key)]),
        ),
      ).toEqual(PRESENTATION);
      expect(svg.textContent?.trim()).toBe("");
      expect(svg.children.length).toBeGreaterThan(0);

      for (const element of [svg, ...svg.querySelectorAll("*")]) {
        expect([
          "svg",
          "g",
          "path",
          "rect",
          "circle",
          "ellipse",
          "line",
          "polyline",
          "polygon",
        ]).toContain(element.localName);
        for (const attribute of element.getAttributeNames()) {
          expect([
            "xmlns",
            "viewBox",
            "width",
            "height",
            "fill",
            "stroke",
            ...Object.keys(PRESENTATION),
            "d",
            "x",
            "y",
            "rx",
            "ry",
            "cx",
            "cy",
            "r",
            "x1",
            "x2",
            "y1",
            "y2",
            "points",
          ]).toContain(attribute);
        }
        if (element.hasAttribute("fill")) {
          expect(FILLS).toContain(element.getAttribute("fill"));
        }
        if (element.hasAttribute("stroke")) {
          expect(STROKES).toContain(element.getAttribute("stroke"));
        }
        for (const [attribute, expected] of Object.entries(PRESENTATION)) {
          if (element.hasAttribute(attribute)) {
            expect(element.getAttribute(attribute)).toBe(expected);
          }
        }
      }
    },
  );
});

describe("generated observability icons", () => {
  it.each(ICONS)(
    "$title preserves the reference palette, stroke geometry, size, and accessible title",
    ({ component: Icon, file, title }) => {
      render(<Icon size={16} title={title} />);
      const svg = screen.getByRole("img", { name: title });

      expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
      expect(svg).toHaveAttribute("width", "16");
      expect(svg).toHaveAttribute("height", "16");
      expect(svg).not.toHaveAttribute("aria-hidden", "true");
      expect(Icon.__source).toBe(`incumbent:${file}`);
      expect(Icon.__group).toBe("tracing-observability");
      expect(
        svg.querySelector(
          "path, rect, circle, ellipse, line, polyline, polygon",
        ),
      ).not.toBeNull();

      for (const shape of svg.querySelectorAll(
        "path, rect, circle, ellipse, line, polyline, polygon",
      )) {
        expect(STROKES).toContain(shape.closest("[stroke]")?.getAttribute("stroke"));
        expect(FILLS).toContain(shape.closest("[fill]")?.getAttribute("fill"));
        for (const [attribute, expected] of Object.entries(PRESENTATION)) {
          expect(shape.closest(`[${attribute}]`)?.getAttribute(attribute)).toBe(
            expected,
          );
        }
      }
      expect(svg.querySelector('[stroke="#3574F0"]')).not.toBeNull();
      expect(svg.querySelector('[fill="#E7EFFD"], [fill="#EBECF0"]')).not.toBeNull();
      expect(svg.querySelector("[color], [style], style")).toBeNull();
      expect(svg).not.toHaveAttribute("style");
    },
  );

  it.each(ICONS)(
    "$title is decorative without a title",
    ({ component: Icon }) => {
      const { container } = render(<Icon />);
      expect(container.querySelector("svg")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    },
  );
});
