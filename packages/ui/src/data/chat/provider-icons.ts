import type { StaticIconComponent } from "../Icon";
import {
  UiLogoClaude,
  UiLogoDeepseek,
  UiLogoGemini,
  UiLogoGoogle,
  UiLogoHuggingface,
  UiLogoMeta,
  UiLogoMistral,
  UiLogoOllama,
  UiLogoOpenai,
  UiLogoPerplexity,
} from "../../icons";

export type ProviderGlyph = StaticIconComponent;

type ProviderIconMeta = {
  icon: ProviderGlyph;
  color: string;
};

// Maps a backend provider id to its brand mark (Simple Icons, monochrome
// currentColor — matching the "Agent Action Icons" model-logo set). `anthropic`
// backs the Claude family, so it surfaces as the Claude mark (not the Anthropic
// wordmark). `googleai` surfaces as the Gemini mark (the model family); plain
// `google` as the Google mark. Meta backs the Llama family.
const PROVIDER_ICONS: Record<string, ProviderIconMeta> = {
  anthropic: {
    icon: UiLogoClaude,
    color: "text-[#C15F3C] [[data-theme=dark]_&]:text-[#D97757]",
  },
  claude: {
    icon: UiLogoClaude,
    color: "text-[#C15F3C] [[data-theme=dark]_&]:text-[#D97757]",
  },
  openai: {
    icon: UiLogoOpenai,
    color: "text-black [[data-theme=dark]_&]:text-white",
  },
  codex: {
    icon: UiLogoOpenai,
    color: "text-black [[data-theme=dark]_&]:text-white",
  },
  google: { icon: UiLogoGoogle, color: "text-[#4285F4]" },
  googleai: { icon: UiLogoGemini, color: "text-[#4285F4]" },
  gemini: { icon: UiLogoGemini, color: "text-[#4285F4]" },
  deepseek: { icon: UiLogoDeepseek, color: "text-[#4D6BFE]" },
  mistral: {
    icon: UiLogoMistral,
    color: "text-[#C2410C] [[data-theme=dark]_&]:text-[#F97316]",
  },
  mistralai: {
    icon: UiLogoMistral,
    color: "text-[#C2410C] [[data-theme=dark]_&]:text-[#F97316]",
  },
  meta: { icon: UiLogoMeta, color: "text-[#0668E1]" },
  llama: { icon: UiLogoMeta, color: "text-[#0668E1]" },
  ollama: {
    icon: UiLogoOllama,
    color: "text-black [[data-theme=dark]_&]:text-white",
  },
  perplexity: {
    icon: UiLogoPerplexity,
    color: "text-[#0F766E] [[data-theme=dark]_&]:text-[#20B2AA]",
  },
  huggingface: {
    icon: UiLogoHuggingface,
    color: "text-[#A16207] [[data-theme=dark]_&]:text-[#FFB000]",
  },
};

/** The brand mark for a chat model's provider, or undefined when unknown. */
export function providerIcon(provider?: string): ProviderGlyph | undefined {
  return provider ? PROVIDER_ICONS[provider.toLowerCase()]?.icon : undefined;
}

/** Brand color class for a provider glyph, or undefined when unknown. */
export function providerIconColor(provider?: string): string | undefined {
  return provider ? PROVIDER_ICONS[provider.toLowerCase()]?.color : undefined;
}
