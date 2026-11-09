import { Icon } from "../Icon";
import { cn } from "../../lib/utils";
import { UiBox, UiGitBranch, UiImage, UiLinkExternal } from "../../icons";
import { OpenInFilesLink, type OpenFileTarget } from "../OpenInFilesLink";
import { relPath } from "./paths";
import { entityLabel, filePosition, imageCrop, imageRegionLabel, urlSelector } from "./locations";
import type { EntityHref, ViolationEntity, ViolationImageRegion, ViolationLocation, ViolationUrlTarget } from "./types";

export type ViolationLocationsProps = {
  /** Every place the violation applies; the first is primary. */
  locations: readonly ViolationLocation[];
  /** The linter's work dir: file locations are shown and opened relative to it. */
  workDir?: string | undefined;
  /** Adds an "Open in Files" link to each file location. */
  onOpenFile?: ((target: OpenFileTarget) => void) | undefined;
  /** Where an entity links in the host; without it, or when it returns undefined, the entity is a plain chip. */
  entityHref?: EntityHref | undefined;
  className?: string | undefined;
};

/** Largest preview of an image region, in CSS pixels. */
const IMAGE_PREVIEW = { width: 240, height: 96 };

function FileTarget({
  location,
  workDir,
  primary,
}: Pick<ViolationLocationsProps, "workDir"> & { location: ViolationLocation; primary: boolean }) {
  return (
    <>
      {location.ref && (
        <span
          className="inline-flex items-center gap-0.5 rounded bg-muted px-1 font-mono text-[10px] text-muted-foreground"
          title={`git ref ${location.ref}`}
        >
          <Icon icon={UiGitBranch} className="shrink-0" />
          {location.ref}
        </span>
      )}
      <span className={cn("break-all font-mono", primary ? "text-foreground" : "text-muted-foreground")}>
        {filePosition(location, workDir)}
      </span>
    </>
  );
}

const CHIP = "inline-flex max-w-full items-center gap-1 rounded border border-border bg-muted/40 px-1.5 py-0.5";

function EntityTarget({ entity, entityHref }: { entity: ViolationEntity; entityHref?: EntityHref | undefined }) {
  const href = entityHref?.(entity);
  const title = `${entity.kind} ${entity.id}`;
  const content = (
    <>
      <Icon icon={UiBox} className="shrink-0 text-muted-foreground" />
      {entityLabel(entity)}
    </>
  );
  return href ? (
    <a href={href} title={title} className={cn(CHIP, "text-primary hover:underline")}>
      {content}
    </a>
  ) : (
    <span title={title} className={CHIP}>
      {content}
    </span>
  );
}

function UrlTarget({ target }: { target: ViolationUrlTarget }) {
  const selector = urlSelector(target);
  return (
    <>
      <a
        href={target.url}
        target="_blank"
        rel="noreferrer"
        title={selector ? `${target.url}\n${selector}` : target.url}
        className="inline-flex min-w-0 items-center gap-1 break-all text-primary hover:underline"
      >
        <Icon icon={UiLinkExternal} className="shrink-0" />
        {target.url}
      </a>
      {selector && <code className="break-all rounded bg-muted px-1 font-mono text-[11px]">{selector}</code>}
    </>
  );
}

function ImageTarget({ image }: { image: ViolationImageRegion }) {
  const crop = imageCrop(image, IMAGE_PREVIEW);
  const region = imageRegionLabel(image);
  return (
    <>
      <a
        href={image.src}
        target="_blank"
        rel="noreferrer"
        title={`Open ${image.src}`}
        className="inline-block rounded border border-border bg-muted hover:border-primary"
      >
        <div className="relative overflow-hidden rounded" style={crop.frame}>
          <img src={image.src} alt={`Region ${region} of ${image.src}`} className="max-w-none" style={crop.image} />
        </div>
      </a>
      <span className="inline-flex items-center gap-1 font-mono text-muted-foreground">
        <Icon icon={UiImage} className="shrink-0" />
        <span>{region}</span>
      </span>
    </>
  );
}

/**
 * Every place a violation applies, the first one primary. Each location renders
 * by its target: a file (with its git ref), an entity chip the host may link,
 * an external URL with its selector, or a cropped preview of an image region.
 */
export function ViolationLocations({ locations, workDir, onOpenFile, entityHref, className }: ViolationLocationsProps) {
  return (
    <div className={cn("space-y-0.5", className)} data-lint-violation-locations="">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {locations.length === 1 ? "Location" : `${locations.length} locations`}
      </div>
      <ul className="space-y-1">
        {locations.map((location, i) => (
          <li
            key={i}
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs"
            data-testid="lint-violation-location"
            {...(i === 0 ? { "data-primary": "" } : {})}
          >
            {location.file && <FileTarget location={location} workDir={workDir} primary={i === 0} />}
            {location.entity && <EntityTarget entity={location.entity} entityHref={entityHref} />}
            {location.url && <UrlTarget target={location.url} />}
            {location.image && <ImageTarget image={location.image} />}
            {location.message && <span>{location.message}</span>}
            {location.file && onOpenFile && (
              <OpenInFilesLink
                target={{
                  file: relPath(location.file, workDir) ?? location.file,
                  ...(workDir ? { workDir } : {}),
                  ...(location.line ? { line: location.line } : {}),
                }}
                onOpenFile={onOpenFile}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
