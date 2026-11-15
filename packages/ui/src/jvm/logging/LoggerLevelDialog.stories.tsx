import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent } from "storybook/test";
import { LOGGERS } from "../fixtures/classes";
import { loggerRows } from "../model/loggers";
import { LoggerLevelDialog } from "./LoggerLevelDialog";

const rows = loggerRows(LOGGERS);
const row = (name: string) => rows.find((candidate) => candidate.name === name)!;

const meta = {
  title: "JVM/LoggerLevelDialog",
  component: LoggerLevelDialog,
  parameters: { layout: "fullscreen" },
  args: { logger: row("com.example.orders"), onSave: async () => {}, onClose: () => {} },
} satisfies Meta<typeof LoggerLevelDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SetLevel: Story = {
  play: async () => {
    await expect(await screen.findByRole("combobox")).toHaveValue("FINE");
  },
};

export const Inheriting: Story = {
  args: { logger: row("com.example.orders.OrderService") },
  play: async () => {
    await expect(await screen.findByRole("combobox")).toHaveValue("__inherit__");
  },
};

export const WriteFails: Story = {
  args: {
    onSave: async () => {
      throw new Error("mutation disabled for setLoggerLevel");
    },
  },
  play: async () => {
    await userEvent.click(await screen.findByRole("button", { name: "Set level" }));
    await expect(await screen.findByRole("alert")).toHaveTextContent("mutation disabled");
  },
};
