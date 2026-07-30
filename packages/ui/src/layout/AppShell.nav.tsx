import type { ReactNode } from "react";
import { Icon } from "../data/Icon";
import { cn } from "../lib/utils";
import type { RenderLink } from "../rpc/EndpointList";
import { useRouter } from "../rpc/router";
import type { AppShellNavItem, AppShellNavSection } from "./AppShell";

export function NavSections({
  sections,
  collapsed,
  onNavigate,
}: {
  sections: AppShellNavSection[];
  collapsed: boolean;
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
          {section.items.map((item) => (
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
    return (
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
  }
  const link = renderLink({
    key: item.key,
    to: item.to,
    className,
    children,
    ...(title ? { title } : {}),
  });

  if (!onNavigate) return link;
  return <div onClick={onNavigate}>{link}</div>;
}
