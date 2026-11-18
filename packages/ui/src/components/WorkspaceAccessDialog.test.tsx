import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { WorkspaceAccessDialog } from "./WorkspaceAccessDialog";
import type { WorkspaceAccessClient } from "./workspace-access-client";
it("requires a reviewed path before granting and opening", async () => {
  const root = {
    id: "grant",
    path: "/workspace/docs",
    source: "saved" as const,
    available: true,
  };
  const client: WorkspaceAccessClient = {
    list: vi.fn(async () => ({ roots: [], canManage: true })),
    preview: vi.fn(async () => ({ path: root.path })),
    grant: vi.fn(async () => root),
    revoke: vi.fn(),
    subscribe: () => () => {},
  };
  const open = vi.fn(async () => {});
  const enteredPath = "/linked/docs";
  render(
    <WorkspaceAccessDialog
      client={client}
      onClose={() => {}}
      onOpenFolder={open}
    />
  );
  expect(screen.queryByRole("button", { name: "Grant and open" })).toBeNull();
  fireEvent.change(screen.getByLabelText("Folder path"), {
    target: { value: enteredPath },
  });
  fireEvent.click(screen.getByRole("button", { name: "Review access" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Grant and open" })
  );
  await waitFor(() => expect(open).toHaveBeenCalledWith(enteredPath));
  expect(client.grant).toHaveBeenCalledWith(enteredPath, root.path);
});
