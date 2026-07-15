import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import type {
  KeyPreview,
  SecretKind,
  SecretResource,
} from "../../components/SecretKeySelector";
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
  { name: "Read", label: "Read", group: "Files", defaultMode: "enabled" },
  { name: "Write", label: "Write", group: "Files", defaultMode: "ask" },
  { name: "Bash", label: "Bash", group: "Shell", defaultMode: "ask" },
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

  it("does not render prompt source and metadata controls", () => {
    render(
      <SpecRuntimeEditor
        value={{
          prompt: {
            user: "hi",
            source: "demo.prompt",
            metadata: { owner: "captain" },
          },
        }}
        onChange={() => {}}
      />,
    );

    const prompt = screen.getByLabelText("Prompt");
    expect(within(prompt).queryByText("Source")).not.toBeInTheDocument();
    expect(within(prompt).queryByText("Metadata")).not.toBeInTheDocument();
    expect(
      within(prompt).queryByRole("button", { name: /Advanced/ }),
    ).not.toBeInTheDocument();
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

  it("selects the agent runtime through the model mode picker", () => {
    function Host() {
      const [value, setValue] = useState<AISpecRuntimeValue>({
        backend: "cli",
      });
      return <SpecRuntimeEditor value={value} onChange={setValue} />;
    }

    render(<Host />);

    const modes = screen.getByRole("radiogroup", { name: "Runtime mode" });
    expect(within(modes).getByRole("radio", { name: "CLI" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    fireEvent.click(within(modes).getByRole("radio", { name: "SDK" }));
    expect(within(modes).getByRole("radio", { name: "SDK" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(within(modes).getByRole("radio", { name: "CLI" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("collapses a section when its heading toggle is clicked", () => {
    render(<SpecRuntimeEditor value={{}} onChange={() => {}} />);

    const section = screen.getByRole("region", { name: "Model" });
    expect(
      within(section).getByRole("radiogroup", { name: "Runtime mode" }),
    ).toBeInTheDocument();

    fireEvent.click(within(section).getByRole("button", { name: /Model/ }));
    expect(
      within(section).queryByRole("radiogroup", { name: "Runtime mode" }),
    ).not.toBeInTheDocument();
  });
});
