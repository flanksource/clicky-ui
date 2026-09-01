import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SandboxCreateWizard } from "./SandboxCreateWizard";
import {
  buildSandboxCreateInput,
  toggleSandboxCredential,
  type SpecRuntimeSandboxCreateDraft,
  type SpecRuntimeSandboxCredential,
} from "./SandboxCreateWizard.model";
import type { SpecRuntimeSandboxCatalog } from "./SpecRuntimeEditor/types";

const CREDENTIALS: SpecRuntimeSandboxCredential[] = [
  {
    id: "ai/claude",
    token: "claude",
    label: "Claude Code",
    category: "AI connections",
    reference: {},
  },
  {
    id: "ai/claude-staging",
    token: "claude",
    label: "Claude staging",
    category: "AI connections",
    reference: { connection: "ai/claude-staging" },
  },
  {
    id: "source/github",
    token: "github",
    label: "GitHub",
    category: "Source control",
    reference: { connection: "github" },
  },
  {
    id: "ai/codex",
    token: "codex",
    label: "Codex",
    available: false,
    unavailableReason: "Sign in first",
  },
];

const CATALOG: SpecRuntimeSandboxCatalog = {
  kinds: [
    { kind: "none", description: "No confinement" },
    {
      kind: "srt",
      description: "Confine a local command",
      configSchema: {
        type: "object",
        required: ["profile"],
        properties: {
          profile: { type: "string", title: "Policy profile" },
        },
      },
    },
    { kind: "container", description: "Run in a container" },
    { kind: "git-agent", description: "Use an isolated Git worktree" },
  ],
};

describe("sandbox creation model", () => {
  it("lowers selected credential references into the backend tokens block", () => {
    const draft: SpecRuntimeSandboxCreateDraft = {
      name: "local-safe",
      kind: "srt",
      parameters: { profile: "strict" },
      credentialIds: ["ai/claude", "source/github"],
      setDefault: true,
    };

    expect(buildSandboxCreateInput(draft, CREDENTIALS)).toEqual({
      name: "local-safe",
      kind: "srt",
      options: {
        profile: "strict",
        tokens: { claude: {}, github: { connection: "github" } },
      },
      setDefault: true,
    });
  });

  it("keeps only one connection for each token provider", () => {
    const initial: SpecRuntimeSandboxCreateDraft = {
      name: "local-safe",
      kind: "srt",
      parameters: {},
      credentialIds: ["ai/claude"],
      setDefault: false,
    };

    expect(
      toggleSandboxCredential(initial, "ai/claude-staging", CREDENTIALS)
        .credentialIds,
    ).toEqual(["ai/claude-staging"]);
  });

  it("fails loudly when parameters try to bypass the credentials step", () => {
    expect(() =>
      buildSandboxCreateInput(
        {
          name: "local-safe",
          kind: "srt",
          parameters: { tokens: { github: {} } },
          credentialIds: [],
          setDefault: false,
        },
        CREDENTIALS,
      ),
    ).toThrow(/credentials step owns options.tokens/);
  });
});

describe("SandboxCreateWizard", () => {
  it("keeps the required name field explicit and connections standalone", () => {
    render(
      <SandboxCreateWizard
        open
        catalog={CATALOG}
        config={{ credentials: CREDENTIALS, onCreate: vi.fn() }}
        onClose={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Sandbox name")).not.toHaveAttribute(
      "placeholder",
    );
    expect(screen.getByText("2. Connections")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Sandbox name"), {
      target: { value: "local-safe" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /Policy profile/ }), {
      target: { value: "strict" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(
      screen.getByRole("region", { name: "Connections" }),
    ).toBeInTheDocument();
  });

  it("shows sandbox types in an icon combobox", () => {
    render(
      <SandboxCreateWizard
        open
        catalog={CATALOG}
        config={{ credentials: CREDENTIALS, onCreate: vi.fn() }}
        onClose={vi.fn()}
      />,
    );

    fireEvent.focus(screen.getByRole("combobox", { name: "Sandbox type" }));

    for (const name of ["Sandbox Runtime", "Container", "Git Agent"]) {
      expect(
        screen.getByRole("option", { name: new RegExp(name) }),
      ).toContainHTML("<svg");
    }
  });

  it("collects kind parameters and credential exposure before creating", async () => {
    const onCreate = vi
      .fn()
      .mockResolvedValue({ name: "local-safe", kind: "srt" });
    const onClose = vi.fn();
    render(
      <SandboxCreateWizard
        open
        catalog={CATALOG}
        config={{ credentials: CREDENTIALS, onCreate }}
        onClose={onClose}
      />,
    );

    fireEvent.change(screen.getByLabelText("Sandbox name"), {
      target: { value: "local-safe" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: /Policy profile/ }), {
      target: { value: "strict" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.click(screen.getByRole("switch", { name: /Claude Code/ }));
    fireEvent.click(screen.getByRole("switch", { name: /GitHub/ }));
    expect(screen.getByRole("switch", { name: /Codex/ })).toBeDisabled();
    expect(screen.getByText("Sign in first")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Create sandbox" }));

    await waitFor(() =>
      expect(onCreate).toHaveBeenCalledWith({
        name: "local-safe",
        kind: "srt",
        options: {
          profile: "strict",
          tokens: { claude: {}, github: { connection: "github" } },
        },
        setDefault: false,
      }),
    );
    expect(onClose).toHaveBeenCalledOnce();
  });
});
