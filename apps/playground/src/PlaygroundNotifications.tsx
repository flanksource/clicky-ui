import { useState } from "react";
import {
  Button,
  DropdownMenu,
  Icon,
  SegmentedControl,
  useRouter,
  type AppShellNavSection,
} from "@flanksource/clicky-ui";
import { UiQueue } from "@flanksource/clicky-ui/icons";

type Category = "external" | "pages" | "markdown";
const PAGE_SIZE = 8;
const INITIAL_LIMITS = {
  external: PAGE_SIZE,
  pages: PAGE_SIZE,
  markdown: PAGE_SIZE,
};
const CATEGORIES = [
  { id: "external" as const, label: "External" },
  { id: "pages" as const, label: "Pages" },
  { id: "markdown" as const, label: "Markdown" },
];

export function PlaygroundNotifications({
  recent,
}: {
  recent: AppShellNavSection;
}) {
  const router = useRouter();
  const [category, setCategory] = useState<Category>("pages");
  const [limits, setLimits] = useState(INITIAL_LIMITS);
  const items =
    recent.groups?.find((group) => group.key === category)?.items ?? [];
  const count = recent.items?.length ?? 0;
  const limit = limits[category];
  return (
    <DropdownMenu
      role="dialog"
      align="right"
      menuLabel="Recent changes"
      menuClassName="flex w-80 max-w-[calc(100vw-24px)] max-h-[70dvh] flex-col overflow-hidden"
      onOpenChange={(open) => {
        if (!open) setLimits(INITIAL_LIMITS);
      }}
      header={
        <div className="space-y-2 py-1">
          <h2 className="text-xs font-semibold">Recent changes</h2>
          <SegmentedControl
            aria-label="Recent change type"
            size="sm"
            value={category}
            onChange={setCategory}
            options={CATEGORIES}
          />
        </div>
      }
      footer={
        recent.loading ? (
          <p role="status" className="text-xs text-muted-foreground">
            Loading recent changes…
          </p>
        ) : items.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No recent{" "}
            {category === "external"
              ? "external page"
              : category === "markdown"
                ? "Markdown"
                : "page"}{" "}
            changes.
          </p>
        ) : limit < items.length ? (
          <Button
            size="sm"
            variant="ghost"
            className="w-full"
            onClick={() =>
              setLimits((previous) => ({
                ...previous,
                [category]: previous[category] + PAGE_SIZE,
              }))
            }
          >
            Show more ({items.length - limit})
          </Button>
        ) : undefined
      }
      trigger={
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          title={`Notifications · ${count} recent changes`}
          className="relative shrink-0 [@media(pointer:coarse)]:size-11"
        >
          <UiQueue className="size-5" />
          {count > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground"
            >
              {count}
            </span>
          )}
        </Button>
      }
    >
      {(close) => (
        <div
          className="min-h-0 overflow-y-auto overscroll-contain"
          aria-label="Recent change results"
        >
          {items.slice(0, limit).map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              className="h-auto w-full justify-start gap-2 rounded-none px-3 py-2 text-left"
              onClick={() => {
                router.navigate(item.to);
                close();
              }}
            >
              {item.icon && (
                <Icon
                  {...(typeof item.icon === "string"
                    ? { name: item.icon }
                    : { icon: item.icon })}
                  className="size-4 shrink-0"
                />
              )}
              {item.label}
            </Button>
          ))}
        </div>
      )}
    </DropdownMenu>
  );
}
