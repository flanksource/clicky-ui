import type { ComponentType, ReactNode } from "react";

/** `color` is the identity's brand colour (Kubernetes blue, IAM red); it tints the chip border only. */
export type EdgeTagSpec = { label: string; icon: ComponentType; color: string };

export const K8S_BLUE = "#326CE5";

export const AWS_IAM_RED = "#DD344C";

/**
 * tags/edge: facts about who a box runs as (service account, IAM role) sit on
 * its top border as icon + mono label chips, left to right.
 */
export function EdgeTagged({ tags, children }: { tags: EdgeTagSpec[]; children: ReactNode }) {
  if (tags.length === 0) return children;
  return (
    // The tag row is in flow so the box stretches to at least the tags' width; -mb pulls it onto the top border.
    <div className="flex w-max flex-col">
      <div className="relative z-10 -mb-[9px] flex gap-1 px-2">
        {tags.map(({ label, icon: Icon, color }) => (
          <span key={label} className="inline-flex items-center gap-1 whitespace-nowrap rounded-[2px] border bg-white px-1 font-mono text-[10px] leading-4 text-slate-800" style={{ borderColor: color }}>
            <span className="inline-flex h-3.5 w-3.5 shrink-0 [&>svg]:h-full [&>svg]:w-full"><Icon /></span>
            {label}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}
