import type { ComponentType, CSSProperties, ReactNode } from "react";
import type { Props as RndProps } from "react-rnd";
import { cn } from "../../lib/utils";
import type { ChatWindowState } from "./chat-window-context";

/** The small-screen query the chat window switches to a full-screen sheet at.
 *  Matches AppShell's md breakpoint (its mobile drawer is md:hidden); export so hosts can align
 *  their own chrome (e.g. hide a bottom bar) with it. */
export const CHAT_WINDOW_MOBILE_QUERY = "(max-width: 767px)";

const MAXIMIZE_CSS = `
.chat-maximized .react-draggable {
  transform: none !important;
  width: auto !important;
  height: auto !important;
  inset: 0 !important;
  position: absolute !important;
}`;

/** The window on a phone: fixed to the dynamic viewport (`h-dvh`, so a URL-bar
 *  or on-screen-keyboard resize never pushes the prompt off-screen), clipped so
 *  the document cannot scroll, padded by the top and side safe areas (the
 *  prompt bar pads its own bottom), never draggable or resizable. `hidden`
 *  keeps a non-front window mounted (its stream and draft survive) without
 *  painting it. */
export function ChatWindowSheet({
  layerStyle,
  hidden,
  children,
}: {
  /** Stacking style of the window layer, built by the host (ChatWindow). */
  layerStyle: CSSProperties;
  hidden: boolean;
  children: ReactNode;
}) {
  return (
    <div hidden={hidden}>
      <div
        data-testid="chat-window-sheet"
        className={cn(
          "fixed inset-x-0 top-0 flex h-dvh flex-col overflow-hidden bg-background",
          "pt-[env(safe-area-inset-top)]",
          "pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]",
        )}
        style={layerStyle}
      >
        {children}
      </div>
    </div>
  );
}

/** The window on a larger screen: a draggable/resizable react-rnd box. Until
 *  react-rnd loads (and as a graceful fallback if it never does) the window is
 *  statically positioned — still usable, just not draggable. */
export function ChatWindowFloating({
  panel,
  layerStyle,
  Rnd,
  onDragStart,
  onGeometryChange,
  children,
}: {
  panel: ChatWindowState;
  /** Stacking style of the window layer, built by the host (ChatWindow). */
  layerStyle: CSSProperties;
  Rnd: ComponentType<RndProps> | null;
  onDragStart: () => void;
  onGeometryChange: (
    partial: Pick<Partial<ChatWindowState>, "x" | "y" | "width" | "height">,
  ) => void;
  children: ReactNode;
}) {
  const outerClass = cn(
    "fixed pointer-events-none",
    panel.maximized ? "inset-4 chat-maximized" : "inset-0",
  );

  if (!Rnd) {
    return (
      <div className={outerClass} style={layerStyle}>
        <div
          className="pointer-events-auto h-full"
          style={
            panel.maximized
              ? { position: "relative", width: "100%", height: "100%" }
              : {
                  position: "absolute",
                  left: panel.x,
                  top: panel.y,
                  width: panel.width,
                  height: panel.height,
                }
          }
        >
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={outerClass} style={layerStyle}>
      <style>{MAXIMIZE_CSS}</style>
      <Rnd
        default={{
          x: panel.x,
          y: panel.y,
          width: panel.width,
          height: panel.height,
        }}
        style={{ pointerEvents: "auto" }}
        minWidth={Math.min(360, Math.max(1, window.innerWidth - 32))}
        minHeight={Math.min(400, Math.max(1, window.innerHeight - 32))}
        bounds="parent"
        dragHandleClassName="chat-drag-handle"
        disableDragging={panel.maximized}
        enableResizing={!panel.maximized}
        onDragStart={onDragStart}
        onDragStop={(_e, d) => onGeometryChange({ x: d.x, y: d.y })}
        onResizeStop={(_e, _dir, ref, _delta, pos) =>
          onGeometryChange({
            width: ref.offsetWidth,
            height: ref.offsetHeight,
            x: pos.x,
            y: pos.y,
          })
        }
      >
        {children}
      </Rnd>
    </div>
  );
}
