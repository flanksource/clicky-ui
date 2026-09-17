import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SessionChatComposer } from "./SessionChatComposer";
import type { SpecPermissionMode } from "./SpecRuntimeEditor.model";

const capabilities = {
  interrupt: true,
  steer: false,
  followUp: true,
  resume: true,
};

const PERMISSION_MODES: SpecPermissionMode[] = ["default", "plan", "auto"];

describe("SessionChatComposer", () => {
  it("renders a host accessory on the same row as the prompt input", () => {
    render(
      <SessionChatComposer
        status="idle"
        capabilities={capabilities}
        inputAccessory={<label>Target model</label>}
        onSubmit={vi.fn()}
      />,
    );

    const textbox = screen.getByRole("textbox");
    expect(screen.getByText("Target model").parentElement).toBe(
      textbox.parentElement,
    );
  });

  it("renders host controls inside the prompt toolbar", () => {
    render(
      <SessionChatComposer
        status="idle"
        capabilities={capabilities}
        toolbar={<label>Target model</label>}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByText("Target model")).toBeInTheDocument();
  });

  it("shows queued messages and accepts a follow-up during a running turn", () => {
    const onSubmit = vi.fn();
    render(
      <SessionChatComposer
        status="running"
        capabilities={capabilities}
        queued={[{ messageId: "m1", text: "after this" }]}
        onSubmit={onSubmit}
        onInterrupt={vi.fn()}
      />,
    );

    expect(screen.getByText("Queued: after this")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "next" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledWith("next");
  });
});

describe("SessionChatComposer permission mode picker", () => {
  it("renders the current mode and only the allowed options", () => {
    render(
      <SessionChatComposer
        status="idle"
        capabilities={capabilities}
        onSubmit={vi.fn()}
        permissionMode="plan"
        permissionModes={PERMISSION_MODES}
        onPermissionModeChange={vi.fn()}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Permission mode" });
    expect(select).toHaveValue("plan");
    const optionLabels = screen
      .getAllByRole("option")
      .map((option) => (option as HTMLOptionElement).value);
    expect(optionLabels).toEqual(PERMISSION_MODES);
  });

  it("calls onPermissionModeChange when a new mode is selected", () => {
    const onPermissionModeChange = vi.fn();
    render(
      <SessionChatComposer
        status="idle"
        capabilities={capabilities}
        onSubmit={vi.fn()}
        permissionMode="default"
        permissionModes={PERMISSION_MODES}
        onPermissionModeChange={onPermissionModeChange}
      />,
    );

    fireEvent.change(
      screen.getByRole("combobox", { name: "Permission mode" }),
      { target: { value: "auto" } },
    );
    expect(onPermissionModeChange).toHaveBeenCalledWith("auto");
  });

  it("is read-only when onPermissionModeChange is absent", () => {
    render(
      <SessionChatComposer
        status="idle"
        capabilities={capabilities}
        onSubmit={vi.fn()}
        permissionMode="default"
        permissionModes={PERMISSION_MODES}
      />,
    );

    const select = screen.getByRole("combobox", { name: "Permission mode" });
    expect(select).toBeDisabled();
    expect(select).toHaveValue("default");
  });

  it.each(["starting", "interrupting", "stopping"] as const)(
    "is read-only while status is %s even with a handler",
    (status) => {
      render(
        <SessionChatComposer
          status={status}
          capabilities={capabilities}
          onSubmit={vi.fn()}
          permissionMode="default"
          permissionModes={PERMISSION_MODES}
          onPermissionModeChange={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("combobox", { name: "Permission mode" }),
      ).toBeDisabled();
    },
  );

  it("does not render the picker when permissionModes is empty", () => {
    render(
      <SessionChatComposer
        status="idle"
        capabilities={capabilities}
        onSubmit={vi.fn()}
        permissionMode="default"
        permissionModes={[]}
        onPermissionModeChange={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("combobox", { name: "Permission mode" }),
    ).not.toBeInTheDocument();
  });

  it.each([
    ["claude", ["Manual", "Plan", "Auto"]],
    ["codex", ["Read only", "Plan", "Auto review"]],
  ])("labels each option in the %s family's vocabulary", (family, labels) => {
    render(
      <SessionChatComposer
        status="idle"
        capabilities={capabilities}
        onSubmit={vi.fn()}
        permissionMode="default"
        permissionModes={PERMISSION_MODES}
        permissionFamily={family}
        onPermissionModeChange={vi.fn()}
      />,
    );

    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(labels);
  });

  it("still renders the host toolbar alongside the picker", () => {
    render(
      <SessionChatComposer
        status="idle"
        capabilities={capabilities}
        onSubmit={vi.fn()}
        permissionMode="default"
        permissionModes={PERMISSION_MODES}
        onPermissionModeChange={vi.fn()}
        toolbar={<label>Target model</label>}
      />,
    );

    expect(screen.getByText("Target model")).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", { name: "Permission mode" }),
    ).toBeInTheDocument();
  });
});
