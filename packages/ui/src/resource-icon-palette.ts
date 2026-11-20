export const resourceIconPalette = {
  compute: { primary: "#2563EB", accent: "#60A5FA" },
  network: { primary: "#0E7490", accent: "#22D3EE" },
  config: { primary: "#7C3AED", accent: "#A78BFA" },
  policy: { primary: "#B45309", accent: "#FBBF24" },
  storage: { primary: "#15803D", accent: "#4ADE80" },
  security: { primary: "#BE123C", accent: "#FB7185" },
} as const;

export type ResourceIconCategory = keyof typeof resourceIconPalette;
