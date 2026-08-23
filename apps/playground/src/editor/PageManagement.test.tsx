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
import { deletePage, movePage } from "./page-api";

vi.mock("./page-api", () => ({
  createFolder: vi.fn(),
  createPage: vi.fn(),
  deletePage: vi.fn(),
  movePage: vi.fn(),
}));

const active: PageEntry = {
  slug: "designs/review",
  title: "Design review",
  group: "Designs",
  load: () => Promise.resolve({}),
};

function renderDialog(action: "rename" | "delete") {
  const onNavigate = vi.fn();
  const fallbackAfterDelete = vi.fn().mockReturnValue("welcome");
  render(
    <PageManagementDialogs
      action={action}
      active={active}
      folders={["designs"]}
      commentCount={2}
      onClose={vi.fn()}
      onFolderCreated={vi.fn()}
      onNavigate={onNavigate}
      fallbackAfterDelete={fallbackAfterDelete}
    />,
  );
  return { fallbackAfterDelete, onNavigate };
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
    expect(fallbackAfterDelete).toHaveBeenCalledWith(active.slug);
    expect(onNavigate).toHaveBeenCalledWith("welcome");
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
        onNavigate={vi.fn()}
        fallbackAfterDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Folder" }).textContent,
    ).toContain("designs/archive");
  });
});
