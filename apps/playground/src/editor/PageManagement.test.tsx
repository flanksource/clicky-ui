// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { PageEntry } from "../registry";
import {
  NewPageMenu,
  PageActions,
  PageManagementDialogs,
} from "./PageManagement";
import { PageApiError, deleteFolder, deletePage, movePage } from "./page-api";

vi.mock("./page-api", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./page-api")>()),
  createFolder: vi.fn(),
  createPage: vi.fn(),
  deleteFolder: vi.fn(),
  deletePage: vi.fn(),
  movePage: vi.fn(),
}));

const active: PageEntry = {
  slug: "designs/review",
  title: "Design review",
  group: "Designs",
  load: () => Promise.resolve({}),
  loadGuidance: () => Promise.resolve({ blocks: [] }),
};

function renderDialog(
  action: "rename" | "delete" | "delete-folder",
  extras: { initialFolder?: string; folderImpact?: { pages: number; comments: number } } = {},
) {
  const onNavigate = vi.fn();
  const onFolderDeleted = vi.fn();
  const fallbackAfterDelete = vi.fn().mockReturnValue("welcome");
  render(
    <PageManagementDialogs
      action={action}
      active={active}
      folders={["designs"]}
      commentCount={2}
      {...extras}
      onClose={vi.fn()}
      onFolderCreated={vi.fn()}
      onFolderDeleted={onFolderDeleted}
      onNavigate={onNavigate}
      fallbackAfterDelete={fallbackAfterDelete}
    />,
  );
  return { fallbackAfterDelete, onFolderDeleted, onNavigate };
}

describe("page management", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(cleanup);

  it("renames the filename and literal metadata title together", async () => {
    vi.mocked(movePage).mockResolvedValue({
      slug: "designs/audit",
      movedComments: 2,
      updatedReferences: 4,
      updatedFiles: 3,
    });
    const { onNavigate } = renderDialog("rename");

    fireEvent.change(screen.getByRole("textbox", { name: /Filename/ }), {
      target: { value: "audit" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "Design audit" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(movePage).toHaveBeenCalledWith({
        slug: "designs/review",
        nextSlug: "designs/audit",
        title: "Design audit",
      }),
    );
    expect(onNavigate).toHaveBeenCalledWith("designs/audit");
  });

  it("confirms the exact file and feedback impact before deleting", async () => {
    vi.mocked(deletePage).mockResolvedValue({
      slug: active.slug,
      deletedComments: 2,
    });
    const { fallbackAfterDelete, onNavigate } = renderDialog("delete");

    expect(screen.getByText("src/pages/designs/review.tsx")).toBeTruthy();
    expect(screen.getByText(/also deletes 2 feedback comments/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Delete page" }));

    await waitFor(() => expect(deletePage).toHaveBeenCalledWith(active.slug));
    expect(fallbackAfterDelete).toHaveBeenCalledWith({ slug: active.slug });
    expect(onNavigate).toHaveBeenCalledWith("welcome");
  });

  // Deleting a folder takes pages with it and none of it is in git, so the
  // confirmation has to name the exact cost before the button is pressed.
  it("spells out what a folder delete destroys, then routes off it", async () => {
    vi.mocked(deleteFolder).mockResolvedValue({
      folder: "designs",
      deletedPages: ["designs/review"],
      deletedComments: 2,
    });
    const { fallbackAfterDelete, onFolderDeleted, onNavigate } = renderDialog(
      "delete-folder",
      { initialFolder: "designs", folderImpact: { pages: 3, comments: 2 } },
    );

    expect(screen.getByText("src/pages/designs/")).toBeTruthy();
    expect(screen.getByText(/3 pages and 2 feedback comments/)).toBeTruthy();
    expect(screen.getByText(/cannot be undone/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Delete folder" }));

    await waitFor(() => expect(deleteFolder).toHaveBeenCalledWith("designs"));
    expect(onFolderDeleted).toHaveBeenCalledWith("designs");
    expect(fallbackAfterDelete).toHaveBeenCalledWith({ folder: "designs" });
    expect(onNavigate).toHaveBeenCalledWith("welcome");
  });

  // Agents and editors write src/pages/ too, so the nav can be holding a row
  // whose file is already gone. Reporting "does not exist" and leaving the row
  // there just means the next click fails the same way.
  it("drops a row whose page turned out to be gone, instead of reporting it", async () => {
    vi.mocked(deletePage).mockRejectedValue(
      new PageApiError('page "designs/review" does not exist', 404),
    );
    const { fallbackAfterDelete, onNavigate } = renderDialog("delete");

    fireEvent.click(screen.getByRole("button", { name: "Delete page" }));

    await waitFor(() =>
      expect(fallbackAfterDelete).toHaveBeenCalledWith({ slug: active.slug }),
    );
    expect(onNavigate).toHaveBeenCalledWith("welcome");
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("still reports a failure that is not a missing page", async () => {
    vi.mocked(deletePage).mockRejectedValue(
      new PageApiError("permission denied", 500),
    );
    const { onNavigate } = renderDialog("delete");

    fireEvent.click(screen.getByRole("button", { name: "Delete page" }));

    await waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        "permission denied",
      ),
    );
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("disables page actions while the source buffer is dirty", () => {
    render(
      <>
        <NewPageMenu
          disabled
          disabledReason="Unsaved source"
          onSelect={vi.fn()}
        />
        <PageActions
          disabled
          disabledReason="Unsaved source"
          onSelect={vi.fn()}
        />
      </>,
    );

    for (const name of ["New", "Rename", "Move", "Delete"]) {
      expect(
        (screen.getByRole("button", { name }) as HTMLButtonElement).disabled,
      ).toBe(true);
      expect(screen.getByRole("button", { name }).getAttribute("title")).toBe(
        "Unsaved source",
      );
    }
  });

  it("starts page creation in the folder selected from the context menu", () => {
    render(
      <PageManagementDialogs
        action="new-page"
        active={active}
        initialFolder="designs/archive"
        folders={["designs", "designs/archive"]}
        commentCount={0}
        onClose={vi.fn()}
        onFolderCreated={vi.fn()}
        onFolderDeleted={vi.fn()}
        onNavigate={vi.fn()}
        fallbackAfterDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Folder" }).textContent,
    ).toContain("designs/archive");
  });
});
