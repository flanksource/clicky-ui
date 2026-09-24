import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { expect, userEvent, within } from "storybook/test";
import { Button } from "../components/button";
import { OperationEntityPicker } from "./OperationEntityPicker";
import { schemesClient } from "./operationEntityPicker.fixtures";
import { clickyNodeText } from "./rowNavigation";

// PickerField is the consumer shape the picker exists for: a read-only input
// holding the chosen label, and a Browse… button that opens the dialog scoped
// to the host's locked values.
function PickerField({
  mode,
  lockedValues,
}: {
  mode: "single" | "multi";
  lockedValues?: Record<string, string>;
}) {
  const client = useMemo(() => schemesClient(), []);
  const queryClient = useMemo(() => new QueryClient(), []);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<{ ids: string[]; labels: string[] }>({
    ids: [],
    labels: [],
  });
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex max-w-md items-center gap-2">
        <input
          readOnly
          aria-label="Scheme"
          className="h-8 flex-1 rounded-md border border-border bg-background px-2 text-sm"
          value={picked.labels.join(", ")}
          placeholder="No scheme chosen"
        />
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
          Browse…
        </Button>
      </div>
      <OperationEntityPicker
        open={open}
        onClose={() => setOpen(false)}
        title="Choose a scheme"
        client={client}
        surfaceKey="schemes"
        mode={mode}
        selected={picked.ids}
        {...(lockedValues ? { lockedValues } : {})}
        onSelect={(ids, rows) =>
          setPicked({
            ids,
            labels: rows.map(
              (row) =>
                `${clickyNodeText(row.cells.customer_number)} · ${clickyNodeText(row.cells.company)}`,
            ),
          })
        }
      />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Clicky-RPC/OperationEntityPicker",
  component: PickerField,
  parameters: { layout: "padded" },
  args: { mode: "single" },
} satisfies Meta<typeof PickerField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleScoped: Story = {
  args: { mode: "single", lockedValues: { product: "gl-guid" } },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    await step("open the picker scoped to a product", async () => {
      await userEvent.click(canvas.getByRole("button", { name: "Browse…" }));
      const dialog = await body.findByRole("dialog", { name: "Choose a scheme" });
      await expect(
        await within(dialog).findByText("Scoped to: Product = Group Life"),
      ).toBeInTheDocument();
      await expect(within(dialog).getByRole("button", { name: "Select" })).toBeDisabled();
    });
    await step("check a row and select it", async () => {
      await userEvent.click(await body.findByText("Example Retail"));
      await userEvent.click(body.getByRole("button", { name: "Select" }));
      await expect(canvas.getByRole("textbox", { name: "Scheme" })).toHaveValue(
        "G0000012 · Example Retail",
      );
    });
  },
};

export const Multi: Story = {
  args: { mode: "multi" },
};
