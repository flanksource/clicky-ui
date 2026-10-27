import { Fragment, useContext, useLayoutEffect, useState, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ListMenuVirtualContext, type ListMenuVirtualState } from "./list-menu-virtual";

export interface ListMenuItemsProps<T> {
  items: readonly T[];
  getItemKey: (item: T) => string;
  children: (item: T, index: number) => ReactNode;
}

export function ListMenuItems<T>(props: ListMenuItemsProps<T>) {
  const virtual = useContext(ListMenuVirtualContext);
  return virtual ? <VirtualMenuItems {...props} virtual={virtual} /> : <MenuItems {...props} />;
}

function MenuItems<T>({ items, getItemKey, children }: ListMenuItemsProps<T>) {
  return items.map((item, index) => <Fragment key={getItemKey(item)}>{children(item, index)}</Fragment>);
}

function VirtualMenuItems<T>({ items, getItemKey, children, virtual }: ListMenuItemsProps<T> & { virtual: ListMenuVirtualState }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [layout, setLayout] = useState<{ count: number; estimate: number; margin: number } | null>(null);
  const { scrollElement, contentElement, estimateRowHeight, overscan } = virtual;
  const scrollMargin = layout?.count === items.length && layout.estimate === estimateRowHeight ? layout.margin : null;

  useLayoutEffect(() => {
    if (!container || !scrollElement || !contentElement) return;
    const measure = () => {
      const margin = container.getBoundingClientRect().top - scrollElement.getBoundingClientRect().top + scrollElement.scrollTop - scrollElement.clientTop;
      setLayout(previous => previous?.count === items.length && previous.estimate === estimateRowHeight && previous.margin === margin
        ? previous : { count: items.length, estimate: estimateRowHeight, margin });
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(contentElement);
    observer.observe(scrollElement);
    return () => observer.disconnect();
  }, [container, scrollElement, contentElement, items.length, estimateRowHeight]);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => scrollElement,
    estimateSize: () => estimateRowHeight,
    getItemKey: index => {
      const item = items[index];
      if (item === undefined) throw new Error(`ListMenu item ${index} is outside its collection`);
      return getItemKey(item);
    },
    overscan,
    scrollMargin: scrollMargin ?? 0,
    enabled: scrollMargin !== null,
  });
  const offset = virtualizer.scrollOffset ?? 0;
  const height = virtualizer.scrollRect?.height ?? 0;
  const visible = virtualizer.getVirtualItems().filter(item => (
    item.end >= offset - overscan * estimateRowHeight && item.start <= offset + height + overscan * estimateRowHeight
  ));

  return (
    <div ref={setContainer} data-slot="list-menu-items" className="relative w-full" style={{ height: scrollMargin === null ? items.length * estimateRowHeight : virtualizer.getTotalSize() }}>
      {visible.map(row => {
        const item = items[row.index];
        if (item === undefined) throw new Error(`ListMenu item ${row.index} is outside its collection`);
        return (
          <div key={row.key} ref={virtualizer.measureElement} data-index={row.index} className="absolute left-0 top-0 w-full" style={{ transform: `translateY(${row.start - (scrollMargin ?? 0)}px)` }}>
            {children(item, row.index)}
          </div>
        );
      })}
    </div>
  );
}
