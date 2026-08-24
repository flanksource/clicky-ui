import type { StaticIconComponent } from "@flanksource/clicky-ui";
import { Badge, Callout, DensitySwitcher } from "@flanksource/clicky-ui";
import {
  UiActivity,
  UiCloud,
  UiDatabase,
  UiFilter,
  UiForm,
  UiGrid,
  UiInfo,
  UiPalette,
  UiRefresh,
  UiSearch,
  UiServer,
  UiTable,
} from "@flanksource/clicky-ui/icons";

import { SpecimenSection } from "../DesignSystemPage";
import { SEMANTIC_COLORS, SPACE_TOKENS, TYPE_ROLES } from "../foundation-data";

// The five foundations render as sections of one page rather than five nav
// destinations: a hue is only judgeable beside the type it tints, and a spacing
// step only beside the control it separates.

const ICON_SPECIMENS: Array<{ name: string; icon: StaticIconComponent; use: string }> = [
  { name: "UiSearch", icon: UiSearch, use: "Find or filter content" },
  { name: "UiFilter", icon: UiFilter, use: "Refine a collection" },
  { name: "UiRefresh", icon: UiRefresh, use: "Fetch current state" },
  { name: "UiInfo", icon: UiInfo, use: "Supporting guidance" },
  { name: "UiCloud", icon: UiCloud, use: "Cloud resource" },
  { name: "UiServer", icon: UiServer, use: "Compute resource" },
  { name: "UiDatabase", icon: UiDatabase, use: "Stored data" },
  { name: "UiActivity", icon: UiActivity, use: "Health or telemetry" },
  { name: "UiTable", icon: UiTable, use: "Collection surface" },
  { name: "UiForm", icon: UiForm, use: "Configuration surface" },
  { name: "UiPalette", icon: UiPalette, use: "Appearance or theme" },
  { name: "UiGrid", icon: UiGrid, use: "Catalog or overview" },
];

export function ColorsSection() {
  return (
    <SpecimenSection
      id="colors"
      title="Colors"
      description="Consume the role token. The active theme owns its value and its contrast relationship; brand color marks interaction and location, semantic tones carry state."
    >
      <div className="grid gap-density-3 sm:grid-cols-2 xl:grid-cols-3">
        {SEMANTIC_COLORS.map((color) => (
          <article key={color.token} className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="h-16 border-b border-border" style={{ backgroundColor: `var(${color.token})` }} />
            <div className="space-y-1 p-density-3">
              <div className="flex items-baseline justify-between gap-density-2">
                <h3 className="text-sm font-semibold text-foreground">{color.name}</h3>
                <code className="text-[11px] text-muted-foreground">{color.token}</code>
              </div>
              <p className="text-xs text-muted-foreground">{color.use}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="grid gap-density-3 md:grid-cols-3">
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-density-4 text-sm text-primary">Primary action or active location</div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-density-4 text-sm text-emerald-700 [[data-theme=dark]_&]:text-emerald-300">Healthy or completed outcome</div>
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-density-4 text-sm text-amber-700 [[data-theme=dark]_&]:text-amber-300">Attention with a clear next step</div>
      </div>
    </SpecimenSection>
  );
}

export function TypographySection() {
  return (
    <SpecimenSection
      id="typography"
      title="Typography"
      description="A small set of repeatable roles keeps information-dense pages scannable. Monospace is for values users compare, copy, or execute — never for prose."
    >
      <div className="grid gap-density-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {TYPE_ROLES.map((role) => (
            <div key={role.role} className="grid gap-density-3 p-density-3 md:grid-cols-[9rem_1fr] md:items-baseline">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{role.role}</p>
                <code className="text-[11px] text-muted-foreground">{role.className}</code>
              </div>
              <p className={role.className}>{role.sample}</p>
            </div>
          ))}
        </div>
        <div className="space-y-density-3">
          <div className="rounded-xl border border-border bg-card p-density-4">
            <p className="text-sm font-semibold text-foreground">Readable measure</p>
            <p className="mt-density-2 max-w-prose text-sm leading-6 text-muted-foreground">
              Keep explanatory text narrow enough to scan without losing the surrounding operational context. Headings announce structure; body copy explains the decision.
            </p>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-border bg-muted p-density-4 font-mono text-xs leading-5 text-foreground"><code>{`namespace: platform-system\nstatus: healthy\nlast_checked: 2026-08-19T11:08:00Z`}</code></pre>
        </div>
      </div>
    </SpecimenSection>
  );
}

export function SpacingSection() {
  return (
    <SpecimenSection
      id="spacing"
      title="Spacing & density"
      description="A four-pixel base rhythm scales from icon gaps to page regions. Switch density to check that hierarchy survives every setting."
    >
      <div className="grid gap-density-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="space-y-density-2 rounded-xl border border-border bg-card p-density-4">
          {SPACE_TOKENS.map((space) => (
            <div key={space.token} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-density-3">
              <code className="text-[11px] text-muted-foreground">{space.token}</code>
              <div className="h-3 rounded-sm bg-primary" style={{ width: `var(${space.token})` }} />
              <span className="text-right text-xs text-muted-foreground">{space.pixels}px</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-density-3 border-b border-border p-density-3">
            <div>
              <p className="text-sm font-semibold text-foreground">Service checks</p>
              <p className="text-xs text-muted-foreground">The same content at every density.</p>
            </div>
            <DensitySwitcher />
          </div>
          <div className="grid gap-density-3 p-density-4 md:grid-cols-3">
            {["API availability", "Certificate expiry", "Configuration drift"].map((label, index) => (
              <div key={label} className="rounded-lg border border-border bg-muted/40 p-density-3">
                <div className="flex items-center justify-between gap-density-2">
                  <span className="text-sm font-medium text-foreground">{label}</span>
                  <span className="size-2 rounded-full bg-emerald-500" />
                </div>
                <p className="mt-density-2 text-xs text-muted-foreground">Checked {index + 2} minutes ago</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SpecimenSection>
  );
}

export function IconsSection() {
  return (
    <SpecimenSection
      id="icons"
      title="Icons"
      description="Import generated Ui components offline — the name is typed, searchable, and bundled. Glyphs inherit text color; size the container when the hierarchy changes."
    >
      <div className="grid gap-density-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ICON_SPECIMENS.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.name} className="flex items-center gap-density-3 rounded-xl border border-border bg-card p-density-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <code className="block text-xs font-semibold text-foreground">{item.name}</code>
                <p className="text-xs text-muted-foreground">{item.use}</p>
              </div>
            </article>
          );
        })}
      </div>
      <div className="flex flex-wrap items-end gap-density-6 rounded-xl border border-border bg-card p-density-4">
        {["size-3.5", "size-4", "size-5", "size-6", "size-8"].map((size) => (
          <div key={size} className="grid justify-items-center gap-density-2">
            <UiActivity className={size} />
            <code className="text-[11px] text-muted-foreground">{size}</code>
          </div>
        ))}
      </div>
    </SpecimenSection>
  );
}

export function TonesSection() {
  return (
    <SpecimenSection
      id="tones"
      title="Tones"
      description="Choose tone from meaning. Warning is not a way to make a neutral message louder, and a badge labels state where prose would not fit."
    >
      <div className="grid gap-density-3 lg:grid-cols-2">
        <Callout variant="note" title="Context">This check inherits the environment&apos;s default schedule.</Callout>
        <Callout variant="tip" title="Recommendation">Start with the narrowest namespace and expand after previewing results.</Callout>
        <Callout variant="important" title="Required decision">Choose an owner before enabling notifications.</Callout>
        <Callout variant="warning" title="Review needed">Three resources have not reported in the last hour.</Callout>
        <Callout variant="caution" title="Destructive outcome" emphasis>Removing this source also removes its collected history.</Callout>
      </div>
      <div className="flex flex-wrap gap-density-3 rounded-xl border border-border bg-card p-density-4">
        <Badge tone="success" clickToCopy={false}>Healthy</Badge>
        <Badge tone="info" clickToCopy={false}>Running</Badge>
        <Badge tone="warning" clickToCopy={false}>Degraded</Badge>
        <Badge tone="danger" clickToCopy={false}>Failed</Badge>
        <Badge tone="neutral" clickToCopy={false}>Unknown</Badge>
      </div>
    </SpecimenSection>
  );
}
