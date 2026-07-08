import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export type RawFenceEditorProps = {
  info: string;
  body: string;
  badge?: ReactNode;
  helper?: ReactNode;
  readOnly: boolean;
  onChange: (body: string) => void;
};

export function RawFenceEditor({
  info,
  body,
  badge,
  helper,
  readOnly,
  onChange,
}: RawFenceEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      {(badge != null || helper != null) && (
        <div className="flex flex-wrap items-center gap-2">
          {badge}
          {helper != null && (
            <span className="text-xs text-muted-foreground">{helper}</span>
          )}
        </div>
      )}
      <textarea
        aria-label={`${info || "fence"} source`}
        value={body}
        onChange={(event) => onChange(event.currentTarget.value)}
        readOnly={readOnly}
        spellCheck={false}
        className={cn(
          "min-h-40 w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-xs leading-5 text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          readOnly && "cursor-default bg-muted/40",
        )}
      />
    </div>
  );
}
