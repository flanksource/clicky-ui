import { useEffect, useState } from "react";
import { Modal } from "../overlay/Modal";
import { Button } from "./button";
import { InputField as Input } from "./InputField";
import { LocalPathTree } from "./LocalPathTree";
import type { LocalPathListing, LocalPathLoader } from "./local-path";

export interface LocalPathPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (path: string) => void;
  load: LocalPathLoader;
  initialPath?: string;
  accept?: readonly string[];
}

export function LocalPathPicker({
  open,
  onClose,
  onSelect,
  load,
  initialPath = "",
  accept = [],
}: LocalPathPickerProps) {
  const [path, setPath] = useState(initialPath);
  const [draft, setDraft] = useState(initialPath);
  const [listing, setListing] = useState<LocalPathListing>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [hidden, setHidden] = useState(false);
  const [all, setAll] = useState(false);
  const [retry, setRetry] = useState(0);
  const extensions = accept
    .map((extension) => extension.toLowerCase())
    .join("\u0000");
  useEffect(() => setSelected(""), [hidden, all, extensions]);
  const filteredLoad: LocalPathLoader = async (directory, signal) => {
    const result = await load(directory, signal);
    return {
      ...result,
      entries: result.entries.filter(
        (entry) =>
          (hidden || !entry.name.startsWith(".")) &&
          (entry.directory ||
            all ||
            accept.length === 0 ||
            accept.some((extension) =>
              entry.name.toLowerCase().endsWith(extension.toLowerCase()),
            )),
      ),
    };
  };
  useEffect(() => {
    if (open) {
      setPath(initialPath);
      setDraft(initialPath);
      setSelected("");
    }
  }, [open, initialPath]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setListing(undefined);
    setSelected("");
    load(path, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setListing(result);
          setDraft(result.path);
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted)
          setError(reason instanceof Error ? reason.message : String(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [open, path, load, retry]);
  const navigate = (next: string) => {
    setPath(next);
    setRetry((value) => value + 1);
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose a local file"
      size="lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selected || loading || !!error}
            onClick={() => {
              onSelect(selected);
              onClose();
            }}
          >
            Select file
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            aria-label="Directory path"
            value={draft}
            onChange={setDraft}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                navigate(draft);
              }
            }}
          />
          <Button type="button" onClick={() => navigate(draft)}>
            Go
          </Button>
        </div>
        <nav
          aria-label="Directory breadcrumbs"
          className="flex flex-wrap gap-1"
        >
          <Button type="button" variant="ghost" onClick={() => navigate("/")}>
            /
          </Button>
          {listing?.path
            .split("/")
            .filter(Boolean)
            .map((part, index, parts) => (
              <Button
                type="button"
                variant="ghost"
                key={parts.slice(0, index + 1).join("/")}
                onClick={() =>
                  navigate("/" + parts.slice(0, index + 1).join("/"))
                }
              >
                {part}
              </Button>
            ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!listing || listing.parent === listing.path}
            onClick={() => listing && navigate(listing.parent)}
          >
            Parent folder
          </Button>
          <label>
            <input
              type="checkbox"
              checked={hidden}
              onChange={(event) => setHidden(event.target.checked)}
            />{" "}
            Show hidden
          </label>
          {accept.length > 0 && (
            <label>
              <input
                type="checkbox"
                checked={all}
                onChange={(event) => setAll(event.target.checked)}
              />{" "}
              All files
            </label>
          )}
        </div>
        {loading && <p role="status">Loading files…</p>}
        {error && (
          <div role="alert">
            {error}
            <Button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Retry
            </Button>
          </div>
        )}
        {listing && (
          <LocalPathTree
            key={JSON.stringify([listing.path, retry, hidden, all, extensions])}
            entries={listing.entries.filter(
              (entry) =>
                (hidden || !entry.name.startsWith(".")) &&
                (entry.directory ||
                  all ||
                  accept.length === 0 ||
                  accept.some((extension) =>
                    entry.name.toLowerCase().endsWith(extension.toLowerCase()),
                  )),
            )}
            load={filteredLoad}
            selected={selected}
            onSelect={setSelected}
            onRetry={navigate}
          />
        )}
      </div>
    </Modal>
  );
}
