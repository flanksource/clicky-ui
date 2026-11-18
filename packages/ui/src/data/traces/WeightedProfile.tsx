import { Button } from "../../components/button";
import { flameLayout, treemapLayout, type WeightedHierarchy, type WeightedNode } from "./weighted-layout";
import { formatProfileValue } from "./profile-aggregate";

export interface WeightedProfileProps {
  hierarchy: WeightedHierarchy;
  mode: "flamegraph" | "treemap";
  zoom: string;
  search: string;
  onZoom: (id: string) => void;
}

function pathTo(root: WeightedNode, id: string): WeightedNode[] | undefined {
  if (root.id === id) return [root];
  for (const child of root.children) {
    const path = pathTo(child, id);
    if (path) return [root, ...path];
  }
  return undefined;
}

/** Call-stack weights are exclusive at leaves; parents display cumulative totals. */
export function WeightedProfile({ hierarchy, mode, zoom, search, onZoom }: WeightedProfileProps) {
  const path = zoom ? pathTo(hierarchy.root, zoom) : [hierarchy.root];
  const root = path?.at(-1);
  if (!path || !root) return <div role="status" className="p-4">Selected stack is absent from this sample. <Button variant="outline" onClick={() => onZoom("")}>Show all stacks</Button></div>;
  const rectangles = mode === "flamegraph" ? flameLayout(root) : treemapLayout(root);
  const levels = Math.max(1, ...rectangles.map(rect => rect.depth + 1));
  const height = mode === "flamegraph" ? levels * 28 : 500;
  const format = (value: number) => formatProfileValue(value, hierarchy.unit);
  return <div className="flex min-h-0 flex-1 flex-col gap-2">
    <nav aria-label="Profile zoom" className="flex shrink-0 flex-wrap items-center gap-1">
      {path.map((node, index) => <Button key={node.id} variant="ghost" size="sm" onClick={() => onZoom(index === 0 ? "" : node.id)}>{node.label}</Button>)}
    </nav>
    <p className="shrink-0 text-sm text-muted-foreground">{root.label} · {format(root.total)} total · {format(root.self)} self</p>
    <div className="min-h-0 flex-1 overflow-auto rounded border border-border">
      {root.total === 0 ? <p role="status" className="p-4">No weighted stacks match this sample.</p> : <svg role="img" aria-label={`${hierarchy.metric} ${mode}`} viewBox={`0 0 1000 ${height}`} className="w-full" style={{ minHeight: Math.min(height, 500) }}>
        {rectangles.map(({ node, x, y, width, height: rectHeight, depth }) => {
          const px = x * 1000;
          const py = mode === "flamegraph" ? (levels - depth - 1) * 28 : y * 500;
          const pw = width * 1000;
          const ph = mode === "flamegraph" ? 27 : rectHeight * 500;
          const matches = search !== "" && node.label.toLowerCase().includes(search.toLowerCase());
          return <g key={node.id} role="button" tabIndex={0} aria-label={`${node.label}, ${format(node.total)}`} onClick={() => onZoom(node.id)}
            onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onZoom(node.id); } }} className="cursor-pointer outline-none focus:stroke-primary">
            <title>{node.label}{"\n"}{node.total} {hierarchy.unit} total · {node.self} {hierarchy.unit} self{"\n"}{format(node.total)} total · {format(node.self)} self</title>
            <rect x={px} y={py} width={Math.max(0, pw - 1)} height={ph} className={matches ? "fill-primary/50 stroke-primary" : "fill-primary/20 stroke-background hover:fill-primary/40"} />
            {pw > 70 && ph > 18 && <text x={px + 4} y={py + 17} fontSize={12} className="pointer-events-none fill-foreground">{node.label.slice(0, Math.floor(pw / 7))}</text>}
          </g>;
        })}
      </svg>}
    </div>
  </div>;
}
