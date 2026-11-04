import { useState } from "react";
import { Button, InputField, Modal } from "@flanksource/clicky-ui";
import { documentPath, type DocumentRepository } from "./types";
import { documentJson, workspaceURL } from "./api";

export function OpenRepositoryDocument({
  repository,
  pageHref,
  onClose,
}: {
  repository: DocumentRepository;
  pageHref: (id: string) => string;
  onClose: () => void;
}) {
  const [path, setPath] = useState("");
  const [verified, setVerified] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <Modal
      open
      title={`Open Markdown · ${repository.name}`}
      onClose={onClose}
      footer={
        <div className="flex items-center gap-3">
          <Button
            loading={busy}
            disabled={!path}
            onClick={() => {
              setError(null);
              setVerified(undefined);
              setBusy(true);
              void (async () => {
                const id = `document:${repository.id}/${path}`;
                documentPath(id);
                await documentJson(workspaceURL("file", repository.root, path));
                setVerified(id);
              })()
                .catch((cause: unknown) => setError(String(cause)))
                .finally(() => setBusy(false));
            }}
          >
            Check file
          </Button>
          {verified && (
            <a
              href={pageHref(verified)}
              className="text-sm text-primary underline"
            >
              Open document
            </a>
          )}
        </div>
      }
    >
      <label
        htmlFor="repository-document-path"
        className="mb-2 block text-sm font-medium"
      >
        Repository-relative Markdown path
      </label>
      <InputField
        id="repository-document-path"
        value={path}
        onChange={(value) => {
          setPath(value);
          setVerified(undefined);
        }}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Explicit paths can open files hidden by ignore rules.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-destructive">
          {error}
        </p>
      )}
    </Modal>
  );
}
