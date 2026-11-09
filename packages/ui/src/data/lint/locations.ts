// What a violation location points at, as text and as group keys. Pure, so the
// groupings, the table and the location list all describe a place the same way.

import { relPath } from "./paths";
import type {
  LintTargetKind,
  Violation,
  ViolationEntity,
  ViolationImageRegion,
  ViolationLocation,
  ViolationUrlTarget,
} from "./types";

const SELECTOR_STRATEGIES = ["css", "xpath", "testId", "role", "text"] as const;

/** A URL target's selector as `strategy: value`, or undefined for the bare page. */
export function urlSelector(target: ViolationUrlTarget): string | undefined {
  const set = SELECTOR_STRATEGIES.filter((strategy) => target[strategy]);
  if (set.length > 1) {
    throw new Error(`lint: location ${JSON.stringify(target.url)} has ${set.length} selector strategies (${set.join(", ")}); at most one is allowed`);
  }
  if (target.name && !target.role) {
    throw new Error(`lint: location ${JSON.stringify(target.url)} sets an accessible name without a role`);
  }
  const strategy = set[0];
  if (!strategy) return undefined;
  if (strategy === "role" && target.name) return `role: ${target.role}[name=${JSON.stringify(target.name)}]`;
  return `${strategy}: ${target[strategy]}`;
}

export function entityLabel(entity: ViolationEntity): string {
  return `${entity.kind} · ${entity.name || entity.id}`;
}

export function imageRegionLabel(image: ViolationImageRegion): string {
  return `${image.x},${image.y} ${image.width}×${image.height}`;
}

/** `path:line:column`, relative to `workDir`, without the ref. */
export function filePosition(location: Pick<ViolationLocation, "file" | "line" | "column">, workDir?: string): string {
  const file = relPath(location.file, workDir) ?? "";
  if (!location.line) return file;
  return `${file}:${location.line}${location.column ? `:${location.column}` : ""}`;
}

/** One line naming a location by its most specific target: file (at its ref), entity, url, image, else its message. */
export function locationLabel(location: ViolationLocation, workDir?: string): string {
  if (location.file) return `${location.ref ? `${location.ref}:` : ""}${filePosition(location, workDir)}`;
  if (location.entity) return entityLabel(location.entity);
  if (location.url) return location.url.url;
  if (location.image) return `${location.image.src} ${imageRegionLabel(location.image)}`;
  return location.message ?? "";
}

function urlHost(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    throw new Error(`lint: location url ${JSON.stringify(url)} is not an absolute URL`);
  }
}

export type LintTargetGroup = { kind: LintTargetKind; name: string };

export const OTHER_TARGET: LintTargetGroup = { kind: "other", name: "Other" };

/** Where a file-less violation is grouped: its first location's entity kind or URL host, else "Other". */
export function violationTargetGroup(violation: Pick<Violation, "locations">): LintTargetGroup {
  const primary = violation.locations?.[0];
  if (primary?.entity) return { kind: "entity", name: primary.entity.kind };
  if (primary?.url) return { kind: "url", name: urlHost(primary.url.url) };
  return OTHER_TARGET;
}

/** The place a violation card names: its file and position, else its primary location. */
export function violationLocationLabel(v: Violation, withFile: boolean): string {
  if (!v.file) {
    const primary = v.locations?.[0];
    if (primary) return locationLabel(primary);
    return v.line ? `:${v.line}` : "";
  }
  const position = `:${v.line ?? 0}${v.column ? `:${v.column}` : ""}`;
  return withFile ? `${v.file}${position}` : position;
}

/** A location list adds something unless it is the violation's own single, plain file location. */
export function showsLocationList(v: Pick<Violation, "locations">): boolean {
  const locations = v.locations ?? [];
  if (locations.length !== 1) return locations.length > 1;
  const [only] = locations;
  return Boolean(only!.ref || only!.entity || only!.url || only!.image);
}

export type ImageCrop = {
  scale: number;
  /** The clipping frame, in CSS pixels. */
  frame: { width: number; height: number };
  /** Inline style for an `<img>` showing only the region, scaled into the frame. */
  image: {
    width: number;
    height: number;
    objectFit: "none";
    objectPosition: string;
    transform: string;
    transformOrigin: "top left";
  };
};

/**
 * Crops `region` without a canvas: an `<img>` the size of the region shows its
 * natural pixels offset to the region (`object-fit: none`), scaled down to fit
 * `max` inside a frame that clips the overflow.
 */
export function imageCrop(region: ViolationImageRegion, max: { width: number; height: number }): ImageCrop {
  if (!(region.width > 0) || !(region.height > 0)) {
    throw new Error(`lint: image region on ${JSON.stringify(region.src)} is empty (${region.width}×${region.height})`);
  }
  const scale = Math.min(1, max.width / region.width, max.height / region.height);
  return {
    scale,
    frame: { width: region.width * scale, height: region.height * scale },
    image: {
      width: region.width,
      height: region.height,
      objectFit: "none",
      objectPosition: `${-region.x}px ${-region.y}px`,
      transform: `scale(${scale})`,
      transformOrigin: "top left",
    },
  };
}
