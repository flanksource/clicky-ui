import { UiFile } from "../../icons";
import { Icon } from "../Icon";

export interface MessageFilePartValue {
  mediaType?: string;
  url?: string;
  filename?: string;
}

export function MessageFilePart({ part }: { part: MessageFilePartValue }) {
  const label = part.filename ?? part.mediaType ?? "file";
  if (part.mediaType?.startsWith("image/") && part.url) {
    return (
      <img
        src={part.url}
        alt={part.filename ?? "attachment"}
        className="max-h-48 max-w-full rounded-md border border-border"
      />
    );
  }
  const content = (
    <>
      <Icon icon={UiFile} className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </>
  );
  const className =
    "flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground";
  return part.url ? (
    <a
      href={part.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${className} hover:text-foreground`}
    >
      {content}
    </a>
  ) : (
    <span className={className}>{content}</span>
  );
}
