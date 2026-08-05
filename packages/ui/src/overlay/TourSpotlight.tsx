import { cn } from "../lib/utils";
import { spotlightClipPath, type SpotlightRect } from "./tour-geometry";
import type { TourInteraction } from "./tour-types";
import { zIndex } from "./zIndex";

/**
 * The dim layer. One element clipped with `clip-path: path(evenodd, ...)`: the
 * clipped-away hole does not hit-test, so the dim swallows clicks while the
 * anchor underneath stays clickable and typable, with no extra blocker element
 * and no inverted pointer semantics.
 */

// A browser that cannot clip would paint an uncut opaque sheet over the whole
// app, which is far worse than simply having no dim.
const SUPPORTS_CLIP_PATH =
  typeof CSS !== "undefined" && typeof CSS.supports === "function"
    ? CSS.supports("clip-path", "path('M0 0')")
    : false;

export function TourSpotlight({
  cutout,
  viewport,
  interaction,
  className,
}: {
  cutout: SpotlightRect | null;
  viewport: { width: number; height: number };
  interaction: TourInteraction;
  className?: string | undefined;
}) {
  if (!SUPPORTS_CLIP_PATH) return null;

  return (
    <>
      <div
        aria-hidden="true"
        data-tour-spotlight=""
        className={cn(
          "fixed inset-0 bg-black/40 transition-[clip-path] duration-200 motion-reduce:transition-none",
          interaction === "allow-all" ? "pointer-events-none" : "pointer-events-auto",
          className,
        )}
        style={{
          zIndex: zIndex.tour,
          clipPath: spotlightClipPath({ viewport, cutout }),
        }}
      />
      {interaction === "block-all" && cutout ? (
        // The cutout is a hole in the dim, so blocking the anchor too needs a
        // second, unclipped layer above it.
        <div
          aria-hidden="true"
          className="fixed inset-0"
          style={{ zIndex: zIndex.tour + 1 }}
        />
      ) : null}
    </>
  );
}
