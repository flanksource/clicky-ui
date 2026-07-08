import { useState } from "react";
import { cn } from "../lib/utils";
import type { ResolvedTheme } from "../hooks/use-theme";
import { Icon } from "./Icon";
import { UiCopy, UiCheck, UiDownload, UiSun, UiMoon } from "../icons";

export type CodeBlockActionsProps = {
  /** Raw source copied to the clipboard and written to the downloaded file. */
  source: string;
  /** Language hint, used to pick the download filename extension. */
  language?: string | undefined;
  /** Show a copy-to-clipboard button. */
  copyable?: boolean | undefined;
  /** Show a download button. */
  downloadable?: boolean | undefined;
  /** This block's effective theme, shown by the toggle. */
  theme?: ResolvedTheme | undefined;
  /** Called when the per-block theme toggle is clicked. Omit to hide it. */
  onToggleTheme?: (() => void) | undefined;
};

// Maps a highlighter language hint to a download filename extension. Anything
// unlisted falls back to `.txt`.
const LANG_EXTENSIONS: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  tsx: "tsx",
  jsx: "jsx",
  python: "py",
  bash: "sh",
  shell: "sh",
  yaml: "yaml",
  json: "json",
  sql: "sql",
  java: "java",
  go: "go",
  html: "html",
  xml: "xml",
  css: "css",
};

function downloadSource(source: string, language: string | undefined) {
  const ext = (language && LANG_EXTENSIONS[language.toLowerCase()]) || "txt";
  const blob = new Blob([source], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `snippet.${ext}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Copy/download controls for the CodeBlock header. Mirrors the copy affordance
 *  in chat/MessageActions so the two behave identically. Renders nothing when
 *  neither control is enabled. */
export function CodeBlockActions({
  source,
  language,
  copyable = false,
  downloadable = false,
  theme,
  onToggleTheme,
}: CodeBlockActionsProps) {
  const [copied, setCopied] = useState(false);

  if (!copyable && !downloadable && !onToggleTheme) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.warn("clicky-ui: copy to clipboard failed", err);
    }
  };

  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      {onToggleTheme && (
        <button
          type="button"
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title="Toggle theme"
          onClick={onToggleTheme}
          className="rounded p-1 hover:bg-accent hover:text-accent-foreground"
        >
          <Icon icon={theme === "dark" ? UiSun : UiMoon} className="size-3.5" />
        </button>
      )}
      {downloadable && (
        <button
          type="button"
          aria-label="Download code"
          title="Download file"
          onClick={() => downloadSource(source, language)}
          className="rounded p-1 hover:bg-accent hover:text-accent-foreground"
        >
          <Icon icon={UiDownload} className="size-3.5" />
        </button>
      )}
      {copyable && (
        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy code"}
          title="Copy code"
          onClick={copy}
          className="rounded p-1 hover:bg-accent hover:text-accent-foreground"
        >
          <Icon
            icon={copied ? UiCheck : UiCopy}
            className={cn("size-3.5", copied && "text-emerald-600")}
          />
        </button>
      )}
    </div>
  );
}
