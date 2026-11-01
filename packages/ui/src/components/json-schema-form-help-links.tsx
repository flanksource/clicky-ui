import type { FieldControl } from "./json-schema-form-types";

export function FormHelp({ field }: { field: FieldControl }) {
  return <>{field.helper}{field.schema["x-help"]?.links?.map((link) => {
    const url = new URL(link.href);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error(`Unsupported documentation URL: ${link.href}`);
    return <a key={link.href} className="ml-1 text-primary underline underline-offset-2" href={url.href} target="_blank" rel="noopener noreferrer">{link.label}</a>;
  })}</>;
}

