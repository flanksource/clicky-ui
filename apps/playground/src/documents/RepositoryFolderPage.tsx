import { ActionError, Button } from "@flanksource/clicky-ui";
import type { RepositoryMenuActions } from "../navigation/menus";
import { useRepositoryCatalog } from "./catalog";
import { folderPath } from "./types";

export function RepositoryFolderPage({
  id,
  onReview,
}: {
  id: string;
  onReview: RepositoryMenuActions["review"];
}) {
  const target = folderPath(id);
  const catalog = useRepositoryCatalog();
  const repository = catalog.repositories.find(
    (item) => item.id === target.repositoryId,
  );

  return (
    <section className="flex flex-col gap-3" data-repository-folder={id}>
      {catalog.error && (
        <ActionError title="Load repositories" error={catalog.error} context={[["Folder", id]]} />
      )}
      {repository && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="break-words text-lg font-semibold">
            {repository.name} / {target.path}
          </h1>
          <Button
            size="sm"
            onClick={() => onReview({ id: target.repositoryId, path: target.path })}
          >
            AI review…
          </Button>
        </div>
      )}
    </section>
  );
}
