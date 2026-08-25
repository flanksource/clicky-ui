import { Button } from "@flanksource/clicky-ui";
import { UiAdd, UiCopy, UiTrash } from "@flanksource/clicky-ui/icons";

export function RuntimeLibraryList({
  title,
  items,
  selectedId,
  onSelect,
  onCreate,
  onDuplicate,
  onDelete,
  deleteReason,
}: {
  title: string;
  items: Array<{ id: string; name: string; description?: string }>;
  selectedId: string | undefined;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  deleteReason?: (id: string) => string | undefined;
}) {
  return (
    <aside className="min-h-0 rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <h2 className="flex-1 text-sm font-semibold">{title}</h2>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`Create ${title}`}
          onClick={onCreate}
        >
          <UiAdd />
        </Button>
      </div>
      <div className="divide-y divide-border">
        {items.map((item) => {
          const reason = deleteReason?.(item.id);
          return (
            <div
              key={item.id}
              className={
                selectedId === item.id
                  ? "bg-primary/5 px-3 py-2"
                  : "px-3 py-2 hover:bg-muted/40"
              }
            >
              <button
                type="button"
                className="w-full min-w-0 text-left"
                onClick={() => onSelect(item.id)}
              >
                <span className="block truncate text-sm font-medium">
                  {item.name}
                </span>
                {item.description && (
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">
                    {item.description}
                  </span>
                )}
              </button>
              <div className="mt-2 flex justify-end gap-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Duplicate ${item.name}`}
                  onClick={() => onDuplicate(item.id)}
                >
                  <UiCopy />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${item.name}`}
                  title={reason}
                  disabled={Boolean(reason)}
                  onClick={() => onDelete(item.id)}
                >
                  <UiTrash />
                </Button>
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">No items yet.</p>
        )}
      </div>
    </aside>
  );
}
