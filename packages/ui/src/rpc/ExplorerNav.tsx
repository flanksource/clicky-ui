import { useContext, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../data/Icon";
import { UiChevronRight } from "../icons";
import { useRouter } from "./router";
import { ExplorerNavContext } from "./explorer-nav-context";

export type ExplorerNavPortalProps = {
  /** Where the surface breadcrumb leads — the surface listing with the host's filters kept. */
  parentHref: string;
  children: ReactNode;
};

/**
 * Renders a drill-down page's title into EntityExplorerApp's top bar, after a
 * breadcrumb back to the surface it was opened from.
 */
export function ExplorerNavPortal({ parentHref, children }: ExplorerNavPortalProps) {
  const slot = useContext(ExplorerNavContext);
  const { renderLink } = useRouter();
  const claim = slot?.claim;
  useEffect(() => claim?.(), [claim]);
  if (!slot) throw new Error("ExplorerNavPortal must render inside EntityExplorerApp");
  const { container, title, titleActions } = slot;
  if (!container) return null;
  return createPortal(
    <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-density-2">
      {renderLink({
        to: parentHref,
        className: "shrink-0 text-base font-semibold tracking-tight text-muted-foreground hover:text-foreground hover:underline",
        children: title,
      })}
      {titleActions ? <div className="flex shrink-0 items-center">{titleActions}</div> : null}
      <Icon icon={UiChevronRight} className="shrink-0 text-muted-foreground" />
      <div aria-current="page" className="flex min-w-0 flex-1 items-center gap-density-2">
        {children}
      </div>
    </nav>,
    container,
  );
}
