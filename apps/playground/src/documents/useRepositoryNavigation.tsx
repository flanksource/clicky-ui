import { useEffect, useRef, useState } from "react";
import {
  Button,
  type AppShellNavGroup,
  type AppShellNavItem,
  type AppShellNavSection,
} from "@flanksource/clicky-ui";
import { UiFolder, UiFileCode } from "@flanksource/clicky-ui/icons";
import { DOCUMENT_ANCHOR } from "@flanksource/clicky-ui";
import { usePromptRuns } from "../prompt-runs/PromptRunsProvider";
import { DocumentProblemBadge } from "./DocumentProblemBadge";
import { refreshDocumentProblems, useDocumentProblems } from "./problems";
import { directoryEntries } from "./api";
import { useRepositoryCatalog } from "./catalog";
import {
  RepositoryFolderSettings,
  RepositoryPicker,
} from "./RepositoryDialogs";
import type {
  DirectoryEntry,
  DocumentRepository,
  RepositoryFolder,
} from "./types";
import {
  containingFolder,
  directoryCacheKey,
  navigationTarget,
  revealPaths,
} from "./repository-navigation";
import { OpenRepositoryDocument } from "./OpenRepositoryDocument";

export function useRepositoryNavigation({
  activeSlug,
  pageHref,
}: {
  activeSlug: string | undefined;
  pageHref: (id: string) => string;
}) {
  const catalog = useRepositoryCatalog();
  const { openPrompt } = usePromptRuns();
  const problems = useDocumentProblems();
  const [picker, setPicker] = useState(false);
  const [openDocument, setOpenDocument] = useState<DocumentRepository>();
  const [settings, setSettings] = useState<{
    repository: DocumentRepository;
    path: string;
  }>();
  const [version, setVersion] = useState(0);
  const [, renderCache] = useState(0);
  const cache = useRef(new Map<string, DirectoryEntry[]>());
  const refresh = () => {
    setVersion((value) => value + 1);
  };
  useEffect(() => {
    window.addEventListener("playground:documents-refresh", refresh);
    return () => {
      window.removeEventListener("playground:documents-refresh", refresh);
    };
  }, []);
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const activeTarget = navigationTarget(activeSlug);
  const activePathIn = (repository: DocumentRepository) =>
    activeTarget?.repositoryId === repository.id ? activeTarget.path : undefined;
  const requestCounters = useRef(new Map<string, number>());
  const load = async ({
    repository,
    path,
    folder,
    isCancelled = () => false,
  }: {
    repository: DocumentRepository;
    path: string;
    folder: RepositoryFolder;
    isCancelled?: () => boolean;
  }) => {
    const target = activePathIn(repository);
    const key = directoryCacheKey({ repositoryId: repository.id, path, folder });
    const requestId = (requestCounters.current.get(key) ?? 0) + 1;
    requestCounters.current.set(key, requestId);
    const entries = (
      await directoryEntries({
        root: repository.root,
        path,
        overrides: folder.overrides,
        overrideDirectory: folder.path,
        includeIgnored: Boolean(target),
      })
    ).filter(
      (entry) =>
        entry.visible ||
        target === entry.path ||
        target?.startsWith(`${entry.path}/`),
    );
    if (isCancelled() || requestCounters.current.get(key) !== requestId)
      return entries;
    cache.current.set(key, entries);
    renderCache((value) => value + 1);
    return entries;
  };
  useEffect(() => {
    setNavigationError(null);
    if (activeSlug?.startsWith("document:")) void refreshDocumentProblems();
    const target = navigationTarget(activeSlug);
    if (!target) return;
    const repository = catalog.repositories.find(
      (repo) => repo.id === target.repositoryId,
    );
    if (!repository) return;
    const folder = containingFolder(repository.folders, target.path);
    if (!folder) return;
    let cancelled = false;
    void (async () => {
      for (const path of revealPaths({ folder, target })) {
        if (cancelled) return;
        await load({ repository, path, folder, isCancelled: () => cancelled });
      }
      if (!cancelled) setNavigationError(null);
    })().catch((cause: unknown) => {
      if (!cancelled)
        setNavigationError(cause instanceof Error ? cause.message : String(cause));
    });
    return () => {
      cancelled = true;
    };
  }, [activeSlug, catalog.repositories]);
  const group = ({
    repository,
    path,
    folder,
  }: {
    repository: DocumentRepository;
    path: string;
    folder: RepositoryFolder;
  }): AppShellNavGroup => {
    const prefix = folder.path;
    const current = activePathIn(repository);
    const children = (entries: DirectoryEntry[]) => ({
      groups: entries
        .filter((entry) => entry.directory)
        .map((entry) => group({ repository, path: entry.path, folder })),
      items: entries
        .filter((entry) => !entry.directory)
        .map((entry): AppShellNavItem => {
          const id = `document:${repository.id}/${entry.path}`;
          return {
            key: `${prefix}:${id}`,
            label: entry.visible ? entry.name : `${entry.name} (ignored)`,
            icon: UiFileCode,
            to: pageHref(id),
            active: id === activeSlug,
            badge: <DocumentProblemBadge repositoryId={repository.id} path={entry.path} />,
          };
        }),
    });
    const folderId = `folder:${repository.id}/${path}`;
    return {
      key: `${prefix}:${repository.id}/${path}`,
      label: path === "." ? repository.name : path.split("/").at(-1)!,
      item: { key: `${prefix}:${folderId}`, label: path === "." ? repository.name : path.split("/").at(-1)!, to: pageHref(folderId), active: activeSlug === folderId, icon: UiFolder },
      icon: UiFolder,
      badge: <DocumentProblemBadge repositoryId={repository.id} path={path} folder />,
      defaultCollapsed: true,
      ...(current && ((path === "." && current !== ".") || current.startsWith(`${path}/`))
        ? { forceExpanded: true }
        : {}),
      ...children(
        cache.current.get(
          directoryCacheKey({ repositoryId: repository.id, path, folder }),
        ) ?? [],
      ),
      loadChildren: async () =>
        children(await load({ repository, path, folder })),
      contextMenu: [
        { label: "Refresh", onSelect: refresh },
        {
          label: "Run prompt linter…",
          onSelect: () => openPrompt({
            page: `folder:${repository.id}/${path}`,
            anchor: DOCUMENT_ANCHOR,
            element: Promise.resolve({ source: `${repository.root}/${path}`, html: "<section>Folder Markdown review</section>" }),
          }),
        },
        {
          label: "Open Markdown by path…",
          onSelect: () => setOpenDocument(repository),
        },
        {
          label: "Sidebar folder and ignore rules…",
          onSelect: () => setSettings({ repository, path }),
        },
      ],
    };
  };
  const section: AppShellNavSection = {
    label: "Repositories",
    variant: "tree",
    childrenVersion: version,
    groups: catalog.repositories.flatMap((repo) =>
      repo.folders.map((folder) =>
        group({ repository: repo, path: folder.path, folder }),
      ),
    ),
    items: [],
  };
  return {
    section,
    controls: (
      <div className="[[data-collapsed=true]_&]:hidden">
        <div className="flex gap-2 p-2">
          <Button size="sm" variant="outline" onClick={() => setPicker(true)}>
            Add repository
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { refresh(); void refreshDocumentProblems(); }}>
            Refresh
          </Button>
        </div>
        {(catalog.error || navigationError || problems.error) && (
          <p role="alert" className="px-2 text-xs text-destructive">
            {catalog.error ?? navigationError ?? problems.error}
          </p>
        )}
      </div>
    ),
    dialogs: (
      <>
        {picker && <RepositoryPicker onClose={() => setPicker(false)} />}
        {settings && (
          <RepositoryFolderSettings
            {...settings}
            onClose={() => setSettings(undefined)}
          />
        )}
        {openDocument && (
          <OpenRepositoryDocument
            repository={openDocument}
            pageHref={pageHref}
            onClose={() => setOpenDocument(undefined)}
          />
        )}
      </>
    ),
  };
}
