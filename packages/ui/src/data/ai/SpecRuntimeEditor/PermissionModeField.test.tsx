import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import { PermissionModeField } from "./PermissionModeField";

const FAMILIES: SpecRuntimeFamily[] = [
  {
    id: "codex",
    label: "Codex",
    provider: "codex-agent",
    modes: [
      {
        id: "agent",
        label: "Agent",
        backend: "codex-agent",
        permissions: {
          modes: {
            default: {
              kind: "approximated",
              effects: { sandbox: "read-only", approval: "on-request" },
            },
            plan: {
              kind: "approximated",
              effects: {
                sandbox: "read-only",
                approval: "on-request",
                note: "escalations are refused while planning",
              },
            },
            acceptEdits: {
              kind: "approximated",
              effects: {
                sandbox: "workspace-write",
                approval: "on-request",
              },
            },
            auto: {
              kind: "approximated",
              effects: {
                sandbox: "workspace-write",
                approval: "on-request",
              },
            },
            bypassPermissions: {
              kind: "approximated",
              effects: { sandbox: "danger-full-access", approval: "never" },
            },
            dontAsk: { kind: "unsupported" },
          },
          toolPolicies: {},
          resources: {},
        },
      },
    ],
  },
];

describe("PermissionModeField", () => {
  it("offers only permission postures implemented by the selected backend", () => {
    const onChange = vi.fn();
    render(
      <PermissionModeField
        value={{ backend: "codex-agent", permissions: { mode: "default" } }}
        onChange={onChange}
        families={FAMILIES}
      />,
    );

    expect(
      screen.queryByRole("combobox", { name: "Permission mode" }),
    ).toBeNull();
    expect(
      screen.getByRole("radiogroup", { name: "Permission posture" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Read only" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Ask for approval" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("radio", { name: "Ask for approval" }),
    ).toHaveLength(1);
    expect(
      screen.getByRole("radio", { name: "Full access" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Don't ask" })).toBeNull();

    fireEvent.click(screen.getByRole("radio", { name: "Plan" }));
    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-agent",
      permissions: { mode: "plan" },
    });
  });

  it("shows one automatic posture when accept-edits and auto have identical approximated effects", () => {
    const onChange = vi.fn();
    render(
      <PermissionModeField
        value={{ backend: "codex-agent", permissions: { mode: "default" } }}
        onChange={onChange}
        families={[
          {
            id: "codex",
            label: "Codex",
            provider: "codex-agent",
            modes: [
              {
                id: "agent",
                label: "Agent",
                backend: "codex-agent",
                permissions: {
                  modes: {
                    default: { kind: "approximated" },
                    acceptEdits: {
                      kind: "approximated",
                      effects: {
                        sandbox: "workspace-write",
                        approval: "on-request",
                        note: "workspace writes are granted as one tier",
                      },
                    },
                    auto: {
                      kind: "approximated",
                      effects: {
                        sandbox: "workspace-write",
                        approval: "on-request",
                        note: "auto and accept-edits resolve identically",
                      },
                    },
                  },
                  toolPolicies: {},
                  resources: {},
                },
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.queryByRole("radio", { name: "Accept edits" })).toBeNull();
    expect(screen.queryByRole("radio", { name: "Auto" })).toBeNull();
    const automatic = screen.getByRole("radio", { name: "Ask for approval" });
    fireEvent.click(automatic);
    expect(onChange).toHaveBeenCalledWith({
      backend: "codex-agent",
      permissions: { mode: "acceptEdits" },
    });
  });

  it("preserves a selected codex alias while presenting one native posture", () => {
    render(
      <PermissionModeField
        value={{ backend: "codex-agent", permissions: { mode: "auto" } }}
        onChange={vi.fn()}
        families={FAMILIES}
      />,
    );

    expect(
      screen.getByRole("radio", { name: "Ask for approval" }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("keeps claude native postures distinct and uses its mode tones", () => {
    render(
      <PermissionModeField
        value={{ backend: "claude-cli", permissions: { mode: "plan" } }}
        onChange={vi.fn()}
        families={[
          {
            id: "claude",
            label: "Claude",
            provider: "claude-agent",
            modes: [
              {
                id: "cli",
                label: "CLI",
                backend: "claude-cli",
                permissions: {
                  modes: {
                    default: { kind: "native" },
                    plan: {
                      kind: "native",
                      effects: { flag: "--permission-mode plan" },
                    },
                    acceptEdits: {
                      kind: "native",
                      effects: { flag: "--permission-mode acceptEdits" },
                    },
                    auto: {
                      kind: "native",
                      effects: { flag: "--permission-mode auto" },
                    },
                    bypassPermissions: {
                      kind: "native",
                      effects: { flag: "--permission-mode bypassPermissions" },
                    },
                    dontAsk: {
                      kind: "native",
                      effects: { flag: "--permission-mode dontAsk" },
                    },
                  },
                  toolPolicies: {},
                  resources: {},
                },
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByRole("radio", { name: "Manual" })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Accept edits" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Auto" })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Bypass permissions" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Don't ask" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Plan" })).toHaveClass(
      "bg-teal-100",
    );
  });

  it("uses Gemini mode names and collapses both published aliases", () => {
    const onChange = vi.fn();
    const geminiModes = {
      default: { kind: "native" as const },
      plan: {
        kind: "native" as const,
        effects: { flag: "--approval-mode plan" },
      },
      acceptEdits: {
        kind: "approximated" as const,
        effects: { flag: "--approval-mode auto_edit" },
      },
      auto: {
        kind: "approximated" as const,
        effects: { flag: "--approval-mode auto_edit" },
      },
      bypassPermissions: {
        kind: "native" as const,
        effects: { flag: "--approval-mode yolo" },
      },
      dontAsk: {
        kind: "approximated" as const,
        effects: { flag: "--approval-mode yolo" },
      },
    };
    render(
      <PermissionModeField
        value={{ backend: "gemini-cli", permissions: { mode: "default" } }}
        onChange={onChange}
        families={[
          {
            id: "gemini",
            label: "Gemini",
            provider: "googleai",
            modes: [
              {
                id: "cli",
                label: "CLI",
                backend: "gemini-cli",
                permissions: {
                  modes: geminiModes,
                  toolPolicies: {},
                  resources: {},
                },
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByRole("radio", { name: "Manual" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio", { name: "Auto edit" })).toHaveLength(1);
    expect(screen.getAllByRole("radio", { name: "YOLO" })).toHaveLength(1);
    expect(screen.getByRole("radio", { name: "Plan" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "YOLO" }));
    expect(onChange).toHaveBeenCalledWith({
      backend: "gemini-cli",
      permissions: { mode: "bypassPermissions" },
    });
  });

  it("preserves a selected Gemini approximation inside a collapsed native posture", () => {
    render(
      <PermissionModeField
        value={{ backend: "gemini-cli", permissions: { mode: "dontAsk" } }}
        onChange={vi.fn()}
        families={[
          {
            id: "gemini",
            label: "Gemini",
            provider: "googleai",
            modes: [
              {
                id: "cli",
                label: "CLI",
                backend: "gemini-cli",
                permissions: {
                  modes: {
                    bypassPermissions: {
                      kind: "native",
                      effects: { flag: "--approval-mode yolo" },
                    },
                    dontAsk: {
                      kind: "approximated",
                      effects: { flag: "--approval-mode yolo" },
                    },
                  },
                  toolPolicies: {},
                  resources: {},
                },
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByRole("radio", { name: "YOLO" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("uses the resolved backend when the editable spec inherits it", () => {
    render(
      <PermissionModeField
        value={{ permissions: { mode: "plan" } }}
        effectiveBackend="codex-agent"
        onChange={vi.fn()}
        families={FAMILIES}
      />,
    );

    expect(
      screen.getByRole("radiogroup", { name: "Permission posture" }),
    ).toBeInTheDocument();
  });

  it("hides the field when the backend publishes no selectable postures", () => {
    render(
      <PermissionModeField
        value={{ backend: "openai" }}
        onChange={vi.fn()}
        families={[
          {
            id: "openai",
            label: "OpenAI",
            provider: "openai",
            modes: [
              {
                id: "api",
                label: "API",
                backend: "openai",
                permissions: {
                  modes: { default: { kind: "unsupported" } },
                  toolPolicies: {},
                  resources: {},
                },
              },
            ],
          },
        ]}
      />,
    );

    expect(
      screen.queryByRole("radiogroup", { name: "Permission posture" }),
    ).toBeNull();
  });

  it("preserves an unavailable persisted posture and reports it as invalid", () => {
    const onChange = vi.fn();
    render(
      <PermissionModeField
        value={{
          backend: "codex-agent",
          permissions: { mode: "dontAsk" },
        }}
        onChange={onChange}
        families={FAMILIES}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Don't ask is not available for Codex Agent",
    );
    expect(screen.queryByRole("radio", { name: "Don't ask" })).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("requires backend context for a persisted posture", () => {
    render(
      <PermissionModeField
        value={{ permissions: { mode: "plan" } }}
        onChange={vi.fn()}
        families={FAMILIES}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Permission posture requires a backend context",
    );
  });
});
