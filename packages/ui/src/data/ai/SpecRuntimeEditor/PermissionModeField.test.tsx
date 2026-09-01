import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import { SPEC_PERMISSION_MODES } from "../SpecRuntimeEditor.model";
import { PermissionModeField } from "./PermissionModeField";

const ALL_MODES = [...SPEC_PERMISSION_MODES];
const CODEX_MODES = ALL_MODES.filter((mode) => mode !== "dontAsk");

const FAMILIES: SpecRuntimeFamily[] = [
  {
    id: "codex",
    label: "Codex",
    provider: "openai",
    modes: [
      {
        id: "agent",
        label: "Agent",
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
  it("offers only permission postures implemented by the selected runtime", () => {
    const onChange = vi.fn();
    render(
      <PermissionModeField
        value={{
          mode: "agent",
          sandbox: { mode: "native", approval: "default" },
        }}
        onChange={onChange}
        families={FAMILIES}
        availableModes={CODEX_MODES}
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
      mode: "agent",
      sandbox: { mode: "native", approval: "plan" },
    });
  });

  it("shows one automatic posture when accept-edits and auto have identical approximated effects", () => {
    const onChange = vi.fn();
    render(
      <PermissionModeField
        value={{
          mode: "agent",
          sandbox: { mode: "native", approval: "default" },
        }}
        onChange={onChange}
        availableModes={["default", "acceptEdits", "auto"]}
        families={[
          {
            id: "codex",
            label: "Codex",
            provider: "codex-agent",
            modes: [
              {
                id: "agent",
                label: "Agent",
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
      mode: "agent",
      sandbox: { mode: "native", approval: "acceptEdits" },
    });
  });

  it("preserves a selected codex alias while presenting one native posture", () => {
    render(
      <PermissionModeField
        value={{
          mode: "agent",
          sandbox: { mode: "native", approval: "auto" },
        }}
        onChange={vi.fn()}
        families={FAMILIES}
        availableModes={CODEX_MODES}
      />,
    );

    expect(
      screen.getByRole("radio", { name: "Ask for approval" }),
    ).toHaveAttribute("aria-checked", "true");
  });

  it("keeps claude native postures distinct and uses its mode tones", () => {
    render(
      <PermissionModeField
        value={{
          mode: "cli",
          sandbox: { mode: "native", approval: "plan" },
        }}
        onChange={vi.fn()}
        availableModes={ALL_MODES}
        families={[
          {
            id: "claude",
            label: "Claude",
            provider: "claude-agent",
            modes: [
              {
                id: "cli",
                label: "CLI",
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
        value={{
          mode: "cli",
          sandbox: { mode: "docker", approval: "default" },
        }}
        onChange={onChange}
        availableModes={ALL_MODES}
        families={[
          {
            id: "gemini",
            label: "Gemini",
            provider: "googleai",
            modes: [
              {
                id: "cli",
                label: "CLI",
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
      mode: "cli",
      sandbox: { mode: "docker", approval: "bypassPermissions" },
    });
  });

  it("preserves a selected Gemini approximation inside a collapsed native posture", () => {
    render(
      <PermissionModeField
        value={{
          mode: "cli",
          sandbox: { mode: "docker", approval: "dontAsk" },
        }}
        onChange={vi.fn()}
        availableModes={["bypassPermissions", "dontAsk"]}
        families={[
          {
            id: "gemini",
            label: "Gemini",
            provider: "googleai",
            modes: [
              {
                id: "cli",
                label: "CLI",
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

  it("uses the resolved mode when the editable spec inherits it", () => {
    render(
      <PermissionModeField
        value={{ sandbox: { mode: "native", approval: "plan" } }}
        effectiveMode="agent"
        onChange={vi.fn()}
        families={FAMILIES}
        availableModes={CODEX_MODES}
      />,
    );

    expect(
      screen.getByRole("radiogroup", { name: "Permission posture" }),
    ).toBeInTheDocument();
  });

  it("hides the field when the runtime publishes no selectable postures", () => {
    render(
      <PermissionModeField
        value={{ mode: "api" }}
        onChange={vi.fn()}
        availableModes={[]}
        families={[
          {
            id: "openai",
            label: "OpenAI",
            provider: "openai",
            modes: [
              {
                id: "api",
                label: "API",
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
          mode: "agent",
          sandbox: { mode: "native", approval: "dontAsk" },
        }}
        onChange={onChange}
        families={FAMILIES}
        availableModes={CODEX_MODES}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Don't ask is not available for Codex Agent",
    );
    expect(screen.queryByRole("radio", { name: "Don't ask" })).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("requires a runtime mode for a persisted posture", () => {
    render(
      <PermissionModeField
        value={{ sandbox: { mode: "native", approval: "plan" } }}
        onChange={vi.fn()}
        families={FAMILIES}
        availableModes={CODEX_MODES}
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Permission posture requires a runtime mode",
    );
  });
});
