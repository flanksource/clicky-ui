/** The box a hovered element is outlined with, positioned inside `root` (which must be `position: relative`). */
export function ElementOutline({ element, root }: { element: Element; root: Element }) {
  const box = element.getBoundingClientRect();
  const base = root.getBoundingClientRect();
  return (
    <div
      data-element-outline=""
      className="pointer-events-none absolute z-30 border-2 border-primary"
      style={{ left: box.left - base.left, top: box.top - base.top, width: box.width, height: box.height }}
    />
  );
}
