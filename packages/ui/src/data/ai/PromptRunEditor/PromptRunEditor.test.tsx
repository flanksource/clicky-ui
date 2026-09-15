import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { PromptRunEditor, type PromptRunEditorProps } from ".";
import type { RuntimePreset } from "../runtime-profile";
import { SPEC_RUNTIME_TABS } from "../SpecRuntimeEditor/types";
import type { AIPromptRunValue } from "./model";

const PRESETS: RuntimePreset[] = [
  {
    id: "defaults",
    name: "Defaults",
    scope: "global",
    spec: { model: "anthropic/claude-sonnet-5", mode: "cli" },
  },
  {
    id: "guardrails",
    name: "Guardrails",
    scope: "surface",
    spec: { permissions: { mode: "plan" } },
  },
];

function Harness({
  initial,
  ...props
}: { initial: AIPromptRunValue } & Omit<
  PromptRunEditorProps,
  "value" | "onChange"
>) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <PromptRunEditor value={value} onChange={setValue} {...props} />
      <output data-testid="value-json">{JSON.stringify(value)}</output>
    </>
  );
}

function currentValue(): AIPromptRunValue {
  return JSON.parse(screen.getByTestId("value-json").textContent ?? "{}");
}

const VALUE: AIPromptRunValue = {
  variables: { company: "Acme" },
  spec: {
    model: "claude-sonnet-4-6",
    id: "anthropic/claude-sonnet-4-6",
    mode: "api",
    prompt: { user: "Review {{company}}", system: "Be precise" },
    messages: [
      { role: "user", parts: [{ type: "text", text: "preserve me" }] },
    ],
  },
  chat: true,
};

describe("PromptRunEditor", () => {
  it.each([
    { spec: {}, family: "Preset runtime", mode: "cmux" },
    {
      spec: { model: "operator-model", mode: "api" },
      family: "Explicit runtime",
      mode: "API",
    },
  ])(
    "uses resolved preset identity for display while preserving $spec overrides",
    ({ spec, family, mode }) => {
      const initial = { presets: ["defaults"], spec };
      render(
        <Harness
          initial={initial}
          models={[
            {
              id: "preset-model",
              provider: "anthropic",
              label: "Preset model",
              reasoning: true,
            },
            {
              id: "operator-model",
              provider: "openai",
              label: "Operator model",
              reasoning: true,
            },
          ]}
          families={[
            {
              id: "explicit",
              label: "Explicit runtime",
              provider: "openai",
              modes: [{ id: "api", label: "API" }],
            },
            {
              id: "preset",
              label: "Preset runtime",
              provider: "anthropic",
              modes: [{ id: "cmux", label: "cmux" }],
            },
          ]}
          resolution={{
            spec: { model: "preset-model", mode: "cmux" },
            constraints: {},
            trace: [],
          }}
        />,
      );
      const runtime = within(
        screen.getByRole("group", { name: "Runtime 1 controls" }),
      );
      expect(runtime.getByTitle(`Family — ${family}`)).toBeInTheDocument();
      expect(runtime.getByText(mode)).toBeInTheDocument();
      expect(currentValue()).toEqual(initial);
    },
  );

  it("edits the canonical prompt run request without dropping untouched spec fields", () => {
    const onChange = vi.fn();
    render(<PromptRunEditor value={VALUE} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText("User prompt"), {
      target: { value: "Reconcile {{company}}" },
    });

    expect(onChange).toHaveBeenLastCalledWith({
      ...VALUE,
      spec: {
        ...VALUE.spec,
        prompt: {
          ...VALUE.spec?.prompt,
          user: "Reconcile {{company}}",
        },
      },
    });
  });

  it("switches between single and multi-model runs from the mode control", () => {
    render(<Harness initial={VALUE} />);

    expect(screen.getByRole("radio", { name: "Single model" })).toBeChecked();
    expect(
      screen.queryByRole("button", { name: "Add runtime" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Multi-model" }));

    expect(currentValue()).toEqual({
      ...VALUE,
      runtimes: [
        {
          model: "claude-sonnet-4-6",
          id: "anthropic/claude-sonnet-4-6",
          mode: "api",
        },
        { mode: "api" },
      ],
    });
    expect(
      screen.queryByRole("button", { name: /Remove runtime/ }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add runtime" }));

    expect(currentValue().runtimes).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Remove runtime 3" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Single model" }));

    expect(currentValue()).toEqual(VALUE);
  });

  it("edits the shared timeout from the single-model runtime bar only", () => {
    render(<Harness initial={VALUE} />);

    fireEvent.click(
      within(
        screen.getByRole("group", { name: "Runtime 1 controls" }),
      ).getByTitle("Timeout — no limit"),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: /^1h/ }));

    expect(currentValue()).toEqual({
      ...VALUE,
      spec: { ...VALUE.spec, budget: { timeout: "1h" } },
    });

    fireEvent.click(screen.getByRole("radio", { name: "Multi-model" }));

    expect(screen.queryByTitle(/^Timeout/)).not.toBeInTheDocument();
  });

  it("renders no profile picker or recent runtimes unless the host supplies them", () => {
    render(
      <PromptRunEditor value={VALUE} onChange={vi.fn()} recentRuntimes={[]} />,
    );

    expect(
      screen.queryByRole("combobox", { name: "Runtime profile" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("list", { name: "Recently used runtimes" }),
    ).not.toBeInTheDocument();
  });

  describe("recently used runtimes", () => {
    const RECENT = [
      { model: "openai/gpt-5.5", mode: "agent", effort: "high" },
      {
        model: "claude-sonnet-4-6",
        id: "anthropic/claude-sonnet-4-6",
        mode: "api",
      },
    ];
    const MODELS = [
      {
        id: "openai/gpt-5.5",
        provider: "openai",
        label: "GPT-5.5",
        reasoning: true,
      },
    ];
    const INITIAL: AIPromptRunValue = {
      ...VALUE,
      spec: { ...VALUE.spec, budget: { timeout: "30m" } },
    };
    const recentChips = () =>
      within(
        screen.getByRole("list", { name: "Recently used runtimes" }),
      ).getAllByRole("button");

    it("lists them under the runtime bar and applies one to the single runtime, keeping its limits", () => {
      render(
        <Harness initial={INITIAL} models={MODELS} recentRuntimes={RECENT} />,
      );

      expect(recentChips().map((chip) => chip.textContent)).toEqual([
        "GPT-5.5·Codex Agent·High",
        "claude-sonnet-4-6·Claude API",
      ]);

      fireEvent.click(recentChips()[0]!);

      const { model: _model, id: _id, mode: _mode, ...rest } = INITIAL.spec!;
      expect(currentValue()).toEqual({
        ...INITIAL,
        spec: { ...rest, ...RECENT[0] },
      });
    });

    it("adds one as another comparison row in multi-model mode", () => {
      render(
        <Harness initial={INITIAL} models={MODELS} recentRuntimes={RECENT} />,
      );

      fireEvent.click(screen.getByRole("radio", { name: "Multi-model" }));
      fireEvent.click(recentChips()[0]!);

      expect(currentValue().runtimes).toEqual([
        {
          model: "claude-sonnet-4-6",
          id: "anthropic/claude-sonnet-4-6",
          mode: "api",
        },
        { mode: "api" },
        RECENT[0],
      ]);
    });
  });

  it("adds a host-defined verification fence through the runtime spec modal", () => {
    const initial: AIPromptRunValue = {
      ...VALUE,
      spec: {
        ...VALUE.spec,
        workflow: {
          verify: { fixture: "# Verification\n", commands: ["check-policy"] },
        },
      },
    };
    render(
      <Harness
        initial={initial}
        specSections={["verify"]}
        fixtureSchemas={{
          "yaml contract": {
            type: "object",
            properties: { policy: { type: "string" } },
          },
        }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Edit spec" }));
    fireEvent.click(screen.getByText("Add fence"));
    fireEvent.click(screen.getByRole("menuitem", { name: "yaml contract" }));

    expect(currentValue()).toEqual({
      ...initial,
      spec: {
        ...initial.spec,
        workflow: {
          verify: {
            fixture: "# Verification\n```yaml contract\n{}\n```\n",
            commands: ["check-policy"],
          },
        },
      },
    });
  });

  it("selects and orders presets directly on the prompt run", () => {
    render(<Harness initial={VALUE} presets={PRESETS} />);

    fireEvent.click(screen.getByRole("button", { name: "Runtime presets" }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Defaults" }));
    fireEvent.click(
      screen.getByRole("menuitemcheckbox", { name: "Guardrails" }),
    );
    expect(currentValue()).toEqual({
      ...VALUE,
      presets: ["defaults", "guardrails"],
    });

    fireEvent.click(screen.getByRole("button", { name: "Move Guardrails up" }));
    expect(currentValue()).toEqual({
      ...VALUE,
      presets: ["guardrails", "defaults"],
    });
    expect(screen.queryByText(/profile/i)).not.toBeInTheDocument();
  });

  describe("with spec tabs", () => {
    it("leads with the prompt tab and edits the system prompt inline instead of through the modal", () => {
      render(<Harness initial={VALUE} specTabs={SPEC_RUNTIME_TABS} />);

      expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
        "User prompt",
        "System Prompt",
        "Environment",
        "Permissions",
        "Model",
        "Workflow",
      ]);
      expect(screen.getByLabelText("Variables JSON")).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: "User prompt" })).toHaveValue(
        "Review {{company}}",
      );
      expect(
        screen.queryByRole("button", { name: "Edit spec" }),
      ).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("tab", { name: "System Prompt" }));

      expect(
        screen.queryByRole("textbox", { name: "User prompt" }),
      ).not.toBeInTheDocument();
      expect(screen.queryByLabelText("User override")).not.toBeInTheDocument();
      fireEvent.change(screen.getByLabelText("System"), {
        target: { value: "Be terse" },
      });

      expect(currentValue()).toEqual({
        ...VALUE,
        spec: {
          ...VALUE.spec,
          prompt: { user: "Review {{company}}", system: "Be terse" },
        },
      });
    });

    it.each([
      {
        mode: "Single model",
        fields: ["Max tokens", "Max turns"],
        omitted: ["Max cost (USD)", "Timeout"],
      },
      {
        mode: "Multi-model",
        fields: ["Max cost (USD)", "Max tokens", "Max turns", "Timeout"],
        omitted: [],
      },
    ])(
      "keeps the $mode runtime bar out of the model tab and shows only the budget it does not own",
      ({ mode, fields, omitted }) => {
        render(<Harness initial={VALUE} specTabs={SPEC_RUNTIME_TABS} />);

        fireEvent.click(screen.getByRole("radio", { name: mode }));
        fireEvent.click(screen.getByRole("tab", { name: "Model" }));

        const model = screen.getByRole("region", { name: "Model" });
        expect(
          within(model).queryByRole("group", { name: "Runtime" }),
        ).not.toBeInTheDocument();
        for (const field of fields) expect(model).toHaveTextContent(field);
        for (const field of omitted)
          expect(within(model).queryByText(field)).not.toBeInTheDocument();
      },
    );

    it("rejects spec tabs combined with spec sections", () => {
      vi.spyOn(console, "error").mockImplementation(() => undefined);
      expect(() =>
        render(
          <PromptRunEditor
            value={VALUE}
            onChange={vi.fn()}
            specTabs={SPEC_RUNTIME_TABS}
            specSections={["model"]}
          />,
        ),
      ).toThrow("pass either specSections or specTabs");
    });
  });
});
