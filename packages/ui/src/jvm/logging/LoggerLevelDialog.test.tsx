import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { loggerRows, type LoggerRow } from "../model/loggers";
import { LoggerLevelDialog } from "./LoggerLevelDialog";

const [root, example, orders, orderService] = loggerRows([
  { name: "", level: "INFO", parent: null },
  { name: "com.example", level: null, parent: "" },
  { name: "com.example.orders", level: "FINE", parent: "com.example" },
  { name: "com.example.orders.OrderService", level: "AUDIT", parent: "com.example.orders" },
]) as [LoggerRow, LoggerRow, LoggerRow, LoggerRow];

function renderDialog(logger: LoggerRow, onSave = vi.fn().mockResolvedValue(undefined)) {
  const onClose = vi.fn();
  render(<LoggerLevelDialog logger={logger} onSave={onSave} onClose={onClose} />);
  return { onSave, onClose };
}

const choose = (value: string) => fireEvent.change(screen.getByRole("combobox"), { target: { value } });

describe("LoggerLevelDialog", () => {
  it("starts on the logger's current level and names the root", () => {
    renderDialog(root);
    expect(screen.getByRole("combobox")).toHaveValue("INFO");
    expect(screen.getByText(/<root> · currently INFO/)).toBeInTheDocument();
  });

  it("offers inherit plus every java.util.logging level", () => {
    renderDialog(example);
    expect(Array.from(screen.getByRole("combobox").querySelectorAll("option")).map((option) => option.textContent)).toEqual([
      "(inherit)",
      "OFF",
      "SEVERE",
      "WARNING",
      "INFO",
      "CONFIG",
      "FINE",
      "FINER",
      "FINEST",
      "ALL",
    ]);
    expect(screen.getByRole("combobox")).toHaveValue("__inherit__");
  });

  it("keeps a custom level the logger already has selectable", () => {
    renderDialog(orderService);
    expect(screen.getByRole("combobox")).toHaveValue("AUDIT");
  });

  it("saves the chosen level and closes", async () => {
    const { onSave, onClose } = renderDialog(orders);
    choose("WARNING");
    fireEvent.click(screen.getByRole("button", { name: "Set level" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
    expect(onSave).toHaveBeenCalledWith("WARNING");
  });

  it("saves null to inherit the parent's level", async () => {
    const { onSave } = renderDialog(orders);
    choose("__inherit__");
    fireEvent.click(screen.getByRole("button", { name: "Set level" }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith(null));
  });

  it("stays open and shows the agent's error when the write fails", async () => {
    const { onClose } = renderDialog(orders, vi.fn().mockRejectedValue(new Error("mutation disabled")));
    fireEvent.click(screen.getByRole("button", { name: "Set level" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("mutation disabled");
    expect(onClose).not.toHaveBeenCalled();
  });
});
