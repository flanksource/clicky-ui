import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { AccordionList } from "./AccordionList";

const meta: Meta<typeof AccordionList> = {
  title: "Components/AccordionList",
  component: AccordionList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A list of items collapsed to one row each, expanding one at a time into that item's own editor. `renderHeader` and `renderBody` are the only content the consumer supplies; the disclosure, aria pairing, arrow-key roving focus, action buttons and add row belong to the list. Every editing capability is opt-in (`allowReorder`, `allowDuplicate`, `allowRemove`, `onCreate`), so the same component serves a read-only summary list and a full editor.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

type Route = { path: string; method: string; upstream: string };

const ROUTES: Route[] = [
  { path: "/api/v1/users", method: "GET", upstream: "users-svc:8080" },
  { path: "/api/v1/events", method: "POST", upstream: "events-svc:8080" },
];

function RouteList(props: {
  allowReorder?: boolean;
  allowDuplicate?: boolean;
  allowRemove?: boolean;
  addable?: boolean;
  readOnly?: boolean;
  initial?: Route[];
}) {
  const { addable = true, initial = ROUTES, ...caps } = props;
  const [routes, setRoutes] = useState(initial);
  return (
    <div className="max-w-2xl">
      <AccordionList<Route>
        items={routes}
        onChange={setRoutes}
        summary={routes.length === 1 ? "1 route" : `${routes.length} routes`}
        itemLabel={({ item }) => item.path}
        addLabel="Add route"
        addDescription="A route forwards one path to one upstream service."
        {...(addable ? { onCreate: () => ({ path: "", method: "GET", upstream: "" }) } : {})}
        {...caps}
        renderHeader={({ item, index }) => (
          <>
            <span className="shrink-0 text-sm font-medium">
              {item.path || `Route ${index + 1}`}
            </span>
            <code className="truncate font-mono text-xs text-muted-foreground">
              {item.method} · {item.upstream}
            </code>
          </>
        )}
        renderBody={({ item, onChange }) => (
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm">
              <span className="w-20 text-muted-foreground">Path</span>
              <input
                className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                value={item.path}
                onChange={(e) => onChange({ ...item, path: e.target.value })}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="w-20 text-muted-foreground">Upstream</span>
              <input
                className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                value={item.upstream}
                onChange={(e) => onChange({ ...item, upstream: e.target.value })}
              />
            </label>
          </div>
        )}
      />
    </div>
  );
}

export const Default: Story = {
  render: () => <RouteList addable={false} />,
};

export const WithActions: Story = {
  render: () => <RouteList allowReorder allowDuplicate allowRemove />,
};

export const ReorderOnly: Story = {
  render: () => <RouteList allowReorder addable={false} />,
};

export const ReadOnly: Story = {
  render: () => <RouteList readOnly allowReorder allowRemove />,
};

export const Empty: Story = {
  render: () => <RouteList initial={[]} />,
};

export const AddsAndRemoves: Story = {
  render: () => <RouteList allowRemove />,
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const rows = () => canvas.getAllByRole("button", { expanded: false });

    await step("starts with the two seeded routes", async () => {
      await expect(canvas.getAllByRole("button", { name: /^Remove/ })).toHaveLength(2);
    });

    await step("the add row appends a route and opens it", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Add route/ }));
      await expect(canvas.getByRole("button", { expanded: true })).toBeInTheDocument();
      await expect(canvas.getAllByRole("button", { name: /^Remove/ })).toHaveLength(3);
    });

    await step("removing takes the named route out", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Remove /api/v1/users" }));
      await expect(canvas.getAllByRole("button", { name: /^Remove/ })).toHaveLength(2);
    });

    await step("only one row opens at a time", async () => {
      await userEvent.click(rows()[0]!);
      await expect(canvas.getAllByRole("button", { expanded: true })).toHaveLength(1);
    });
  },
};
