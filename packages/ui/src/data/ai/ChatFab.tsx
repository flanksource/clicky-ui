import { cn } from "../../lib/utils";
import { Icon, type StaticIconComponent } from "../Icon";
import { UiComment } from "../../icons";
import { useChatWindowManager } from "./chat-window-context";
import { zIndex } from "../../overlay/zIndex";

export type ChatFabProps = {
  /** Iconify name or imported icon component shown in the button. */
  icon?: string | StaticIconComponent;
  /** Accessible label / tooltip. */
  label?: string;
  className?: string;
};

/** A fixed bottom-right launch button that opens the first chat window. It
 *  hides itself once any window is open (the windows carry their own controls). */
export function ChatFab({ icon = UiComment, label = "Open chat", className }: ChatFabProps) {
  const { panels, openPanel } = useChatWindowManager();
  if (panels.length > 0) return null;

  return (
    <button
      type="button"
      data-testid="chat-fab"
      title={label}
      aria-label={label}
      onClick={() => openPanel()}
      style={{ zIndex: zIndex.chatFab }}
      className={cn(
        "fixed bottom-4 right-4 flex h-12 w-12 items-center justify-center",
        "rounded-full bg-primary text-primary-foreground shadow-lg transition-colors hover:bg-primary/90",
        className,
      )}
    >
      <Icon {...(typeof icon === "string" ? { name: icon } : { icon })} className="size-5" />
    </button>
  );
}
