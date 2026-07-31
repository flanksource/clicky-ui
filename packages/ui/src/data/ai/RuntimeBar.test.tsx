import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChatModel } from "../chat/types";
import { RuntimeBar } from "./RuntimeBar";

const MODELS: ChatModel[] = [
  {
    id: "claude-agent/sonnet",
    provider: "claude-agent",
    label: "Sonnet",
    reasoning: true,
    configured: true,
  },
  {
    id: "codex-cli/gpt-5",
    provider: "codex-cli",
    label: "GPT-5",
    reasoning: true,
    configured: true,
  },
  {
    id: "codex-cli/gpt-5-mini",
    provider: "codex-cli",
    label: "GPT-5 mini",
    reasoning: false,
    configured: false,
  },
];

function openSegment(title: string) {
  fireEvent.click(within(screen.getByRole("group")).getByTitle(title));
}

describe("RuntimeBar", () => {
  it("renders the combo summary and direct runtime controls", () => {
    render(
      <RuntimeBar
        variant="combo"
        value={{
          backend: "codex-cli",
          model: "codex-cli/gpt-5",
          effort: "high",
        }}
        onChange={vi.fn()}
        models={MODELS}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Runtime: Codex, CLI, GPT-5, effort High",
    });
    expect(trigger).toHaveTextContent("GPT-5");
    expect(trigger.querySelectorAll("svg")).toHaveLength(4);

    fireEvent.click(trigger);
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("aria-label", "Runtime controls");
    expect(
      within(menu).getByRole("radiogroup", { name: "Family" }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole("radiogroup", { name: "Runtime mode" }),
    ).toBeInTheDocument();
    expect(within(menu).queryByLabelText("Model id")).not.toBeInTheDocument();
    const modelChoice = within(menu).getByRole("button", {
      name: "GPT-5",
    });
    expect(modelChoice).toBeInTheDocument();
    expect(modelChoice).toHaveAttribute("title", "codex-cli/gpt-5");
    expect(modelChoice).not.toHaveTextContent("codex-cli/gpt-5");
    expect(modelChoice.querySelectorAll("svg")).toHaveLength(2);
    expect(
      within(menu).getByRole("slider", { name: "Reasoning effort" }),
    ).toHaveAttribute("aria-valuetext", "High");
  });

  it("updates combo fields without closing the runtime menu", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        variant="combo"
        value={{
          backend: "codex-cli",
          model: "codex-cli/gpt-5",
          effort: "high",
        }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Runtime: Codex, CLI, GPT-5, effort High",
      }),
    );
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("aria-label", "Runtime controls");

    fireEvent.click(within(menu).getByRole("radio", { name: "Claude" }));
    expect(onChange).toHaveBeenCalledWith({
      backend: "claude-cli",
      effort: "high",
    });
    expect(menu).toBeInTheDocument();

    fireEvent.click(within(menu).getByRole("radio", { name: "cmux" }));
    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-cmux",
      model: "codex-cli/gpt-5",
      effort: "high",
    });
    expect(menu).toBeInTheDocument();

    fireEvent.change(
      within(menu).getByRole("slider", { name: "Reasoning effort" }),
      { target: { value: "1" } },
    );
    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-cli",
      model: "codex-cli/gpt-5",
      effort: "low",
    });
    expect(menu).toBeInTheDocument();
  });

  it("keeps the current mode when the new family supports it", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "claude-cli" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Family — Claude");
    fireEvent.click(screen.getByRole("menuitem", { name: /^Codex/ }));

    expect(onChange).toHaveBeenCalledWith({ backend: "codex-cli" });
  });

  it("drops a model the new family cannot run", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "claude-agent", model: "claude-agent/sonnet" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Family — Claude");
    fireEvent.click(screen.getByRole("menuitem", { name: /^Codex/ }));

    expect(onChange).toHaveBeenCalledWith({ backend: "codex-agent" });
  });

  it("keeps a model the new mode can still run", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "codex-cli", model: "codex-cli/gpt-5" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Codex CLI");
    fireEvent.click(screen.getByRole("menuitem", { name: /^cmux/ }));

    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-cmux",
      model: "codex-cli/gpt-5",
    });
  });

  it("renders modes the family lacks as disabled and inert", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "claude-agent" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Claude Agent SDK");
    const api = screen.getByRole("menuitem", { name: /^API not on Claude/ });
    expect(api).toBeDisabled();

    fireEvent.click(api);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps the model segment when the catalog has none for the family", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "gemini" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — prompt default");
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Prompt defaultno override"]);

    fireEvent.change(screen.getByLabelText("Model id"), {
      target: { value: "gemini-3-pro" },
    });
    expect(onChange).toHaveBeenCalledWith({
      backend: "gemini",
      model: "gemini-3-pro",
    });
  });

  it("lists only the family's models and disables unconfigured ones", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "codex-cli" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — prompt default");
    const items = screen.getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Prompt defaultno override",
      "GPT-5codex-cli/gpt-5",
      "GPT-5 minicodex-cli/gpt-5-mini",
    ]);
    expect(items[2]).toBeDisabled();

    fireEvent.click(items[1]!);
    // A reasoning model with unknown capabilities defaults to medium effort.
    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-cli",
      model: "codex-cli/gpt-5",
      effort: "medium",
    });
  });

  it("selects the catalog's canonical Captain runtime value", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "anthropic" }}
        onChange={onChange}
        models={[
          {
            id: "anthropic/claude-sonnet-4-6",
            provider: "anthropic",
            label: "Sonnet 4.6",
            reasoning: true,
            configured: true,
            runtime: {
              model: "claude-sonnet-4-6",
              id: "anthropic/claude-sonnet-4-6",
              backend: "anthropic",
            },
          },
        ]}
      />,
    );

    openSegment("Model — prompt default");
    fireEvent.click(screen.getByRole("menuitem", { name: /^Sonnet 4.6/ }));

    expect(onChange).toHaveBeenCalledWith({
      model: "claude-sonnet-4-6",
      id: "anthropic/claude-sonnet-4-6",
      backend: "anthropic",
      effort: "medium",
    });
  });

  it("clears the model through the prompt-default entry", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "codex-cli", model: "codex-cli/gpt-5" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — codex-cli/gpt-5");
    fireEvent.click(screen.getByRole("menuitem", { name: /^Prompt default/ }));

    expect(onChange).toHaveBeenCalledWith({ backend: "codex-cli" });
  });

  it("clears the effort through the None entry", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "codex-cli", effort: "high" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Reasoning effort");
    fireEvent.click(screen.getByRole("menuitem", { name: /^None/ }));

    expect(onChange).toHaveBeenCalledWith({ backend: "codex-cli" });
  });

  it("offers a tier the catalog omits when the spec already selects it", () => {
    render(
      <RuntimeBar
        value={{ backend: "codex-cli", effort: "minimal" }}
        onChange={vi.fn()}
        models={MODELS}
        reasoningEfforts={["low", "high"]}
      />,
    );

    openSegment("Reasoning effort");
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Nonesingle pass", "Low", "High", "Minimalunsupported"]);
  });
});
