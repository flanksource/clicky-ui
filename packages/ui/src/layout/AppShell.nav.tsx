import { useState, type ReactNode } from "react";
import { Icon } from "../data/Icon";
import { cn } from "../lib/utils";
import { ContextMenu } from "../overlay/ContextMenu";
import type { RenderLink } from "../rpc/EndpointList";
import { useRouter } from "../rpc/router";
import type {
  AppShellNavGroup,
  AppShellNavItem,
  AppShellNavSection,
} from "./AppShell";

// Per-group collapsed state. Owned by AppShell (see `useGroupCollapsed` there)
// and passed down, because AppShell renders NavSections twice — the desktop
// rail and the mobile drawer — and per-render state behind one storage key
// would desync: the rail stays mounted while the drawer is open, so a drawer
// toggle would write localStorage the rail never reads back.
export interface GroupState {
  isCollapsed: (key: string, fallback: boolean) => boolean;
  toggle: (key: string, fallback: boolean) => void;
}

export function NavSections({
  sections,
  collapsed,
  groupState,
  onNavigate,
}: {
  sections: AppShellNavSection[];
  collapsed: boolean;
  groupState: GroupState;
  onNavigate?: () => void;
}) {
  const { renderLink } = useRouter();
  return (
    <nav
      className={cn(
        "flex flex-col gap-0.5",
        collapsed ? "px-2" : "px-density-2",
      )}
    >
      {sections.map((section, index) => (
        <div
          key={section.label ?? `section-${index}`}
          className="flex flex-col"
        >
          {section.label &&
            (collapsed ? (
              <div className="mx-2 mb-1 mt-3 border-t border-sidebar-border first:mt-1" />
            ) : (
              <div className="mb-0.5 mt-3 px-density-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/55 first:mt-1">
                {section.label}
              </div>
            ))}
          {section.variant !== "tree" &&
            section.items?.map((item) => (
              <NavItemRow
                key={item.key}
                item={item}
                collapsed={collapsed}
                renderLink={renderLink}
                {...(onNavigate ? { onNavigate } : {})}
              />
            ))}
          {section.groups?.map((group) =>
            // A collapsed rail has no room for group headings, so the whole
            // subtree flattens into the icon strip rather than hiding behind
            // toggles the user cannot see.
            collapsed ? (
              flattenGroup(group).map((item) => (
                <NavItemRow
                  key={item.key}
                  item={item}
                  collapsed
                  renderLink={renderLink}
                  {...(onNavigate ? { onNavigate } : {})}
                />
              ))
            ) : (
              <NavGroupRows
                key={group.key}
                group={group}
                variant={section.variant ?? "list"}
                renderLink={renderLink}
                groupState={groupState}
                {...(onNavigate ? { onNavigate } : {})}
              />
            ),
          )}
          {section.variant === "tree" &&
            section.items?.map((item) => (
              <NavItemRow
                key={item.key}
                item={item}
                collapsed={collapsed}
                renderLink={renderLink}
                {...(onNavigate ? { onNavigate } : {})}
              />
            ))}
        </div>
      ))}
    </nav>
  );
}

// flattenGroup collects every destination in a group's subtree — its own row
// (when it has one), its items, and everything under its nested groups.
function flattenGroup(group: AppShellNavGroup): AppShellNavItem[] {
  return [
    ...(group.item ? [group.item] : []),
    ...group.items,
    ...(group.groups ?? []).flatMap(flattenGroup),
  ];
}

function NavGroupRows({
  group,
  variant,
  renderLink,
  groupState,
  onNavigate,
}: {
  group: AppShellNavGroup;
  variant: "list" | "tree";
  renderLink: RenderLink;
  groupState: GroupState;
  onNavigate?: () => void;
}) {
  const [contextTarget, setContextTarget] = useState<HTMLElement | null>(null);
  const hasChildren = group.items.length > 0 || (group.groups?.length ?? 0) > 0;
  const fallback = group.defaultCollapsed ?? false;
  const collapsed =
    !group.forceExpanded && groupState.isCollapsed(group.key, fallback);
  const toggle = () => groupState.toggle(group.key, fallback);
  const chevron = (
    <span aria-hidden className="text-[0.65rem] opacity-60">
      {collapsed ? "▸" : "▾"}
    </span>
  );
  const groupIcon = group.icon && (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center">
      <Icon
        {...(typeof group.icon === "string"
          ? { name: group.icon }
          : { icon: group.icon })}
      />
    </span>
  );
  if (!hasChildren && !group.item) {
    return (
      <>
        <div
          ref={setContextTarget}
          className="flex items-center gap-2.5 rounded-md px-density-2 py-1.5 text-[13px] text-sidebar-foreground"
        >
          {groupIcon}
          <span className="flex-1 truncate text-left">{group.label}</span>
          {group.badge}
        </div>
        {group.contextMenu && (
          <ContextMenu
            contextTarget={contextTarget}
            menuLabel={group.contextMenuLabel ?? `${group.label} actions`}
            menuItems={group.contextMenu}
          />
        )}
      </>
    );
  }
  if (!hasChildren && group.item) {
    return (
      <div className="flex items-center gap-1">
        <div className="min-w-0 flex-1">
          <NavItemRow
            item={group.item}
            collapsed={false}
            renderLink={renderLink}
            {...(onNavigate ? { onNavigate } : {})}
          />
        </div>
        {group.badge}
      </div>
    );
  }
  return (
    <div className="flex flex-col">
      {group.item ? (
        // Folder AND leaf: the link and the disclosure are siblings. Nesting a
        // button inside the anchor would be invalid DOM and would make the
        // click target ambiguous.
        <div
          ref={setContextTarget}
          className="group/nav flex items-center gap-1"
        >
          <div className="min-w-0 flex-1">
            <NavItemRow
              item={group.item}
              collapsed={false}
              renderLink={renderLink}
              {...(onNavigate ? { onNavigate } : {})}
            />
          </div>
          {group.badge}
          <button
            type="button"
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-label={`${collapsed ? "Expand" : "Collapse"} ${group.label}`}
            className="shrink-0 rounded-md px-1.5 py-1.5 text-sidebar-foreground/55 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {chevron}
          </button>
          {group.contextMenu && (
            <ContextMenu
              contextTarget={contextTarget}
              menuLabel={
                group.contextMenuLabel ?? `${group.label} folder actions`
              }
              menuItems={group.contextMenu}
            />
          )}
        </div>
      ) : (
        <>
          <button
            ref={setContextTarget}
            type="button"
            onClick={toggle}
            aria-expanded={!collapsed}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-density-2 py-1.5 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              variant === "tree"
                ? "text-[13px] text-sidebar-foreground"
                : "text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/55",
            )}
          >
            {groupIcon}
            <span className="flex-1 truncate text-left">{group.label}</span>
            {group.badge}
            {chevron}
          </button>
          {group.contextMenu && (
            <ContextMenu
              contextTarget={contextTarget}
              menuLabel={group.contextMenuLabel ?? `${group.label} actions`}
              menuItems={group.contextMenu}
            />
          )}
        </>
      )}
      {!collapsed && (
        <div className="ml-2 mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border pl-2">
          {variant !== "tree" &&
            group.items.map((item) => (
              <NavItemRow
                key={item.key}
                item={item}
                collapsed={false}
                renderLink={renderLink}
                {...(onNavigate ? { onNavigate } : {})}
              />
            ))}
          {group.groups?.map((child) => (
            <NavGroupRows
              key={child.key}
              group={child}
              variant={variant}
              renderLink={renderLink}
              groupState={groupState}
              {...(onNavigate ? { onNavigate } : {})}
            />
          ))}
          {variant === "tree" &&
            group.items.map((item) => (
              <NavItemRow
                key={item.key}
                item={item}
                collapsed={false}
                renderLink={renderLink}
                {...(onNavigate ? { onNavigate } : {})}
              />
            ))}
        </div>
      )}
    </div>
  );
}

function NavItemRow({
  item,
  collapsed,
  renderLink,
  onNavigate,
}: {
  item: AppShellNavItem;
  collapsed: boolean;
  renderLink: RenderLink;
  onNavigate?: () => void;
}) {
  const [contextTarget, setContextTarget] = useState<HTMLElement | null>(null);
  const className = cn(
    "flex w-full items-center gap-2.5 rounded-md px-density-2 py-1.5 text-left text-[13px] text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    collapsed && "justify-center px-0",
    item.active && "bg-sidebar-accent font-medium text-sidebar-primary",
  );
  const children: ReactNode = (
    <>
      {item.icon && (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center">
          <Icon
            {...(typeof item.icon === "string"
              ? { name: item.icon }
              : { icon: item.icon })}
          />
        </span>
      )}
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge}
    </>
  );
  const title =
    collapsed && typeof item.label === "string" ? item.label : undefined;

  if (item.external) {
    const externalLink = (
      <a
        href={item.to}
        className={className}
        title={title}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onNavigate}
      >
        {children}
      </a>
    );
    if (!item.contextMenu) return externalLink;
    return (
      <div ref={setContextTarget} className="w-full">
        {externalLink}
        <ContextMenu
          contextTarget={contextTarget}
          menuLabel={item.contextMenuLabel ?? `${String(item.label)} actions`}
          menuItems={item.contextMenu}
        />
      </div>
    );
  }
  const link = renderLink({
    key: item.key,
    to: item.to,
    className,
    children,
    ...(title ? { title } : {}),
  });

  if (!onNavigate && !item.contextMenu) return link;
  return (
    <div
      ref={item.contextMenu ? setContextTarget : undefined}
      className="w-full"
      {...(onNavigate ? { onClick: onNavigate } : {})}
    >
      {link}
      {item.contextMenu && (
        <ContextMenu
          contextTarget={contextTarget}
          menuLabel={item.contextMenuLabel ?? `${String(item.label)} actions`}
          menuItems={item.contextMenu}
        />
      )}
    </div>
  );
}
