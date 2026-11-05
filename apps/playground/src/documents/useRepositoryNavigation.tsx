import { useEffect, useMemo, useState } from "react";
import { Button, ActionError, DOCUMENT_ANCHOR } from "@flanksource/clicky-ui";
import { usePromptRuns } from "../prompt-runs/PromptRunsProvider";
import { DOCUMENTS_REFRESH_EVENT } from "../navigation/refresh";
import type { RepositoryMenuActions } from "../navigation/menus";
import { refreshDocumentProblems, useDocumentProblems } from "./problems";
import { useRepositoryCatalog } from "./catalog";
import {
  RepositoryFolderSettings,
  RepositoryPicker,
} from "./RepositoryDialogs";
import type { DocumentRepository } from "./types";
import { OpenRepositoryDocument } from "./OpenRepositoryDocument";

const requestDocumentsRefresh = () => window.dispatchEvent(new Event(DOCUMENTS_REFRESH_EVENT));

/**
 * The repository side of the sidebar that is not the tree: the add/refresh controls, the dialogs
 * the folder context menus open, and the actions behind those menus. The tree itself comes from
 * `useNavigationTree`.
 */
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
  useEffect(() => {
    if (activeSlug?.startsWith("document:")) void refreshDocumentProblems();
  }, [activeSlug]);

  const actions = useMemo<RepositoryMenuActions>(() => {
    const repositoryById = (id: string) => {
      const repository = catalog.repositories.find((repo) => repo.id === id);
      if (!repository) throw new Error(`Repository ${id} is not in the loaded repository list`);
      return repository;
    };
    return {
      refresh: requestDocumentsRefresh,
      lint: ({ id, path }) => {
        const repository = repositoryById(id);
        openPrompt({
          page: `folder:${id}/${path}`,
          anchor: DOCUMENT_ANCHOR,
          element: Promise.resolve({ source: `${repository.root}/${path}`, html: "<section>Folder Markdown review</section>" }),
        });
      },
      openMarkdown: (id) => setOpenDocument(repositoryById(id)),
      editRules: ({ id, path }) => setSettings({ repository: repositoryById(id), path }),
    };
  }, [catalog.repositories, openPrompt]);

  return {
    actions,
    controls: (
      <div>
        <div className="flex gap-2 p-2">
          <Button size="sm" variant="outline" onClick={() => setPicker(true)}>
            Add repository
          </Button>
          <Button size="sm" variant="ghost" onClick={() => { requestDocumentsRefresh(); void catalog.refresh(); void refreshDocumentProblems(); }}>
            Refresh
          </Button>
        </div>
        {(catalog.error || problems.error) && (
          <ActionError title="Repository review unavailable" error={catalog.error ?? problems.error} context={[["Operation", "Load repository review"]]} className="mx-2 rounded-md bg-background text-xs text-foreground" />
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
