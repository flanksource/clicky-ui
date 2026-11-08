export const parityPages = [
  "BadgeExamples", "BleedTest", "CompactTableExample", "DataFlowDiagram", "FindingsReport",
  "HeaderDefault", "HeaderMinimal", "HeaderNone", "HeaderSolid", "ListTableExample", "LogoGridTableExample",
  "MetricExamples", "PageSizeTest", "SecurityChecksTableExample", "SpecificationTableExample", "StatCardExamples",
  "TableExamples", "TypographyTest", "OfficeContents", "LiveDiagram", "OfficeReport",
];

export function pageFile(name: string): string {
  if (name === "OfficeContents") return "office/Contents.tsx";
  if (name === "LiveDiagram") return "office/LiveDiagram.tsx";
  if (name === "OfficeReport") return "office/Report.tsx";
  if (!parityPages.includes(name)) throw new Error(`unknown Tailwind parity page ${name}`);
  return `kitchen-sink/${name}.tsx`;
}
