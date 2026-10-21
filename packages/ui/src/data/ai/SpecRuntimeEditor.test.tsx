import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type {
  KeyPreview,
  SecretKind,
  SecretResource,
} from "../../components/SecretKeySelector";
import type { ChatModel } from "../chat/types";
import type { SpecRuntimeFamily } from "../runtime/runtime-mode";
import {
  SpecRuntimeEditor,
  type SpecRuntimeEditorProps,
} from "./SpecRuntimeEditor";
import { SpecRuntimeBar } from "./SpecRuntimeBar";
import type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";

const RESOURCES: Record<SecretKind, SecretResource[]> = {
  secret: [{ name: "captain-api", keys: ["token"] }],
  configmap: [{ name: "runtime", keys: ["surface"] }],
};

const PREVIEWS: KeyPreview[] = [{ key: "token", value: "cap_••••" }];

const loadResources = (kind: SecretKind) => Promise.resolve(RESOURCES[kind]);
const loadKeyPreview = () => Promise.resolve(PREVIEWS);

const SAMPLE_TOOLS = [
  { name: "Read", label: "Read", group: "Files", defaultPermission: "auto" },
  { name: "Write", label: "Write", group: "Files", defaultPermission: "ask" },
  { name: "Bash", label: "Bash", group: "Shell", defaultPermission: "ask" },
];

const SAMPLE_MODELS: ChatModel[] = [
  {
    id: "openai/gpt-4o",
    provider: "openai",
    label: "GPT-4o",
    reasoning: false,
    configured: true,
  },
  {
    id: "openai/o4-mini",
    provider: "openai",
    label: "o4-mini",
    reasoning: true,
    configured: true,
  },
  {
    id: "anthropic/claude-sonnet-4-5",
    provider: "anthropic",
    label: "Claude Sonnet 4.5",
    reasoning: true,
    configured: true,
  },
];

const PERMISSION_FAMILIES: SpecRuntimeFamily[] = [
  {
    id: "claude",
    label: "Claude",
    provider: "anthropic",
    modes: [
      {
        id: "agent",
        label: "Agent",
        mode: "agent",
        permissions: {
          modes: Object.fromEntries(
            [
              "default",
              "plan",
              "acceptEdits",
              "auto",
              "bypassPermissions",
              "dontAsk",
            ].map((mode) => [mode, { kind: "native", effects: {} }]),
          ),
          toolPolicies: {},
          resources: {},
        },
      },
    ],
  },
];

function policyRadio(tool: string, mode: string) {
  return within(
    screen.getByRole("radiogroup", { name: `${tool} policy` }),
  ).getByRole("radio", { name: mode });
}

function RuntimeEditor(props: SpecRuntimeEditorProps) {
  return (
    <SpecRuntimeEditor
      {...props}
      beforeSections={
        <SpecRuntimeBar
          value={props.value}
          onChange={props.onChange}
          models={props.models}
          families={props.families}
          effectiveMode={props.effectiveMode}
          effectiveModel={props.effectiveModel}
          readOnly={props.readOnly}
          variant={props.variant}
        />
      }
    />
  );
}

async function chooseBarField(field: string, name: string) {
  fireEvent.click(screen.getByRole("button", { name: "Runtime options" }));
  fireEvent.click(await screen.findByRole("menuitem", { name: field }));
  fireEvent.click(await screen.findByRole("menuitem", { name, exact: true }));
}

function openModelAdvanced() {
  fireEvent.click(
    within(screen.getByRole("region", { name: "Model" })).getByRole("button", {
      name: /Advanced/,
    }),
  );
}

describe("runtime bar and detailed editor", () => {
  it("keeps legacy runtime values editable and marks them as invalid model configuration", () => {
    const canonicalFamilies: SpecRuntimeFamily[] = [
      {
        id: "claude",
        label: "Claude",
        provider: "anthropic",
        modes: [
          { id: "api", label: "API" },
          { id: "agent", label: "Agent" },
        ],
      },
    ];

    render(
      <RuntimeEditor
        value={{ model: "haiku", mode: "anthropic" }}
        onChange={vi.fn()}
        families={canonicalFamilies}
        sections={["model", "prompt"]}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      'Invalid model configuration: mode "anthropic"',
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "api, agent, cli, or cmux",
    );
    expect(screen.getByRole("region", { name: "Model" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Prompt" })).toBeInTheDocument();
  });

  it("rejects legacy provider prefixes in compact model values", () => {
    render(
      <RuntimeEditor
        value={{ model: "anthropic:haiku", mode: "agent" }}
        onChange={vi.fn()}
        sections={["model", "prompt"]}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      'Invalid model configuration: mode "anthropic" in model "anthropic:haiku"',
    );
    expect(screen.getByRole("region", { name: "Model" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Prompt" })).toBeInTheDocument();
  });

  it("renders every section at once and edits a literal env var through SecretKeySelector", () => {
    const value: AISpecRuntimeValue = {
      model: "claude-sonnet-4-5",
      setup: {
        envVars: [{ name: "CAPTAIN_MODE", value: "demo" }],
      },
    };
    const onChange = vi.fn();

    render(
      <RuntimeEditor
        value={value}
        onChange={onChange}
        secretSelector={{ loadResources, loadKeyPreview }}
      />,
    );

    for (const label of [
      "Model",
      "Prompt",
      "Workspace",
      "Permissions",
      "Environment",
      "Verify",
      "Commit",
    ]) {
      expect(screen.getByRole("region", { name: label })).toBeInTheDocument();
    }
    // No cliOptions prop: the CLI flags section stays hidden.
    expect(
      screen.queryByRole("region", { name: "CLI flags" }),
    ).not.toBeInTheDocument();

    // All sections render without tab switching.
    expect(screen.getByText("Environment variables")).toBeInTheDocument();
    expect(screen.getByText("Git checkout")).toBeInTheDocument();
    expect(screen.getByText("Verify fixture")).toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Commit" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Commit message")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /CAPTAIN_MODE.*demo/ }));
    fireEvent.change(screen.getByPlaceholderText("Static value…"), {
      target: { value: "changed" },
    });

    expect(onChange).toHaveBeenCalledWith({
      ...value,
      setup: {
        envVars: [{ name: "CAPTAIN_MODE", value: "changed" }],
      },
    });
  });

  it("reveals workspace fields per mode and clears dependent values on bar switches", async () => {
    const initialValue: AISpecRuntimeValue = {
      setup: {
        checkout: {
          mode: "remote",
          url: "https://github.com/flanksource/clicky-ui.git",
          ref: "main",
          since: "origin/main",
          worktree: {
            mode: "new",
            prefix: "ai",
            path: ".shell/worktrees/runtime",
            keep: true,
          },
        },
      },
    };

    function Host() {
      const [value, setValue] = useState(initialValue);
      return <RuntimeEditor value={value} onChange={setValue} />;
    }

    render(<Host />);

    expect(screen.getByLabelText("Git URL")).toHaveValue(
      "https://github.com/flanksource/clicky-ui.git",
    );
    expect(screen.getByLabelText("Keep worktree")).toBeChecked();

    const checkoutGroup = () =>
      screen.getByRole("radiogroup", { name: "Checkout source" });
    fireEvent.click(within(checkoutGroup()).getByText("None"));
    expect(screen.queryByText("Git URL")).not.toBeInTheDocument();
    fireEvent.click(within(checkoutGroup()).getByText("Remote"));
    expect(screen.getByLabelText("Git URL")).toHaveValue("");

    await chooseBarField("Source", "Existing worktree");
    expect(screen.queryByText("Worktree prefix")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Source — Existing worktree"));
    expect(await screen.findByLabelText("Worktree path")).toHaveValue(
      ".shell/worktrees/runtime",
    );
    fireEvent.keyDown(document, { key: "Escape" });
    await chooseBarField("Source", "HEAD");
    expect(screen.queryByLabelText("Worktree path")).not.toBeInTheDocument();
    await chooseBarField("Source", "New worktree");
    fireEvent.click(screen.getByTitle("Source — New worktree"));
    expect(await screen.findByLabelText("Worktree path")).toHaveValue("");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByLabelText("Keep worktree")).not.toBeChecked();
    expect(screen.getByLabelText("Report changes since")).toHaveValue(
      "origin/main",
    );
  });

  it("edits a commit policy through the bar and explicitly clears it on Never", async () => {
    const onChange = vi.fn();

    function Host() {
      const [value, setValue] = useState<AISpecRuntimeValue>({});
      return (
        <RuntimeEditor
          value={value}
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
        />
      );
    }

    render(<Host />);

    await chooseBarField("Commit", "Every turn");
    expect(onChange).toHaveBeenLastCalledWith({
      workflow: { commits: [{ on: "turn" }] },
    });

    fireEvent.change(screen.getByLabelText("Commit message"), {
      target: { value: "feat: rewrite the config" },
    });
    expect(onChange).toHaveBeenLastCalledWith({
      workflow: {
        commits: [{ on: "turn", message: "feat: rewrite the config" }],
      },
    });

    await chooseBarField("Commit", "Never");
    expect(onChange).toHaveBeenLastCalledWith({ workflow: { commits: [] } });
    expect(screen.queryByLabelText("Commit message")).not.toBeInTheDocument();
  });

  it("moves prompt schema into advanced without source and metadata controls", () => {
    render(
      <RuntimeEditor
        value={
          {
            prompt: {
              user: "hi",
              schemaJSON: { type: "object" },
              schemaStrictness: "retry",
              source: "demo.prompt",
              metadata: { owner: "captain" },
            },
          } as any
        }
        onChange={() => {}}
      />,
    );

    const prompt = screen.getByLabelText("Prompt");
    expect(within(prompt).queryByText("Source")).not.toBeInTheDocument();
    expect(within(prompt).queryByText("Metadata")).not.toBeInTheDocument();
    expect(
      within(prompt).queryByText("Prompt schema JSON"),
    ).not.toBeInTheDocument();

    fireEvent.click(within(prompt).getByRole("button", { name: /Advanced/ }));

    expect(within(prompt).getByLabelText("Prompt schema JSON")).toHaveValue(
      '{\n  "type": "object"\n}',
    );
    expect(
      within(prompt).getByRole("radiogroup", { name: "Schema strictness" }),
    ).toBeInTheDocument();
    expect(
      within(prompt).getByRole("radio", { name: "Retry" }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("renders fallback models as rows with expandable inline editors", async () => {
    function Host() {
      const [value, setValue] = useState<AISpecRuntimeValue>({
        mode: "api",
        fallbacks: [{ model: "openai/gpt-4o", effort: "low" }],
      });
      return (
        <RuntimeEditor
          value={value}
          onChange={setValue}
          models={SAMPLE_MODELS}
          sections={["model"]}
        />
      );
    }

    render(<Host />);

    const modelSection = screen.getByRole("region", { name: "Model" });
    openModelAdvanced();

    expect(
      within(modelSection).getByRole("button", {
        name: /Advanced · fallbacks, caching/,
      }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      within(modelSection).getByText("Fallback models"),
    ).toBeInTheDocument();
    expect(
      within(modelSection).queryByPlaceholderText("session UUID"),
    ).not.toBeInTheDocument();
    expect(
      within(modelSection).getByText("Disable prompt caching"),
    ).toBeInTheDocument();

    expect(within(modelSection).getByText("GPT-4o")).toBeInTheDocument();
    const gpt4oRow = within(modelSection).getByRole("button", {
      name: "Edit fallback GPT-4o",
    });
    expect(within(gpt4oRow).getByText("Low")).toBeInTheDocument();
    // The collapsed row tones its glyphs like the bar does: the OpenAI mark in
    // the brand color, the effort battery on the low (sky) rung.
    expect(gpt4oRow.querySelector("svg.text-black")).not.toBeNull();
    expect(gpt4oRow.querySelector("svg.text-sky-700")).not.toBeNull();
    // This fallback names no mode, so the row claims none.
    expect(within(gpt4oRow).queryByRole("img")).not.toBeInTheDocument();

    fireEvent.click(
      within(modelSection).getByRole("button", {
        name: "Edit fallback GPT-4o",
      }),
    );
    expect(
      within(modelSection).getByRole("group", {
        name: "Fallback model picker",
      }),
    ).toBeInTheDocument();
    fireEvent.click(
      within(modelSection).getByRole("button", {
        name: "Edit fallback GPT-4o",
      }),
    );
    expect(
      within(modelSection).queryByRole("group", {
        name: "Fallback model picker",
      }),
    ).not.toBeInTheDocument();

    fireEvent.click(
      within(modelSection).getByRole("button", { name: "Remove GPT-4o" }),
    );
    expect(within(modelSection).queryByText("GPT-4o")).not.toBeInTheDocument();

    fireEvent.click(
      within(modelSection).getByRole("button", { name: /^Add$/ }),
    );

    const picker = within(modelSection).getByRole("group", {
      name: "Fallback model picker",
    });
    expect(within(modelSection).getByText("Select model")).toBeInTheDocument();
    expect(
      within(modelSection).queryByRole("button", { name: "Add fallback" }),
    ).not.toBeInTheDocument();
    const bar = within(picker).getByRole("group", { name: "Fallback runtime" });
    expect(within(bar).getByTitle("Runtime mode — API")).toHaveTextContent(
      "API",
    );
    expect(within(bar).getByTitle("Model — unspecified")).toBeInTheDocument();
    // The bar is the whole editor — temperature is no longer part of it.
    expect(
      within(picker).queryByLabelText("Temperature"),
    ).not.toBeInTheDocument();
    // The draft inherits the spec's mode, so its collapsed row shows it.
    expect(
      within(
        within(modelSection).getByRole("button", {
          name: "Edit fallback Select model",
        }),
      ).getByRole("img", { name: "Anthropic API" }),
    ).toBeInTheDocument();

    fireEvent.click(within(bar).getByTitle("Model — unspecified"));
    fireEvent.mouseDown(await screen.findByRole("option", { name: /o4-mini/ }));
    expect(
      await within(modelSection).findByTitle("Model — openai/o4-mini"),
    ).toBeInTheDocument();

    const updatedPicker = within(modelSection).getByRole("group", {
      name: "Fallback model picker",
    });
    const updatedBar = within(updatedPicker).getByRole("group", {
      name: "Fallback runtime",
    });
    fireEvent.click(within(updatedBar).getByTitle("Runtime options"));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Effort" }));
    fireEvent.click(await screen.findByRole("menuitem", { name: /^High/ }));

    const updatedRow = within(modelSection).getByRole("button", {
      name: "Edit fallback o4-mini",
    });
    expect(within(updatedRow).getByText("o4-mini")).toBeInTheDocument();
    expect(within(updatedRow).getByText("High")).toBeInTheDocument();
    expect(
      within(updatedBar).getByRole("combobox", { name: "Model" }),
    ).toHaveTextContent("o4-mini");
    expect(
      within(modelSection).getByRole("button", {
        name: "Remove o4-mini",
      }),
    ).toBeInTheDocument();
  });

  it("renders grouped permission rows with segmented policies and bulk group controls", () => {
    const initialValue: AISpecRuntimeValue = {
      permissions: {
        tools: {
          Read: "auto",
          Write: "deny",
          Bash: "deny",
        },
        mcp: {
          gavel: "disabled",
          servers: ["filesystem", "gavel"],
        },
      },
    };

    function Host() {
      const [value, setValue] = useState(initialValue);
      return (
        <RuntimeEditor
          value={value}
          onChange={setValue}
          tools={SAMPLE_TOOLS}
          permissionCatalog={{
            mcp: [
              { id: "filesystem", label: "filesystem", group: "MCP" },
              { id: "gavel", label: "gavel", group: "MCP" },
            ],
          }}
        />
      );
    }

    render(<Host />);

    expect(policyRadio("Read", "Auto")).toBeChecked();
    expect(policyRadio("Write", "Deny")).toBeChecked();

    fireEvent.click(policyRadio("Read", "Ask"));
    expect(policyRadio("Read", "Ask")).toBeChecked();

    fireEvent.click(
      screen.getByRole("radio", { name: "Set Files group to Allow" }),
    );
    expect(policyRadio("Read", "Allow")).toBeChecked();
    expect(policyRadio("Write", "Allow")).toBeChecked();

    expect(policyRadio("gavel", "Disabled")).toBeChecked();
    fireEvent.click(
      screen.getByRole("radio", { name: "Set MCP group to Disabled" }),
    );
    expect(policyRadio("filesystem", "Disabled")).toBeChecked();
  });

  it("collapses a permission group when its header row (not just the chevron) is clicked", () => {
    function Host() {
      const [value, setValue] = useState<AISpecRuntimeValue>({
        permissions: { tools: { Read: "auto", Write: "deny", Bash: "deny" } },
      });
      return (
        <RuntimeEditor value={value} onChange={setValue} tools={SAMPLE_TOOLS} />
      );
    }

    render(<Host />);

    expect(
      screen.getByRole("radiogroup", { name: "Read policy" }),
    ).toBeInTheDocument();

    // Clicking the group's label (part of the header row, not the chevron
    // button) collapses the group and hides its entries.
    fireEvent.click(screen.getByText("Files"));
    expect(
      screen.queryByRole("radiogroup", { name: "Read policy" }),
    ).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Files"));
    expect(
      screen.getByRole("radiogroup", { name: "Read policy" }),
    ).toBeInTheDocument();
  });

  it("changes the permission posture through the bar and clears it via Unspecified", async () => {
    function Host() {
      const [value, setValue] = useState<AISpecRuntimeValue>({
        mode: "agent",
        permissions: { mode: "plan" },
      });
      return (
        <>
          <RuntimeEditor
            value={value}
            onChange={setValue}
            tools={SAMPLE_TOOLS}
            families={PERMISSION_FAMILIES}
          />
          <output aria-label="Permissions value">
            {JSON.stringify(value.permissions ?? {})}
          </output>
        </>
      );
    }

    render(<Host />);

    expect(screen.getByTitle("Permission posture — Plan")).toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Permission posture — Plan"));
    fireEvent.click(await screen.findByRole("menuitem", { name: /^-/ }));
    expect(
      screen.queryByTitle("Permission posture — Plan"),
    ).not.toBeInTheDocument();
    expect(
      JSON.parse(
        screen.getByLabelText("Permissions value").textContent ?? "{}",
      ),
    ).not.toHaveProperty("mode");
  });

  it("shows the target chip in the header", () => {
    render(
      <RuntimeEditor
        value={{
          setup: {
            checkout: {
              mode: "remote",
              url: "https://github.com/flanksource/clicky-ui.git",
              ref: "main",
            },
          },
        }}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText("clicky-ui · main")).toBeInTheDocument();
  });

  it("renders an ordered read-only prompt document presentation", () => {
    const onChange = vi.fn();
    render(
      <RuntimeEditor
        value={{
          prompt: {
            user: '{{role "system"}}\nBe concise.\n{{role "user"}}\n{{body}}',
          },
        }}
        onChange={onChange}
        sections={["prompt", "model"]}
        promptVariant="document"
        readOnly
      />,
    );

    const body = screen.getByLabelText("Prompt document body");
    expect(body).toBeDisabled();
    expect(body).toHaveValue(
      '{{role "system"}}\nBe concise.\n{{role "user"}}\n{{body}}',
    );
    expect(screen.queryByLabelText("User override")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Prompt 01/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Model 02/ }),
    ).toBeInTheDocument();

    fireEvent.change(body, { target: { value: "changed" } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("keeps captain execution identity out of runtime profiles", () => {
    render(
      <RuntimeEditor
        value={{ mode: "agent" }}
        onChange={() => {}}
        families={[
          {
            id: "claude",
            label: "Claude",
            provider: "anthropic",
            modes: [
              {
                id: "agent",
                label: "Agent",
                mode: "agent",
                schema: {
                  type: "object",
                  properties: {
                    sandbox: {
                      type: "object",
                      properties: {
                        mode: {
                          type: "string",
                          enum: ["off", "native", "docker", "git-agent"],
                        },
                        approval: {
                          type: "string",
                          enum: ["default", "plan"],
                        },
                        policy: { type: "object", properties: {} },
                      },
                    },
                  },
                },
              },
            ],
          },
        ]}
        sandboxCatalog={{
          kinds: [
            {
              kind: "docker",
              capabilities: [],
              modes: ["api", "cli", "agent", "cmux"],
            },
          ],
        }}
      />,
    );

    const environment = screen.getByRole("region", { name: "Environment" });
    const sandbox = screen.getByRole("region", { name: "Sandbox" });
    const workspace = screen.getByRole("region", { name: "Workspace" });
    const commit = screen.getByRole("region", { name: "Commit" });
    expect(
      within(environment).queryByText("Execution identity"),
    ).not.toBeInTheDocument();
    expect(
      within(sandbox).queryByText("Execution identity"),
    ).not.toBeInTheDocument();
    expect(
      within(workspace).getByLabelText("Report changes since"),
    ).toBeInTheDocument();
    expect(within(workspace).queryByText("Stash")).not.toBeInTheDocument();
    expect(within(commit).queryByText("Dry run")).not.toBeInTheDocument();
  });

  it("hides the footer without callbacks and wires save/cancel when provided", () => {
    const { rerender } = render(
      <RuntimeEditor value={{}} onChange={() => {}} />,
    );
    expect(
      screen.queryByRole("button", { name: /Save & run/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Ready to run")).not.toBeInTheDocument();

    const onSave = vi.fn();
    const onCancel = vi.fn();
    rerender(
      <RuntimeEditor
        value={{}}
        onChange={() => {}}
        onSave={onSave}
        onCancel={onCancel}
        saveLabel="Save spec"
        footerStatus="Draft"
      />,
    );

    expect(screen.getByText("Draft")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Save spec/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("renders the CLI flags section from a cliOptions schema", () => {
    const onChange = vi.fn();
    render(
      <RuntimeEditor
        value={{ cliArgs: { profile: "dev" } }}
        onChange={onChange}
        cliOptions={{
          schema: {
            type: "object",
            properties: {
              profile: { type: "string", title: "Profile" },
            },
          },
        }}
      />,
    );

    expect(
      screen.getByRole("region", { name: "CLI flags" }),
    ).toBeInTheDocument();
    const input = screen.getByLabelText("Profile");
    expect(input).toHaveValue("dev");
    fireEvent.change(input, { target: { value: "prod" } });
    expect(onChange).toHaveBeenCalledWith({ cliArgs: { profile: "prod" } });
  });

  it("selects the agent runtime through the runtime bar's mode segment", async () => {
    function Host() {
      const [value, setValue] = useState<AISpecRuntimeValue>({
        mode: "cli",
      });
      return <RuntimeEditor value={value} onChange={setValue} />;
    }

    render(<Host />);

    const bar = screen.getByRole("group", { name: "Runtime" });
    expect(within(bar).getByTitle("Runtime mode — CLI")).toHaveTextContent(
      "CLI",
    );

    fireEvent.click(within(bar).getByTitle("Runtime mode — CLI"));
    fireEvent.click(await screen.findByRole("menuitem", { name: "Agent" }));

    expect(within(bar).getByTitle("Runtime mode — Agent")).toHaveTextContent(
      "Agent",
    );
    expect(
      within(bar).queryByTitle("Runtime mode — CLI"),
    ).not.toBeInTheDocument();
  });

  it("collapses a section when its heading toggle is clicked", () => {
    render(<RuntimeEditor value={{}} onChange={() => {}} />);

    const section = screen.getByRole("region", { name: "Model" });
    expect(
      within(section).getByRole("button", { name: /Advanced/ }),
    ).toBeInTheDocument();

    fireEvent.click(within(section).getByRole("button", { name: /Model/ }));
    expect(
      within(section).queryByRole("button", { name: /Advanced/ }),
    ).not.toBeInTheDocument();
  });

  it("shows provider status below the runtime bar and collapses it by default", () => {
    render(
      <RuntimeEditor
        value={{ mode: "agent" }}
        onChange={() => {}}
        models={[
          {
            id: "anthropic/opus",
            provider: "anthropic",
            label: "Claude Opus",
            reasoning: true,
            configured: false,
            availability: {
              state: "not_authenticated",
              reason: "Claude Agent is not authenticated.",
              remediation: "Run claude login, then refresh.",
            },
          },
        ]}
        families={[
          {
            id: "claude",
            label: "Claude",
            provider: "anthropic",
            modes: [
              {
                id: "agent",
                label: "Agent",
                mode: "agent",
              },
            ],
          },
        ]}
      />,
    );

    const modelSection = screen.getByRole("region", { name: "Model" });
    const bar = screen.getByRole("group", { name: "Runtime" });
    const providerStatus = within(modelSection).getByRole("button", {
      name: "Provider status, 1 issue",
    });
    expect(providerStatus).toHaveAttribute("aria-expanded", "false");
    expect(
      bar.compareDocumentPosition(providerStatus) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();

    fireEvent.click(providerStatus);
    expect(
      within(modelSection).getByRole("button", {
        name: "Claude, needs attention",
      }),
    ).toBeInTheDocument();
  });

  it("preset variant shows Unspecified for model, effort, and permission mode", () => {
    render(
      <RuntimeEditor
        value={{}}
        onChange={vi.fn()}
        models={SAMPLE_MODELS}
        families={PERMISSION_FAMILIES}
        tools={SAMPLE_TOOLS}
        variant="preset"
        showHeader={false}
      />,
    );

    const bar = screen.getByRole("group", { name: "Runtime" });
    expect(within(bar).getByTitle("Model — unspecified")).toBeInTheDocument();
    expect(
      screen.queryByRole("radiogroup", { name: "Permission posture" }),
    ).not.toBeInTheDocument();
    expect(
      within(bar).getByRole("button", { name: "Runtime options" }),
    ).toBeInTheDocument();
  });
});
