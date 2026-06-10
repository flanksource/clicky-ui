export const ACCEPT_OPTIONS = [
  { value: "application/json", label: "JSON" },
  { value: "application/clicky+json", label: "Clicky" },
  { value: "text/markdown", label: "Markdown" },
  { value: "text/html", label: "HTML" },
  { value: "application/x-yaml", label: "YAML" },
  { value: "text/csv", label: "CSV" },
  { value: "application/pdf", label: "PDF" },
  { value: "text/plain", label: "Pretty" },
] as const;

export const VIEW_OPTIONS = [
  { value: "application/json", label: "JSON" },
  { value: "application/clicky+json", label: "Clicky" },
  { value: "application/pdf", label: "PDF" },
] as const;

export type AcceptOption = { value: string; label: string };
export type AcceptValue = (typeof ACCEPT_OPTIONS)[number]["value"];
export type OperationPreviewMode = "hidden" | "curl" | "cli";
