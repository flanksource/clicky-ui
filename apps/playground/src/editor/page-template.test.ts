import { describe, expect, it } from "vitest";

import { componentName, pageTemplate } from "./page-template";

describe("componentName", () => {
  it.each([
    ["welcome", "Welcome"],
    ["agent-inbox", "AgentInbox"],
    ["dashboards/agent-inbox", "AgentInbox"],
    ["a-b-c", "ABC"],
  ])("maps %s to %s", (slug, expected) => {
    expect(componentName(slug)).toBe(expected);
  });

  it("prefixes a name that would not start with a letter", () => {
    // JSX resolves a lowercase/numeric tag as an intrinsic element, so a slug
    // like "404" must not become `function 404()`.
    expect(componentName("404")).toBe("Page404");
  });
});

describe("pageTemplate", () => {
  it("produces a default-exported component named after the slug", () => {
    const source = pageTemplate("agent-inbox");

    expect(source).toContain("export default function AgentInbox()");
    expect(source).toContain('export const meta = { title: "Agent inbox" };');
  });

  it("escapes a title rather than emitting broken source", () => {
    expect(pageTemplate("say-hi")).toContain('title: "Say hi"');
  });

  it("uses an explicit display title without changing the component name", () => {
    const source = pageTemplate("designs/review", "Quarterly design review");

    expect(source).toContain('title: "Quarterly design review"');
    expect(source).toContain("export default function Review()");
    expect(source).toContain('>{"Quarterly design review"}</h1>');
  });

  it("emits a template the registry would accept as a page", () => {
    const source = pageTemplate("dashboards/metrics");

    expect(source).toContain("export default function Metrics()");
    expect(source.trimEnd().endsWith("}")).toBe(true);
  });
});
