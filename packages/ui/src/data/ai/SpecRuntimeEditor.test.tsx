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

const RESOURCES: Record<SecretKind, SecretResource[]> = {
  secret: [{ name: "captain-api", keys: ["token"] }],
  configmap: [{ name: "runtime", keys: ["surface"] }],
};

const PREVIEWS: KeyPreview[] = [{ key: "token", value: "cap_••••" }];

const loadResources = (kind: SecretKind) => Promise.resolve(RESOURCES[kind]);
const loadKeyPreview = () => Promise.resolve(PREVIEWS);

describe("SpecRuntimeEditor", () => {
  it("renders setup sections and edits a literal env var through SecretKeySelector", () => {
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

    expect(screen.getByRole("tab", { name: "Model" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tab", { name: "Prompt" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Git" })).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Permissions" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Setup" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Verify" })).toBeInTheDocument();
    expect(screen.queryByText("Environment variables")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Setup" }));

    expect(screen.getByText("Environment variables")).toBeInTheDocument();
    expect(screen.queryByText("Backend")).not.toBeInTheDocument();
    expect(screen.queryByText("Provider ID")).not.toBeInTheDocument();
    expect(screen.queryByText("Session ID")).not.toBeInTheDocument();

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

  it("keeps workspace fields visible while mode controls clear dependent values", () => {
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

    fireEvent.click(screen.getByRole("tab", { name: "Git" }));

    expect(screen.getByText("Git URL")).toBeInTheDocument();
    expect(screen.getByText("Worktree path")).toBeInTheDocument();
    expect(screen.getByText("Keep worktree")).toBeInTheDocument();
    expect(screen.getByText("Since")).toBeInTheDocument();

    fireEvent.click(screen.getAllByText("None")[0]);
    expect(screen.getByText("Git URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Git URL")).toHaveValue("");

    fireEvent.click(
      within(
        screen.getByRole("radiogroup", { name: "Worktree mode" }),
      ).getByText("Existing"),
    );
    expect(screen.getByText("Worktree path")).toBeInTheDocument();
    expect(screen.getByLabelText("Keep worktree")).not.toBeChecked();

    fireEvent.click(
      within(
        screen.getByRole("radiogroup", { name: "Worktree mode" }),
      ).getByText("None"),
    );
    expect(screen.getByText("Worktree path")).toBeInTheDocument();
    expect(screen.getByLabelText("Worktree path")).toHaveValue("");

    fireEvent.click(screen.getAllByText("None")[2]);
    expect(screen.getByText("Since")).toBeInTheDocument();
    expect(screen.getByLabelText("Since")).toHaveValue("");
  });

  it("renders tools as compact grouped click toggles", () => {
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
        plugins: {
          "/Users/moshe/.codex/plugins/captain": "disabled",
        },
        skills: {
          "$CWD/.skills": "enabled",
        },
      },
    };

    function Host() {
      const [value, setValue] = useState(initialValue);
      return (
        <SpecRuntimeEditor
          value={value}
          onChange={setValue}
          tools={[
            {
              name: "Read",
              label: "Read",
              group: "Files",
              defaultMode: "enabled",
            },
            {
              name: "Write",
              label: "Write",
              group: "Files",
              defaultMode: "ask",
            },
            {
              name: "Bash",
              label: "Bash",
              group: "Shell",
              defaultMode: "ask",
            },
          ]}
          permissionCatalog={{
            mcp: [
              { id: "filesystem", label: "filesystem", group: "MCP" },
              { id: "gavel", label: "gavel", group: "MCP" },
            ],
            plugins: [
              {
                id: "/Users/moshe/.codex/plugins/captain",
                label: "captain",
                group: "Plugins",
              },
            ],
            skills: [{ id: "$CWD/.skills", label: "$CWD/.skills" }],
          }}
        />
      );
    }

    render(<Host />);

    fireEvent.click(screen.getByRole("tab", { name: "Permissions" }));

    expect(screen.getAllByText("Files").length).toBeGreaterThan(0);
    expect(screen.getAllByText("MCP").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Plugins").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Skills").length).toBeGreaterThan(0);

    const readTool = screen.getByTitle("Read");
    expect(readTool).toHaveTextContent("Auto");

    fireEvent.click(readTool);
    expect(screen.getByTitle("Read")).toHaveTextContent("Ask");

    fireEvent.click(
      screen.getByRole("button", { name: "Set Files group to Allow" }),
    );
    expect(screen.getByTitle("Read")).toHaveTextContent("Allow");
    expect(screen.getByTitle("Write")).toHaveTextContent("Allow");

    expect(screen.getByTitle("gavel")).toHaveTextContent("Disabled");

    fireEvent.click(
      screen.getByRole("button", { name: "Set MCP group to Disabled" }),
    );
    expect(screen.getByTitle("filesystem")).toHaveTextContent("Disabled");
    expect(screen.getByTitle("gavel")).toHaveTextContent("Disabled");
  });
});
