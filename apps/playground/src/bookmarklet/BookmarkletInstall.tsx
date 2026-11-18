import { useState } from "react";
import { Button, Modal } from "@flanksource/clicky-ui";
import { BOOKMARKLET_ROUTE } from "./model";
import { writeClipboard } from "../comments/clipboard";

export function BookmarkletInstall({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const scriptUrl = new URL(BOOKMARKLET_ROUTE, location.origin).href;
  const code = `javascript:void(function(){var s=document.createElement('script');s.src=${JSON.stringify(scriptUrl)}+'?v='+Date.now();s.onerror=function(){alert('Playground grabber could not load. Check that the playground is running and this page permits its scripts.');};document.head.appendChild(s);}())`;
  return (
    <Modal open onClose={onClose} title="Install playground grabber">
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
        <p className="text-muted-foreground">
          For pages that block the bookmarklet, use the Gavel Chrome extension
          from the Gavel repository's <code>extension</code> workspace package.
          It connects directly to Gavel and captures todos offline. Build it
          there, load <code>extension/dist</code> unpacked from{" "}
          <code>chrome://extensions</code>, then configure the Gavel address and
          project in its popup and turn on Enabled on this site.
        </p>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
