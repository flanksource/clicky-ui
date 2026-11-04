import type { CSSProperties, ReactNode } from "react";
import { MissionControl, Postgres, Redis } from "@flanksource/icons/mi";
import { Captain, type DiagramIcon } from "../reference/icons";
import { Sheet, Swatch } from "./common";

// A product keeps one brand colour everywhere it appears; the logo is either in its own
// colours on white, or white on the brand fill. Never a tinted or recoloured logo.
type Product = { name: string; color: string; tint: string; logo: DiagramIcon };

const mark = (Logo: typeof MissionControl): DiagramIcon => ({ className, style }) => (
  <span className={`inline-flex ${className ?? ""}`} style={style}><Logo size="100%" square /></span>
);

const MISSION_CONTROL: Product = { name: "Mission Control", color: "#1d4ed8", tint: "#eff6ff", logo: mark(MissionControl) };
const CAPTAIN: Product = { name: "Captain", color: "#c45125", tint: "#fdf3ee", logo: Captain };
const REDIS: Product = { name: "Redis", color: "#dc382d", tint: "#fef2f2", logo: mark(Redis) };
const POSTGRES: Product = { name: "PostgreSQL", color: "#336791", tint: "#f0f5fa", logo: mark(Postgres) };

const INK = "#0f172a";
const MUTED = "#64748b";
const WHITE_LOGO: CSSProperties = { filter: "brightness(0) invert(1)" };

const Logo = ({ product, white = false, className = "h-4 w-4" }: { product: Product; white?: boolean; className?: string }) => {
  const Mark = product.logo;
  return <Mark className={`shrink-0 ${className}`} {...(white ? { style: WHITE_LOGO } : {})} />;
};

function Badge({ product, outline = false }: { product: Product; outline?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 whitespace-nowrap rounded px-1.5 py-0.5 text-[9.5px] font-bold" style={outline ? { border: `1px solid ${product.color}`, color: product.color, backgroundColor: "#ffffff" } : { backgroundColor: product.color, color: "#ffffff" }}>
      <Logo product={product} white={!outline} className="h-3 w-3" />{product.name}
    </span>
  );
}

const Member = ({ children }: { children: ReactNode }) => <div className="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[9px] font-semibold" style={{ color: INK }}>{children}</div>;

export function ProductStyles() {
  return (
    <Sheet columns={4} intro="Products as boxes, containers and badges. A product keeps one brand colour and its own logo wherever it appears: use a box when the product is one component, a container when it owns the components inside it, and a badge to tag something else with the product that supplies it.">
      <Swatch name="product/box" note="One component: logo, name and role, brand accent">
        <div className="flex items-center gap-1.5 overflow-hidden rounded-md border bg-white py-1.5 pl-0 pr-2" style={{ borderColor: "#cbd5e1" }}>
          <span className="w-[3px] self-stretch" style={{ backgroundColor: REDIS.color }} />
          <Logo product={REDIS} className="h-5 w-5" />
          <div><div className="text-[11px] font-semibold leading-tight" style={{ color: INK }}>Redis cache</div><div className="text-[9px] leading-tight" style={{ color: MUTED }}>query results</div></div>
        </div>
      </Swatch>
      <Swatch name="product/box-filled" note="The figure's subject: brand fill, white logo">
        <div className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5" style={{ backgroundColor: CAPTAIN.color }}>
          <Logo product={CAPTAIN} white className="h-5 w-5" />
          <div><div className="text-[11px] font-semibold leading-tight text-white">Captain</div><div className="text-[9px] leading-tight text-white/80">agent runtime</div></div>
        </div>
      </Swatch>
      <Swatch name="product/tile" note="Well-known product: logo tile, name below">
        <div className="flex flex-col items-center gap-0.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border bg-white" style={{ borderColor: "#cbd5e1" }}><Logo product={POSTGRES} className="h-6 w-6" /></span>
          <div className="text-[10px] font-semibold" style={{ color: INK }}>PostgreSQL</div>
        </div>
      </Swatch>
      <Swatch name="product/logo" note="Logo only: legends and dense rows">
        <div className="flex items-center gap-2">{[MISSION_CONTROL, CAPTAIN, REDIS, POSTGRES].map((product) => <Logo key={product.name} product={product} className="h-5 w-5" />)}</div>
      </Swatch>
      <Swatch name="product/container" note="Owns its members: filled edge badge, white logo" height={112}>
        <div className="relative w-[150px] rounded-md border-[1.5px] bg-white px-2 pb-2 pt-3" style={{ borderColor: MISSION_CONTROL.color }}>
          <span className="absolute -top-[14px] left-2"><Badge product={MISSION_CONTROL} /></span>
          <div className="flex gap-1"><Member>API</Member><Member>Scheduler</Member></div>
        </div>
      </Swatch>
      <Swatch name="product/container-outline" note="Lighter owner: outline edge badge, logo in its colours" height={112}>
        <div className="relative w-[150px] rounded-md border-[1.5px] bg-white px-2 pb-2 pt-3" style={{ borderColor: CAPTAIN.color }}>
          <span className="absolute -top-[14px] left-2"><Badge product={CAPTAIN} outline /></span>
          <div className="flex gap-1"><Member>Runner</Member><Member>Prompts</Member></div>
        </div>
      </Swatch>
      <Swatch name="product/container-tinted" note="One subject product per figure: brand tint, logo title" height={112}>
        <div className="w-[150px] rounded-md border px-2 pb-2 pt-1.5" style={{ borderColor: CAPTAIN.color, backgroundColor: CAPTAIN.tint }}>
          <div className="mb-1 flex items-center gap-1 text-[10px] font-bold" style={{ color: CAPTAIN.color }}><Logo product={CAPTAIN} className="h-3.5 w-3.5" />Captain</div>
          <div className="flex gap-1"><Member>Runner</Member><Member>Prompts</Member></div>
        </div>
      </Swatch>
      <Swatch name="product/badge" note="Tags a group or note: brand fill, white logo">
        <div className="flex flex-col items-start gap-1"><Badge product={CAPTAIN} /><Badge product={MISSION_CONTROL} /></div>
      </Swatch>
      <Swatch name="product/badge-outline" note="Lighter tag for lists: outline, logo in its colours">
        <div className="flex flex-col items-start gap-1"><Badge product={CAPTAIN} outline /><Badge product={REDIS} outline /></div>
      </Swatch>
      <Swatch name="product/badge-corner" note="Built on or supplied by: badge on a component's corner">
        <div className="relative rounded-md border bg-white px-3 py-2" style={{ borderColor: "#cbd5e1" }}>
          <div className="text-[11px] font-semibold" style={{ color: INK }}>Session cache</div>
          <span className="absolute -right-2 -top-2.5"><Badge product={REDIS} /></span>
        </div>
      </Swatch>
    </Sheet>
  );
}
