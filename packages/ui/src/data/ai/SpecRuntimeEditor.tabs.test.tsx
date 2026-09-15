import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type { SpecRuntimeFamily } from "../runtime/runtime-mode";
import { SpecRuntimeEditor, type SpecRuntimeEditorProps } from "./SpecRuntimeEditor";
import type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";
import { SPEC_RUNTIME_TABS, type SpecRuntimeTab } from "./SpecRuntimeEditor/types";

// The agent mode publishes no permission, sandbox, or CLI fields, so those
// sections filter out and the tab strip has to follow.
const FAMILIES: SpecRuntimeFamily[] = [
  {
    id: "claude",
    label: "Claude",
    provider: "anthropic",
    modes: [
      {
        id: "agent",
        label: "Agent",
        schema: {
          type: "object",
          properties: {
            model: { type: "string" },
            effort: { type: "string" },
            prompt: {
              type: "object",
              properties: {
                system: { type: "string" },
                appendSystem: { type: "string" },
              },
            },
            setup: { type: "object", properties: { cwd: { type: "string" } } },
          },
        },
      },
    ],
  },
];

const VALUE: AISpecRuntimeValue = {
  mode: "agent",
  prompt: { user: "Review the diff" },
  budget: { maxTokens: 4000 },
};

function Harness({
  initial,
  ...props
}: { initial: AISpecRuntimeValue } & Omit<SpecRuntimeEditorProps, "value" | "onChange">) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <SpecRuntimeEditor value={value} onChange={setValue} {...props} />
      <output data-testid="value-json">{JSON.stringify(value)}</output>
    </>
  );
}

function currentValue(): AISpecRuntimeValue {
  return JSON.parse(screen.getByTestId("value-json").textContent ?? "{}");
}

function tabLabels() {
  return screen.getAllByRole("tab").map((tab) => tab.textContent);
}

describe("SpecRuntimeEditor tabs", () => {
  it("hides tabs whose sections the runtime filters out and renders only the active tab's sections", () => {
    render(
      <SpecRuntimeEditor
        value={VALUE}
        onChange={vi.fn()}
        families={FAMILIES}
        tabs={SPEC_RUNTIME_TABS}
      />,
    );

    expect(tabLabels()).toEqual(["System Prompt", "Environment", "Model", "Workflow"]);
    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("System Prompt");
    expect(screen.getByRole("region", { name: "Prompt" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Model" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Environment" }));

    expect(screen.getByRole("region", { name: "Workspace" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Environment" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Sandbox" })).not.toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "Prompt" })).not.toBeInTheDocument();
  });

  it("falls back to the first visible tab when the requested tab is filtered out", () => {
    render(
      <SpecRuntimeEditor
        value={VALUE}
        onChange={vi.fn()}
        families={FAMILIES}
        tabs={SPEC_RUNTIME_TABS}
        activeTab="permissions"
      />,
    );

    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent("System Prompt");
    expect(screen.getByRole("region", { name: "Prompt" })).toBeInTheDocument();
  });

  it("renders host-owned content tabs and reports tab changes", () => {
    const onActiveTabChange = vi.fn();
    const hostTab: SpecRuntimeTab = {
      id: "request",
      label: "Request",
      content: <pre>request payload</pre>,
    };
    render(
      <SpecRuntimeEditor
        value={VALUE}
        onChange={vi.fn()}
        families={FAMILIES}
        tabs={[hostTab, ...SPEC_RUNTIME_TABS]}
        onActiveTabChange={onActiveTabChange}
      />,
    );

    expect(screen.getByText("request payload")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Model" }));

    expect(onActiveTabChange).toHaveBeenCalledWith("model");
    expect(screen.queryByText("request payload")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Model" })).toBeInTheDocument();
  });

  it.each([
    {
      name: "tabs combined with sections",
      props: { tabs: SPEC_RUNTIME_TABS, sections: ["model"] as const },
      error: "pass either sections or tabs",
    },
    {
      name: "a tab with neither sections nor content",
      props: { tabs: [{ id: "empty", label: "Empty" }] },
      error: 'tab "empty" needs exactly one of sections or content',
    },
    {
      name: "a tab with both sections and content",
      props: { tabs: [{ id: "both", label: "Both", sections: ["model"] as const, content: "x" }] },
      error: 'tab "both" needs exactly one of sections or content',
    },
    {
      name: "duplicate tab ids",
      props: { tabs: [...SPEC_RUNTIME_TABS, { id: "model", label: "Again", content: "x" }] },
      error: 'duplicate tab id "model"',
    },
  ])("rejects $name", ({ props, error }) => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(<SpecRuntimeEditor value={VALUE} onChange={vi.fn()} families={FAMILIES} {...props} />),
    ).toThrow(error);
  });

  it("edits system prompt fields without offering the user override in the system variant", () => {
    render(
      <Harness
        initial={VALUE}
        families={FAMILIES}
        tabs={SPEC_RUNTIME_TABS}
        promptVariant="system"
      />,
    );

    expect(screen.queryByLabelText("User override")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("System"), {
      target: { value: "You are a careful reviewer" },
    });

    expect(currentValue()).toEqual({
      ...VALUE,
      prompt: { user: "Review the diff", system: "You are a careful reviewer" },
    });
  });

  it("omits the model fields the host renders beside the editor", () => {
    render(
      <SpecRuntimeEditor
        value={VALUE}
        onChange={vi.fn()}
        families={FAMILIES}
        tabs={SPEC_RUNTIME_TABS}
        activeTab="model"
        hostFields={["runtime", "budget.timeout"]}
      />,
    );

    const model = screen.getByRole("region", { name: "Model" });
    expect(model).toHaveTextContent("Max tokens");
    expect(screen.queryByText("Timeout")).not.toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Runtime" })).not.toBeInTheDocument();
  });
});
