import { useState } from "react";
import { Button, Modal } from "@flanksource/clicky-ui";
import { BOOKMARKLET_ROUTE } from "./model";
import { writeClipboard } from "../comments/clipboard";

export function BookmarkletInstall() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const scriptUrl = new URL(BOOKMARKLET_ROUTE, location.origin).href;
  const code = `javascript:void(function(){var s=document.createElement('script');s.src=${JSON.stringify(scriptUrl)}+'?v='+Date.now();s.onerror=function(){alert('Playground grabber could not load. Check that the playground is running and this page permits its scripts.');};document.head.appendChild(s);}())`;
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        Bookmarklet
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Install playground grabber"
      >
        <div className="space-y-4 text-sm">
          <p>
            Drag this link to your bookmarks bar, then activate it on a page to
            leave persistent feedback.
          </p>
          <a
            ref={(node) => node?.setAttribute("href", code)}
            draggable
            className="inline-flex rounded-md border border-primary px-3 py-2 font-medium text-primary"
          >
            Playground grabber
          </a>
          <Button
            variant="outline"
            onClick={() => {
              void writeClipboard(Promise.resolve(code)).then(
                () => {
                  setCopied(true);
                  setError("");
                },
                (cause: unknown) =>
                  setError(
                    cause instanceof Error ? cause.message : String(cause),
                  ),
              );
            }}
          >
            {copied ? "Copied" : "Copy bookmarklet"}
          </Button>
          <p className="text-muted-foreground">
            Keep this playground running. After a full navigation, activate the
            bookmarklet again. Some sites block injected scripts or frames;
            browser internal pages and cross-origin frame contents are
            unsupported.
          </p>
          {error && (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
