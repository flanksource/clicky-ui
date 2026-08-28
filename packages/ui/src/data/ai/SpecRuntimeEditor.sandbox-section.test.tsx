import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { SpecRuntimeEditor } from "./SpecRuntimeEditor";
import type { AISpecRuntimeValue } from "./SpecRuntimeEditor.model";
import type { SpecRuntimeFamily } from "../runtime/runtime-mode";
import type { SpecRuntimeSandboxCatalog } from "./SpecRuntimeEditor/types";

const approvalModes = {
  default: { kind: "native" as const },
  plan: { kind: "native" as const },
  acceptEdits: {
    kind: "approximated" as const,
    effects: { sandbox: "workspace-write", approval: "on-request" },
  },
  auto: {
    kind: "approximated" as const,
    effects: { sandbox: "workspace-write", approval: "on-request" },
  },
  bypassPermissions: { kind: "native" as const },
  dontAsk: { kind: "unsupported" as const },
};

const sandboxSchema = (claude: boolean) => ({
  type: "object" as const,
  properties: {
    sandbox: {
      type: "object" as const,
      properties: {
        mode: {
          type: "string" as const,
          title: "Sandbox mode",
          enum: ["off", "native", "docker", "git-agent"],
          "x-enum-display": "segmented" as const,
        },
        approval: {
          type: "string" as const,
          title: "Permission posture",
          enum: ["default", "acceptEdits", "auto", "bypassPermissions", "plan"],
        },
        policy: {
          type: "object" as const,
          title: "Native sandbox settings",
          properties: {
            ...(claude
              ? {
                  required: {
                    type: "boolean" as const,
                    title: "Require native sandbox",
                    "x-icon": "shield",
                  },
                }
              : {}),
            filesystem: {
              type: "object" as const,
              title: "Filesystem",
              properties: {
                access: {
                  type: "string" as const,
                  title: "Filesystem access",
                  enum: ["read-only", "workspace-write"],
                  "x-enum-display": "segmented" as const,
                  "x-icon": "folder-lock",
                },
                writableRoots: {
                  type: "array" as const,
                  title: "Writable roots",
                  items: { type: "string" as const },
                },
              },
            },
            network: {
              type: "object" as const,
              title: "Network",
              properties: {
                access: {
                  type: "string" as const,
                  title: "Network access",
                  enum: claude
                    ? ["disabled", "restricted", "unrestricted"]
                    : ["disabled", "unrestricted"],
                  "x-enum-display": "segmented" as const,
                  "x-icon": "globe-lock",
                },
              },
            },
          },
        },
        backend: { type: "string" as const },
        agent: { type: "string" as const },
        dispatch: {
          type: "object" as const,
          properties: {
            paths: {
              type: "array" as const,
              items: { type: "string" as const },
            },
            maxAttempts: { type: "integer" as const },
          },
        },
      },
    },
  },
});

const FAMILIES: SpecRuntimeFamily[] = [
  {
    id: "claude",
    label: "Claude",
    provider: "claude-agent",
    modes: [
      {
        id: "cli",
        label: "CLI",
        backend: "claude-cli",
        schema: sandboxSchema(true),
        permissions: {
          modes: approvalModes,
          toolPolicies: {},
          resources: {},
        },
      },
    ],
  },
  {
    id: "codex",
    label: "Codex",
    provider: "codex-agent",
    modes: [
      {
        id: "cli",
        label: "CLI",
        backend: "codex-cli",
        schema: sandboxSchema(false),
        permissions: {
          modes: approvalModes,
          toolPolicies: {},
          resources: {},
        },
      },
    ],
  },
];

const CATALOG: SpecRuntimeSandboxCatalog = {
  kinds: [
    {
      kind: "docker",
      backends: [{ name: "docker-safe", kind: "docker" }],
    },
    {
      kind: "git-agent",
      backends: [
        {
          name: "prod-pool",
          kind: "git-agent",
          agents: [
            { name: "worker-01", status: "enrolled", dispatchable: true },
            { name: "worker-02", status: "enrolled", dispatchable: false },
          ],
        },
      ],
    },
  ],
};

function Harness({
  initial = { backend: "claude-cli" },
  catalog,
}: {
  initial?: AISpecRuntimeValue;
  catalog?: SpecRuntimeSandboxCatalog | undefined;
}) {
  const [value, setValue] = useState(initial);
  return (
    <>
      <SpecRuntimeEditor
        value={value}
        onChange={setValue}
        sections={["sandbox"]}
        families={FAMILIES}
        {...(catalog ? { sandboxCatalog: catalog } : {})}
      />
      <output aria-label="Runtime value">{JSON.stringify(value)}</output>
    </>
  );
}

const sandboxModes = () =>
  screen.getByRole("radiogroup", { name: "Sandbox mode" });

function chooseMode(name: string) {
  fireEvent.click(
    within(sandboxModes()).getByRole("radio", {
      name: new RegExp(`^${name}(?:\\s|$)`),
    }),
  );
}

function chooseCombobox(name: string, option: string) {
  const combobox = screen.getByRole("combobox", { name });
  fireEvent.focus(combobox);
  fireEvent.mouseDown(screen.getByRole("option", { name: option }));
}

describe("SpecRuntimeEditor sandbox section", () => {
  it("renders only public modes published by the selected backend schema", () => {
    render(<Harness />);
    expect(within(sandboxModes()).getAllByRole("radio")).toHaveLength(4);
    for (const label of ["Off", "Native", "Docker", "Git Agent"]) {
      expect(
        within(sandboxModes()).getByRole("radio", {
          name: new RegExp(`^${label}(?:\\s|$)`),
        }),
      ).toBeInTheDocument();
    }
    expect(screen.queryByText("Sandbox Runtime")).toBeNull();
    expect(screen.queryByText("Local")).toBeNull();
  });

  it("does not require an adapter catalog to render schema-owned modes", () => {
    render(<Harness />);
    expect(sandboxModes()).toBeInTheDocument();
  });

  it("renders native settings from the selected backend schema", () => {
    render(<Harness />);
    chooseMode("Native");
    expect(
      screen.getByRole("radiogroup", { name: "Permission posture" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", { name: "Require native sandbox" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "Filesystem access" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radiogroup", { name: "Network access" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Execution identity")).toBeNull();
  });

  it("hides native fields not present in the active provider schema", () => {
    render(<Harness initial={{ backend: "codex-cli" }} />);
    chooseMode("Native");
    expect(
      screen.queryByRole("checkbox", { name: "Require native sandbox" }),
    ).toBeNull();
    expect(
      within(
        screen.getByRole("radiogroup", { name: "Network access" }),
      ).queryByRole("radio", { name: "restricted" }),
    ).toBeNull();
  });

  it("moves posture into sandbox and collapses equivalent provider aliases", () => {
    render(<Harness initial={{ backend: "codex-cli" }} />);
    chooseMode("Native");
    expect(
      screen.getAllByRole("radio", { name: "Ask for approval" }),
    ).toHaveLength(1);
    fireEvent.click(screen.getByRole("radio", { name: "Plan" }));
    expect(screen.getByLabelText("Runtime value")).toHaveTextContent(
      JSON.stringify({
        backend: "codex-cli",
        sandbox: { mode: "native", approval: "plan" },
      }),
    );
  });

  it("clears native policy when switching to docker but preserves posture", () => {
    render(
      <Harness
        initial={{
          backend: "claude-cli",
          sandbox: {
            mode: "native",
            approval: "plan",
            policy: { filesystem: { access: "read-only" } },
          },
        }}
        catalog={CATALOG}
      />,
    );
    chooseMode("Docker");
    expect(screen.getByLabelText("Runtime value")).toHaveTextContent(
      JSON.stringify({
        backend: "claude-cli",
        sandbox: { mode: "docker", approval: "plan" },
      }),
    );
  });

  it("filters configured backends by mode and pins dispatchable Git agents", () => {
    render(<Harness catalog={CATALOG} />);
    chooseMode("Docker");
    chooseCombobox("Sandbox backend", "docker-safe");
    expect(screen.queryByText("prod-pool")).toBeNull();

    chooseMode("Git Agent");
    chooseCombobox("Sandbox backend", "prod-pool");
    chooseCombobox("Pinned agent", "worker-01");
    expect(screen.queryByRole("option", { name: "worker-02" })).toBeNull();
    expect(screen.getByLabelText("Runtime value")).toHaveTextContent(
      JSON.stringify({
        backend: "claude-cli",
        sandbox: {
          mode: "git-agent",
          backend: "prod-pool",
          agent: "worker-01",
        },
      }),
    );
  });
});
