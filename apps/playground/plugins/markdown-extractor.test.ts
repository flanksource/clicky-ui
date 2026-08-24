import { describe, expect, it } from "vitest";

import { extractPageGuidance, memoryGuidanceHost } from "./markdown-extractor";

describe("extractPageGuidance", () => {
  it("extracts sections, practices, annotations, variants, callouts, lists, and tables in render order", () => {
    const host = memoryGuidanceHost({
      "/src/page.tsx": `
        import { VariantFrame } from "./variant";
        import { PracticeGrid } from "./practice";

        const PRACTICES = [
          { tone: "do", title: "Keep scope visible", body: "Put filters in the route." },
          { tone: "avoid", title: "Never hide filters", body: "Empty results need recovery." },
        ] as const;
        const NOTES = [{ id: "rail", title: "Rail owns location", body: "Keep page state out." }];
        const ROWS = [{ slot: "search", holds: "Global find", avoid: "Local filtering" }];

        export default function Page() {
          return <DesignSystemPage title="Anatomy" description="Shell guidance">
            <SpecimenSection title="Regions" description="Where controls belong">
              <table>
                <thead><tr><th>Slot</th><th>Holds</th><th>Keeps out</th></tr></thead>
                <tbody>{ROWS.map((row) => (<tr><td>{row.slot}</td><td>{row.holds}</td><td>{row.avoid}</td></tr>))}</tbody>
              </table>
            </SpecimenSection>
            <AnnotatedSpecimen notes={NOTES} label="Rules"><div>specimen noise</div></AnnotatedSpecimen>
            <PracticeGrid practices={PRACTICES} />
            <VariantFrame title="Compact" verdict="Fits one scanning line" width={720}><div>noise</div></VariantFrame>
            <Callout variant="important" title="Required">Choose an owner.</Callout>
            <GuidanceList title="Use when" tone="use" items={["The collection is large"]} />
          </DesignSystemPage>;
        }
      `,
      "/src/variant.tsx": `export function VariantFrame() { return null; }`,
      "/src/practice.tsx": `export function PracticeGrid() { return null; }`,
    });

    expect(extractPageGuidance("/src/page.tsx", host).guidance.blocks).toEqual([
      { kind: "section", title: "Regions", description: "Where controls belong" },
      {
        kind: "table",
        headers: ["Slot", "Holds", "Keeps out"],
        rows: [["search", "Global find", "Local filtering"]],
      },
      {
        kind: "annotation",
        tone: "rule",
        title: "Rail owns location",
        body: "Keep page state out.",
      },
      {
        kind: "practice",
        tone: "do",
        title: "Keep scope visible",
        body: "Put filters in the route.",
      },
      {
        kind: "practice",
        tone: "avoid",
        title: "Never hide filters",
        body: "Empty results need recovery.",
      },
      { kind: "variant", title: "Compact", verdict: "Fits one scanning line" },
      {
        kind: "callout",
        tone: "important",
        title: "Required",
        body: "Choose an owner.",
      },
      {
        kind: "list",
        title: "Use when",
        tone: "use",
        items: ["The collection is large"],
      },
    ]);
  });

  it("follows local wrapper components and imported constants with bound props", () => {
    const host = memoryGuidanceHost({
      "/src/page.tsx": `
        import { Frame, OPTIONS } from "./shared";
        export default function Page() {
          return (<main>{OPTIONS.map(({ title, verdict }, index) =>
            <Frame title={title} verdict={verdict} selected={index === 0} />
          )}</main>);
        }
      `,
      "/src/shared.tsx": `
        const OPTIONS_WITHOUT_VERDICT = [
          { title: "Summary row", note: "Fast to scan" },
          { title: "Detail card", note: "Shows rationale" },
        ];
        export const OPTIONS = OPTIONS_WITHOUT_VERDICT.map((option) => ({
          ...option,
          verdict: option.note,
        }));
        export function Frame({ title, verdict, selected }) {
          return <VariantFrame title={title} verdict={verdict} selected={selected}><div /></VariantFrame>;
        }
      `,
    });

    expect(extractPageGuidance("/src/page.tsx", host).guidance.blocks).toEqual([
      { kind: "variant", title: "Summary row", verdict: "Fast to scan", selected: true },
      { kind: "variant", title: "Detail card", verdict: "Shows rationale" },
    ]);
  });

  it("fails loudly when a recognized annotation prop is runtime-only", () => {
    const host = memoryGuidanceHost({
      "/src/page.tsx": `
        export default function Page() {
          const [verdict] = useState("runtime");
          return <VariantFrame title="Dynamic" verdict={verdict}><div /></VariantFrame>;
        }
      `,
    });

    expect(() => extractPageGuidance("/src/page.tsx", host)).toThrow(
      /VariantFrame prop "verdict".*page\.tsx:4/,
    );
  });

  it("ignores runtime maps that only render specimen content", () => {
    const host = memoryGuidanceHost({
      "/src/page.tsx": `
        export default function Page() {
          const [items] = useState([]);
          return <main>
            {items.map((item) => <div>{item}</div>)}
            <PracticeGrid practices={[{ title: "Static rule", body: "Keep this." }]} />
          </main>;
        }
      `,
    });

    expect(extractPageGuidance("/src/page.tsx", host).guidance.blocks).toEqual([
      { kind: "practice", tone: "rule", title: "Static rule", body: "Keep this." },
    ]);
  });

  it("skips runtime maps whose instances cannot be determined statically", () => {
    const host = memoryGuidanceHost({
      "/src/page.tsx": `
        export default function Page() {
          const [items] = useState([]);
          return <main>{items.map((item) =>
            <VariantFrame title={item.title} verdict={item.verdict}><div /></VariantFrame>
          )}</main>;
        }
      `,
    });

    expect(extractPageGuidance("/src/page.tsx", host).guidance.blocks).toEqual([]);
  });

  it("extracts every entry from an explicit guidance catalog", () => {
    const host = memoryGuidanceHost({
      "/src/page.tsx": `
        const STYLES = [{
          label: "Table",
          useWhen: ["Columns repeat"],
          avoidWhen: ["Items have different shapes"],
        }];
        export default function Page() {
          return <GuidanceCatalog styles={STYLES} />;
        }
      `,
    });

    expect(extractPageGuidance("/src/page.tsx", host).guidance.blocks).toEqual([
      { kind: "list", title: "Table: Use when", tone: "use", items: ["Columns repeat"] },
      {
        kind: "list",
        title: "Table: Avoid when",
        tone: "avoid",
        items: ["Items have different shapes"],
      },
    ]);
  });
});
