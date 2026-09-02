import { UiDatabaseTrash } from "../icons";
import type { StaticIconComponent } from "../data/Icon";

const actionIcons: Record<string, StaticIconComponent> = {
  "database-trash": UiDatabaseTrash,
};

export function resolveActionIcon(
  name: string | undefined
): StaticIconComponent | undefined {
  return name ? actionIcons[name] : undefined;
}
