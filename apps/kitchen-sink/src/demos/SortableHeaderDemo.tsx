import { SortableHeader, useSort } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

type Row = { id: number; name: string; score: number };

const data: Row[] = [
  { id: 1, name: "Alice", score: 82 },
  { id: 2, name: "Bob", score: 91 },
  { id: 3, name: "Charlie", score: 74 },
  { id: 4, name: "Dana", score: 88 },
];

export function SortableHeaderDemo() {
  const { sorted, sort, toggle } = useSort(data);
  return (
    <DemoSection
      id="sortable"
      title="useSort + SortableHeader"
      description="Click a header to toggle asc / desc / none."
    >
      <table className="w-full text-sm">
        <thead>
          <tr>
            {(["id", "name", "score"] as const).map((k) => (
              <th
                key={k}
                className="text-left p-density-2 border-b border-border font-medium text-xs"
              >
                <SortableHeader
                  active={sort?.key === k}
                  dir={sort?.dir}
                  onClick={() => toggle(k)}
                  align={k === "score" ? "right" : "left"}
                >
                  {k}
                </SortableHeader>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id} className="border-b border-border/50">
              <td className="p-density-2">{r.id}</td>
              <td className="p-density-2">{r.name}</td>
              <td className="p-density-2 text-right tabular-nums">{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </DemoSection>
  );
}
