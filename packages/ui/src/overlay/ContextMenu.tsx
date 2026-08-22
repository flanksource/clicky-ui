import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  FloatingList,
  FloatingNode,
  FloatingPortal,
  FloatingTree,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFloatingNodeId,
  useFloatingTree,
  useInteractions,
  useListNavigation,
  useRole,
  type VirtualElement,
} from "@floating-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DropdownMenuItem } from "./DropdownMenu";
import { MenuItemList } from "./DropdownMenuSubmenu";
import { MENU_POPOVER_CLASS, MenuContext } from "./dropdownMenuContext";
import { useEscapeLayer, useFloatingZIndex } from "./modalStack";

export type ContextMenuProps = {
  contextTarget: HTMLElement | null;
  menuLabel: string;
  menuItems: DropdownMenuItem[];
};

function pointReference(
  x: number,
  y: number,
  contextElement: HTMLElement,
): VirtualElement {
  return {
    contextElement,
    getBoundingClientRect: () => ({
      x,
      y,
      top: y,
      left: x,
      right: x,
      bottom: y,
      width: 0,
      height: 0,
      toJSON: () => ({}),
    }),
  };
}

function ContextMenuRoot({
  contextTarget,
  menuLabel,
  menuItems,
}: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const floatingZ = useFloatingZIndex();
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();

  const closeMenu = useCallback(() => {
    setOpen(false);
    queueMicrotask(() =>
      returnFocusRef.current?.focus({ preventScroll: true }),
    );
  }, []);

  const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
    ...(nodeId ? { nodeId } : {}),
    open,
    onOpenChange: (next) => (next ? setOpen(true) : closeMenu()),
    placement: "right-start",
    middleware: [offset(4), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context, { escapeKey: false });
  const role = useRole(context, { role: "menu" });
  const listNavigation = useListNavigation(context, {
    listRef: elementsRef,
    activeIndex,
    onNavigate: setActiveIndex,
    loop: true,
  });
  const { getFloatingProps, getItemProps } = useInteractions([
    dismiss,
    role,
    listNavigation,
  ]);

  const openAt = useCallback(
    (x: number, y: number) => {
      if (!contextTarget || menuItems.length === 0) return;
      const active = document.activeElement;
      returnFocusRef.current =
        active instanceof HTMLElement ? active : contextTarget;
      refs.setPositionReference(pointReference(x, y, contextTarget));
      setActiveIndex(null);
      setOpen(true);
    },
    [contextTarget, menuItems.length, refs],
  );

  useEffect(() => {
    if (!contextTarget || menuItems.length === 0) return;
    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      openAt(event.clientX, event.clientY);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key !== "ContextMenu" &&
        !(event.key === "F10" && event.shiftKey)
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      const rect = contextTarget.getBoundingClientRect();
      openAt(rect.left + 8, rect.top + Math.min(rect.height, 24));
    };

    contextTarget.addEventListener("contextmenu", onContextMenu);
    contextTarget.addEventListener("keydown", onKeyDown);
    return () => {
      contextTarget.removeEventListener("contextmenu", onContextMenu);
      contextTarget.removeEventListener("keydown", onKeyDown);
    };
  }, [contextTarget, menuItems.length, openAt]);

  useEffect(() => {
    if (!tree) return;
    tree.events.on("click", closeMenu);
    return () => tree.events.off("click", closeMenu);
  }, [closeMenu, tree]);

  useEscapeLayer(open, closeMenu);

  return (
    <FloatingNode id={nodeId}>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager
            context={context}
            modal={false}
            returnFocus={false}
          >
            <div
              ref={refs.setFloating}
              role="menu"
              aria-label={menuLabel}
              style={{ ...floatingStyles, zIndex: floatingZ }}
              className={MENU_POPOVER_CLASS}
              {...getFloatingProps()}
            >
              <MenuContext.Provider
                value={{
                  getItemProps,
                  activeIndex,
                  setActiveIndex,
                  setHasFocusInside: () => {},
                  isOpen: open,
                }}
              >
                <FloatingList elementsRef={elementsRef}>
                  <MenuItemList items={menuItems} />
                </FloatingList>
              </MenuContext.Provider>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </FloatingNode>
  );
}

export function ContextMenu(props: ContextMenuProps) {
  return (
    <FloatingTree>
      <ContextMenuRoot {...props} />
    </FloatingTree>
  );
}
