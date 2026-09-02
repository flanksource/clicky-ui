import type { SectionLink } from "../../design-system/DesignSystemPage";

export const MERIVIO_SECTIONS: SectionLink[] = [
  { id: "principles", label: "Principles" },
  { id: "semantic-colors", label: "Semantic color" },
  { id: "brand-colors", label: "Brand and paper" },
  { id: "typography", label: "Typography" },
  { id: "icon-catalog", label: "Icon catalog" },
  { id: "components", label: "Components" },
  { id: "rules", label: "Rules" },
];

export const MERIVIO_PRINCIPLES = [
  {
    title: "Color is a claim",
    body: "Green always means money in and rose always means money out. Palette entries are never reused as decoration.",
  },
  {
    title: "One concept, one glyph",
    body: "Synonyms resolve to an existing accounting concept. Pages import the vocabulary; they do not invent it.",
  },
  {
    title: "Quiet ledger, explicit signal",
    body: "Warm paper and near-black ink carry the interface so semantic marks remain meaningful in dense review work.",
  },
] as const;

export const PAPER_COLORS = [
  { name: "Paper", token: "--mv-paper", value: "#f3f1ea", use: "Workspace canvas" },
  { name: "Paper raised", token: "--mv-paper-2", value: "#ebe7dc", use: "Inset regions" },
  { name: "Surface", token: "--mv-surface", value: "#ffffff", use: "Cards and controls" },
  { name: "Border", token: "--mv-border", value: "#e3dfd2", use: "Component boundaries" },
  { name: "Ink tertiary", token: "--mv-ink-3", value: "#4a514e", use: "Supporting copy" },
  { name: "Ink", token: "--mv-ink", value: "#0f1413", use: "Primary content" },
] as const;

export const BRAND_COLORS = [
  { name: "Primary", token: "--mv-accent", value: "#114c40", use: "Brand green, actions, and emphasis" },
  { name: "Secondary", token: "--mv-accent-2", value: "#1c6b59", use: "Links, active meters, and reconciled state" },
  { name: "Warm", token: "--mv-warm", value: "#b8642e", use: "Draft, pending, and partial states" },
  { name: "Negative", token: "--mv-negative", value: "#b13427", use: "Out-of-balance, voids, and overdue" },
] as const;

export const ACCOUNT_CLASSES = [
  { name: "Asset", color: "#2e5d4e", background: "#dbe9df" },
  { name: "Bank", color: "#2a4f74", background: "#dde7f0" },
  { name: "Liability", color: "#82431a", background: "#f0e0d0" },
  { name: "Equity", color: "#5a3a82", background: "#e6dcf0" },
  { name: "Revenue", color: "#3a6c2a", background: "#dfe9d4" },
  { name: "Expense", color: "#8a2e3a", background: "#f2d8dc" },
] as const;
