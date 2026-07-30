import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type PanelTone = "default" | "danger" | "warning" | "success" | "info";

export type PanelFrameProps = {
  header?: ReactNode;
  footer?: ReactNode;
  tone?: PanelTone;
  padded?: boolean;
  bodyVisible?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  children: ReactNode;
};

const toneRing: Record<PanelTone, string> = {
  default: "",
  danger: "border-l-2 border-l-red-500",
  warning: "border-l-2 border-l-yellow-500",
  success: "border-l-2 border-l-green-500",
  info: "border-l-2 border-l-blue-500",
};

export function PanelFrame({
  header,
  footer,
  tone = "default",
  padded = true,
  bodyVisible = true,
  className,
  headerClassName,
  bodyClassName,
  children,
}: PanelFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-border bg-card",
        toneRing[tone],
        className,
      )}
    >
      {header !== undefined && (
        <div
          className={cn(
            "flex items-center gap-2 px-density-3 py-density-2",
            bodyVisible && "border-b border-border",
            headerClassName,
          )}
        >
          {header}
        </div>
      )}
      {bodyVisible && (
        <div
          className={cn(padded && "px-density-3 py-density-2", bodyClassName)}
        >
          {children}
        </div>
      )}
      {bodyVisible && footer !== undefined && (
        <div className="border-t border-border px-density-3 py-density-2">
          {footer}
        </div>
      )}
    </div>
  );
}
