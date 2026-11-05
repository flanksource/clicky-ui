import { Button, DropdownMenu, useRouter, type AppShellNavSection } from "@flanksource/clicky-ui";
import { UiQueue } from "@flanksource/clicky-ui/icons";

export function PlaygroundNotifications({ recent }: { recent: AppShellNavSection }) {
  const router = useRouter();
  const items = (recent.items ?? []).map((item) => {
    const to = item.to;
    if (!to) throw new Error(`Recent page ${item.key} has no navigation target`);
    return {
      label: item.label,
      ...(item.icon ? { icon: item.icon } : {}),
      onSelect: () => router.navigate(to),
    };
  });
  return (
    <DropdownMenu
      align="right"
      menuLabel="Notifications"
      menuClassName="w-80 max-w-[calc(100vw-24px)] max-h-[70dvh] overflow-auto"
      header={<h2 className="text-xs font-semibold">Recent changes</h2>}
      footer={recent.loading
        ? <p role="status" className="text-xs text-muted-foreground">Loading recent changes…</p>
        : items.length === 0
          ? <p className="text-xs text-muted-foreground">No recent changes.</p>
          : undefined}
      trigger={
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          title={`Notifications · ${items.length} recent changes`}
          className="relative shrink-0 [@media(pointer:coarse)]:size-11"
        >
          <UiQueue className="size-5" />
          {items.length > 0 && <span aria-hidden="true" className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground">{items.length}</span>}
        </Button>
      }
      items={items}
    />
  );
}
