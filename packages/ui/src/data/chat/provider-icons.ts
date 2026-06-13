import type { ComponentType } from "react";
import { Anthropic, Gemini, Google, Openai } from "@flanksource/icons/mi";

export type ProviderGlyph = ComponentType<{ className?: string }>;

// Maps a backend provider id to its brand glyph. googleai surfaces as the Gemini
// mark (the model family), plain google as the Google mark.
const PROVIDER_ICONS: Record<string, ProviderGlyph> = {
  anthropic: Anthropic,
  openai: Openai,
  google: Google,
  googleai: Gemini,
  gemini: Gemini,
};

/** The brand glyph for a chat model's provider, or undefined when unknown. */
export function providerIcon(provider?: string): ProviderGlyph | undefined {
  return provider ? PROVIDER_ICONS[provider.toLowerCase()] : undefined;
}
