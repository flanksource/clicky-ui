import type { Meta, StoryObj } from "@storybook/react-vite";
import { useSort } from "../hooks/use-sort";
import { SortableHeader } from "./SortableHeader";

const meta: Meta<typeof SortableHeader> = {
  title: "Data/SortableHeader",
  component: SortableHeader,
};

export default meta;
type Story = StoryObj<typeof SortableHeader>;

type Row = { id: number; name: string; score: number };
const data: Row[] = [
  { id: 1, name: "Alice", score: 82 },
  { id: 2, name: "Bob", score: 91 },
  { id: 3, name: "Charlie", score: 74 },
];

export const TableDemo: Story = {
  render: () => {
    const { sorted, sort, toggle } = useSort(data);
    return (
      <table className="w-full text-sm">
        <thead>
          <tr>
            {(["id", "name", "score"] as const).map((k) => (
              <th key={k} className="text-left p-density-2 border-b">
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
            <tr key={r.id}>
              <td className="p-density-2">{r.id}</td>
              <td className="p-density-2">{r.name}</td>
              <td className="p-density-2 text-right">{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
};
