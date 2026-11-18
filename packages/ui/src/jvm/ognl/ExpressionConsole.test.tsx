import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CLASS_LOADERS } from "../fixtures/classes";
import { BUILT_IN_EXPRESSION_PRESETS, type ExpressionPreset } from "../model/expressions";
import { ExpressionConsole, type ExpressionConsoleProps } from "./ExpressionConsole";

const GROOVY_PRESET: ExpressionPreset = { label: "Hello", expression: 'println "hello"', language: "groovy" };

function renderConsole(overrides: Partial<ExpressionConsoleProps> = {}) {
  const props: ExpressionConsoleProps = {
    language: "ognl",
    onLanguageChange: vi.fn(),
    expression: "@java.lang.System@getProperties()",
    onExpressionChange: vi.fn(),
    presets: [...BUILT_IN_EXPRESSION_PRESETS, GROOVY_PRESET],
    history: ["#root.size()", "@java.lang.Runtime@getRuntime()"],
    onHistoryChange: vi.fn(),
    canRun: true,
    running: false,
    onRun: vi.fn(),
    ...overrides,
  };
  render(<ExpressionConsole {...props} />);
  return props;
}

describe("ExpressionConsole", () => {
  it("lists only the presets of the current language and loads one into the editor", () => {
    const props = renderConsole();
    const presets = screen.getByRole("region", { name: "Presets" });
    expect(within(presets).getAllByRole("button").map((button) => button.textContent)).toEqual([
      "System properties@java.lang.System@getProperties()",
      "Runtime@java.lang.Runtime@getRuntime()",
      "Threads@java.lang.Thread@getAllStackTraces().keySet()",
    ]);
    fireEvent.click(within(presets).getByRole("button", { name: /^Runtime/ }));
    expect(props.onExpressionChange).toHaveBeenCalledWith("@java.lang.Runtime@getRuntime()");
  });

  it("shows host presets for Groovy and not the OGNL built-ins", () => {
    renderConsole({ language: "groovy", expression: "" });
    const presets = screen.getByRole("region", { name: "Presets" });
    expect(within(presets).getAllByRole("button")).toHaveLength(1);
    expect(within(presets).getByRole("button", { name: /^Hello/ })).toBeInTheDocument();
  });

  it("recalls a history entry and clears the history", () => {
    const props = renderConsole();
    const history = screen.getByRole("region", { name: "History" });
    fireEvent.click(within(history).getByRole("button", { name: "#root.size()" }));
    expect(props.onExpressionChange).toHaveBeenCalledWith("#root.size()");
    fireEvent.click(within(history).getByRole("button", { name: "Clear history" }));
    expect(props.onHistoryChange).toHaveBeenCalledWith([]);
  });

  it("hides the history section when there is no history", () => {
    renderConsole({ history: [] });
    expect(screen.queryByRole("region", { name: "History" })).toBeNull();
  });

  it("edits the expression and switches language", () => {
    const props = renderConsole();
    fireEvent.change(screen.getByRole("textbox", { name: "OGNL expression" }), { target: { value: "#a" } });
    expect(props.onExpressionChange).toHaveBeenCalledWith("#a");
    fireEvent.click(screen.getByRole("radio", { name: "Groovy" }));
    expect(props.onLanguageChange).toHaveBeenCalledWith("groovy");
  });

  it("runs from the button and from Ctrl+Enter", () => {
    const props = renderConsole();
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    fireEvent.keyDown(screen.getByRole("textbox", { name: "OGNL expression" }), { key: "Enter", ctrlKey: true });
    expect(props.onRun).toHaveBeenCalledTimes(2);
  });

  it.each([
    ["blank", { expression: "  " }],
    ["not permitted", { canRun: false }],
    ["already running", { running: true }],
  ])("does not run while the expression is %s", (_name, overrides) => {
    const props = renderConsole(overrides);
    expect(screen.getByRole("button", { name: "Run" })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("textbox", { name: "OGNL expression" }), { key: "Enter", metaKey: true });
    expect(props.onRun).not.toHaveBeenCalled();
  });

  it("keeps the draft editable while running is not permitted and renders the host's gate beside Run", () => {
    renderConsole({ canRun: false, toolbar: <span>gate here</span> });
    expect(screen.getByRole("textbox", { name: "OGNL expression" })).toBeEnabled();
    expect(screen.getByText("gate here")).toBeInTheDocument();
  });

  it("offers real class loaders only when the host supplies them, and reports the choice", () => {
    const onLoaderChange = vi.fn();
    renderConsole({ loaders: { options: CLASS_LOADERS, value: "", onChange: onLoaderChange } });
    const select = screen.getByRole("combobox", { name: "Class loader" });
    expect(within(select).getAllByRole("option").map((option) => option.textContent)).toEqual(["Default loader", "Order application", "Platform", "Bootstrap"]);
    fireEvent.change(select, { target: { value: CLASS_LOADERS[0]!.hash } });
    expect(onLoaderChange).toHaveBeenCalledWith(CLASS_LOADERS[0]!.hash);
  });

  it("omits virtual class loaders, which cannot be targeted", () => {
    renderConsole({ loaders: { options: [{ ...CLASS_LOADERS[0]!, label: "All loaders", virtual: true }, CLASS_LOADERS[1]!], value: "", onChange: vi.fn() } });
    expect(screen.queryByRole("option", { name: "All loaders" })).toBeNull();
  });

  it("has no loader select without loaders", () => {
    renderConsole();
    expect(screen.queryByRole("combobox", { name: "Class loader" })).toBeNull();
  });

  it("loads a .groovy file into the editor, for Groovy only", async () => {
    const props = renderConsole({ language: "groovy", expression: "" });
    const file = new File(["println 1 + 1"], "script.groovy", { type: "text/plain" });
    fireEvent.change(screen.getByLabelText("Load Groovy file"), { target: { files: [file] } });
    await waitFor(() => expect(props.onExpressionChange).toHaveBeenCalledWith("println 1 + 1"));
  });

  it("offers no file loader for OGNL", () => {
    renderConsole();
    expect(screen.queryByLabelText("Load Groovy file")).toBeNull();
  });
});
