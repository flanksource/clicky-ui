import type { CSSProperties, ReactNode } from "react";

import {
  DesignSystemPage,
  SpecimenSection,
} from "../../design-system/DesignSystemPage";
import { designSystemPage } from "../../design-system/catalog";
import { IconCatalog } from "./_merivio/IconCatalog";
import {
  FINANCIAL_CATEGORY_COLORS,
  FINANCIAL_ICON_COUNT,
} from "./_merivio/financial-icons";
import {
  ACCOUNT_CLASSES,
  BRAND_COLORS,
  MERIVIO_PRINCIPLES,
  MERIVIO_SECTIONS,
  PAPER_COLORS,
} from "./merivio-foundations";
import "./merivio.css";

export const meta = designSystemPage("flanksource/merivio");

export default function MerivioSystem() {
  return (
    <DesignSystemPage
      eyebrow="Product system"
      title={meta.title}
      description={meta.description}
      icon={meta.icon}
      sections={MERIVIO_SECTIONS}
    >
      <div className="merivio-system rounded-xl border border-[var(--mv-border)] shadow-sm">
        <header className="merivio-hero">
          <div className="flex flex-wrap items-center gap-density-3">
            <span className="merivio-brand-mark">
              <iconify-icon icon="ph:scales-thin" width="25" height="25" />
            </span>
            <span className="text-2xl font-semibold tracking-[-0.03em]">Merivio</span>
            <span className="merivio-source-chip">financial-icons.jsx</span>
            <span className="merivio-status-chip">Single source of truth</span>
          </div>
          <h2 className="merivio-display mt-density-6">
            The ledger has a <em>vocabulary</em>. This is it.
          </h2>
          <p className="mt-density-4 max-w-3xl text-base leading-7 text-[var(--mv-ink-3)]">
            Nine semantic colors map to the things money can be doing; {FINANCIAL_ICON_COUNT} Phosphor Thin glyphs name the documents, states, and reports that move it. Pages import — they never invent.
          </p>
        </header>

        <div className="space-y-density-7 p-density-4 sm:p-density-6">
          <SpecimenSection
            id="principles"
            title="Principles"
            description="The constraints imported from the Merivio source package, not a parallel interpretation."
          >
            <div className="grid gap-density-3 lg:grid-cols-3">
              {MERIVIO_PRINCIPLES.map((principle, index) => (
                <article key={principle.title} className="merivio-card p-density-4">
                  <p className="font-mono text-xs font-semibold text-[var(--mv-accent)]">0{index + 1}</p>
                  <h3 className="mt-density-3 text-base font-semibold">{principle.title}</h3>
                  <p className="mt-density-2 text-sm leading-6 text-[var(--mv-ink-3)]">{principle.body}</p>
                </article>
              ))}
            </div>
          </SpecimenSection>

          <SpecimenSection
            id="semantic-colors"
            title="Semantic color"
            description="Bright accents live on marks and glyphs. Paper tints live on surfaces. Each color makes one accounting claim."
          >
            <div className="grid gap-density-3 sm:grid-cols-2 xl:grid-cols-3">
              {Object.entries(FINANCIAL_CATEGORY_COLORS).map(([key, category]) => (
                <SemanticColorCard key={key} token={key} category={category} />
              ))}
            </div>
          </SpecimenSection>

          <SpecimenSection
            id="brand-colors"
            title="Paper and brand neutrals"
            description="Warm paper and near-black ink form a deliberately quiet ground for the semantic set."
          >
            <div className="grid gap-density-3 sm:grid-cols-2 lg:grid-cols-3">
              {PAPER_COLORS.map((color) => <BrandColorCard key={color.token} color={color} />)}
            </div>
            <div className="mt-density-4 grid gap-density-3 sm:grid-cols-2">
              {BRAND_COLORS.map((color) => <BrandColorCard key={color.token} color={color} compact />)}
            </div>
          </SpecimenSection>

          <SpecimenSection
            id="typography"
            title="Typography"
            description="Geist for interface and figures, Geist Mono for digit-by-digit comparison, and Instrument Serif for editorial moments only."
          >
            <div className="merivio-card divide-y divide-[var(--mv-hair)] overflow-hidden">
              <TypeRow label="Display" spec="Instrument Serif · 64/1.02 · -3.5%">
                <span className="merivio-serif text-4xl">Debits equal credits</span>
              </TypeRow>
              <TypeRow label="Page title" spec="Geist 600 · 34/1.1 · -2%">
                <span className="text-3xl font-semibold tracking-[-0.02em]">Trial balance</span>
              </TypeRow>
              <TypeRow label="Section" spec="Geist 600 · 13.5px">
                <span className="text-[13.5px] font-semibold">Accounts receivable</span>
              </TypeRow>
              <TypeRow label="Body" spec="Geist 400 · 13.5/1.45">
                <span>Reversal journals back out a posted entry without deleting history.</span>
              </TypeRow>
              <TypeRow label="Eyebrow" spec="Geist 500 · 11px · 12% caps">
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--mv-muted)]">Period 07 · unaudited</span>
              </TypeRow>
              <TypeRow label="Figures" spec="Geist Mono · tabular-nums">
                <span className="font-mono text-base tabular-nums">1,284,905.40&nbsp;&nbsp;(38,204.12)</span>
              </TypeRow>
            </div>
          </SpecimenSection>

          <SpecimenSection
            id="icon-catalog"
            title="Financial icon catalog"
            description={`${FINANCIAL_ICON_COUNT} named glyphs across seven accounting domains. The playground uses the exact Iconify tokens from the imported source.`}
          >
            <IconCatalog />
          </SpecimenSection>

          <SpecimenSection
            id="components"
            title="Components in use"
            description="The same vocabulary at the sizes and registers used by ledger rows, controls, and status surfaces."
          >
            <ComponentSpecimens />
          </SpecimenSection>

          <SpecimenSection
            id="rules"
            title="Rules"
            description="Four constraints keep the catalog legible as the product grows."
          >
            <div className="grid gap-density-3 md:grid-cols-2">
              <RuleCard kind="do" title="Color by meaning, not variety" body="Green is money in and rose is money out — everywhere, on every page." />
              <RuleCard kind="dont" title="Never mix bright and paper palettes" body="A bright glyph inside a paper status badge reads as two systems. Pick one register per component." />
              <RuleCard kind="do" title="Import icons from the set" body="Resolve accounting names and aliases from the shared vocabulary. A new raw token in a product page is a bug." />
              <RuleCard kind="dont" title="Do not add icons for synonyms" body="Register an alias instead: sales_invoice resolves to invoice, and bank_transfer resolves to transfer." />
            </div>
          </SpecimenSection>
        </div>
      </div>
    </DesignSystemPage>
  );
}

function SemanticColorCard({ token, category }: { token: string; category: (typeof FINANCIAL_CATEGORY_COLORS)[keyof typeof FINANCIAL_CATEGORY_COLORS] }) {
  const style = { backgroundColor: category.accent } satisfies CSSProperties;
  return (
    <article className="merivio-card overflow-hidden">
      <div className="flex h-16 items-end justify-between p-density-3 text-white" style={style}>
        <iconify-icon icon="ph:coins-thin" width="22" height="22" />
        <code className="rounded bg-black/25 px-1.5 py-0.5 text-[10px]">{category.accent}</code>
      </div>
      <div className="p-density-3">
        <div className="flex items-baseline justify-between gap-density-2">
          <h3 className="text-sm font-semibold">{category.color} · {category.name}</h3>
          <code className="text-[10px] text-[var(--mv-muted)]">{token}</code>
        </div>
        <p className="mt-1 text-xs leading-5 text-[var(--mv-muted)]">{category.meaning}</p>
      </div>
    </article>
  );
}

function BrandColorCard({ color, compact = false }: { color: { name: string; token: string; value: string; use: string }; compact?: boolean }) {
  const style = { backgroundColor: color.value } satisfies CSSProperties;
  return (
    <article className={`merivio-card ${compact ? "flex items-center gap-density-3 p-density-3" : "overflow-hidden"}`}>
      <span className={compact ? "size-9 shrink-0 rounded-lg" : "block h-12"} style={style} />
      <div className={compact ? "min-w-0" : "p-density-3"}>
        <div className="flex flex-wrap items-baseline justify-between gap-density-2">
          <strong className="text-sm">{color.name}</strong>
          <code className="text-[10px] text-[var(--mv-muted)]">{color.token} · {color.value}</code>
        </div>
        <p className="mt-1 text-xs text-[var(--mv-muted)]">{color.use}</p>
      </div>
    </article>
  );
}

function TypeRow({ label, spec, children }: { label: string; spec: string; children: ReactNode }) {
  return (
    <div className="grid gap-density-3 p-density-4 md:grid-cols-[10rem_1fr] md:items-baseline">
      <span>
        <strong className="block text-xs">{label}</strong>
        <code className="text-[10px] text-[var(--mv-muted)]">{spec}</code>
      </span>
      <span className="min-w-0 overflow-hidden text-ellipsis">{children}</span>
    </div>
  );
}

function ComponentSpecimens() {
  return (
    <div className="grid gap-density-3 lg:grid-cols-2">
      <SpecimenCard label="Source marks" note="Solid category accent, white glyph, 20×20 at 5px radius.">
        <SourceMark token="ph:receipt-thin" label="Sales invoice" color="#059669" />
        <SourceMark token="ph:arrows-left-right-thin" label="Bank transfer" color="#3578e5" />
        <SourceMark token="ph:notebook-thin" label="Manual journal" color="#7c3aed" />
      </SpecimenCard>
      <SpecimenCard label="Status badges" note="Paper-palette states describe lifecycle, not money direction.">
        <span className="merivio-badge posted">Posted</span>
        <span className="merivio-badge draft">Draft</span>
        <span className="merivio-badge void">Void</span>
        <span className="merivio-badge imported">Imported</span>
        <span className="merivio-badge muted">Archived</span>
      </SpecimenCard>
      <SpecimenCard label="Account class tags" note="Mono, 11px, and desaturated for dense tables.">
        {ACCOUNT_CLASSES.map((accountClass) => (
          <span key={accountClass.name} className="merivio-account-tag" style={{ color: accountClass.color, backgroundColor: accountClass.background }}>
            {accountClass.name}
          </span>
        ))}
      </SpecimenCard>
      <SpecimenCard label="Controls" note="One ink primary per view. Brand green remains reserved for meaning.">
        <button type="button" className="merivio-primary-button">
          <iconify-icon icon="ph:plus-thin" width="15" height="15" /> New journal
        </button>
        <button type="button" className="merivio-ghost-button">Export</button>
        <span className="merivio-segment"><button type="button" className="active">All</button><button type="button">Posted</button><button type="button">Draft</button></span>
      </SpecimenCard>
    </div>
  );
}

function SpecimenCard({ label, note, children }: { label: string; note: string; children: ReactNode }) {
  return (
    <article className="merivio-card flex flex-col gap-density-3 p-density-4">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--mv-muted)]">{label}</span>
      <div className="flex flex-wrap items-center gap-density-3">{children}</div>
      <p className="text-xs leading-5 text-[var(--mv-muted)]">{note}</p>
    </article>
  );
}

function SourceMark({ token, label, color }: { token: string; label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-density-2 text-xs">
      <span className="grid size-5 place-items-center rounded-[5px] text-white" style={{ backgroundColor: color }}>
        <iconify-icon icon={token} width="13" height="13" />
      </span>
      {label}
    </span>
  );
}

function RuleCard({ kind, title, body }: { kind: "do" | "dont"; title: string; body: string }) {
  const isDo = kind === "do";
  return (
    <article className="merivio-card p-density-4">
      <span className={isDo ? "merivio-rule-do" : "merivio-rule-dont"}>
        <iconify-icon icon={isDo ? "ph:check-circle-thin" : "ph:x-circle-thin"} width="16" height="16" />
        {isDo ? "Do" : "Don’t"}
      </span>
      <h3 className="mt-density-3 text-sm font-semibold">{title}</h3>
      <p className="mt-density-2 text-xs leading-5 text-[var(--mv-ink-3)]">{body}</p>
    </article>
  );
}
