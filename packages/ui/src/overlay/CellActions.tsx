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
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { Icon, type StaticIconComponent } from "../data/Icon";
import { cn } from "../lib/utils";
import type { DropdownMenuItem } from "./DropdownMenu";
import { MenuItemList } from "./DropdownMenuSubmenu";
import { MENU_POPOVER_CLASS, MenuContext } from "./dropdownMenuContext";
import { useEscapeLayer, useFloatingZIndex } from "./modalStack";

export type CellActionsProps = {
  contextTarget: HTMLElement | null;
  menuLabel: string;
  menuItems: DropdownMenuItem[];
  children: ReactNode;
  className?: string;
};

export type CellActionButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
> & {
  label: string;
  icon: StaticIconComponent;
  onSelect: () => void;
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

function CellActionsRoot({
  contextTarget,
  menuLabel,
  menuItems,
  children,
  className,
}: CellActionsProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const elementsRef = useRef<Array<HTMLElement | null>>([]);
  const floatingZ = useFloatingZIndex();
  const tree = useFloatingTree();
  const nodeId = useFloatingNodeId();

  const closeMenu = useCallback(() => {
    setOpen(false);
    queueMicrotask(() => returnFocusRef.current?.focus({ preventScroll: true }));
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
      returnFocusRef.current = active instanceof HTMLElement ? active : contextTarget;
      refs.setPositionReference(pointReference(x, y, contextTarget));
      setActiveIndex(null);
      setOpen(true);
    },
    [contextTarget, menuItems.length, refs],
  );

  useEffect(() => {
    if (!contextTarget || menuItems.length === 0) return;
    contextTarget.classList.add("group/cell-actions");

    const onContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      openAt(event.clientX, event.clientY);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ContextMenu" && !(event.key === "F10" && event.shiftKey)) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = contextTarget.getBoundingClientRect();
      openAt(rect.left + 8, rect.top + Math.min(rect.height, 24));
    };

    contextTarget.addEventListener("contextmenu", onContextMenu);
    contextTarget.addEventListener("keydown", onKeyDown);
    return () => {
      contextTarget.classList.remove("group/cell-actions");
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
      <span
        className={cn("ms-1 inline-flex items-center gap-0.5 align-middle", className)}
        contentEditable={false}
      >
        {children}
      </span>
      {open && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} returnFocus={false}>
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

export function CellActions(props: CellActionsProps) {
  return (
    <FloatingTree>
      <CellActionsRoot {...props} />
    </FloatingTree>
  );
}

export function CellActionButton({
  label,
  icon,
  onSelect,
  className,
  title = label,
  onMouseDown,
  ...props
}: CellActionButtonProps) {
  return (
    <button
      {...props}
      type="button"
      title={title}
      aria-label={label}
      className={cn(
        "inline-flex size-5 items-center justify-center rounded-full p-1 text-muted-foreground opacity-70 transition-colors transition-opacity hover:bg-primary/10 hover:text-primary hover:opacity-100 focus-visible:bg-primary/10 focus-visible:text-primary focus-visible:opacity-100 focus-visible:outline-none group-hover/cell-actions:opacity-95",
        className,
      )}
      onMouseDown={(event) => {
        event.preventDefault();
        onMouseDown?.(event);
      }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onSelect();
      }}
    >
      <Icon icon={icon} className="text-sm" />
    </button>
  );
}
