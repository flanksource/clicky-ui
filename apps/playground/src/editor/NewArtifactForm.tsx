import { useState, type FormEvent } from "react";

import { pageTemplate } from "./page-template";
import { createPage } from "./useSource";

export type NewArtifactFormProps = {
  onCancel: () => void;
};

export function NewArtifactForm({ onCancel }: NewArtifactFormProps) {
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const trimmed = slug.trim();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (trimmed === "" || busy) return;

    setBusy(true);
    try {
      await createPage(trimmed, pageTemplate(trimmed));
      // A full navigation guarantees the freshly written file is in the glob.
      window.location.href = `?page=${encodeURIComponent(trimmed)}`;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="mb-density-3 space-y-2 rounded-md border border-border bg-muted/40 p-density-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="new-artifact-slug" className="text-xs font-medium">
          New artifact
        </label>
        <span className="font-mono text-xs text-muted-foreground">src/pages/</span>
        <input
          id="new-artifact-slug"
          value={slug}
          onChange={(event) => setSlug(event.target.value)}
          onKeyDown={(event) => event.key === "Escape" && onCancel()}
          placeholder="pricing-table"
          autoFocus
          className="min-w-48 flex-1 rounded-md border border-border bg-background px-2 py-1 font-mono text-xs outline-none focus:border-ring"
        />
        <span className="font-mono text-xs text-muted-foreground">.tsx</span>
        <button
          type="submit"
          disabled={trimmed === "" || busy}
          className="rounded-md border border-primary bg-primary px-2 py-1 text-xs font-medium text-primary-foreground disabled:opacity-40"
        >
          {busy ? "Creating…" : "Create"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Lowercase letters, digits and hyphens. Nest with “/” to group in the sidebar.
        </p>
      )}
    </form>
  );
}
