import { type StaticIconComponent } from "../data/Icon";
import { UiComment, UiEye, UiFileCode, UiTable } from "../icons";

export type FormatOption = {
  /** Stable identifier emitted by `onChange`. */
  value: string;
  /** Visible label. */
  label: string;
  /** Secondary description shown in the menu. */
  description?: string;
  /** Icon rendered before the label. */
  icon?: StaticIconComponent;
};

/**
 * Clicky output formats with their label, description, and icon. Mirrors the
 * metadata in `Clicky.tsx`'s `getRemoteFormatMeta` so the format picker can live
 * as a standalone component.
 */
export const CLICKY_FORMAT_OPTIONS: FormatOption[] = [
  { value: "clicky", label: "Clicky", description: "Rendered Clicky JSON with the rich Clicky viewer", icon: UiEye },
  { value: "json", label: "JSON", description: "Plain JSON for inspecting the raw response body", icon: UiFileCode },
  { value: "yaml", label: "YAML", description: "YAML for config-friendly inspection and export", icon: UiFileCode },
  { value: "csv", label: "CSV", description: "Comma-separated values for spreadsheets and imports", icon: UiTable },
  { value: "markdown", label: "Markdown", description: "Markdown formatted for docs, comments, and chat", icon: UiFileCode },
  { value: "html", label: "HTML", description: "Browser-ready HTML preview of the formatted output", icon: UiFileCode },
  { value: "pdf", label: "PDF", description: "Portable document for sharing and printing", icon: UiFileCode },
  { value: "pretty", label: "Pretty", description: "Human-readable plain text output from the formatter", icon: UiFileCode },
  { value: "excel", label: "Excel", description: "Spreadsheet workbook for offline analysis", icon: UiTable },
  { value: "slack", label: "Slack", description: "Slack Block Kit JSON for chat-native output", icon: UiComment },
];
