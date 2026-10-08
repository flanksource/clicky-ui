import { useResolvedTheme } from "../hooks/use-theme";
import { UiReadAccess, UiReadAccessDark, UiWriteAccess, UiWriteAccessDark, type IconComponent } from "../icons";
import { cn } from "../lib/utils";
import type { DataAccess } from "./data-access";

export interface AccessMarkProps {
  access: DataAccess;
  className?: string;
}

const WORDS: Record<DataAccess, string> = { read: "Read", write: "Written", readwrite: "Read and written" };

const ICONS: Record<"read" | "write", { light: IconComponent; dark: IconComponent }> = {
  read: { light: UiReadAccess, dark: UiReadAccessDark },
  write: { light: UiWriteAccess, dark: UiWriteAccessDark },
};

const KINDS: Record<DataAccess, ("read" | "write")[]> = { read: ["read"], write: ["write"], readwrite: ["read", "write"] };

/**
 * How a name is accessed, as the read and write icons the call graph draws its edges with: one icon for
 * a read or a write, both side by side for a name that is read and written. Its words are its title.
 */
export function AccessMark({ access, className }: AccessMarkProps) {
  const dark = useResolvedTheme() === "dark";
  const words = WORDS[access];
  return (
    <span role="img" aria-label={words} title={words} data-access={access} className={cn("inline-flex shrink-0 items-center gap-px text-sm leading-none", className)}>
      {KINDS[access].map((kind) => {
        const Icon = dark ? ICONS[kind].dark : ICONS[kind].light;
        return <Icon key={kind} aria-hidden data-access-icon={kind} />;
      })}
    </span>
  );
}
