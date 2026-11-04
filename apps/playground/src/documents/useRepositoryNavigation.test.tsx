import { act, cleanup, render, renderHook, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AppShellNavGroup } from "@flanksource/clicky-ui";
import type { DirectoryEntry, DocumentRepository } from "./types";
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
  directoryEntries: vi.fn(),
  refreshDocumentProblems: vi.fn(),
}));

vi.mock("./api", () => ({ directoryEntries: mocks.directoryEntries }));
const catalog = { repositories: [repository], error: null };
vi.mock("./catalog", () => ({ useRepositoryCatalog: () => catalog }));
vi.mock("../prompt-runs/PromptRunsProvider", () => ({
  usePromptRuns: () => ({ openPrompt: vi.fn() }),
}));
vi.mock("./problems", () => ({
  refreshDocumentProblems: mocks.refreshDocumentProblems,
  useDocumentProblems: () => ({ results: {}, error: null }),
}));
vi.mock("./DocumentProblemBadge", () => ({ DocumentProblemBadge: () => null }));
vi.mock("./RepositoryDialogs", () => ({
  RepositoryFolderSettings: () => null,
  RepositoryPicker: () => null,
}));
vi.mock("./OpenRepositoryDocument", () => ({ OpenRepositoryDocument: () => null }));

import { useRepositoryNavigation } from "./useRepositoryNavigation";

const entry = (path: string, directory: boolean): DirectoryEntry => ({
  path,
  name: path.split("/").at(-1)!,
  directory,
  visible: true,
});

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

const docsChildLabels = (section: { groups?: AppShellNavGroup[] }) =>
  section.groups
    ?.find((g) => g.key === `docs:${repositoryId}/docs`)
    ?.groups?.map((g) => g.label);

beforeEach(() => {
  mocks.refreshDocumentProblems.mockResolvedValue(undefined);
  mocks.directoryEntries.mockImplementation(
    async ({ path }: { path: string }) =>
      ({
        docs: [entry("docs/guides", true)],
        "docs/guides": [entry("docs/guides/a.md", false)],
      })[path] ?? [],
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
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

  it("reveals from the containing folder with its overrides and fills the cache key the tree reads", async () => {
    const { result } = renderHook(() =>
      useRepositoryNavigation({ activeSlug: docSlug, pageHref }),
    );
    await waitFor(() => expect(mocks.directoryEntries).toHaveBeenCalledTimes(2));
    expect(mocks.directoryEntries.mock.calls.map(([input]) => input)).toEqual([
      expect.objectContaining({ path: "docs", overrides: ["*.draft.md"], overrideDirectory: "docs" }),
      expect.objectContaining({ path: "docs/guides", overrides: ["*.draft.md"], overrideDirectory: "docs" }),
    ]);
    await waitFor(() => {
      const docs = result.current.section.groups?.find((g) => g.key === "docs:" + repositoryId + "/docs");
      expect(docs?.groups?.[0]?.items?.map((item) => item.label)).toEqual(["a.md"]);
    });
    const root = result.current.section.groups?.find((g) => g.key === `.:${repositoryId}/.`);
    expect(root?.groups).toEqual([]);
  });

  it("does not reload folders or refresh problems when navigating to a non-document page", async () => {
    const { result, rerender } = renderHook(
      ({ activeSlug }) => useRepositoryNavigation({ activeSlug, pageHref }),
      { initialProps: { activeSlug: "page:button" as string | undefined } },
    );
    const version = result.current.section.childrenVersion;
    rerender({ activeSlug: "page:card" });
    expect(mocks.directoryEntries).not.toHaveBeenCalled();
    expect(mocks.refreshDocumentProblems).not.toHaveBeenCalled();
    expect(result.current.section.childrenVersion).toBe(version);
  });

  it("refreshes problems for a document slug without bumping the folder reload version", async () => {
    const { result } = renderHook(() =>
      useRepositoryNavigation({ activeSlug: docSlug, pageHref }),
    );
    await waitFor(() => expect(mocks.directoryEntries).toHaveBeenCalledTimes(2));
    expect(mocks.refreshDocumentProblems).toHaveBeenCalledTimes(1);
    expect(result.current.section.childrenVersion).toBe(0);
  });

  it("keeps the newer reveal's entries when a cancelled reveal's slower response lands last", async () => {
    const slow = deferred<DirectoryEntry[]>();
    mocks.directoryEntries
      .mockImplementationOnce(() => slow.promise)
      .mockImplementationOnce(async () => [entry("docs/fresh", true)]);
    const { result, rerender } = renderHook(
      ({ activeSlug }) => useRepositoryNavigation({ activeSlug, pageHref }),
      { initialProps: { activeSlug: `document:${repositoryId}/docs/a.md` as string | undefined } },
    );
    await waitFor(() => expect(mocks.directoryEntries).toHaveBeenCalledTimes(1));
    rerender({ activeSlug: `document:${repositoryId}/docs/b.md` });
    await waitFor(() => expect(docsChildLabels(result.current.section)).toEqual(["fresh"]));
    await act(async () => {
      slow.resolve([entry("docs/stale", true)]);
      await slow.promise;
    });
    expect(docsChildLabels(result.current.section)).toEqual(["fresh"]);
  });

  it("only lets the latest request for a directory write the cache", async () => {
    const first = deferred<DirectoryEntry[]>();
    const second = deferred<DirectoryEntry[]>();
    const { result } = renderHook(() =>
      useRepositoryNavigation({ activeSlug: "page:button", pageHref }),
    );
    const docs = result.current.section.groups!.find((g) => g.key === `docs:${repositoryId}/docs`)!;
    mocks.directoryEntries
      .mockImplementationOnce(() => first.promise)
      .mockImplementationOnce(() => second.promise);
    const loads = [docs.loadChildren!(), docs.loadChildren!()];
    await act(async () => {
      second.resolve([entry("docs/fresh", true)]);
      await loads[1];
      first.resolve([entry("docs/stale", true)]);
      await loads[0];
    });
    expect(docsChildLabels(result.current.section)).toEqual(["fresh"]);
  });

  it("does not reload expanded folders when the window regains focus", async () => {
    const { result } = renderHook(() =>
      useRepositoryNavigation({ activeSlug: undefined, pageHref }),
    );
    act(() => {
      window.dispatchEvent(new Event("focus"));
    });
    expect(result.current.section.childrenVersion).toBe(0);
    act(() => {
      window.dispatchEvent(new Event("playground:documents-refresh"));
    });
    expect(result.current.section.childrenVersion).toBe(1);
  });

  it("shows the bare error message, then clears it when the slug changes", async () => {
    mocks.directoryEntries.mockRejectedValue(new Error("entries unavailable"));
    const { result, rerender } = renderHook(
      ({ activeSlug }) => useRepositoryNavigation({ activeSlug, pageHref }),
      { initialProps: { activeSlug: docSlug as string | undefined } },
    );
    const shown = render(<>{result.current.controls}</>);
    await waitFor(() => {
      shown.rerender(<>{result.current.controls}</>);
      expect(screen.getByRole("alert").textContent).toBe("entries unavailable");
    });
    rerender({ activeSlug: "page:button" });
    shown.rerender(<>{result.current.controls}</>);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("returns controls without dialogs, hidden in the collapsed rail, and dialogs separately", () => {
    const { result } = renderHook(() =>
      useRepositoryNavigation({ activeSlug: undefined, pageHref }),
    );
    expect(Object.keys(result.current).sort()).toEqual(["controls", "dialogs", "section"]);
    const { container } = render(<>{result.current.controls}</>);
    expect(container.firstElementChild?.className).toContain("[[data-collapsed=true]_&]:hidden");
    expect(screen.getByRole("button", { name: "Add repository" })).toBeTruthy();
  });
});
