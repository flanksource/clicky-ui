import {
  Avatar,
  Button,
  DensitySwitcher,
  DropdownMenu,
  ThemeSwitcher,
  useDensity,
  useTheme,
} from "@flanksource/clicky-ui";
import { ReloadControl } from "./ReloadControl";

export function PlaygroundPreferences({
  sourceDirty,
}: {
  sourceDirty: boolean;
}) {
  const { theme } = useTheme();
  const { density } = useDensity();
  return (
    <ReloadControl sourceDirty={sourceDirty}>
      {(reloads, attention) => (
        <DropdownMenu
          role="dialog"
          align="right"
          menuLabel="Preferences"
          menuClassName="w-80 max-w-[calc(100vw-16px)]"
          trigger={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Preferences"
              title={
                attention
                  ? "Preferences · updates or issues available"
                  : "Preferences"
              }
              className="relative shrink-0 rounded-full [@media(pointer:coarse)]:size-11"
            >
              <Avatar alt="You" size="md" />
              {attention && (
                <span
                  aria-label="Updates or issues available"
                  className="absolute right-0 top-0 size-2 rounded-full bg-warning"
                />
              )}
            </Button>
          }
        >
          {() => (
            <div className="space-y-3 p-3 text-xs">
              <h2 className="font-semibold">Preferences</h2>
              <div className="flex items-center justify-between gap-3">
                <span>Theme</span>
                <span className="flex items-center gap-2 capitalize text-muted-foreground">
                  {theme}
                  <ThemeSwitcher />
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span>Density</span>
                <span className="flex items-center gap-2 capitalize text-muted-foreground">
                  {density}
                  <DensitySwitcher />
                </span>
              </div>
              <hr className="border-border" />
              {reloads}
            </div>
          )}
        </DropdownMenu>
      )}
    </ReloadControl>
  );
}
