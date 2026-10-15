import type { Meta, StoryObj } from "@storybook/react-vite";
import { UiCalculator, UiFileCode, UiFunctionSquare, UiTable } from "../icons";
import { SymbolBadge } from "./SymbolBadge";

const meta = {
  title: "Data/SymbolBadge",
  component: SymbolBadge,
  args: { children: "CalculatePremium(CoverMV) = …", style: "badge", color: "indigo", icon: UiFunctionSquare },
  argTypes: {
    style: { control: "inline-radio", options: ["badge", "badge-outline", "inline"] },
    color: { control: "text" },
    icon: { control: false },
    language: { control: "text" },
  },
  parameters: {
    docs: { description: { component: "Compact symbols, identifiers and expressions with an imported glyph. Named hues adapt to the page theme; language adds inline syntax formatting without changing the source." } },
  },
} satisfies Meta<typeof SymbolBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Badge: Story = {};
export const BadgeOutline: Story = { args: { style: "badge-outline" } };
export const Inline: Story = { args: { style: "inline" } };
export const LanguageFormatting: Story = { args: { language: "javascript" } };
export const CssColor: Story = { args: { color: "var(--color-violet-700)" } };
export const Palette: Story = {
  render: () => <div className="flex flex-wrap items-center gap-4">
    <SymbolBadge color="violet" icon={UiCalculator}>PremiumMV * TaxRateMV</SymbolBadge>
    <SymbolBadge color="sky" icon={UiFunctionSquare} style="badge-outline">AnnualPremiumMV</SymbolBadge>
    <SymbolBadge color="slate" icon={UiTable} style="inline">dbo.AsPolicy</SymbolBadge>
    <SymbolBadge color="slate" icon={UiFileCode} language="xml">{'<MathVariable />'}</SymbolBadge>
  </div>,
};
