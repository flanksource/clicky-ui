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
    runtime: { model: "sonnet" },
  },
  {
    id: "openai/gpt-5",
    provider: "openai",
    label: "GPT-5",
    reasoning: true,
    configured: true,
    runtime: { model: "gpt-5" },
  },
  {
    id: "openai/gpt-5-mini",
    provider: "openai",
    label: "GPT-5 mini",
    reasoning: false,
    configured: false,
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
          mode: "cli",
          model: "gpt-5",
          effort: "high",
        }}
        onChange={onChange}
        models={MODELS}
        locked
      />,
    );

    expect(screen.getByTitle("Runtime mode — CLI")).toBeDisabled();
    expect(screen.getByTitle("Model — gpt-5")).toBeDisabled();
    openSegment("Reasoning effort");
    fireEvent.click(screen.getByRole("menuitem", { name: "Low" }));
    expect(onChange).toHaveBeenCalledWith({
      mode: "cli",
      model: "gpt-5",
      effort: "low",
    });
  });

  it("renders separate mode and combined model controls in the combo layout", () => {
    render(
      <RuntimeBar
        variant="combo"
        value={{
          mode: "cli",
          model: "gpt-5",
          effort: "high",
        }}
        onChange={vi.fn()}
        models={MODELS}
      />,
    );

    const trigger = screen.getByTitle("Model — gpt-5");
    expect(trigger).toHaveTextContent("GPT-5");

    fireEvent.click(trigger);
    const menu = screen.getByRole("listbox");
    expect(menu).toHaveAttribute("aria-label", "Model");
    expect(within(menu).getByText("Claude")).toBeInTheDocument();
    expect(within(menu).getByText("Codex")).toBeInTheDocument();
    expect(screen.getByLabelText("Search Model")).toBeInTheDocument();
    const modelChoice = within(menu).getByRole("option", {
      name: /^GPT-5/,
    });
    expect(modelChoice).toBeInTheDocument();
    expect(modelChoice).toHaveTextContent(/^GPT-5$/);
    expect(screen.getByTitle("Reasoning effort")).toHaveTextContent("High");
  });

  it("bounds the combo model picker to the viewport", () => {
    render(
      <RuntimeBar
        variant="combo"
        value={{ mode: "cli" }}
        onChange={vi.fn()}
        models={MODELS}
      />,
    );

    openSegment("Model — unspecified");

    expect(screen.getByRole("listbox").parentElement).toHaveStyle({
      maxWidth: "400px",
      maxHeight: "256px",
    });
  });

  it("accepts an uncatalogued model id in the combo menu", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        variant="combo"
        value={{ mode: "api" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — unspecified");
    fireEvent.change(screen.getByLabelText("Search Model"), {
      target: { value: "gemini-3-pro" },
    });
    fireEvent.click(
      screen.getByRole("option", { name: "Use custom: gemini-3-pro" }),
    );

    expect(onChange).toHaveBeenLastCalledWith({
      mode: "api",
      model: "gemini-3-pro",
    });
  });

  it("renders an inherited mode without persisting it on unrelated edits", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        variant="combo"
        value={{ effort: "high" }}
        effectiveMode="cli"
        effectiveModel="gpt-5"
        onChange={onChange}
        models={MODELS}
      />,
    );

    expect(screen.getByTitle("Runtime mode — CLI")).toBeInTheDocument();
    openSegment("Reasoning effort");
    fireEvent.click(screen.getByRole("menuitem", { name: "Low" }));
    expect(onChange).toHaveBeenCalledWith({ effort: "low" });
  });

  it("keeps the combo model picker open while typing a custom model", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        variant="combo"
        value={{
          mode: "cli",
          model: "gpt-5",
          effort: "high",
        }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — gpt-5");
    const menu = screen.getByRole("listbox");
    expect(menu).toHaveAttribute("aria-label", "Model");
    fireEvent.change(screen.getByLabelText("Search Model"), {
      target: { value: "gpt-next" },
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(menu).toBeInTheDocument();
  });

  it("keeps the current mode when the new family supports it", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ mode: "cli", model: "sonnet" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — sonnet");
    fireEvent.mouseDown(screen.getByRole("option", { name: /^GPT-5/ }));

    expect(onChange).toHaveBeenCalledWith({
      mode: "cli",
      model: "gpt-5",
    });
  });

  it("selects a model from the new family when providers share a mode", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ mode: "agent", model: "sonnet" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — sonnet");
    fireEvent.mouseDown(screen.getByRole("option", { name: /^GPT-5/ }));

    expect(onChange).toHaveBeenCalledWith({
      mode: "agent",
      model: "gpt-5",
    });
  });

  it("replaces the catalog id alongside the model when changing family", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{
          mode: "agent",
          model: "sonnet",
          id: "anthropic/sonnet",
        }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — sonnet");
    fireEvent.mouseDown(screen.getByRole("option", { name: /^GPT-5/ }));

    expect(onChange).toHaveBeenCalledWith({
      mode: "agent",
      model: "gpt-5",
    });
  });

  it("drops the catalog id when a model is typed in directly", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{
          mode: "cli",
          model: "gpt-5",
          id: "openai/gpt-5",
        }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — gpt-5");
    fireEvent.change(screen.getByLabelText("Search Model"), {
      target: { value: "gpt-5.1" },
    });
    fireEvent.click(
      screen.getByRole("option", { name: "Use custom: gpt-5.1" }),
    );

    expect(onChange).toHaveBeenCalledWith({
      mode: "cli",
      model: "gpt-5.1",
    });
  });

  it("keeps a model the new mode can still run", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ mode: "cli", model: "gpt-5" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Runtime mode — CLI");
    fireEvent.click(screen.getByRole("menuitem", { name: /^cmux/ }));

    expect(onChange).toHaveBeenCalledWith({
      mode: "cmux",
      model: "gpt-5",
    });
  });

  it("omits modes the selected family does not provide", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ mode: "agent", model: "sonnet" }}
        onChange={onChange}
        models={MODELS}
        families={[
          {
            id: "claude",
            label: "Claude",
            provider: "anthropic",
            modes: [
              { id: "agent", label: "Agent", mode: "agent" },
              { id: "cli", label: "CLI", mode: "cli" },
            ],
          },
        ]}
      />,
    );

    openSegment("Runtime mode — Agent");
    expect(
      screen.queryByRole("menuitem", { name: /^API/ }),
    ).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps the model segment when the selected family has no catalog rows", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ mode: "api", model: "gemini-3-pro" }}
        onChange={onChange}
        models={MODELS}
        families={[
          {
            id: "gemini",
            label: "Gemini",
            provider: "googleai",
            modes: [{ id: "api", label: "API", mode: "api" }],
          },
        ]}
      />,
    );

    openSegment("Model — gemini-3-pro");
    expect(
      screen.getAllByRole("option").map((item) => item.textContent),
    ).toEqual(["-not sent — configuration decides", "Custom model…"]);

    fireEvent.change(screen.getByLabelText("Search Model"), {
      target: { value: "gemini-3-pro-preview" },
    });
    fireEvent.click(
      screen.getByRole("option", { name: "Use custom: gemini-3-pro-preview" }),
    );
    expect(onChange).toHaveBeenCalledWith({
      mode: "api",
      model: "gemini-3-pro-preview",
    });
  });

  it("lists selectable models across eligible families with the inherited model hint", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ mode: "cli" }}
        effectiveModel="gpt-5"
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — unspecified");
    expect(
      screen.getByRole("option", { name: /not sent — inherits GPT-5/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /^Sonnet/ })).toBeInTheDocument();
    expect(screen.queryByText("GPT-5 mini")).not.toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole("option", { name: /^GPT-5/ }));
    // Picking a model never invents a reasoning effort the user didn't choose.
    expect(onChange).toHaveBeenCalledWith({
      mode: "cli",
      model: "gpt-5",
    });
  });

  it("omits unavailable runtime modes instead of explaining them inline", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ mode: "agent", model: "sonnet" }}
        onChange={onChange}
        families={[
          {
            id: "claude",
            label: "Claude",
            provider: "anthropic",
            modes: [
              { id: "agent", label: "Agent", mode: "agent" },
              {
                id: "cmux",
                label: "cmux",
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

    openSegment("Runtime mode — Agent");
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
          mode: "cli",
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
    expect(screen.getByLabelText("Search Model")).toHaveValue("");
    expect(screen.queryByText("GPT-5 mini")).not.toBeInTheDocument();
  });

  it("does not let an unavailable API alias hide the selected CLI model", () => {
    render(
      <RuntimeBar
        value={{ mode: "cli", model: "gemini-3.6-flash" }}
        onChange={vi.fn()}
        families={[
          {
            id: "gemini",
            label: "Gemini",
            provider: "google",
            modes: [
              { id: "api", label: "API", provider: "google" },
              { id: "cli", label: "CLI", provider: "google" },
            ],
          },
        ]}
        models={[
          {
            id: "googleai/gemini-3.6-flash",
            provider: "google",
            label: "Gemini 3.6 Flash API",
            reasoning: true,
            configured: false,
            runtime: { model: "gemini-3.6-flash", mode: "api" },
          },
          {
            id: "gemini-3.6-flash",
            provider: "google",
            label: "Gemini 3.6 Flash",
            reasoning: true,
            configured: true,
            runtime: { model: "gemini-3.6-flash", mode: "cli" },
          },
        ]}
      />,
    );

    const bar = screen.getByRole("group", { name: "Runtime" });
    expect(within(bar).getByText("Gemini 3.6 Flash")).toBeInTheDocument();
    expect(
      within(bar).queryByText("Unavailable selection"),
    ).not.toBeInTheDocument();
  });

  it("omits unavailable models from the combo picker", () => {
    render(
      <RuntimeBar
        variant="combo"
        value={{ mode: "cli" }}
        effectiveModel="gpt-5"
        onChange={vi.fn()}
        models={MODELS}
      />,
    );

    openSegment("Model — unspecified");

    expect(screen.getByRole("option", { name: /^GPT-5/ })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: /^GPT-5 mini/ }),
    ).not.toBeInTheDocument();
  });

  it("selects the catalog's canonical Captain runtime value", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ mode: "api" }}
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
              mode: "api",
            },
          },
        ]}
      />,
    );

    openSegment("Model — unspecified");
    fireEvent.mouseDown(screen.getByRole("option", { name: /^Sonnet 4.6/ }));

    expect(onChange).toHaveBeenCalledWith({
      model: "claude-sonnet-4-6",
      id: "anthropic/claude-sonnet-4-6",
      mode: "api",
    });
  });

  it("keeps the selected mode when one provider model serves several modes", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ mode: "cli" }}
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
                provider: "anthropic",
              },
              {
                id: "cli",
                label: "CLI",
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
            runtime: {
              model: "claude-opus-5",
            },
          },
        ]}
      />,
    );

    openSegment("Model — unspecified");
    fireEvent.mouseDown(screen.getByRole("option", { name: /^Opus 5/ }));

    expect(onChange).toHaveBeenCalledWith({
      model: "claude-opus-5",
      mode: "cli",
    });
  });

  it("clears the model through the Unspecified entry", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ mode: "cli", model: "gpt-5" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Model — gpt-5");
    fireEvent.mouseDown(screen.getByRole("option", { name: /^-\s*not sent/ }));

    expect(onChange).toHaveBeenCalledWith({ mode: "cli" });
  });

  it("clears the effort through the Unspecified entry", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ mode: "cli", model: "gpt-5", effort: "high" }}
        onChange={onChange}
        models={MODELS}
      />,
    );

    openSegment("Reasoning effort");
    fireEvent.click(screen.getByRole("menuitem", { name: /^-\s*not sent/ }));

    expect(onChange).toHaveBeenCalledWith({ mode: "cli", model: "gpt-5" });
  });

  it("offers a tier the catalog omits when the spec already selects it", () => {
    render(
      <RuntimeBar
        value={{ mode: "cli", model: "gpt-5", effort: "minimal" }}
        onChange={vi.fn()}
        models={MODELS}
        reasoningEfforts={["low", "high"]}
      />,
    );

    openSegment("Reasoning effort");
    expect(
      screen.getAllByRole("menuitem").map((item) => item.textContent),
    ).toEqual([
      "-not sent — configuration decides",
      "Low",
      "High",
      "Minimalunsupported",
    ]);
  });
});
