import { act, cleanup, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DocumentRepository } from "./types";
import {
  containingFolder,
  directoryCacheKey,
  navigationTarget,
  revealPaths,
} from "./repository-navigation";

const repositoryId = "11111111-1111-1111-1111-111111111111";
const repository: DocumentRepository = {
  id: repositoryId,
  root: "/repo",
  name: "repo",
  folders: [
    { path: ".", overrides: ["root-rule"] },
    { path: "docs", overrides: ["*.draft.md"] },
    { path: "docs/internal", overrides: ["*.secret.md"] },
  ],
};

const mocks = vi.hoisted(() => ({
  refreshDocumentProblems: vi.fn(),
  openPrompt: vi.fn(),
  catalog: { repositories: [] as unknown[], error: null as Error | null, refresh: vi.fn() },
}));

vi.mock("./catalog", () => ({ useRepositoryCatalog: () => mocks.catalog }));
vi.mock("../prompt-runs/PromptRunsProvider", () => ({
  usePromptRuns: () => ({ openPrompt: mocks.openPrompt }),
}));
vi.mock("./problems", () => ({
  refreshDocumentProblems: mocks.refreshDocumentProblems,
  useDocumentProblems: () => ({ results: {}, error: null }),
}));
vi.mock("./RepositoryDialogs", () => ({
  RepositoryFolderSettings: ({ path }: { path: string }) => <p>folder rules for {path}</p>,
  RepositoryPicker: () => <p>repository picker</p>,
}));
vi.mock("./OpenRepositoryDocument", () => ({
  OpenRepositoryDocument: ({ repository }: { repository: { name: string } }) => <p>open markdown in {repository.name}</p>,
}));

import { useRepositoryNavigation } from "./useRepositoryNavigation";

beforeEach(() => {
  mocks.catalog.repositories = [repository];
  mocks.catalog.error = null;
  mocks.refreshDocumentProblems.mockResolvedValue(undefined);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe("repository navigation helpers", () => {
  it.each([
    ["root fallback", "README.md", "."],
    ["nested folder wins over root", "docs/guides/a.md", "docs"],
    ["longest configured folder wins", "docs/internal/x/b.md", "docs/internal"],
    ["folder target equal to a configured folder", "docs", "docs"],
    ["sibling with a shared name prefix is not contained", "docs-old/a.md", "."],
  ])("containingFolder: %s", (_label, target, expected) => {
    expect(containingFolder(repository.folders, target)?.path).toBe(expected);
  });

  it("containingFolder returns undefined when no folder (not even root) matches", () => {
    expect(containingFolder([{ path: "docs", overrides: [] }], "other/a.md")).toBeUndefined();
  });

  it.each([
    ["root folder, document at root", ".", "document:{id}/README.md", ["."]],
    ["root folder, nested document", ".", "document:{id}/docs/guides/a.md", [".", "docs", "docs/guides"]],
    ["docs folder, nested document", "docs", "document:{id}/docs/guides/a.md", ["docs", "docs/guides"]],
    ["docs folder, document directly inside", "docs", "document:{id}/docs/a.md", ["docs"]],
    ["nested folder, folder target", "docs/internal", "folder:{id}/docs/internal/deep", ["docs/internal", "docs/internal/deep"]],
    ["root folder, root folder target", ".", "folder:{id}/.", ["."]],
  ])("revealPaths: %s", (_label, folderPath, slug, expected) => {
    const folder = repository.folders.find((f) => f.path === folderPath)!;
    const target = navigationTarget(slug.replace("{id}", repositoryId))!;
    expect(revealPaths({ folder, target })).toEqual(expected);
  });

  it("directoryCacheKey differs by folder overrides and folder path", () => {
    const [root, docs] = repository.folders as [
      (typeof repository.folders)[number],
      (typeof repository.folders)[number],
    ];
    const keys = [
      directoryCacheKey({ repositoryId, path: "docs", folder: root }),
      directoryCacheKey({ repositoryId, path: "docs", folder: docs }),
    ];
    expect(new Set(keys).size).toBe(2);
  });
});

describe("useRepositoryNavigation", () => {
  const pageHref = (id: string) => `/#${id}`;
  const docSlug = `document:${repositoryId}/docs/guides/a.md`;
  const folderRef = { id: repositoryId, folder: "docs", path: "docs/guides" };

  it("refreshes problems when a document opens, and not for any other page", () => {
    const { rerender } = renderHook(
      ({ activeSlug }) => useRepositoryNavigation({ activeSlug, pageHref }),
      { initialProps: { activeSlug: "page:button" as string | undefined } },
    );
    expect(mocks.refreshDocumentProblems).not.toHaveBeenCalled();
    rerender({ activeSlug: docSlug });
    expect(mocks.refreshDocumentProblems).toHaveBeenCalledTimes(1);
  });

  it("exposes the controls, the dialogs and the folder-menu actions, and no tree of its own", () => {
    const { result } = renderHook(() => useRepositoryNavigation({ activeSlug: undefined, pageHref }));
    expect(Object.keys(result.current).sort()).toEqual(["actions", "controls", "dialogs"]);
    render(<>{result.current.controls}</>);
    expect(screen.getByRole("button", { name: "Add repository" })).toBeTruthy();
  });

  it("shows a catalog failure with copyable details", async () => {
    mocks.catalog.error = Object.assign(new Error("catalog unavailable"), {
      diagnostics: { message: "catalog unavailable", context: [["Endpoint", "/__playground/documents/repositories"]], details: [{ label: "Response", value: "Workspace offline" }] },
    });
    const { result } = renderHook(() => useRepositoryNavigation({ activeSlug: undefined, pageHref }));
    render(<>{result.current.controls}</>);
    expect(screen.getByText("catalog unavailable")).toBeTruthy();
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    fireEvent.click(screen.getByRole("button", { name: "Copy error details" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(writeText.mock.calls[0]?.[0]).toContain("/__playground/documents/repositories");
    expect(writeText.mock.calls[0]?.[0]).toContain("Workspace offline");
  });

  it("Refresh in a folder menu asks the tree to re-read through the documents refresh event", () => {
    const refreshed = vi.fn();
    window.addEventListener("playground:documents-refresh", refreshed);
    const { result } = renderHook(() => useRepositoryNavigation({ activeSlug: undefined, pageHref }));
    result.current.actions.refresh();
    window.removeEventListener("playground:documents-refresh", refreshed);
    expect(refreshed).toHaveBeenCalledTimes(1);
  });

  it("Run prompt linter opens a prompt on the folder's page for the folder's directory", async () => {
    const { result } = renderHook(() => useRepositoryNavigation({ activeSlug: undefined, pageHref }));
    result.current.actions.lint(folderRef);
    const input = mocks.openPrompt.mock.calls[0]?.[0] as { page: string; element: Promise<{ source: string }> };
    expect({ page: input.page, source: (await input.element).source }).toEqual({
      page: `folder:${repositoryId}/docs/guides`,
      source: "/repo/docs/guides",
    });
  });

  it("opens the Markdown-by-path and folder-rules dialogs for the folder's repository", () => {
    const { result } = renderHook(() => useRepositoryNavigation({ activeSlug: undefined, pageHref }));
    const dialogs = render(<>{result.current.dialogs}</>);
    act(() => result.current.actions.openMarkdown(repositoryId));
    dialogs.rerender(<>{result.current.dialogs}</>);
    expect(screen.getByText("open markdown in repo")).toBeTruthy();
    act(() => result.current.actions.editRules(folderRef));
    dialogs.rerender(<>{result.current.dialogs}</>);
    expect(screen.getByText("folder rules for docs/guides")).toBeTruthy();
  });

  it("fails loudly when a menu names a repository the catalog does not hold", () => {
    const { result } = renderHook(() => useRepositoryNavigation({ activeSlug: undefined, pageHref }));
    expect(() => result.current.actions.openMarkdown("22222222-2222-2222-2222-222222222222")).toThrow("is not in the loaded repository list");
  });
});
