/**
 * The specimen renderers the reconctl design-system page composes.
 *
 * Kept out of the page itself so the page reads as an outline. Everything here
 * draws from `vocabulary.ts`, `icons.ts` and `tone.ts` rather than restating
 * them, so a term added to the vocabulary appears on the page without anyone
 * editing the page — the same discipline `flanksource/supply-chain.tsx` follows.
 */

import { cn } from "@flanksource/clicky-ui";
import { Icon } from "@iconify/react/offline";

import { PROVIDER_HUES, PROVIDER_LABELS, PROVIDER_MARKS } from "../_recon/marks";
import { HUES } from "../_shared/hues";
import { glyphFor } from "./icons";
import { CHOSEN, TOKEN_ROWS, palette, type PaletteTheme } from "./palettes";
import { contrastRatio, wcagGrade } from "./contrast";
import { EXTRA_TONES, EXTRA_TONE_MEANING, chipClass, glyphClass, toneClasses } from "./tone";
import { ENGINE_TERMS, ENTITY_TERMS, type Term, type Vocabulary } from "./vocabulary";

const WINNER = palette(CHOSEN);

/** A term's glyph in its own tone, at chip size. */
export function TermGlyph({ term, className }: { term: Term; className?: string }) {
  return (
    <Icon
      aria-hidden
      className={cn("size-4 shrink-0", glyphClass(term.tone), className)}
      icon={glyphFor(term.glyph).icon}
    />
  );
}

/**
 * The chip a value wears.
 *
 * Colour never carries the state alone — the label is always present. Six
 * severities cannot be told apart by hue by everyone who has to read them, and
 * that constraint governs every other axis here too.
 */
export function TermChip({ term }: { term: Term }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        chipClass(term.tone),
      )}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" icon={glyphFor(term.glyph).icon} />
      {term.label}
    </span>
  );
}

/** One vocabulary as a table: value, chip, what it means, where it comes from. */
export function VocabularyTable({ vocabulary }: { vocabulary: Vocabulary }) {
  return (
    <div className="space-y-2">
      <div className="space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h3 className="text-sm font-semibold text-foreground">{vocabulary.title}</h3>
          <code className="text-[11px] text-muted-foreground">{vocabulary.source}</code>
        </div>
        <p className="max-w-3xl text-xs leading-5 text-muted-foreground">{vocabulary.description}</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-border">
            {vocabulary.terms.map((term) => (
              <tr key={term.value}>
                <td className="w-44 p-density-3 align-top">
                  <TermChip term={term} />
                </td>
                <td className="w-40 p-density-3 align-top">
                  <code className="text-[11px] text-muted-foreground">{term.value}</code>
                </td>
                <td className="p-density-3 align-top text-xs leading-5 text-muted-foreground">
                  {term.meaning}
                </td>
                <td className="w-36 p-density-3 align-top">
                  <code className="text-[10px] text-muted-foreground">{glyphFor(term.glyph).token}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** The added tones, next to a sample of what wears each one. */
export function ToneLegend() {
  return (
    <div className="grid gap-density-2 sm:grid-cols-2">
      {EXTRA_TONES.map((tone) => (
        <article
          key={tone}
          className={cn("flex items-start gap-density-3 rounded-xl border-l-4 border border-border bg-card p-density-3", toneClasses(tone).edge)}
        >
          <span className={cn("mt-0.5 size-4 shrink-0 rounded", toneClasses(tone).dot)} />
          <div className="min-w-0 space-y-1">
            <code className="text-xs font-semibold text-foreground">{tone}</code>
            <p className="text-xs leading-5 text-muted-foreground">{EXTRA_TONE_MEANING[tone]}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

/** Engines, split by family — the split is the point, so it is the layout. */
export function EngineGrid() {
  const families = [
    { id: "scan" as const, title: "Scanning", note: "Produce findings." },
    { id: "discovery" as const, title: "Discovery", note: "Produce targets and fill their machine-owned sections." },
  ];
  return (
    <div className="grid gap-density-3 lg:grid-cols-2">
      {families.map((family) => (
        <div key={family.id} className="space-y-density-2 rounded-xl border border-border bg-card p-density-4">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">{family.title}</p>
            <p className="text-xs text-muted-foreground">{family.note}</p>
          </div>
          <ul className="space-y-density-2">
            {ENGINE_TERMS.filter((term) => term.family === family.id).map((term) => (
              <li key={term.value} className="flex items-start gap-density-2">
                <TermGlyph className="mt-0.5" term={term} />
                <div className="min-w-0">
                  <code className="text-xs font-semibold text-foreground">{term.value}</code>
                  <p className="text-xs leading-5 text-muted-foreground">{term.meaning}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/** The eleven registered entities — the nav vocabulary and the API surface. */
export function EntityGrid() {
  return (
    <div className="grid gap-density-2 sm:grid-cols-2 xl:grid-cols-3">
      {ENTITY_TERMS.map((term) => (
        <article key={term.value} className="flex items-start gap-density-3 rounded-xl border border-border bg-card p-density-3">
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset", chipClass(term.tone))}>
            <Icon aria-hidden className="size-5" icon={glyphFor(term.glyph).icon} />
          </span>
          <div className="min-w-0 space-y-0.5">
            <code className="block text-xs font-semibold text-foreground">{term.value}</code>
            <p className="text-[11px] leading-4 text-muted-foreground">{term.meaning}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

/**
 * Providers, read from `_recon/marks.ts`.
 *
 * Real logos, not glyphs: a mixed-provider inventory is scannable without
 * reading a word only when the AWS row carries the AWS mark. The hues are the
 * cool end of the spectrum on purpose, so "this row is AWS" can never read as
 * "this row is high severity".
 */
export function ProviderRow() {
  return (
    <div className="flex flex-wrap gap-density-2">
      {Object.keys(PROVIDER_MARKS).map((provider) => {
        const Mark = PROVIDER_MARKS[provider]!;
        const hue = HUES[PROVIDER_HUES[provider] ?? "slate"];
        return (
          <span
            key={provider}
            className={cn("inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset", hue.chip)}
          >
            <Mark className="size-4 shrink-0" />
            {PROVIDER_LABELS[provider] ?? provider}
          </span>
        );
      })}
    </div>
  );
}

/** The chosen palette's tokens and the contrast they earn, per theme. */
export function PaletteBand({ theme }: { theme: PaletteTheme }) {
  const tokens = WINNER[theme];
  return (
    <div className="space-y-density-2 rounded-xl border border-border bg-card p-density-4">
      <p className="text-sm font-semibold text-foreground">{theme === "dark" ? "Dark" : "Day shift"}</p>
      <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
        {TOKEN_ROWS.map((row) => (
          <div key={row.key} className="flex items-center gap-2 py-0.5">
            {/* Runtime hex, so it rides on an inline style — a dynamic
                arbitrary Tailwind class would never be emitted. */}
            <span
              className="size-4 shrink-0 rounded border border-border"
              style={{ backgroundColor: tokens[row.key] }}
            />
            <code className="w-40 shrink-0 truncate text-[11px] text-foreground">{row.label}</code>
            <code className="w-20 shrink-0 font-mono text-[11px] uppercase text-muted-foreground">
              {tokens[row.key]}
            </code>
            <span className="min-w-0 truncate text-[11px] text-muted-foreground">{row.role}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Body text {contrastRatio(tokens.fg, tokens.bg).toFixed(2)}:1 (
        {wcagGrade(contrastRatio(tokens.fg, tokens.bg))}) · muted{" "}
        {contrastRatio(tokens.fgMuted, tokens.bg).toFixed(2)}:1 (
        {wcagGrade(contrastRatio(tokens.fgMuted, tokens.bg))}) · accent{" "}
        {contrastRatio(tokens.primary, tokens.bg).toFixed(2)}:1 (
        {wcagGrade(contrastRatio(tokens.primary, tokens.bg))})
      </p>
    </div>
  );
}
