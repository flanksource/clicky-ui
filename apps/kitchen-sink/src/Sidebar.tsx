import { cn } from "@flanksource/clicky-ui";
import { useEffect, useMemo, useState } from "react";
import type { DemoGroup } from "./demo-catalog";

export type SidebarProps = {
  groups: DemoGroup[];
  activeId: string;
  onSelect: (id: string) => void;
};

/** Spacing tier the sidebar collapses toward as its content grows or the
 * viewport shrinks. `roomy` gives generous breathing room for short menus on
 * tall screens; `tight` packs the maximum number of rows into a short
 * viewport before the tree has to scroll. */
type Tier = "roomy" | "normal" | "tight";

type TierClasses = {
  groupGap: string;
  itemGap: string;
  itemPad: string;
  headingGap: string;
  heading: string;
  label: string;
};

const TIERS: Record<Tier, TierClasses> = {
  roomy: {
    groupGap: "space-y-density-6",
    itemGap: "space-y-1",
    itemPad: "px-density-3 py-1.5",
    headingGap: "mb-density-2",
    heading: "text-[11px]",
    label: "text-sm",
  },
  normal: {
    groupGap: "space-y-density-4",
    itemGap: "space-y-0.5",
    itemPad: "px-density-2 py-1",
    headingGap: "mb-density-1",
    heading: "text-[10px]",
    label: "text-sm",
  },
  tight: {
    groupGap: "space-y-density-2",
    itemGap: "space-y-px",
    itemPad: "px-density-2 py-0.5",
    headingGap: "mb-0.5",
    heading: "text-[10px]",
    label: "text-xs",
  },
};

/** Tracks the live viewport height so the menu can trade density for fit as
 * the window is resized. */
function useViewportHeight(): number {
  const [height, setHeight] = useState(() =>
    typeof window === "undefined" ? 800 : window.innerHeight,
  );
  useEffect(() => {
    const onResize = () => setHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return height;
}

/** Picks a spacing tier by comparing the menu's natural height (≈28px/row at
 * the `normal` tier, including group headings) against the space the sticky
 * column actually has. A ratio under ~0.7 has room to spare; over ~1.05 the
 * tree would overflow, so we tighten before falling back to scroll. */
function pickTier(rows: number, viewportHeight: number): Tier {
  const estimated = rows * 28;
  const available = Math.max(viewportHeight - 64, 1);
  const ratio = estimated / available;
  if (ratio < 0.7) return "roomy";
  if (ratio < 1.05) return "normal";
  return "tight";
}

export function Sidebar({ groups, activeId, onSelect }: SidebarProps) {
  const viewportHeight = useViewportHeight();
  const rows = useMemo(
    () => groups.reduce((total, group) => total + group.items.length + 1, 0),
    [groups],
  );
  const tier = pickTier(rows, viewportHeight);
  const t = TIERS[tier];

  return (
    <nav className="sticky top-0 flex h-[100dvh] w-44 shrink-0 flex-col py-density-4 lg:w-52 xl:w-56">
      <ul className={cn("min-h-0 flex-1 overflow-y-auto pr-density-1", t.groupGap)}>
        {groups.map((g) => (
          <li key={g.title}>
            <p
              className={cn(
                "uppercase tracking-wide text-muted-foreground font-semibold",
                t.headingGap,
                t.heading,
              )}
            >
              {g.title}
            </p>
            <ul className={t.itemGap} role="tablist" aria-label={`${g.title} components`}>
              {g.items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={item.id === activeId}
                    aria-controls={`demo-panel-${item.id}`}
                    onClick={() => onSelect(item.id)}
                    className={cn(
                      "block w-full rounded text-left transition-colors",
                      t.itemPad,
                      t.label,
                      item.id === activeId
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
