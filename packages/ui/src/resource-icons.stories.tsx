import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import * as GeneratedIcons from "./icons";
import type { IconComponent } from "./icons";
import { resourceIconPalette } from "./resource-icon-palette";

const groups = [
  { id: "cloud-resources", label: "Cloud resources" },
  { id: "kubernetes", label: "Kubernetes" },
];

function isResourceIcon(value: unknown): value is IconComponent {
  return (
    typeof value === "function" &&
    "__source" in value &&
    "__group" in value &&
    (value.__group === "cloud-resources" || value.__group === "kubernetes")
  );
}

const icons = Object.entries(GeneratedIcons)
  .filter((entry): entry is [string, IconComponent] => isResourceIcon(entry[1]))
  .sort(([a], [b]) => a.localeCompare(b));

function ResourceIconCatalog({ size }: { size: number }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Object.entries(resourceIconPalette).map(([category, colors]) => (
          <div key={category} className="rounded border border-border p-3">
            <div className="mb-2 flex gap-1">
              <span
                className="h-6 w-6 rounded"
                style={{ background: colors.primary }}
              />
              <span
                className="h-6 w-6 rounded"
                style={{ background: colors.accent }}
              />
            </div>
            <span className="text-xs capitalize">{category}</span>
          </div>
        ))}
      </div>
      {groups.map(({ id, label }) => {
        const entries = icons.filter(([, icon]) => icon.__group === id);
        return (
          <section key={id} className="space-y-2">
            <header className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold">{label}</h2>
              <span className="text-xs text-muted-foreground">
                {entries.length}
              </span>
            </header>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {entries.map(([name, Icon]) => (
                <div
                  key={name}
                  className="flex min-w-0 items-center gap-2 rounded border border-border bg-background px-2 py-1.5"
                >
                  <Icon size={size} title={name} className="shrink-0" />
                  <span className="truncate font-mono text-[11px] text-foreground">
                    {name}
                  </span>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

const meta: Meta<typeof ResourceIconCatalog> = {
  title: "Foundations/Resource Icons",
  component: ResourceIconCatalog,
  args: { size: 32 },
  argTypes: {
    size: { control: { type: "number", min: 16, max: 64, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof ResourceIconCatalog>;

export const Catalog: Story = {
  name: "Cloud and Kubernetes resources",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const category of [
      "compute",
      "network",
      "config",
      "policy",
      "storage",
      "security",
    ]) {
      await expect(canvas.getByText(category)).toBeVisible();
    }
    await expect(
      canvas.getByRole("img", { name: "UiCloudVmAws" }),
    ).toBeVisible();
    await expect(canvas.getByRole("img", { name: "UiKubePod" })).toBeVisible();
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shared semantic colors for 12 cloud resource glyphs, AWS/Azure/Google Cloud badge variants, and 39 Kubernetes Community glyphs shown bare and on reproducible octagons.",
      },
    },
  },
};
