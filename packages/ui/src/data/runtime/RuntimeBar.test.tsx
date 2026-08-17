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
          backend: "codex-cli",
          model: "codex-cli/gpt-5",
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
      backend: "codex-cli",
      model: "codex-cli/gpt-5",
      effort: "low",
    });
  });

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

  it("drops the catalog id alongside the model the new family cannot run", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{
          backend: "claude-agent",
          model: "claude-agent/sonnet",
          id: "claude-agent/sonnet",
        }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Family — Claude");
    fireEvent.click(screen.getByRole("menuitem", { name: /^Codex/ }));

    expect(onChange).toHaveBeenCalledWith({ backend: "codex-agent" });
  });

  it("drops the catalog id when a model is typed in directly", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{
          backend: "codex-cli",
          model: "codex-cli/gpt-5",
          id: "codex-cli/gpt-5",
        }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — codex-cli/gpt-5");
    fireEvent.change(screen.getByLabelText("Model id"), {
      target: { value: "gpt-5.1" },
    });

    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-cli",
      model: "gpt-5.1",
    });
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

  it("omits modes the selected family does not provide", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "claude-agent" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Claude Agent SDK");
    expect(
      screen.queryByRole("menuitem", { name: /^API/ }),
    ).not.toBeInTheDocument();
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

  it("lists only selectable models for the selected family", () => {
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
    ]);
    expect(screen.queryByText("GPT-5 mini")).not.toBeInTheDocument();

    fireEvent.click(items[1]!);
    // A reasoning model with unknown capabilities defaults to medium effort.
    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-cli",
      model: "codex-cli/gpt-5",
      effort: "medium",
    });
  });

  it("omits unavailable runtime modes instead of explaining them inline", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "claude-agent" }}
        onChange={onChange}
        families={[
          {
            id: "claude",
            label: "Claude",
            provider: "anthropic",
            modes: [
              { id: "agent", label: "Agent", backend: "claude-agent" },
              {
                id: "cmux",
                label: "cmux",
                backend: "claude-cmux",
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
          backend: "codex-cli",
          model: "codex-cli/gpt-5-mini",
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
        value={{ backend: "codex-cli" }}
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

  it("keeps the selected mode when one menu row serves several backends", () => {
    // The served catalog lists claude-cli and claude-cmux models as claude-agent
    // rows, so the row's own backend must not replace the mode the user picked.
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ backend: "claude-cli" }}
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
                backend: "claude-agent",
                provider: "claude-agent",
              },
              {
                id: "cli",
                label: "CLI",
                backend: "claude-cli",
                provider: "claude-agent",
              },
            ],
          },
        ]}
        models={[
          {
            id: "claude-opus-5",
            provider: "claude-agent",
            label: "Opus 5",
            reasoning: true,
            configured: true,
            runtime: {
              model: "claude-opus-5",
              backend: "claude-agent",
              mode: "agent",
            },
          },
        ]}
      />,
    );

    openSegment("Model — prompt default");
    fireEvent.click(screen.getByRole("menuitem", { name: /^Opus 5/ }));

    expect(onChange).toHaveBeenCalledWith({
      model: "claude-opus-5",
      backend: "claude-cli",
      mode: "cli",
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
