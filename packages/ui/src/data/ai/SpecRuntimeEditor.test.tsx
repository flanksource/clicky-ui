import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type {
  KeyPreview,
  SecretKind,
  SecretResource,
} from "../../components/SecretKeySelector";
import type { ChatModel } from "../chat/types";
import { SpecRuntimeEditor } from "./SpecRuntimeEditor";
import type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";
import { SPEC_PERMISSION_PRESET_STORAGE_KEY } from "./SpecRuntimeEditor/presets";

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

function policyRadio(tool: string, mode: string) {
  return within(
    screen.getByRole("radiogroup", { name: `${tool} policy` }),
  ).getByRole("radio", { name: mode });
}

function openPermissionsAdvanced() {
  fireEvent.click(
    within(screen.getByLabelText("Permissions")).getByRole("button", {
      name: /Advanced/,
    }),
  );
}

function commitPhaseSelect() {
  return within(screen.getByRole("region", { name: "Commit" })).getByRole(
    "combobox",
  );
}

function openModelAdvanced() {
  fireEvent.click(
    within(screen.getByRole("region", { name: "Model" })).getByRole("button", {
      name: /Advanced/,
    }),
  );
}

describe("SpecRuntimeEditor", () => {
  it("renders every section at once and edits a literal env var through SecretKeySelector", () => {
    const value: AISpecRuntimeValue = {
      model: "claude-sonnet-4-5",
      setup: {
        envVars: [{ name: "CAPTAIN_MODE", value: "demo" }],
      },
    };
    const onChange = vi.fn();

    render(
      <SpecRuntimeEditor
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
    // The commit phase select is the section's always-present control; the
    // message and dry-run fields belong to a policy that does not exist yet.
    expect(commitPhaseSelect()).toHaveValue("none");
    expect(screen.queryByLabelText("Commit message")).not.toBeInTheDocument();

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

  it("reveals workspace fields per mode and clears dependent values on switches", () => {
    const initialValue: AISpecRuntimeValue = {
      setup: {
        checkout: {
          mode: "remote",
          url: "https://github.com/flanksource/clicky-ui.git",
          ref: "main",
          worktree: {
            mode: "new",
            prefix: "ai",
            path: ".shell/worktrees/runtime",
            keep: true,
          },
          dirty: {
            stash: "all",
            since: "origin/main",
          },
        },
      },
    };

    function Host() {
      const [value, setValue] = useState(initialValue);
      return <SpecRuntimeEditor value={value} onChange={setValue} />;
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

    const worktreeGroup = () =>
      screen.getByRole("radiogroup", { name: "Worktree mode" });
    fireEvent.click(within(worktreeGroup()).getByText("Existing"));
    expect(screen.queryByText("Worktree prefix")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Worktree path")).toHaveValue(
      ".shell/worktrees/runtime",
    );
    fireEvent.click(within(worktreeGroup()).getByText("None"));
    expect(screen.queryByText("Worktree path")).not.toBeInTheDocument();
    fireEvent.click(within(worktreeGroup()).getByText("New"));
    expect(screen.getByLabelText("Worktree path")).toHaveValue("");
    expect(screen.getByLabelText("Keep worktree")).not.toBeChecked();

    fireEvent.click(
      within(screen.getByRole("radiogroup", { name: "Stash mode" })).getByText(
        "None",
      ),
    );
    expect(screen.getByLabelText("Since")).toHaveValue("");
  });

  // The commit phase is what makes per-turn commits reachable at all, and
  // "Never" has to mean an absent policy rather than a stanza of falses — a
  // lingering {dryRun: true} would still read as configured downstream.
  it("edits a commit policy through the phase select and drops it on Never", () => {
    const onChange = vi.fn();

    function Host() {
      const [value, setValue] = useState<AISpecRuntimeValue>({});
      return (
        <SpecRuntimeEditor
          value={value}
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
        />
      );
    }

    render(<Host />);

    fireEvent.change(commitPhaseSelect(), { target: { value: "turn" } });
    expect(onChange).toHaveBeenLastCalledWith({
      workflow: { commits: [{ on: "turn" }] },
    });

    fireEvent.change(screen.getByLabelText("Commit message"), {
      target: { value: "feat: rewrite the config" },
    });
    fireEvent.click(screen.getByLabelText("Dry run"));
    expect(onChange).toHaveBeenLastCalledWith({
      workflow: {
        commits: [
          { on: "turn", message: "feat: rewrite the config", dryRun: true },
        ],
      },
    });

    fireEvent.change(commitPhaseSelect(), { target: { value: "none" } });
    expect(onChange).toHaveBeenLastCalledWith({ workflow: { commits: [] } });
    expect(screen.queryByLabelText("Commit message")).not.toBeInTheDocument();
  });

  it("moves prompt schema into advanced without source and metadata controls", () => {
    render(
      <SpecRuntimeEditor
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
        backend: "openai",
        fallbacks: [{ model: "openai/gpt-4o", effort: "low" }],
      });
      return (
        <SpecRuntimeEditor
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
        name: /Advanced · fallbacks, session, caching/,
      }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(
      within(modelSection).getByText("Fallback models"),
    ).toBeInTheDocument();
    expect(
      within(modelSection).getByPlaceholderText("session UUID"),
    ).toBeInTheDocument();
    expect(
      within(modelSection).getByText("Disable prompt caching"),
    ).toBeInTheDocument();
    expect(
      within(modelSection)
        .getByPlaceholderText("session UUID")
        .closest('[class~="md:grid-cols-2"]'),
    ).toBeNull();

    expect(within(modelSection).getByText("GPT-4o")).toBeInTheDocument();
    const gpt4oRow = within(modelSection).getByRole("button", {
      name: "Edit fallback GPT-4o",
    });
    expect(within(gpt4oRow).getByText("Low")).toBeInTheDocument();
    // The collapsed row tones its glyphs like the bar does: the OpenAI mark in
    // the brand color, the effort battery on the low (sky) rung.
    expect(gpt4oRow.querySelector("svg.text-black")).not.toBeNull();
    expect(gpt4oRow.querySelector("svg.text-sky-700")).not.toBeNull();
    // This fallback names no backend, so the row claims no runtime mode.
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
    expect(within(bar).getByTitle("OpenAI API")).toHaveTextContent("API");
    expect(
      within(bar).getByTitle("Model — prompt default"),
    ).toBeInTheDocument();
    // The bar is the whole editor — temperature is no longer part of it.
    expect(within(picker).queryByLabelText("Temperature")).not.toBeInTheDocument();
    // The draft inherits the spec's backend, so its collapsed row shows the mode.
    expect(
      within(
        within(modelSection).getByRole("button", {
          name: "Edit fallback Select model",
        }),
      ).getByRole("img", { name: "OpenAI API" }),
    ).toBeInTheDocument();

    fireEvent.click(within(bar).getByTitle("Model — prompt default"));
    fireEvent.click(await screen.findByRole("menuitem", { name: /o4-mini/ }));
    expect(
      await within(modelSection).findByTitle("Model — openai/o4-mini"),
    ).toBeInTheDocument();

    const updatedPicker = within(modelSection).getByRole("group", {
      name: "Fallback model picker",
    });
    const updatedBar = within(updatedPicker).getByRole("group", {
      name: "Fallback runtime",
    });
    fireEvent.click(within(updatedBar).getByTitle("Reasoning effort"));
    fireEvent.click(await screen.findByRole("menuitem", { name: /^High/ }));

    expect(within(modelSection).getAllByText("o4-mini").length).toBe(2);
    expect(within(modelSection).getAllByText("High").length).toBe(2);
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
        <SpecRuntimeEditor
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

    openPermissionsAdvanced();

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
        <SpecRuntimeEditor
          value={value}
          onChange={setValue}
          tools={SAMPLE_TOOLS}
        />
      );
    }

    render(<Host />);
    openPermissionsAdvanced();

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

  it("applies permission presets and marks custom trees after manual tweaks", () => {
    function Host() {
      const [value, setValue] = useState<AISpecRuntimeValue>({});
      return (
        <SpecRuntimeEditor
          value={value}
          onChange={setValue}
          tools={SAMPLE_TOOLS}
        />
      );
    }

    render(<Host />);

    const planPreset = screen.getByRole("radio", { name: /Plan/ });
    fireEvent.click(planPreset);

    expect(planPreset).toHaveAttribute("aria-checked", "true");
    openPermissionsAdvanced();
    expect(
      screen.getByRole("combobox", { name: "Permission mode" }),
    ).toHaveValue("plan");
    expect(policyRadio("Read", "Allow")).toBeChecked();
    expect(policyRadio("Bash", "Deny")).toBeChecked();

    fireEvent.click(policyRadio("Bash", "Allow"));
    expect(screen.getByRole("radio", { name: /Custom/ })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("saves and reapplies local permission presets", () => {
    window.localStorage.removeItem(SPEC_PERMISSION_PRESET_STORAGE_KEY);

    function Host() {
      const [value, setValue] = useState<AISpecRuntimeValue>({});
      return (
        <SpecRuntimeEditor
          value={value}
          onChange={setValue}
          tools={SAMPLE_TOOLS}
        />
      );
    }

    render(<Host />);

    fireEvent.click(screen.getByRole("radio", { name: /Read-only/ }));
    fireEvent.change(screen.getByLabelText("Permission preset name"), {
      target: { value: "Locked down" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(
      window.localStorage.getItem(SPEC_PERMISSION_PRESET_STORAGE_KEY),
    ).toContain("Locked down");

    openPermissionsAdvanced();
    expect(policyRadio("Bash", "Deny")).toBeChecked();
    fireEvent.click(policyRadio("Bash", "Allow"));
    expect(policyRadio("Bash", "Allow")).toBeChecked();

    fireEvent.click(screen.getByRole("radio", { name: /Locked down/ }));
    expect(policyRadio("Bash", "Deny")).toBeChecked();
  });

  it("shows the target chip in the header", () => {
    render(
      <SpecRuntimeEditor
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

  it("hides the footer without callbacks and wires save/cancel when provided", () => {
    const { rerender } = render(
      <SpecRuntimeEditor value={{}} onChange={() => {}} />,
    );
    expect(
      screen.queryByRole("button", { name: /Save & run/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Ready to run")).not.toBeInTheDocument();

    const onSave = vi.fn();
    const onCancel = vi.fn();
    rerender(
      <SpecRuntimeEditor
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
      <SpecRuntimeEditor
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
        backend: "claude-cli",
      });
      return <SpecRuntimeEditor value={value} onChange={setValue} />;
    }

    render(<Host />);

    const bar = screen.getByRole("group", { name: "Runtime" });
    expect(within(bar).getByTitle("Claude Code CLI")).toHaveTextContent("CLI");

    fireEvent.click(within(bar).getByTitle("Claude Code CLI"));
    fireEvent.click(
      await screen.findByRole("menuitem", { name: /^Agent Claude Agent SDK/ }),
    );

    expect(within(bar).getByTitle("Claude Agent SDK")).toHaveTextContent(
      "Agent",
    );
    expect(within(bar).queryByTitle("Claude Code CLI")).not.toBeInTheDocument();
  });

  it("collapses a section when its heading toggle is clicked", () => {
    render(<SpecRuntimeEditor value={{}} onChange={() => {}} />);

    const section = screen.getByRole("region", { name: "Model" });
    expect(
      within(section).getByRole("group", { name: "Runtime" }),
    ).toBeInTheDocument();

    fireEvent.click(within(section).getByRole("button", { name: /Model/ }));
    expect(
      within(section).queryByRole("group", { name: "Runtime" }),
    ).not.toBeInTheDocument();
  });
});
