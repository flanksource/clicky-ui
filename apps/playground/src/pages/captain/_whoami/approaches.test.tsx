// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import WhoamiAlternatives from "../whoami";

describe("whoami capability topology", () => {
  afterEach(cleanup);

  it("selects and edits provider, runtime, and model nodes in one tree", () => {
    render(<WhoamiAlternatives />);

    expect(
      screen.getByRole("heading", { name: "Capability topology" }),
    ).toBeTruthy();
    expect(screen.queryByRole("radio")).toBeNull();
    expect(
      screen.getByRole("tree", { name: "Capability topology" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("heading", { name: "Resolved values" }),
    ).toBeTruthy();
    expect(screen.queryByText("Selected path")).toBeNull();
    const modelPicker = screen.getByRole("button", {
      name: "Run model GPT-5.6 Sol via OpenAI API",
    });
    expect(
      modelPicker.querySelector('[data-provider-icon="openai"]'),
    ).not.toBeNull();
    expect(
      modelPicker.querySelector('[data-agent-type-icon="api"]'),
    ).not.toBeNull();
    fireEvent.click(modelPicker);
    const pickerTree = screen.getByRole("tree", { name: "Run model" });
    fireEvent.click(within(pickerTree).getByText("GPT-5.6 Terra"));
    expect(
      screen.getByRole("button", {
        name: "Run model GPT-5.6 Terra via OpenAI API",
      }),
    ).toBeTruthy();
    expect(screen.getAllByRole("treeitem", { selected: true })).toHaveLength(1);

    fireEvent.click(
      screen.getByRole("button", {
        name: "OpenAI 4 runtimes · 27 models",
      }),
    );
    expect(screen.getAllByRole("treeitem", { selected: true })).toHaveLength(1);
    expect(
      screen.getByRole("treeitem", { selected: true }).textContent,
    ).toContain("OpenAI");

    fireEvent.click(screen.getByRole("button", { name: "API runtime Ready" }));
    expect(screen.getAllByRole("treeitem", { selected: true })).toHaveLength(1);
    fireEvent.click(
      screen.getByRole("button", {
        name: "GPT-5.6 Sol gpt-5.6-sol reasoning",
      }),
    );
    expect(screen.getAllByRole("treeitem", { selected: true })).toHaveLength(1);

    const provider = screen.getByRole("checkbox", {
      name: "Enable OpenAI provider",
    });
    expect(provider).toHaveProperty("checked", true);
    fireEvent.click(provider);
    expect(provider).toHaveProperty("checked", false);
    expect(screen.getByText("Excluded by provider policy")).toBeTruthy();

    const runtime = screen.getByRole("checkbox", {
      name: "Enable OpenAI API runtime",
    });
    fireEvent.click(runtime);
    expect(runtime).toHaveProperty("checked", false);

    const model = screen.getByRole("checkbox", {
      name: "Enable gpt-5.6-sol model",
    });
    fireEvent.click(model);
    expect(model).toHaveProperty("checked", false);

    fireEvent.click(
      screen.getByRole("button", { name: "Collapse OpenAI provider" }),
    );
    expect(
      screen.queryByRole("checkbox", { name: "Enable OpenAI API runtime" }),
    ).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Expand OpenAI provider" }),
    );
    expect(
      screen.getByRole("checkbox", { name: "Enable OpenAI API runtime" }),
    ).toBeTruthy();
  });
});
