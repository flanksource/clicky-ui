import { useEffect, useState } from "react";
import {
  ActionError,
  CommandPalette,
  type CommandItem,
} from "@flanksource/clicky-ui";
import { fetchNavigation } from "./api";
import { searchItems } from "./search";

export function ArtifactSearch({
  onNavigate,
}: {
  onNavigate: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<CommandItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  useEffect(() => {
    if (open) window.__REACT_GRAB__?.deactivate();
  }, [open]);
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("playground-search", show);
    return () => window.removeEventListener("playground-search", show);
  }, []);
  useEffect(() => {
    setItems([]);
    setError(null);
    setLoading(open && Boolean(query.trim()));
    if (!open || !query.trim()) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void fetchNavigation(
        { node: "", sort: "none", filters: [], age: "all", q: query.trim() },
        controller.signal,
      ).then(
        (response) => {
          if (!controller.signal.aborted) {
            setItems(searchItems(response.children));
            setLoading(false);
          }
        },
        (cause: unknown) => {
          if (!controller.signal.aborted) {
            setError(cause);
            setLoading(false);
          }
        },
      );
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, query]);
  return (
    <CommandPalette
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
      ariaLabel="Search artifacts"
      placeholder="Search pages, documents, and external captures…"
      query={query}
      onQueryChange={setQuery}
      groups={[{ id: "artifacts", items }]}
      filter={false}
      loading={loading}
      emptyState={
        error ? (
          <ActionError error={error} />
        ) : query.trim() ? (
          "No artifacts found"
        ) : (
          "Type to search all artifacts"
        )
      }
      onSelect={({ item }) => onNavigate(item.id)}
    />
  );
}
