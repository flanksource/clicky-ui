import { EXTERNAL_PAGES_ROUTE } from "./model";

export function ExternalPreview({
  page,
  url,
  title,
}: {
  page: string;
  url: string;
  title: string;
}) {
  const source = new URL(url);
  return (
    <iframe
      title={title}
      className="min-h-80 w-full flex-1 rounded-md border border-border bg-white"
      sandbox="allow-scripts"
      src={
        source.protocol === "file:"
          ? `${EXTERNAL_PAGES_ROUTE}/html?${new URLSearchParams({ page, url })}${source.hash}`
          : url
      }
    />
  );
}
