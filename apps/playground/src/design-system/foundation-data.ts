export const SEMANTIC_COLORS = [
  { name: "Canvas", utility: "bg-background", swatch: "bg-background", use: "Primary application background" },
  { name: "Subtle", utility: "bg-muted/40", swatch: "bg-muted/40", use: "Alternating regions and quiet panels" },
  { name: "Muted", utility: "bg-muted", swatch: "bg-muted", use: "Control tracks and nested surfaces" },
  { name: "Foreground", utility: "text-foreground", swatch: "bg-foreground", use: "Primary readable content" },
  { name: "Brand", utility: "bg-primary / text-primary", swatch: "bg-primary", use: "Links and primary actions" },
  { name: "Success", utility: "bg-emerald-500 / text-emerald-700", swatch: "bg-emerald-500", use: "Completed and healthy states" },
  { name: "Warning", utility: "bg-amber-500 / text-amber-700", swatch: "bg-amber-500", use: "Attention without failure" },
  { name: "Error", utility: "bg-destructive / text-destructive", swatch: "bg-destructive", use: "Failure and destructive actions" },
  { name: "Info", utility: "bg-sky-500 / text-sky-700", swatch: "bg-sky-500", use: "Neutral operational guidance" },
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
  { utility: "gap-1 / p-1", width: "w-1", pixels: 4 },
  { utility: "gap-2 / p-2", width: "w-2", pixels: 8 },
  { utility: "gap-3 / p-3", width: "w-3", pixels: 12 },
  { utility: "gap-4 / p-4", width: "w-4", pixels: 16 },
  { utility: "gap-6 / p-6", width: "w-6", pixels: 24 },
  { utility: "gap-8 / p-8", width: "w-8", pixels: 32 },
  { utility: "gap-12 / p-12", width: "w-12", pixels: 48 },
] as const;
