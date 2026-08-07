import { Fragment, useContext, useEffect, useRef, useState } from "react";
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingList,
  FloatingNode,
  FloatingPortal,
  offset,
  safePolygon,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingParentNodeId,
  useFloatingTree,
  useHover,
  useInteractions,
  useListItem,
  useListNavigation,
  useMergeRefs,
  useRole,
  type UseInteractionsReturn,
} from "@floating-ui/react";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { UiChevronRight } from "../icons";
import { MENU_POPOVER_CLASS, MenuContext } from "./dropdownMenuContext";
import { useEscapeLayer, useFloatingZIndex } from "./modalStack";
import type { DropdownMenuItem } from "./DropdownMenu";

// Shared item surfaces so a leaf renders identically in the root menu or a
// flyout submenu.
const MENU_ITEM_CLASS =
  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50";
const MENU_HEADER_CLASS =
  "select-none px-3 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground";

function MenuItemIcon({
  icon,
  iconColor,
}: {
  icon: string | StaticIconComponent | undefined;
  iconColor: string | undefined;
}) {
  if (!icon) return null;
  return (
    // `text-base` rather than inheriting the row: `Icon` sizes at 1em, so on a
    // `text-xs` row the glyph came out at 12px — smaller than anything a caller
    // puts in the label beside it, and too small to identify at a glance. The
    // row's content box is already 16px tall, so this does not change its height.
    <span
      className="inline-flex shrink-0 text-base"
      style={iconColor ? { color: iconColor } : undefined}
    >
      <Icon {...(typeof icon === "string" ? { name: icon } : { icon })} />
    </span>
  );
}

function MenuLeaf({ item }: { item: DropdownMenuItem }) {
  const menu = useContext(MenuContext);
  const tree = useFloatingTree();
  const listItem = useListItem();
  const isActive = listItem.index === menu.activeIndex;

  const activate = () => {
    if (item.disabled) return;
    item.onSelect();
    // A selection closes every open level; each menu subscribes to "click".
    tree?.events.emit("click");
  };

  return (
    <button
      ref={listItem.ref}
      type="button"
      role="menuitem"
      tabIndex={isActive ? 0 : -1}
      disabled={item.disabled}
      title={item.title}
      className={MENU_ITEM_CLASS}
      {...menu.getItemProps({
        onClick: activate,
        onFocus: () => menu.setHasFocusInside(true),
        onKeyDown: (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate();
          }
        },
      })}
    >
      <MenuItemIcon icon={item.icon} iconColor={item.iconColor} />
      {item.label}
    </button>
  );
}

function MenuSubmenu({ item }: { item: DropdownMenuItem }) {
  const parent = useContext(MenuContext);
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  const listItem = useListItem();

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hasFocusInside, setHasFocusInside] = useState(false);
  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const floatingZ = useFloatingZIndex();

  const { refs, floatingStyles, context } = useFloating<HTMLButtonElement>({
    // nodeId is always defined inside the FloatingTree; guard for the type only.
    ...(nodeId ? { nodeId } : {}),
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: "right-start",
    middleware: [
      offset({ mainAxis: 0, alignmentAxis: -4 }),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    delay: { open: 75 },
    handleClose: safePolygon(),
  });
  // Hover opens the flyout for mouse users; click/tap also opens it (touch and
  // keyboard) but never toggles it shut — leaving via safePolygon or selecting a
  // leaf is what closes it.
  const click = useClick(context, { toggle: false });
  const role = useRole(context, { role: "menu" });
  // Escape is owned by useEscapeLayer (below) so it dismisses one menu level at
  // a time and cooperates with modals; useDismiss keeps outside-press dismissal.
  const dismiss = useDismiss(context, { escapeKey: false, bubbles: true });
  const listNav = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    nested: true,
    onNavigate: setActiveIndex,
    loop: true,
  });
  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
    hover,
    click,
    role,
    dismiss,
    listNav,
  ]);

  useEscapeLayer(isOpen, () => setIsOpen(false));

  useEffect(() => {
    if (!tree) return;
    const closeAll = () => setIsOpen(false);
    const closeSiblings = (event: {
      nodeId: string;
      parentId: string | null;
    }) => {
      if (event.nodeId !== nodeId && event.parentId === parentId) {
        setIsOpen(false);
      }
    };
    tree.events.on("click", closeAll);
    tree.events.on("menuopen", closeSiblings);
    return () => {
      tree.events.off("click", closeAll);
      tree.events.off("menuopen", closeSiblings);
    };
  }, [tree, nodeId, parentId]);

  useEffect(() => {
    if (isOpen && tree) tree.events.emit("menuopen", { parentId, nodeId });
  }, [isOpen, tree, nodeId, parentId]);

  const isActive = listItem.index === parent.activeIndex;
  const referenceRef = useMergeRefs([refs.setReference, listItem.ref]);
  const ariaLabel = typeof item.label === "string" ? item.label : undefined;

  return (
    <FloatingNode id={nodeId}>
      <button
        ref={referenceRef}
        type="button"
        role="menuitem"
        tabIndex={isActive ? 0 : -1}
        disabled={item.disabled}
        title={item.title}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        data-focus-inside={hasFocusInside ? "" : undefined}
        className={MENU_ITEM_CLASS}
        {...parent.getItemProps(
          // Merge the parent's roving-tabindex props with this trigger's own
          // reference props (open on hover/click/ArrowRight). Both prop-getters
          // return an opaque prop bag; the cast bridges the two getter
          // signatures (getReferenceProps -> getItemProps parameter).
          getReferenceProps({
            onFocus: () => {
              setHasFocusInside(false);
              parent.setHasFocusInside(true);
            },
          }) as unknown as Parameters<UseInteractionsReturn["getItemProps"]>[0],
        )}
      >
        <MenuItemIcon icon={item.icon} iconColor={item.iconColor} />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
        <Icon icon={UiChevronRight} className="ml-auto shrink-0 opacity-60" />
      </button>
      <MenuContext.Provider
        value={{
          getItemProps,
          activeIndex,
          setActiveIndex,
          setHasFocusInside,
          isOpen,
        }}
      >
        <FloatingList elementsRef={elementsRef}>
          {isOpen && (
            <FloatingPortal>
              <FloatingFocusManager
                context={context}
                modal={false}
                initialFocus={-1}
                returnFocus={false}
              >
                <div
                  ref={refs.setFloating}
                  role="menu"
                  aria-label={ariaLabel}
                  style={{ ...floatingStyles, zIndex: floatingZ }}
                  className={MENU_POPOVER_CLASS}
                  {...getFloatingProps()}
                >
                  <MenuItemList items={item.children ?? []} />
                </div>
              </FloatingFocusManager>
            </FloatingPortal>
          )}
        </FloatingList>
      </MenuContext.Provider>
    </FloatingNode>
  );
}

/**
 * Renders one menu level: a leaf `menuitem` button, or a submenu trigger when
 * the item has `children`. A group header renders above the first item of each
 * contiguous group (headers are not focusable, so keyboard navigation stays
 * dense over the interactive items). Must be rendered inside a `FloatingList`
 * whose `elementsRef` backs the enclosing menu's list navigation.
 */
export function MenuItemList({ items }: { items: DropdownMenuItem[] }) {
  return (
    <>
      {items.map((item, index) => {
        const showHeader =
          item.group != null && item.group !== items[index - 1]?.group;
        const hasChildren = !!item.children && item.children.length > 0;
        return (
          <Fragment key={index}>
            {showHeader && (
              <div role="presentation" className={MENU_HEADER_CLASS}>
                {item.group}
              </div>
            )}
            {hasChildren ? (
              <MenuSubmenu item={item} />
            ) : (
              <MenuLeaf item={item} />
            )}
          </Fragment>
        );
      })}
    </>
  );
}
