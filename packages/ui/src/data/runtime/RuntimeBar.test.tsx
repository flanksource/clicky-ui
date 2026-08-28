import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChatModel } from "../chat/types";
import { RuntimeBar } from "./RuntimeBar";

const MODELS: ChatModel[] = [
  {
    id: "anthropic/sonnet",
    provider: "anthropic",
    label: "Sonnet",
    reasoning: true,
    configured: true,
    backends: ["api", "agent", "cli", "cmux"],
    runtime: { model: "sonnet" },
  },
  {
    id: "openai/gpt-5",
    provider: "openai",
    label: "GPT-5",
    reasoning: true,
    configured: true,
    backends: ["api", "agent", "cli", "cmux"],
    runtime: { model: "gpt-5" },
  },
  {
    id: "openai/gpt-5-mini",
    provider: "openai",
    label: "GPT-5 mini",
    reasoning: false,
    configured: false,
    backends: ["api", "agent", "cli", "cmux"],
    runtime: { model: "gpt-5-mini" },
    availability: {
      state: "missing_executable",
      reason: "`codex` was not found on PATH.",
      remediation: "Install Codex CLI or add it to PATH, then refresh.",
    },
  },
];

function openSegment(title: string) {
  fireEvent.click(within(screen.getByRole("group")).getByTitle(title));
}

describe("RuntimeBar", () => {
  it("locks model identity while keeping reasoning effort editable", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        variant="combo"
        value={{
          backend: "cli",
          model: "gpt-5",
          effort: "high",
        }}
        onChange={onChange}
        models={MODELS}
        locked
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /Model and backend are locked for this conversation/,
      }),
    );
    expect(
      screen.getByText(/Fork this conversation to change them/),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Claude" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "GPT-5" })).toBeDisabled();
    const effort = screen.getByRole("slider", { name: "Reasoning effort" });
    expect(effort).not.toBeDisabled();
    fireEvent.change(effort, { target: { value: "1" } });
    expect(onChange).toHaveBeenCalledWith({
      backend: "cli",
      model: "gpt-5",
      effort: "low",
    });
  });

  it("renders the combo summary and direct runtime controls", () => {
    render(
      <RuntimeBar
        variant="combo"
        value={{
          backend: "cli",
          model: "gpt-5",
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
    expect(modelChoice).toHaveAttribute("title", "openai/gpt-5");
    expect(modelChoice).not.toHaveTextContent("openai/gpt-5");
    expect(
      within(menu).getByRole("slider", { name: "Reasoning effort" }),
    ).toHaveAttribute("aria-valuetext", "High");
  });

  it("renders an inherited backend without persisting it on unrelated edits", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        variant="combo"
        value={{ effort: "high" }}
        effectiveBackend="cli"
        effectiveModel="gpt-5"
        onChange={onChange}
        models={MODELS}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Runtime: Codex, CLI, Prompt default, effort High",
      }),
    );
    expect(screen.getByRole("radio", { name: "Codex" })).toBeChecked();
    fireEvent.change(screen.getByRole("slider", { name: "Reasoning effort" }), {
      target: { value: "1" },
    });
    expect(onChange).toHaveBeenCalledWith({ effort: "low" });
  });

  it("updates combo fields without closing the runtime menu", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        variant="combo"
        value={{
          backend: "cli",
          model: "gpt-5",
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
      mode: "cli",
      effort: "high",
    });
    expect(menu).toBeInTheDocument();

    fireEvent.click(within(menu).getByRole("radio", { name: "cmux" }));
    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-cmux",
      mode: "cmux",
      model: "codex-cli/gpt-5",
      effort: "high",
    });
    expect(menu).toBeInTheDocument();

    fireEvent.change(
      within(menu).getByRole("slider", { name: "Reasoning effort" }),
      { target: { value: "1" } },
    );
    expect(onChange).toHaveBeenCalledWith({
      backend: "cli",
      model: "gpt-5",
      effort: "low",
    });
    expect(menu).toBeInTheDocument();
  });

  it("keeps the current mode when the new family supports it", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "cli", model: "sonnet" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Family — Claude");
    fireEvent.click(screen.getByRole("menuitem", { name: /^Codex/ }));

    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-cli",
      mode: "cli",
    });
  });

  it("selects a model from the new family when providers share a backend", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "agent", model: "sonnet" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Family — Claude");
    fireEvent.click(screen.getByRole("menuitem", { name: /^Codex/ }));

    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-agent",
      mode: "agent",
    });
  });

  it("replaces the catalog id alongside the model when changing family", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{
          backend: "agent",
          model: "sonnet",
          id: "anthropic/sonnet",
        }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Family — Claude");
    fireEvent.click(screen.getByRole("menuitem", { name: /^Codex/ }));

    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-agent",
      mode: "agent",
    });
  });

  it("drops the catalog id when a model is typed in directly", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{
          backend: "cli",
          model: "gpt-5",
          id: "openai/gpt-5",
        }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — gpt-5");
    fireEvent.change(screen.getByLabelText("Model id"), {
      target: { value: "gpt-5.1" },
    });

    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-cli",
      mode: "cli",
      model: "gpt-5.1",
    });
  });

  it("keeps a model the new mode can still run", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "cli", model: "gpt-5" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Codex CLI");
    fireEvent.click(screen.getByRole("menuitem", { name: /^cmux/ }));

    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-cmux",
      mode: "cmux",
      model: "codex-cli/gpt-5",
      effort: "medium",
    });
  });

  it("omits modes the selected family does not provide", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "agent", model: "sonnet" }}
        onChange={onChange}
        models={MODELS}
        families={[
          {
            id: "claude",
            label: "Claude",
            provider: "anthropic",
            modes: [
              { id: "agent", label: "Agent", backend: "agent" },
              { id: "cli", label: "CLI", backend: "cli" },
            ],
          },
        ]}
      />,
    );

    openSegment("Runtime mode");
    expect(
      screen.queryByRole("menuitem", { name: /^API/ }),
    ).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps the model segment when the selected family has no catalog rows", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "api", model: "gemini-3-pro" }}
        onChange={onChange}
        models={MODELS}
        families={[
          {
            id: "gemini",
            label: "Gemini",
            provider: "googleai",
            modes: [{ id: "api", label: "API", backend: "api" }],
          },
        ]}
      />,
    );

    openSegment("Model — gemini-3-pro");
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual(["Prompt defaultno override"]);

    fireEvent.change(screen.getByLabelText("Model id"), {
      target: { value: "gemini-3-pro-preview" },
    });
    expect(onChange).toHaveBeenCalledWith({
      backend: "gemini",
      mode: "api",
      model: "gemini-3-pro",
    });
  });

  it("lists only selectable models for the selected family", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "cli" }}
        effectiveModel="gpt-5"
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — prompt default");
    const items = screen.getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual([
      "Prompt defaultno override",
      "GPT-5openai/gpt-5",
    ]);
    expect(screen.queryByText("GPT-5 mini")).not.toBeInTheDocument();

    fireEvent.click(items[1]!);
    // A reasoning model with unknown capabilities defaults to medium effort.
    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-cli",
      mode: "cli",
      model: "codex-cli/gpt-5",
      effort: "medium",
    });
  });

  it("omits unavailable runtime modes instead of explaining them inline", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "agent", model: "sonnet" }}
        onChange={onChange}
        families={[
          {
            id: "claude",
            label: "Claude",
            provider: "anthropic",
            modes: [
              { id: "agent", label: "Agent", backend: "agent" },
              {
                id: "cmux",
                label: "cmux",
                backend: "cmux",
                availability: {
                  state: "disabled",
                  reason: "Disabled by mode cmux in Captain configuration.",
                  remediation:
                    "Enable mode cmux on the Whoami page, then refresh.",
                },
              },
            ],
          },
        ]}
      />,
    );

    openSegment("Runtime mode");
    expect(
      screen.queryByRole("menuitem", { name: /cmux/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Disabled by mode cmux/)).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("hides a saved unavailable model behind a generic invalid selection", () => {
    render(
      <RuntimeBar
        value={{
          backend: "cli",
          model: "gpt-5-mini",
        }}
        onChange={vi.fn()}
        models={MODELS}
      />,
    );

    const bar = screen.getByRole("group", { name: "Runtime" });
    expect(within(bar).getByText("Unavailable selection")).toBeInTheDocument();
    expect(within(bar).queryByText("GPT-5 mini")).not.toBeInTheDocument();

    openSegment("Model — unavailable selection");
    expect(screen.getByLabelText("Model id")).toHaveValue("");
    expect(screen.queryByText("GPT-5 mini")).not.toBeInTheDocument();
  });

  it("omits unavailable models from the combo picker", () => {
    render(
      <RuntimeBar
        variant="combo"
        value={{ backend: "cli" }}
        effectiveModel="gpt-5"
        onChange={vi.fn()}
        models={MODELS}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Runtime: Codex, CLI, Prompt default, effort None",
      }),
    );

    expect(screen.getByRole("button", { name: "GPT-5" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "GPT-5 mini" }),
    ).not.toBeInTheDocument();
  });

  it("selects the catalog's canonical Captain runtime value", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "api" }}
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
              backend: "api",
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
      mode: "api",
      effort: "medium",
    });
  });

  it("keeps the selected mode when one provider model serves several backends", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "cli" }}
        onChange={onChange}
        families={[
          {
            id: "claude",
            label: "Claude",
            provider: "anthropic",
            modes: [
              {
                id: "agent",
                label: "Agent",
                backend: "agent",
                provider: "anthropic",
              },
              {
                id: "cli",
                label: "CLI",
                backend: "cli",
                provider: "anthropic",
              },
            ],
          },
        ]}
        models={[
          {
            id: "claude-opus-5",
            provider: "anthropic",
            label: "Opus 5",
            reasoning: true,
            configured: true,
            backends: ["agent", "cli"],
            runtime: {
              model: "claude-opus-5",
            },
          },
        ]}
      />,
    );

    openSegment("Model — prompt default");
    fireEvent.click(screen.getByRole("menuitem", { name: /^Opus 5/ }));

    expect(onChange).toHaveBeenCalledWith({
      model: "claude-opus-5",
      backend: "cli",
      effort: "medium",
    });
  });

  it("clears the model through the prompt-default entry", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "cli", model: "gpt-5" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — gpt-5");
    fireEvent.click(screen.getByRole("menuitem", { name: /^Prompt default/ }));

    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-cli",
      mode: "cli",
    });
  });

  it("clears the effort through the None entry", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "cli", model: "gpt-5", effort: "high" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Reasoning effort");
    fireEvent.click(screen.getByRole("menuitem", { name: /^None/ }));

    expect(onChange).toHaveBeenCalledWith({ backend: "cli", model: "gpt-5" });
  });

  it("offers a tier the catalog omits when the spec already selects it", () => {
    render(
      <RuntimeBar
        value={{ backend: "cli", model: "gpt-5", effort: "minimal" }}
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
