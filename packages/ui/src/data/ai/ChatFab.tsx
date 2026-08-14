import { cn } from "../../lib/utils";
import { Icon, type StaticIconComponent } from "../Icon";
import { UiSparkles } from "../../icons";
import { useChatWindowManager } from "./chat-window-context";
import { zIndex } from "../../overlay/zIndex";

export type ChatFabProps = {
  /** Iconify name or imported icon component shown in the button. */
  icon?: string | StaticIconComponent;
  /** Accessible label / tooltip. */
  label?: string;
  /** Keep navbar chrome visible and focus an existing window when clicked. */
  persistent?: boolean;
  className?: string;
};

/** A fixed bottom-right chat launcher. By default it hides while a window is
 * open; persistent launchers remain visible and focus the existing window. */
export function ChatFab({
  icon = UiSparkles,
  label = "Open chat",
  persistent = false,
  className,
}: ChatFabProps) {
  const { panels, openPanel, findOrCreatePanel } = useChatWindowManager();
  if (!persistent && panels.length > 0) return null;

  return (
    <button
      type="button"
      data-testid="chat-fab"
      title={label}
      aria-label={label}
      onClick={() => (persistent ? findOrCreatePanel() : openPanel())}
      {...(!persistent ? { style: { zIndex: zIndex.chatFab } } : {})}
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
