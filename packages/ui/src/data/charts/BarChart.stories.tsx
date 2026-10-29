import type { Meta, StoryObj } from "@storybook/react-vite";
import { BarChart } from "./BarChart";

const SERVICES = [
  { label: "s3", value: 214 },
  { label: "iam", value: 186 },
  { label: "ec2", value: 143 },
  { label: "rds", value: 97 },
  { label: "kms", value: 64 },
  { label: "elbv2", value: 41 },
  { label: "lambda", value: 22 },
  { label: "sqs", value: 9 },
];

const meta = {
  title: "Charts/BarChart",
  component: BarChart,
  args: { data: SERVICES, width: 420 },
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    maxBars: { control: { type: "number", min: 2, max: 12 } },
    format: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Static single-series bar chart: pure SVG at an explicit size, so it renders identically through `renderToStaticMarkup` (reports, PDFs). Values are labelled directly; hover details ride on SVG `<title>`s. `maxBars` folds the tail into a neutral \"Other\" bar.",
      },
    },
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};

export const FoldedIntoOther: Story = { args: { maxBars: 5 } };

export const Vertical: Story = { args: { orientation: "vertical", height: 180 } };

export const Formatted: Story = { args: { format: (n: number) => `${n} findings`, maxBars: 4 } };

export const Empty: Story = { args: { data: [] } };
