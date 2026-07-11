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

// Maps a backend provider id to its brand mark (Simple Icons, monochrome
// currentColor — matching the "Agent Action Icons" model-logo set). `anthropic`
// backs the Claude family, so it surfaces as the Claude mark (not the Anthropic
// wordmark). `googleai` surfaces as the Gemini mark (the model family); plain
// `google` as the Google mark. Meta backs the Llama family.
const PROVIDER_ICONS: Record<string, ProviderGlyph> = {
  anthropic: UiLogoClaude,
  claude: UiLogoClaude,
  openai: UiLogoOpenai,
  codex: UiLogoOpenai,
  google: UiLogoGoogle,
  googleai: UiLogoGemini,
  gemini: UiLogoGemini,
  deepseek: UiLogoDeepseek,
  mistral: UiLogoMistral,
  mistralai: UiLogoMistral,
  meta: UiLogoMeta,
  llama: UiLogoMeta,
  ollama: UiLogoOllama,
  perplexity: UiLogoPerplexity,
  huggingface: UiLogoHuggingface,
};

/** The brand mark for a chat model's provider, or undefined when unknown. */
export function providerIcon(provider?: string): ProviderGlyph | undefined {
  return provider ? PROVIDER_ICONS[provider.toLowerCase()] : undefined;
}
