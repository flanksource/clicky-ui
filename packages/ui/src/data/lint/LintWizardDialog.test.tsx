import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LintWizardDialog, type LintWizardDialogProps } from "./LintWizardDialog";

const PROPS: Omit<LintWizardDialogProps, "onRun" | "onClose"> = {
  open: true,
  target: "products/schemas",
  paths: ["products/schemas"],
  linters: [{ value: "jsonlint" }, { value: "markdownlint" }],
  prompts: [{ value: "review.prompt", label: "Schema review" }],
  models: [{ value: "agent:sonnet" }],
};

const next = () => fireEvent.click(screen.getByRole("button", { name: "Next" }));
const command = () => document.querySelector("[data-lint-command]")?.textContent;

describe("LintWizardDialog", () => {
  it("runs the linters path with every detected linter and the toggled options, previewing the command first", async () => {
    const onRun = vi.fn();
    const onClose = vi.fn();
    render(<LintWizardDialog {...PROPS} onRun={onRun} onClose={onClose} />);

    const nextBeforeMethod = screen.getByRole("button", { name: "Next" }).hasAttribute("disabled");
    fireEvent.click(screen.getByRole("radio", { name: /Linters/ }));
    next();
    fireEvent.click(screen.getByRole("switch", { name: /Auto-fix/ }));
    fireEvent.click(screen.getByRole("switch", { name: "Changed files only" }));
    next();
    const preview = command();
    fireEvent.click(screen.getByRole("button", { name: "Run linters" }));
    await waitFor(() => expect(onClose).toHaveBeenCalled());

    expect({ nextBeforeMethod, preview, request: onRun.mock.calls[0]?.[0] }).toEqual({
      nextBeforeMethod: true,
      preview: "gavel lint --fix --changed products/schemas",
      request: { method: "linters", paths: ["products/schemas"], fix: true, exclude: [], changed: true },
    });
  });

  it("asks for a prompt on the AI path and keeps the dialog open with the error when the run fails to start", async () => {
    const onRun = vi.fn(() => Promise.reject(new Error("captain is not configured")));
    const onClose = vi.fn();
    render(<LintWizardDialog {...PROPS} onRun={onRun} onClose={onClose} />);

    fireEvent.click(screen.getByRole("radio", { name: /AI review/ }));
    next();
    const nextWithoutPrompt = screen.getByRole("button", { name: "Next" }).hasAttribute("disabled");
    fireEvent.focus(screen.getByRole("combobox", { name: "Review prompt" }));
    fireEvent.mouseDown(screen.getByRole("option", { name: /Schema review/ }));
    fireEvent.click(screen.getByRole("switch", { name: /AI fix/ }));
    next();
    const preview = command();
    fireEvent.click(screen.getByRole("button", { name: "Start review" }));

    expect({
      nextWithoutPrompt,
      preview,
      alert: (await screen.findByRole("alert")).textContent,
      closed: onClose.mock.calls.length,
    }).toEqual({
      nextWithoutPrompt: true,
      preview: "gavel lint prompt --ai-fix review.prompt products/schemas",
      alert: "captain is not configured",
      closed: 0,
    });
  });
});
