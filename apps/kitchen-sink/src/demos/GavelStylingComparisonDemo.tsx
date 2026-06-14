import { useState, type CSSProperties, type ReactNode } from "react";
import {
  Badge,
  SearchInput,
  SegmentedControl,
  Timeline,
  type TimelineItem,
  UiCheck,
  UiComment,
  UiGitPr,
  UiRobotAi,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

// Gavel's bespoke light theme (gavel/ui.jsx gavelTheme(false) + sem()), reproduced
// verbatim so the right-hand column shows the design's literal look — Inter +
// JetBrains Mono, slate palette, #2563eb accent — next to the clicky-token build.
const G = {
  accent: "#2563eb",
  surface: "#ffffff",
  surfaceAlt: "#f8fafc",
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  fg: "#334155",
  fgStrong: "#0f172a",
  muted: "#64748b",
  faint: "#94a3b8",
  inset: "#f1f5f9",
  sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  sem: {
    success: { fg: "#15803d", bg: "#dcfce7", solid: "#22c55e" },
    error: { fg: "#b91c1c", bg: "#fee2e2", solid: "#ef4444" },
    warning: { fg: "#a16207", bg: "#fef3c7", solid: "#f59e0b" },
    info: { fg: "#0369a1", bg: "#e0f2fe", solid: "#0ea5e9" },
    neutral: { fg: "#475569", bg: "#f1f5f9", solid: "#94a3b8" },
  },
} as const;

const SCOPE = [
  { id: "me", label: "Mine" },
  { id: "all", label: "All" },
  { id: "bots", label: "Bots", icon: UiRobotAi },
];

const TIMELINE_ITEMS: TimelineItem[] = [
  { id: 1, icon: UiGitPr, tone: "neutral", actor: "adityathebe", action: "opened this pull request", timestamp: "3d ago" },
  { id: 2, icon: UiCheck, tone: "success", actor: "moshloop", action: "approved these changes", timestamp: "1d ago" },
  {
    id: 3,
    icon: UiComment,
    tone: "info",
    actor: "yashmehrotra",
    action: "commented",
    timestamp: "1d ago",
    bodyHeader: (
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-primary">reconnect.go:42</span>
        <Badge tone="warning" size="xs">
          Unresolved
        </Badge>
      </div>
    ),
    body: "Debounce the SSE reconnect.",
  },
];

const MAPPING: Array<[string, string]> = [
  ["canvas / surface", "bg-background / bg-card"],
  ["surfaceAlt / inset", "bg-secondary / bg-muted"],
  ["border / borderStrong", "border-border / border-ring"],
  ["fg / fgStrong", "text-foreground / text-primary"],
  ["muted / faint", "text-muted-foreground"],
  ["accent #2563eb", "--primary / ring-ring"],
  ["Inter + JetBrains Mono", "clicky sans + font-mono"],
  ["fixed px (12.5px, radii)", "text-sm/text-xs, px-density-*, rounded-md"],
];

function Pair({ title, clicky, gavel }: { title: string; clicky: ReactNode; gavel: ReactNode }) {
  return (
    <div className="space-y-density-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="grid grid-cols-1 gap-density-3 md:grid-cols-2">
        <Cell label="clicky tokens (shipped)">{clicky}</Cell>
        <Cell label="Gavel faithful (reference)">{gavel}</Cell>
      </div>
    </div>
  );
}

function Cell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-density-2 rounded-md border border-border bg-card p-density-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

// ── Gavel-faithful inline replicas ──────────────────────────────────────────
function GavelSegmented({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div style={{ display: "inline-flex", background: G.inset, borderRadius: 8, padding: 2, gap: 2, fontFamily: G.sans }}>
      {SCOPE.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            style={{
              padding: "4px 11px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 12.5,
              fontWeight: active ? 600 : 500,
              fontFamily: "inherit",
              background: active ? G.surface : "transparent",
              color: active ? G.fgStrong : G.muted,
              boxShadow: active ? "0 1px 2px rgba(6,20,49,0.10)" : "none",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function GavelSearch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        padding: "6px 12px",
        background: G.surfaceAlt,
        border: `1px solid ${G.border}`,
        borderRadius: 8,
        fontFamily: G.sans,
      }}
    >
      <span style={{ color: G.faint, display: "inline-flex" }} aria-hidden>
        ⌕
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search pull requests, branches, #id…"
        style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontSize: 13, color: G.fg, fontFamily: "inherit", minWidth: 0 }}
      />
      <span style={{ fontFamily: G.mono, fontSize: 10.5, color: G.faint, border: `1px solid ${G.border}`, padding: "1px 5px", borderRadius: 4 }}>
        ⌘K
      </span>
    </div>
  );
}

function GavelToast({ tone, children }: { tone: keyof typeof G.sem; children: ReactNode }) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: "#0f172a",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 500,
        border: `1px solid ${G.accent}`,
        fontFamily: G.sans,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: G.sem[tone].solid }} />
      {children}
    </div>
  );
}

const GAVEL_TIMELINE: Array<{ who: string; act: string; when: string; tone: keyof typeof G.sem; glyph: string }> = [
  { who: "adityathebe", act: "opened this pull request", when: "3d ago", tone: "neutral", glyph: "⊙" },
  { who: "moshloop", act: "approved these changes", when: "1d ago", tone: "success", glyph: "✓" },
  { who: "yashmehrotra", act: "commented", when: "1d ago", tone: "info", glyph: "❝" },
];

function GavelTimeline() {
  return (
    <div style={{ fontFamily: G.sans }}>
      {GAVEL_TIMELINE.map((e, i) => {
        const last = i === GAVEL_TIMELINE.length - 1;
        const c = G.sem[e.tone];
        return (
          <div key={e.who} style={{ display: "flex", gap: 11, position: "relative", paddingBottom: last ? 0 : 16 }}>
            {!last && <span style={{ position: "absolute", left: 10, top: 22, bottom: 0, width: 1.5, background: G.border }} />}
            <span style={{ width: 21, height: 21, borderRadius: "50%", background: c.bg, color: c.fg, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1, fontSize: 11 }}>
              {e.glyph}
            </span>
            <div style={{ fontSize: 12.5, paddingTop: 1 }}>
              <span style={{ fontWeight: 600, color: G.fgStrong }}>{e.who}</span>{" "}
              <span style={{ color: G.muted }}>{e.act}</span>
              <span style={{ color: G.faint, marginLeft: 6, fontSize: 11.5 }}>· {e.when}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const tableCell: CSSProperties = { padding: "6px 10px", borderBottom: "1px solid", verticalAlign: "top" };

export function GavelStylingComparisonDemo() {
  const [scopeA, setScopeA] = useState("all");
  const [scopeB, setScopeB] = useState("all");
  const [qA, setQA] = useState("");
  const [qB, setQB] = useState("");

  return (
    <DemoSection
      id="gavel-styling-comparison"
      title="Gavel styling comparison"
      description="The four net-new primitives in clicky-token form (left, shipped — inherits dark-mode + density) next to a Gavel-faithful replica (right — Inter / JetBrains Mono, slate, #2563eb). Toggle the global theme/density switchers to see the left column adapt while the reference stays fixed."
    >
      <div className="overflow-hidden rounded-md border border-border">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-secondary text-left text-muted-foreground">
              <th className="px-2.5 py-1.5 font-semibold">Gavel token / value</th>
              <th className="px-2.5 py-1.5 font-semibold">clicky-ui equivalent</th>
            </tr>
          </thead>
          <tbody>
            {MAPPING.map(([from, to]) => (
              <tr key={from} className="border-t border-border">
                <td className="px-2.5 py-1.5 font-mono text-foreground" style={tableCell}>
                  {from}
                </td>
                <td className="px-2.5 py-1.5 font-mono text-muted-foreground" style={tableCell}>
                  {to}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pair
        title="SegmentedControl"
        clicky={
          <SegmentedControl aria-label="Scope" value={scopeA} onChange={setScopeA} options={SCOPE} />
        }
        gavel={<GavelSegmented value={scopeB} onChange={setScopeB} />}
      />

      <Pair
        title="SearchInput"
        clicky={
          <SearchInput value={qA} onChange={setQA} placeholder="Search pull requests, branches, #id…" />
        }
        gavel={<GavelSearch value={qB} onChange={setQB} />}
      />

      <Pair
        title="Timeline"
        clicky={<Timeline items={TIMELINE_ITEMS} />}
        gavel={<GavelTimeline />}
      />

      <Pair
        title="Toast"
        clicky={
          <div className="inline-flex items-center gap-density-2.5 rounded-md border border-border bg-popover px-density-3 py-density-2 text-sm font-medium text-popover-foreground shadow-lg">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Approved — review submitted
          </div>
        }
        gavel={<GavelToast tone="success">Approved — review submitted</GavelToast>}
      />
    </DemoSection>
  );
}
