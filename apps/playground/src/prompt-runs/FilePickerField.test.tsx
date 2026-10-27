// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FilePickerField } from "./FilePickerField";
import type { WorkspaceFile } from "./prompt-runs-api";

const SEED = "apps/playground/src/prompt-runs/seed.ts";
const DIALOG = "apps/playground/src/prompt-runs/RunPromptDialog.tsx";
const BUTTON = "packages/ui/src/components/button.tsx";
const FILES: WorkspaceFile[] = [{ path: DIALOG, status: "M" }, { path: SEED }, { path: BUTTON }];

function renderField(loadFiles: () => Promise<WorkspaceFile[]>, value: string[] = [SEED]) {
  const onChange = vi.fn();
  render(<FilePickerField value={value} onChange={onChange} multiple suggested={[SEED]} loadFiles={loadFiles} />);
  return onChange;
}

const browse = async () => {
  const button = await screen.findByRole("button", { name: "Browse…" });
  await vi.waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
  fireEvent.click(button);
  return screen.findByRole("dialog");
};

afterEach(cleanup);

describe("FilePickerField", () => {
  it("adds a git change picked in Browse… to the files already chosen", async () => {
    const onChange = renderField(async () => FILES);
    const dialog = await browse();
    fireEvent.click(within(dialog).getByRole("checkbox", { name: DIALOG }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Select" }));
    expect(onChange).toHaveBeenCalledWith([SEED, DIALOG]);
  });

  it("walks folders from All files and back through the breadcrumbs", async () => {
    renderField(async () => FILES, []);
    const dialog = await browse();
    fireEvent.click(within(dialog).getByRole("tab", { name: /All files/ }));
    fireEvent.click(within(dialog).getByRole("button", { name: /^packages/ }));
    fireEvent.click(within(dialog).getByRole("button", { name: /^ui/ }));
    fireEvent.click(within(dialog).getByRole("button", { name: /^src/ }));
    fireEvent.click(within(dialog).getByRole("button", { name: /^components/ }));
    expect(within(dialog).getByRole("checkbox", { name: BUTTON })).toBeTruthy();
    fireEvent.click(within(within(dialog).getByRole("navigation", { name: "Folder" })).getByRole("button", { name: "All files" }));
    expect(within(dialog).getByRole("button", { name: /^apps/ })).toBeTruthy();
  });

  it("searches every file from the dialog, ignoring the tabs", async () => {
    renderField(async () => FILES, []);
    const dialog = await browse();
    fireEvent.change(within(dialog).getByPlaceholderText("Search all files"), { target: { value: "button" } });
    expect(within(dialog).getByText("1 match")).toBeTruthy();
    expect(within(dialog).getByRole("checkbox", { name: BUTTON })).toBeTruthy();
  });

  it("says why the file list is missing and recovers on Retry", async () => {
    const loadFiles = vi
      .fn<() => Promise<WorkspaceFile[]>>()
      .mockRejectedValueOnce(new Error("git could not list /repo"))
      .mockResolvedValue(FILES);
    renderField(loadFiles);
    expect(await screen.findByText(/Couldn't list the workspace files: git could not list \/repo/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await browse();
    expect(loadFiles).toHaveBeenCalledTimes(2);
  });
});
