import type { Project } from "./project";

export const STARTER: Project = {
  format: 1,
  name: "Deployment diagram",
  entry: "diagram.tsx",
  locks: {},
  files: {
    "package.json": JSON.stringify({ dependencies: { "@flanksource/clicky-ui": "^0.3", "@flanksource/facet": "^0.1" } }, null, 2),
    "diagram.tsx": `import { Arrow, BoxNode, Diagram } from "@flanksource/facet";
import "./page.css";

export default function DeploymentDiagram() {
  return <main className="p-8">
    <h1 className="text-2xl font-bold">Deployment path</h1>
    <p>Changes move from source to a running service.</p>
    <Diagram className="p-8">
      {(id) => <div className="flex items-center justify-between gap-16">
        <BoxNode id={id("source")} title="Source" className="w-64">Approved change</BoxNode>
        <BoxNode id={id("target")} title="Deployment" className="w-64">Running service</BoxNode>
        <Arrow from={id("source")} to={id("target")} />
      </div>}
    </Diagram>
  </main>;
}
`,
    "notes.tsx": 'export default function Notes() { return <article><h1>Release notes</h1><p>Each page keeps its own library lock.</p></article>; }\n',
    "page.css": "@media print { body { print-color-adjust: exact; } main { break-inside: avoid; } }\n",
  },
};
