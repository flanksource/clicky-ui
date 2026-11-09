import { useEffect, useState } from "react";
import {
  Button,
  ActionError,
  Checkbox,
  Combobox,
  Field,
  Modal,
} from "@flanksource/clicky-ui";
import { documentError, documentJson, folderLintScope, GAVEL_ROUTE, jsonBody } from "./api";
import type { FolderLintScope } from "./types";
import {
  fetchPrompts,
  type CaptainPromptSummary,
} from "../prompt-runs/prompt-runs-api";

type LinterChoice = { name: string; includes: string[] | null };

export function LintDialog({
  root,
  path,
  selected,
  page,
  onPrompt,
  onRun,
  onClose,
}: {
  root: string;
  path: string;
  selected: string[];
  page: string;
  onPrompt: (promptId: string) => void;
  onRun: (linters: string[], scope?: FolderLintScope) => Promise<void>;
  onClose: () => void;
}) {
  const [choices, setChoices] = useState<LinterChoice[]>();
  const [prompts, setPrompts] = useState<CaptainPromptSummary[]>([]);
  const [promptId, setPromptId] = useState("");
  const [linters, setLinters] = useState(selected);
  const [error, setError] = useState<Error>();
  const [busy, setBusy] = useState(false);
  const [scope, setScope] = useState<FolderLintScope>();
  useEffect(() => {
    let cancelled = false;
    const folder = page.startsWith("folder:");
    const cwd = `${root}/${folder ? path : path.split("/").slice(0, -1).join("/")}`;
    const conventional = documentJson<{ preparationId: string }>(
      `${GAVEL_ROUTE}/api/launch/prepare`,
      jsonBody("POST", { workspace: { cwd } }),
    ).then(({ preparationId }) =>
      documentJson<LinterChoice[]>(
        `${GAVEL_ROUTE}/api/launch/linters?${new URLSearchParams({ preparationId })}`,
      ),
    );
    Promise.all([
      conventional,
      fetchPrompts(page),
      folder ? folderLintScope(page) : Promise.resolve(undefined),
    ]).then(
      ([next, available, nextScope]) => {
        if (!cancelled) {
          setChoices(next);
          setPrompts(available);
          setScope(nextScope);
        }
      },
      (cause: unknown) => {
        if (!cancelled) setError(documentError(cause));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [root, path, page]);
  const run = async () => {
    setBusy(true);
    setError(undefined);
    try {
      await onRun(linters, scope);
      onClose();
    } catch (cause) {
      setError(documentError(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open onClose={onClose} title="Run lint" size="md">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Choose linters for <span className="font-mono">{path}</span>.
        </p>
        {error && (
          <ActionError title="Lint request failed" error={error} context={[["Repository", root], ["Path", path]]} />
        )}
        {!choices && !error && <p role="status">Loading linters…</p>}
        {scope && (
          <details className="rounded border border-border p-2 text-xs">
            <summary>
              {scope.files.length} Markdown files including subfolders
            </summary>
            <ul className="mt-2 max-h-32 overflow-auto font-mono">
              {scope.files.map((file) => (
                <li key={file}>{file}</li>
              ))}
            </ul>
          </details>
        )}
        {prompts.length > 0 && (
          <div className="space-y-2 border-b border-border pb-4">
            <Field label="Prompt linter" htmlFor="document-prompt-linter">
              <Combobox
                id="document-prompt-linter"
                ariaLabel="Prompt linter"
                value={promptId}
                onChange={setPromptId}
                allowCustomValue={false}
                options={[...prompts]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((prompt) => ({
                    value: prompt.id,
                    label: prompt.name,
                    ...(prompt.description
                      ? { description: prompt.description }
                      : {}),
                  }))}
              />
            </Field>
            <Button
              variant="outline"
              disabled={!promptId || busy}
              onClick={() => onPrompt(promptId)}
            >
              Configure prompt…
            </Button>
          </div>
        )}
        <div className="max-h-80 space-y-2 overflow-y-auto">
          {choices?.map((choice) => (
            <Checkbox
              key={choice.name}
              checked={linters.includes(choice.name)}
              disabled={busy}
              onChange={(checked) =>
                setLinters((current) =>
                  checked
                    ? [...current, choice.name]
                    : current.filter((name) => name !== choice.name),
                )
              }
              label={
                <span>
                  <span className="font-medium">{choice.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {choice.includes?.join(", ")}
                  </span>
                </span>
              }
              className="flex"
            />
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            onClick={() => void run()}
            loading={busy}
            disabled={!choices || linters.length === 0}
          >
            Run lint
          </Button>
        </div>
      </div>
    </Modal>
  );
}
