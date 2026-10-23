import { Button } from "../components/button";
import { UiExternalLink } from "../icons";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";

/** A file, and optionally a line in it, for a host to open in its annotated file view. */
export type OpenFileTarget = {
  /** Path relative to `workDir` when it lives under it. */
  file: string;
  workDir?: string | undefined;
  line?: number | undefined;
};

export type OpenInFilesLinkProps = {
  target: OpenFileTarget;
  onOpenFile: (target: OpenFileTarget) => void;
  className?: string | undefined;
};

/** A small "Open in Files" link that hands `target` to the host's `onOpenFile`. */
export function OpenInFilesLink({ target, onOpenFile, className }: OpenInFilesLinkProps) {
  return (
    <Button
      type="button"
      variant="link"
      size="sm"
      className={cn("h-auto gap-1 p-0 text-xs", className)}
      title={`Open ${target.file}${target.line ? `:${target.line}` : ""} in Files`}
      onClick={(event) => {
        event.stopPropagation();
        onOpenFile(target);
      }}
    >
      <Icon icon={UiExternalLink} className="text-xs" />
      Open in Files
    </Button>
  );
}
