import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { WorkspaceAccessDialog } from "./WorkspaceAccessDialog";
import type { WorkspaceAccessClient } from "./workspace-access-client";
it("reviews the canonical path and keeps granting separate from opening", async () => {
  const root = {
    id: "grant",
    path: "/workspace/docs",
    source: "saved" as const,
    available: true,
  };
  let granted = false;
  const client: WorkspaceAccessClient = {
    list: vi.fn(async () => ({ roots: granted ? [root] : [], canManage: true })),
    preview: vi.fn(async () => ({ path: root.path })),
    grant: vi.fn(async () => { granted = true; return root; }),
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
  await screen.findByText("No saved folder access.");
  expect(screen.queryByRole("button", { name: "Grant and open" })).toBeNull();
  fireEvent.change(screen.getByLabelText("Folder path"), {
    target: { value: enteredPath },
  });
  fireEvent.click(screen.getByRole("button", { name: "Review access" }));
  fireEvent.click(
    await screen.findByRole("button", { name: "Grant access", exact: true })
  );
  const openFolder = await screen.findByRole("button", { name: "Open folder" });
  expect(open).not.toHaveBeenCalled();
  expect(client.grant).toHaveBeenCalledWith(enteredPath, root.path);
  fireEvent.click(openFolder);
  await waitFor(() => expect(open).toHaveBeenCalledWith(root.path));
});

it("labels session access and confirms revocation in the saved folder row", async () => {
  const revoke = vi.fn(async () => {});
  const client: WorkspaceAccessClient = {
    list: async () => ({ canManage: true, roots: [
      { id: "", path: "/session", source: "command-line", available: true },
      { id: "saved", path: "/saved", source: "saved", available: false },
    ] }),
    preview: vi.fn(), grant: vi.fn(), revoke, subscribe: () => () => {},
  };
  render(<WorkspaceAccessDialog client={client} onClose={() => {}} highlightedPath="/saved" />);
  expect(await screen.findByRole("heading", { name: "This session" })).toBeDefined();
  expect(screen.getByRole("heading", { name: "Saved access" })).toBeDefined();
  expect(screen.getByText("Folder unavailable")).toBeDefined();
  expect(screen.getByText("Approved from this page")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Revoke access to /saved" }));
  expect(revoke).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Revoke access", exact: true }));
  await waitFor(() => expect(revoke).toHaveBeenCalledWith("saved"));
});
