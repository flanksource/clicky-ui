export const SEMANTIC_COLORS = [
  { name: "Canvas", token: "--fs-bg-canvas", use: "Primary application background" },
  { name: "Subtle", token: "--fs-bg-subtle", use: "Alternating regions and quiet panels" },
  { name: "Muted", token: "--fs-bg-muted", use: "Control tracks and nested surfaces" },
  { name: "Foreground", token: "--fs-fg-1", use: "Primary readable content" },
  { name: "Brand", token: "--fs-primary-blue", use: "Links and primary actions" },
  { name: "Success", token: "--fs-success", use: "Completed and healthy states" },
  { name: "Warning", token: "--fs-warning", use: "Attention without failure" },
  { name: "Error", token: "--fs-error", use: "Failure and destructive actions" },
  { name: "Info", token: "--fs-info", use: "Neutral operational guidance" },
] as const;

export const TYPE_ROLES = [
  { role: "Display", className: "text-4xl font-bold", sample: "Operational clarity" },
  { role: "Page title", className: "text-2xl font-semibold", sample: "Configuration health" },
  { role: "Section", className: "text-lg font-semibold", sample: "Recent changes" },
  { role: "Body", className: "text-base", sample: "Track posture across every environment." },
  { role: "Interface", className: "text-sm font-medium", sample: "Last checked 4 minutes ago" },
  { role: "Caption", className: "text-xs text-muted-foreground", sample: "SOURCE · KUBERNETES" },
] as const;

export const SPACE_TOKENS = [
  { token: "--fs-space-1", pixels: 4 },
  { token: "--fs-space-2", pixels: 8 },
  { token: "--fs-space-3", pixels: 12 },
  { token: "--fs-space-4", pixels: 16 },
  { token: "--fs-space-6", pixels: 24 },
  { token: "--fs-space-8", pixels: 32 },
  { token: "--fs-space-12", pixels: 48 },
] as const;
