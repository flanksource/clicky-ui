import { UiSparkles } from "../../icons";
import { cn } from "../../lib/utils";
import { ChatFab, type ChatFabProps } from "./ChatFab";

export type ChatButtonProps = Omit<ChatFabProps, "persistent">;

/** A persistent chat trigger styled as navbar chrome for AppShell actions. */
export function ChatButton({
  icon = UiSparkles,
  label = "Open chat",
  className,
}: ChatButtonProps) {
  return (
    <ChatFab
      persistent
      icon={icon}
      label={label}
      className={cn(
        "static size-9 rounded-md bg-transparent text-foreground shadow-none hover:bg-accent",
        className,
      )}
    />
  );
}
