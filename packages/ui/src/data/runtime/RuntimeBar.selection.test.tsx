import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChatModel } from "../chat/types";
import { RuntimeBar } from "./RuntimeBar";
import type { SpecRuntimeFamily } from "./runtime-mode";

const FAMILIES: SpecRuntimeFamily[] = [
  {
    id: "claude",
    label: "Claude",
    provider: "anthropic",
    modes: [
      { id: "api", label: "API" },
      { id: "cli", label: "CLI", provider: "anthropic-local" },
    ],
  },
  {
    id: "codex",
    label: "Codex",
    provider: "openai",
    modes: [
      { id: "api", label: "API" },
      { id: "cli", label: "CLI" },
    ],
  },
  {
    id: "custom",
    label: "Custom API",
    provider: "custom",
    modes: [{ id: "api", label: "API" }],
  },
];
const MODELS: ChatModel[] = [
  {
    id: "sonnet-api",
    label: "Sonnet API",
    provider: "anthropic",
    reasoning: true,
  },
  {
    id: "sonnet-cli",
    label: "Sonnet CLI",
    provider: "anthropic-local",
    reasoning: true,
    runtime: { model: "sonnet", mode: "cli" },
  },
  {
    id: "codex-cli",
    label: "Codex CLI",
    provider: "openai",
    reasoning: true,
    runtime: { model: "codex", mode: "cli" },
  },
  {
    id: "unavailable",
    label: "Unavailable model",
    provider: "anthropic-local",
    reasoning: true,
    availability: { state: "not_authenticated" },
  },
];

describe.each(["segmented", "combo"] as const)(
  "RuntimeBar %s mode-first selection",
  (variant) => {
    it("renders Mode before the combined model picker and filters models across eligible families", () => {
      render(
        <RuntimeBar
          variant={variant}
          value={{ mode: "cli", model: "sonnet" }}
          onChange={vi.fn()}
          families={FAMILIES}
          models={MODELS}
        />,
      );
      const buttons = within(
        screen.getByRole("group", { name: "Runtime" }),
      ).getAllByRole("button");
      const modelPicker = screen.getByRole("combobox", { name: "Model" });
      expect(buttons[0]).toHaveAttribute("title", "Runtime mode — CLI");
      expect(
        buttons[0]!.compareDocumentPosition(modelPicker) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(screen.queryByTitle("Family — Claude")).not.toBeInTheDocument();

      fireEvent.click(modelPicker);
      const menu = within(screen.getByRole("listbox", { name: "Model" }));
      expect(
        menu.getByRole("option", { name: /Sonnet CLI/ }),
      ).toBeInTheDocument();
      expect(
        menu.getByRole("option", { name: /Codex CLI/ }),
      ).toBeInTheDocument();
      expect(
        menu.queryByRole("option", { name: /Sonnet API|Unavailable model/ }),
      ).not.toBeInTheDocument();
      expect(menu.queryByText("Custom API")).not.toBeInTheDocument();
    });

    it("selects a model from another family without changing mode or limits", () => {
      const onChange = vi.fn();
      render(
        <RuntimeBar
          variant={variant}
          value={{ mode: "cli", model: "sonnet", budget: { cost: 2 } }}
          onChange={onChange}
          families={FAMILIES}
          models={MODELS}
        />,
      );
      fireEvent.click(screen.getByTitle("Model — sonnet"));
      fireEvent.mouseDown(screen.getByRole("option", { name: /Codex CLI/ }));
      expect(onChange).toHaveBeenCalledWith({
        mode: "cli",
        model: "codex",
        budget: { cost: 2 },
      });
    });

    it("clears an incompatible model when changing mode", () => {
      const onChange = vi.fn();
      render(
        <RuntimeBar
          variant={variant}
          value={{ mode: "cli", model: "sonnet", budget: { timeout: "30m" } }}
          onChange={onChange}
          families={FAMILIES}
          models={MODELS}
        />,
      );
      fireEvent.click(screen.getByTitle("Runtime mode — CLI"));
      fireEvent.click(screen.getByRole("menuitem", { name: "API" }));
      expect(onChange).toHaveBeenCalledWith({
        mode: "api",
        budget: { timeout: "30m" },
      });
    });

    it("keeps effort colors in both the inline dropdown and overflow submenu", () => {
      render(
        <RuntimeBar
          variant={variant}
          value={{ mode: "cli", effort: "medium" }}
          onChange={vi.fn()}
          families={FAMILIES}
          models={MODELS}
        />,
      );
      expect(
        screen.getByTitle("Reasoning effort").querySelector("svg"),
      ).toHaveClass("text-amber-700");
      fireEvent.click(screen.getByTitle("Reasoning effort"));
      expect(
        screen.getByRole("menuitem", { name: "High" }).querySelector("svg")
          ?.parentElement,
      ).toHaveClass("text-orange-700");
      fireEvent.keyDown(document, { key: "Escape" });
      fireEvent.click(screen.getByTitle("Runtime options"));
      expect(
        screen.getByRole("menuitem", { name: "Effort" }).querySelector("svg")
          ?.parentElement,
      ).toHaveClass("text-muted-foreground");
      fireEvent.click(screen.getByRole("menuitem", { name: "Effort" }));
      expect(
        screen.getByRole("menuitem", { name: "Medium" }).querySelector("svg")
          ?.parentElement,
      ).toHaveClass("text-amber-700");
    });

    it("keeps unset settings menu-only and edits custom limits through their submenu", () => {
      const onChange = vi.fn();
      render(
        <RuntimeBar
          variant={variant}
          value={{ mode: "cli" }}
          onChange={onChange}
          families={FAMILIES}
          models={MODELS}
          showTimeout
          showCost
        />,
      );
      expect(screen.queryByTitle("Timeout — no limit")).not.toBeInTheDocument();
      expect(screen.queryByTitle("Budget — no limit")).not.toBeInTheDocument();
      fireEvent.click(screen.getByTitle("Runtime options"));
      expect(
        within(screen.getByRole("menu", { name: "Runtime options" }))
          .getAllByRole("menuitem")
          .map((item) => item.textContent),
      ).toEqual(["Effort", "Budget", "Timeout"]);
      fireEvent.click(screen.getByRole("menuitem", { name: "Timeout" }));
      fireEvent.change(
        screen.getByRole("textbox", { name: "Timeout duration" }),
        { target: { value: "45m" } },
      );
      expect(onChange).toHaveBeenCalledWith({
        mode: "cli",
        budget: { timeout: "45m" },
      });
    });
  },
);
