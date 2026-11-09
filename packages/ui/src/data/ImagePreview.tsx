import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

export type ImagePreviewProps = {
  /** URL that serves the image bytes. */
  src: string;
  /** Accessible name, and the name in the load-error message; defaults to `src`. */
  alt?: string | undefined;
  className?: string | undefined;
};

const CHECKERBOARD = {
  backgroundImage:
    "conic-gradient(color-mix(in srgb, var(--muted-foreground) 14%, transparent) 25%, transparent 0 50%, color-mix(in srgb, var(--muted-foreground) 14%, transparent) 0 75%, transparent 0)",
  backgroundSize: "16px 16px",
} as const;

/**
 * An image centered on a checkerboard so transparency shows, scaled to fit the
 * pane; clicking toggles its actual size. A load failure is shown, not hidden.
 */
export function ImagePreview({ src, alt, className }: ImagePreviewProps) {
  const [failed, setFailed] = useState(false);
  const [actual, setActual] = useState(false);
  const name = alt || src;

  useEffect(() => {
    setFailed(false);
    setActual(false);
  }, [src]);

  if (failed) {
    return (
      <div role="alert" className={cn("m-density-4 rounded-md border border-destructive/40 p-3 text-sm text-destructive", className)}>
        Could not load {name}
      </div>
    );
  }

  return (
    <div
      data-image-preview=""
      className={cn("flex size-full min-h-0 items-center justify-center overflow-auto bg-muted/30 p-density-4", className)}
      style={CHECKERBOARD}
    >
      <img
        src={src}
        alt={name}
        data-size={actual ? "actual" : "fit"}
        onClick={() => setActual((value) => !value)}
        onError={() => setFailed(true)}
        className={cn(
          "rounded-sm bg-background shadow-sm",
          actual ? "max-w-none cursor-zoom-out" : "max-h-full max-w-full cursor-zoom-in object-contain",
        )}
      />
    </div>
  );
}
