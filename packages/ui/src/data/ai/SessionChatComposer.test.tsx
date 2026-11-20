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

const pickerButton = () =>
  screen.getByRole("button", { name: /^Permission mode:/ });

const openPicker = () => {
  fireEvent.click(pickerButton());
  return screen.getAllByRole("menuitem");
};

describe("SessionChatComposer permission mode picker", () => {
  it("sits on the input row, right of the textbox and before Send, as a menu trigger naming the current mode", () => {
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

    const row = screen.getByRole("textbox").parentElement;
    const order = [screen.getByRole("textbox"), pickerButton(), screen.getByRole("button", { name: "Send" })]
      .map((element) => [...(row?.querySelectorAll("*") ?? [])].indexOf(element));
    expect({
      name: pickerButton().getAttribute("aria-label"),
      inRow: row?.contains(pickerButton()),
      ordered: order.every((index, i) => index >= 0 && (i === 0 || index > order[i - 1]!)),
      combobox: screen.queryByRole("combobox"),
    }).toEqual({ name: "Permission mode: Plan", inRow: true, ordered: true, combobox: null });
  });

  it("opens a menu of only the allowed modes, marking the current one", () => {
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

    expect(
      openPicker().map((item) => [item.textContent, item.querySelector("[data-current-mode]") !== null]),
    ).toEqual([["Manual", false], ["Plan", true], ["Auto", false]]);
  });

  it("calls onPermissionModeChange when a new mode is chosen", () => {
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

    fireEvent.click(openPicker()[2]!);
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

    expect(pickerButton()).toBeDisabled();
    expect(pickerButton()).toHaveAttribute("aria-label", "Permission mode: Manual");
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

      expect(pickerButton()).toBeDisabled();
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
      screen.queryByRole("button", { name: /^Permission mode:/ }),
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

    expect(openPicker().map((item) => item.textContent)).toEqual(labels);
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
    expect(pickerButton()).toBeInTheDocument();
  });

  it("disables the input and says why while the host reports a reason", () => {
    const onSubmit = vi.fn();
    render(
      <SessionChatComposer
        status="idle"
        capabilities={capabilities}
        disabledReason="This session cannot be read"
        onSubmit={onSubmit}
      />,
    );

    const textbox = screen.getByRole("textbox");
    expect(textbox).toBeDisabled();
    expect(textbox).toHaveAttribute("placeholder", "This session cannot be read");
    fireEvent.keyDown(textbox, { key: "Enter" });
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
