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
import {
  documentPath,
  type DirectoryEntry,
  type DocumentRepository,
} from "./types";
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
    window.addEventListener("focus", refresh);
    window.addEventListener("playground:documents-refresh", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      window.removeEventListener("playground:documents-refresh", refresh);
    };
  }, []);
  const load = async (
    repository: DocumentRepository,
    path: string,
    overrides: string[],
    overrideDirectory = ".",
  ) => {
    const target = activeSlug?.startsWith(`document:${repository.id}/`)
      ? documentPath(activeSlug).path
      : undefined;
    const entries = (
      await directoryEntries({
        root: repository.root,
        path,
        overrides,
        overrideDirectory,
        includeIgnored: Boolean(target),
      })
    ).filter(
      (entry) =>
        entry.visible ||
        target === entry.path ||
        target?.startsWith(`${entry.path}/`),
    );
    cache.current.set(
      JSON.stringify([repository.id, path, overrides, overrideDirectory]),
      entries,
    );
    renderCache((value) => value + 1);
    return entries;
  };
  useEffect(() => {
    refresh();
    void refreshDocumentProblems();
    if (!activeSlug?.startsWith("document:")) return;
    const target = documentPath(activeSlug);
    const repository = catalog.repositories.find(
      (repo) => repo.id === target.repositoryId,
    );
    if (!repository) return;
    let cancelled = false;
    void (async () => {
      const segments = target.path.split("/").slice(0, -1);
      for (let index = 0; index <= segments.length; index++) {
        if (cancelled) return;
        const path = segments.slice(0, index).join("/") || ".";
        await load(
          repository,
          path,
          repository.folders.find((folder) => folder.path === ".")?.overrides ??
            [],
        );
      }
    })().catch((cause: unknown) => {
      if (!cancelled) setNavigationError(String(cause));
    });
    return () => {
      cancelled = true;
    };
  }, [activeSlug, catalog.repositories]);
  const [navigationError, setNavigationError] = useState<string | null>(null);
  const group = (
    repository: DocumentRepository,
    path: string,
    overrides: string[],
    prefix: string,
  ): AppShellNavGroup => {
    const current = activeSlug?.startsWith(`document:${repository.id}/`)
      ? documentPath(activeSlug).path
      : undefined;
    const children = (entries: DirectoryEntry[]) => ({
      groups: entries
        .filter((entry) => entry.directory)
        .map((entry) => group(repository, entry.path, overrides, prefix)),
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
    return {
      key: `${prefix}:${repository.id}/${path}`,
      label: path === "." ? repository.name : path.split("/").at(-1)!,
      icon: UiFolder,
      badge: <DocumentProblemBadge repositoryId={repository.id} path={path} folder />,
      defaultCollapsed: true,
      ...(current && (path === "." || current.startsWith(`${path}/`))
        ? { forceExpanded: true }
        : {}),
      ...children(
        cache.current.get(
          JSON.stringify([repository.id, path, overrides, prefix]),
        ) ?? [],
      ),
      loadChildren: async () =>
        children(await load(repository, path, overrides, prefix)),
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
        group(repo, folder.path, folder.overrides, folder.path),
      ),
    ),
    items: [],
  };
  return {
    section,
    controls: (
      <>
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
