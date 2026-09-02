import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeBlock, Panel, SearchInput, SegmentedControl } from "@flanksource/clicky-ui";

import { SECTIONS, type IconEntry } from "../_supply-chain-threat-icons/catalog";
import { IconCard, Legend, SectionHead } from "../_supply-chain-threat-icons/parts";
import {
  filterSections,
  renderTable,
  toRows,
  type TableFormat,
} from "../_supply-chain-threat-icons/table";

export const meta = {
  title: "Supply chain threat icons",
  description: "Iconography and colour theme for software supply-chain threat models",
};

const COPY_FLAG_MS = 1400;

export default function SupplyChainThreatIcons() {
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<TableFormat>("md");
  // Flagged by key, not by token: several entries share a glyph, and keying the
  // flag on the token makes one click light up every card that borrows it.
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const flagTimer = useRef<number | undefined>(undefined);

  const sections = useMemo(() => filterSections(SECTIONS, query), [query]);
  const rows = useMemo(() => toRows(sections), [sections]);
  const table = useMemo(() => renderTable(rows, format), [rows, format]);

  useEffect(() => () => window.clearTimeout(flagTimer.current), []);

  const copyToken = useCallback((item: IconEntry) => {
    void navigator.clipboard.writeText(item.icon).then(
      () => {
        setCopiedKey(item.key);
        window.clearTimeout(flagTimer.current);
        flagTimer.current = window.setTimeout(() => setCopiedKey(null), COPY_FLAG_MS);
      },
      (error: unknown) => {
        // Silently doing nothing here would look identical to a successful
        // copy, so the failure has to be visible somewhere.
        console.error(`[threat-icons] could not copy ${item.icon}`, error);
      },
    );
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-16">
      <header className="space-y-4 border-b border-border pb-7">
        <div className="flex items-center gap-2.5">
          <span className="grid size-[22px] place-items-center rounded bg-primary text-primary-foreground">
            <iconify-icon icon="ph:shield-warning-thin" width="14" height="14" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Flanksource · Mission Control
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Supply chain threat icons</h1>

        <p className="max-w-[76ch] leading-relaxed text-muted-foreground">
          An iconography and colour theme for modelling threats across the software supply chain —
          from source and dependencies through build, distribution, and self-hosted or enterprise
          deployment. STRIDE threat classes, attack surfaces, concrete attack vectors, defensive
          controls, deployment contexts, and a risk / trust ramp. Every glyph is an outline icon on
          the 24&nbsp;px grid, drawn in the Phosphor (thin) style and referenced through Iconify.
        </p>

        <p className="max-w-[76ch] text-sm leading-relaxed text-muted-foreground">
          The colour theme encodes <strong className="font-semibold text-foreground">meaning, not
          decoration</strong>: threat classes take the hue of the <em>security property at risk</em>{" "}
          (identity <Tok>violet</Tok>, integrity <Tok>amber</Tok>, confidentiality <Tok>indigo</Tok>,
          availability&nbsp;/&nbsp;attack <Tok>rose</Tok>, authorization <Tok>crimson</Tok>,
          auditability <Tok>sky</Tok>); the supply-chain surface is <Tok>blue</Tok> (the system being
          protected); controls are <Tok>emerald</Tok>; deployment is <Tok>teal</Tok>; and severity
          follows the product ramp <Tok>critical → informational</Tok>.
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Filter by name, key, token or description…"
            shortcut={null}
            className="w-full max-w-sm"
          />
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <iconify-icon icon="ph:cursor-click-thin" width="13" height="13" />
            Click any card to copy its token
          </span>
        </div>
      </header>

      {sections.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing in the catalogue matches <code className="rounded bg-muted px-1">{query}</code>.
        </p>
      ) : (
        sections.map((section) => (
          <section key={section.title} className="space-y-4">
            <SectionHead title={section.title} desc={section.desc} count={section.items.length} />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {section.items.map((item) => (
                <IconCard
                  key={item.key}
                  item={item}
                  copied={copiedKey === item.key}
                  onCopy={copyToken}
                />
              ))}
            </div>
          </section>
        ))
      )}

      <section className="space-y-4">
        <SectionHead
          title="Reference table"
          desc="A plain-text table of the set above — group, name, icon token, key, colour & meaning, and description. Copy as Markdown or tab-separated (paste straight into Sheets, Notion, or a threat-model doc)."
          count={rows.length}
        />
        <Legend />
        <Panel
          padded={false}
          actions={
            <SegmentedControl
              size="sm"
              aria-label="Table format"
              value={format}
              onChange={setFormat}
              options={[
                { id: "md", label: "Markdown" },
                { id: "tsv", label: "Tab-separated" },
              ]}
            />
          }
        >
          {/* The Markdown table is width-padded, so it has to scroll rather
              than wrap — CodeBlock's body wraps by default. */}
          <CodeBlock
            source={table}
            copyable
            className="rounded-none border-0 [&_pre]:max-h-[460px] [&_pre]:!whitespace-pre"
          />
        </Panel>
      </section>

      <p className="max-w-[76ch] border-t border-border pt-6 text-sm leading-relaxed text-muted-foreground">
        <strong className="font-semibold text-foreground">Usage.</strong> Render with the Iconify web
        component: <code className="rounded bg-muted px-1 py-0.5 text-xs">{`<iconify-icon icon="ph:shield-warning-thin" />`}</code>
        . Icons inherit <code className="rounded bg-muted px-1 py-0.5 text-xs">currentColor</code>, so
        set the semantic colour with a text-colour utility or CSS variable. Sizes follow the system
        scale — <strong className="font-semibold text-foreground">24&nbsp;px default</strong>,
        16&nbsp;px dense tables, 40&nbsp;px feature. In a threat model, pair a <em>threat class</em> or{" "}
        <em>attack vector</em> icon with the <em>surface</em> it targets and the <em>control</em> that
        mitigates it — the shared colour families let a diagram read at a glance.
      </p>
    </div>
  );
}

function Tok({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">
      {children}
    </code>
  );
}
