import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/button";
import { Icon } from "../Icon";
import {
  UiAdd,
  UiArrowLeft,
  UiClose,
  UiFullscreen,
  UiGitBranch,
} from "../../icons";
import { ThreadPicker, type ThreadSource } from "./ThreadPicker";
import { ToolPreferences } from "./ToolPreferences";

export type ChatWindowHeaderProps = {
  /** Below the mobile breakpoint: a back button replaces drag, maximize and close. */
  mobile: boolean;
  title: ReactNode;
  threadId: string | null;
  maximized: boolean;
  threadsSource: ThreadSource | undefined;
  sessionsApi: string | null;
  /** Bumped when a turn settles so the picker re-reads the conversation name. */
  titleRefresh: number;
  headerExtras: ReactNode;
  toolPreferences: ComponentProps<typeof ToolPreferences>;
  hasMessages: boolean;
  forkDisabled: boolean;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  onFork: () => void;
  onNewWindow: () => void;
  onMaximize: () => void;
  onClose: () => void;
};

/** The chat window's drag-handle header: thread switcher (or title), host
 *  extras, tool/runtime preferences, fork, new window, and — off mobile —
 *  maximize and close. */
export function ChatWindowHeader({
  mobile,
  title,
  threadId,
  maximized,
  threadsSource,
  sessionsApi,
  titleRefresh,
  headerExtras,
  toolPreferences,
  hasMessages,
  forkDisabled,
  onSelectThread,
  onNewThread,
  onFork,
  onNewWindow,
  onMaximize,
  onClose,
}: ChatWindowHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5",
        !mobile && "chat-drag-handle cursor-move",
      )}
    >
      {mobile && (
        <Button
          variant="ghost"
          size="icon"
          title="Back"
          aria-label="Back"
          onClick={onClose}
        >
          <Icon icon={UiArrowLeft} className="size-4" />
        </Button>
      )}
      {threadsSource != null || sessionsApi !== null ? (
        <ThreadPicker
          threadId={threadId}
          onSelect={onSelectThread}
          onNew={onNewThread}
          refreshToken={titleRefresh}
          {...(threadsSource
            ? { source: threadsSource }
            : sessionsApi !== null
              ? { api: sessionsApi }
              : {})}
        />
      ) : (
        <span className="px-1 text-sm font-medium">{title}</span>
      )}
      <div className="flex-1" />
      {headerExtras}
      <ToolPreferences {...toolPreferences} />
      {sessionsApi && (
        <Button
          variant="ghost"
          size="icon"
          title={
            hasMessages
              ? "Fork conversation into a new window"
              : "Send a message before forking this conversation"
          }
          disabled={forkDisabled}
          onClick={onFork}
        >
          <Icon icon={UiGitBranch} className="size-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        title="New window"
        onClick={onNewWindow}
      >
        <Icon icon={UiAdd} className="size-4" />
      </Button>
      {!mobile && (
        <>
          <Button
            variant="ghost"
            size="icon"
            title={maximized ? "Restore" : "Maximize"}
            onClick={onMaximize}
          >
            <Icon icon={UiFullscreen} className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Close" onClick={onClose}>
            <Icon icon={UiClose} className="size-4" />
          </Button>
        </>
      )}
    </div>
  );
}
