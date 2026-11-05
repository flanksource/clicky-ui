import type { ReactNode } from "react";

import {
  UiCursorClick,
  UiDatabase,
  UiGlobe,
  UiKey,
  UiLockKey,
  UiRobotAi,
  UiServerProcess,
  UiShieldCheck,
  UiStack,
  UiUser,
  UiUserCheck,
  UiUsersThree,
} from "@flanksource/clicky-ui/icons";

import { Postgres } from "@flanksource/icons/mi";

import { type Icon } from "../products/blocks";

import { Frame, NIGHT, SquareTile } from "../layouts/temporal-styles";

import { Captain } from "../reference/icons";

import { BOX_STYLES, CONTAINER_STYLES, BoxNode, ContainerNode, DEFAULT_NODE_PALETTE } from "@flanksource/facet";

import { useVocabularySample } from "./sample-context";
import { Sheet, Swatch } from "./common";

import { ROLES } from "./roles";

type Role = keyof typeof ROLES;

const ROLE_KEYS = Object.keys(ROLES) as Role[];

const R = ROLES.new;

const INK = "#0f172a";

const MUTED = "#64748b";

const Title = ({ children, color = INK }: { children: ReactNode; color?: string }) => <div className="text-[11px] font-semibold leading-tight" style={{ color }}>{children}</div>;

const Detail = ({ children }: { children: ReactNode }) => <div className="text-[9px] leading-tight" style={{ color: MUTED }}>{children}</div>;

const Chip = ({ children, color = R.header }: { children: ReactNode; color?: string }) => <span className="whitespace-nowrap rounded border bg-white px-1 text-[8px] font-semibold" style={{ borderColor: color, color }}>{children}</span>;

export function BoxStyles() {
  const notes = {
    outlined: "Default component", header: "Component with a role colour", tinted: "Light fill, no header",
    card: "White card on a tinted zone", dashed: "Planned, optional or phase 2", stacked: "An outside party",
    "chip-dark": "The one hub everything meets", pill: "Small node, member or tag", tile: "Icon-first square",
    accent: "Left stripe marks the role", borderless: "Icon + label row inside a zone", ghost: "Out of scope or removed",
  };
  return (
    <Sheet columns={4} intro="Box styles. Pick the shape by what the box is, not by taste: solid and header boxes are components, cards sit inside tinted zones, dashed means planned or optional, stacked means an outside party. box/round and box/square are corner treatments for any of them; use one per diagram.">
      {BOX_STYLES.map((variant) => <Swatch key={variant} name={`box/${variant}`} note={notes[variant]} height={112}>
        <div className="rounded-md p-2" style={{ backgroundColor: variant === "card" ? R.body : undefined }}>
          <BoxNode variant={variant} title={variant === "tile" ? "Router" : "Run API"} compact
            palette={{ ...DEFAULT_NODE_PALETTE, accent: R.header, border: R.border, tint: R.body }}
            minWidth={variant === "tile" ? "64px" : "112px"}
            {...(variant === "header" ? { description: "Validates requests" } : {})}
            {...(["pill", "tile", "borderless"].includes(variant) ? { icon: <UiServerProcess className="h-4 w-4" /> } : {})}
            {...(variant === "chip-dark" ? { icon: <UiStack className="h-4 w-4" /> } : {})} />
        </div>
      </Swatch>)}
      {CORNERS.map(({ name, radius, note }) => (
        <Swatch key={name} name={`box/${name}`} note={note} height={112}>
          <div className="flex gap-2">
            <div className="flex min-w-[64px] items-center justify-center border bg-white px-2 py-2 text-xs font-bold" style={{ borderColor: R.border, color: INK, borderRadius: radius }}>Run API</div>
            <div className="min-w-[64px] overflow-hidden border-2" style={{ borderColor: R.border, borderRadius: radius }}>
              <div className="px-2 py-1 text-center text-[10px] font-bold text-white" style={{ backgroundColor: R.header }}>Run API</div>
              <div className="px-2 py-1 text-[9px]" style={{ backgroundColor: R.body, color: MUTED }}>Validates</div>
            </div>
          </div>
        </Swatch>
      ))}
    </Sheet>
  );
}

const CORNERS = [
  { name: "round", radius: "12px", note: "Soft corners; product and marketing figures" },
  { name: "square", radius: "0px", note: "Hard corners; spec sheets, blueprints, dense grids" },
] as const;

export function BoxColors() {
  return (
    <Sheet columns={4} intro="Box colour schemes. A role colour says what kind of thing a box is. Colour the header or border, keep the body light, and use at most four roles in one diagram.">
      {ROLE_KEYS.map((key) => {
        const role = ROLES[key];
        return (
          <Swatch key={key} name={`role/${key}`} note={{ new: "New in this change", existing: "Already in the estate", external: "Outside our control", security: "Identity, policy, secrets", store: "Data at rest", action: "Queues, jobs, actions", cloud: "Cloud and edge services", muted: "Context, out of focus" }[key]}>
            <div className="w-[112px] overflow-hidden rounded-md border" style={{ borderColor: role.border }}>
              <div className="px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: role.header }}>{role.label}</div>
              <div className="flex gap-1 px-2 py-1.5" style={{ backgroundColor: role.body }}>
                {[role.header, role.border, role.body].map((c) => <span key={c} className="h-3 w-3 rounded-sm border border-black/5" style={{ backgroundColor: c }} />)}
              </div>
            </div>
          </Swatch>
        );
      })}
    </Sheet>
  );
}

export function BoxDensities() {
  const box = "w-[150px] rounded-md border bg-white px-2 py-1.5";
  return (
    <Sheet columns={3} intro="Box information density. Raise density only as far as the reader needs; put everything else in the caption or a second diagram.">
      <Swatch name="box-density/glyph" note="Icon only, for repeated members"><span className="flex h-9 w-9 items-center justify-center rounded-md border bg-white" style={{ borderColor: R.border, color: R.header }}><UiDatabase className="h-5 w-5" /></span></Swatch>
      <Swatch name="box-density/label" note="Name only"><div className={box} style={{ borderColor: R.border }}><Title>Run history</Title></div></Swatch>
      <Swatch name="box-density/label-detail" note="Name plus one fact"><div className={box} style={{ borderColor: R.border }}><Title>Run history</Title><Detail>Sessions, cost, results</Detail></div></Swatch>
      <Swatch name="box-density/tagged" note="Adds chips for kinds or tech" height={108}><div className={box} style={{ borderColor: R.border }}><Title>Run history</Title><Detail>Sessions, cost, results</Detail><div className="mt-1 flex gap-1"><Chip>PostgreSQL</Chip><Chip>90 days</Chip></div></div></Swatch>
      <Swatch name="box-density/listed" note="Members as rows" height={108}><div className={box} style={{ borderColor: R.border }}><Title>Run history</Title>{["Sessions", "Cost", "Results"].map((r) => <div key={r} className="flex items-center gap-1 text-[9.5px] text-slate-700"><span className="h-1 w-1 rounded-full" style={{ backgroundColor: R.header }} />{r}</div>)}</div></Swatch>
      <Swatch name="box-density/detailed" note="Field table, for spec figures only" height={108}><div className={box} style={{ borderColor: R.border }}><Title>Run history</Title>{[["Engine", "PostgreSQL"], ["Retention", "90 days"], ["Access", "read: audit"]].map(([k, v]) => <div key={k} className="flex justify-between border-b border-slate-100 text-[9px]"><span className="text-slate-500">{k}</span><b className="text-slate-800">{v}</b></div>)}</div></Swatch>
    </Sheet>
  );
}

export function BoxTagVariants() {
  const box = "relative w-[150px] rounded-md border bg-white px-2 py-1.5";
  const accent = { borderColor: R.border };
  return (
    <Sheet columns={4} intro="Alternatives to box-density/tagged. The same two facts (engine and retention) placed differently; pick one per diagram.">
      <Swatch name="tags/chips" note="Chips under the detail line" height={96}><div className={box} style={accent}><Title>Run history</Title><Detail>Sessions, cost, results</Detail><div className="mt-1 flex gap-1"><Chip>PostgreSQL</Chip><Chip>90 days</Chip></div></div></Swatch>
      <Swatch name="tags/inline" note="Badge beside the title" height={96}><div className={box} style={accent}><div className="flex items-center gap-1"><Title>Run history</Title><Chip>PG</Chip></div><Detail>Sessions, cost · 90 days</Detail></div></Swatch>
      <Swatch name="tags/corner" note="Badge on the top-right edge" height={96}><div className={box} style={accent}><span className="absolute -right-1.5 -top-2 rounded-full px-1.5 text-[8px] font-semibold text-white" style={{ backgroundColor: R.header }}>90 days</span><Title>Run history</Title><Detail>Sessions, cost, results</Detail></div></Swatch>
      <Swatch name="tags/logo" note="Technology as a logo, not text" height={96}><div className={`${box} flex items-center gap-2`} style={accent}><span className="h-6 w-6 shrink-0 [&>svg]:h-full [&>svg]:w-full"><Postgres /></span><div><Title>Run history</Title><Detail>Sessions, cost, results</Detail></div></div></Swatch>
      <Swatch name="tags/footer" note="Mono metadata line" height={96}><div className={box} style={accent}><Title>Run history</Title><Detail>Sessions, cost, results</Detail><div className="mt-1 border-t border-slate-100 pt-0.5 font-mono text-[8px] text-slate-500">postgres · 90d · encrypted</div></div></Swatch>
      <Swatch name="tags/header" note="Tag in the header bar" height={96}><div className="w-max min-w-[150px] overflow-hidden rounded-md border" style={accent}><div className="flex items-center justify-between gap-2 whitespace-nowrap px-2 py-0.5 text-[10px] font-semibold text-white" style={{ backgroundColor: R.header }}>Run history<span className="rounded bg-white/20 px-1 text-[8px]">PostgreSQL</span></div><div className="px-2 py-1" style={{ backgroundColor: R.body }}><Detail>Sessions, cost · 90 days</Detail></div></div></Swatch>
      <Swatch name="tags/edge" note="Tag sitting on the top border" height={96}><div className={`${box} pt-2.5`} style={accent}><span className="absolute -top-[7px] left-2 rounded-[2px] border bg-white px-1 font-mono text-[8px] leading-[12px]" style={{ borderColor: R.header, color: R.header }}>postgres</span><Title>Run history</Title><Detail>Sessions, cost, results</Detail></div></Swatch>
      <Swatch name="tags/icons" note="Icon-only facts with a legend" height={96}><div className={box} style={accent}><Title>Run history</Title><Detail>Sessions, cost, results</Detail><div className="mt-1 flex items-center gap-1.5 text-slate-500"><UiDatabase className="h-3 w-3" /><UiLockKey className="h-3 w-3" /><span className="font-mono text-[8px]">90d</span></div></div></Swatch>
    </Sheet>
  );
}

function Mini({ dark = false }: { dark?: boolean | undefined }) {
  const box = dark ? "rounded-sm border border-white/30 bg-white/10" : "rounded-sm border border-slate-300 bg-white";
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-5 w-9 ${box}`} />
      <span className={`h-px w-4 ${dark ? "bg-white/50" : "bg-slate-400"}`} />
      <span className={`h-5 w-9 ${box}`} />
    </div>
  );
}

const CANVASES: { name: string; note: string; style: React.CSSProperties; dark?: boolean }[] = [
  { name: "canvas/plain", note: "White; the default for print", style: { backgroundColor: "#ffffff" } },
  { name: "canvas/paper", note: "Warm off-white", style: { backgroundColor: "#f7f5f0" } },
  { name: "canvas/dots", note: "Dot grid; sketch or whiteboard feel", style: { backgroundColor: "#fbfbfa", backgroundImage: "radial-gradient(#d6d3d1 1px, transparent 1px)", backgroundSize: "10px 10px" } },
  { name: "canvas/grid", note: "Blueprint line grid", style: { backgroundColor: "#f8fbfd", backgroundImage: "linear-gradient(#dbeaf3 1px, transparent 1px), linear-gradient(90deg, #dbeaf3 1px, transparent 1px)", backgroundSize: "12px 12px" } },
  { name: "canvas/tint", note: "Soft grey card, figures in prose", style: { backgroundColor: "#f4f4f3" } },
  { name: "canvas/wash", note: "Light gradient, product pages", style: { backgroundImage: "linear-gradient(135deg, #eff6ff, #ffffff 60%)" } },
  { name: "canvas/night", note: "Dark grid; slides and heroes", style: { backgroundColor: "#0b1023", backgroundImage: "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)", backgroundSize: "12px 12px" }, dark: true },
  { name: "canvas/transparent", note: "Inherits the page; never for PNG", style: { background: "repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%) 50% / 10px 10px" } },
];

export function CanvasBackgrounds() {
  return (
    <Sheet columns={4} intro="Canvas backgrounds: what the whole diagram sits on. Choose once per document; dotted and grid canvases suit working drawings, plain and paper suit print.">
      {CANVASES.map(({ name, note, style, dark }) => (
        <Swatch key={name} name={name} note={note}><div className="flex h-[76px] w-full items-center justify-center rounded" style={style}><Mini dark={dark} /></div></Swatch>
      ))}
    </Sheet>
  );
}

export function CanvasFrames() {
  return (
    <Sheet columns={3} intro="Canvas frames: how the diagram as a whole is bounded and captioned on the page.">
      <Swatch name="frame/none" note="Bleeds into the page; inline figures" height={110}><Mini /></Swatch>
      <Swatch name="frame/card" note="Rounded border, optional shadow" height={110}><div className="flex h-[78px] w-[170px] items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm"><Mini /></div></Swatch>
      <Swatch name="frame/figure" note="Grey card with a numbered caption below" height={110}><div className="space-y-1"><div className="flex h-[66px] w-[170px] items-center justify-center rounded-lg border border-[#e4e4e2] bg-[#f4f4f3]"><Mini /></div><div className="text-center text-[8.5px] text-slate-500">Figure 1. Runs pass one gateway.</div></div></Swatch>
      <Swatch name="frame/titled" note="Title bar and tag above the canvas" height={110}><div className="w-[170px] space-y-1"><div className="flex items-center gap-1.5"><span className="text-[10px] font-semibold">Deployment</span><span className="border-y border-sky-700 px-1 font-mono text-[7px] tracking-[0.15em] text-sky-800">REV 01</span></div><div className="flex h-[60px] items-center justify-center border border-sky-200 bg-[#f8fbfd]"><Mini /></div></div></Swatch>
      <Swatch name="frame/crop" note="Corner crop marks, reference drawing" height={110}><div className="relative flex h-[78px] w-[170px] items-center justify-center bg-[#f8fbfd]">{["left-1 top-1 border-l border-t", "right-1 top-1 border-r border-t", "bottom-1 left-1 border-b border-l", "bottom-1 right-1 border-b border-r"].map((c) => <span key={c} className={`absolute h-2.5 w-2.5 border-slate-400 ${c}`} />)}<Mini /></div></Swatch>
      <Swatch name="frame/footer" note="Uppercase title bottom-left" height={110}><div className="relative flex h-[78px] w-[170px] items-center justify-center bg-[#fafafa] pb-3"><Mini /><span className="absolute bottom-1.5 left-2 text-[7.5px] font-semibold uppercase tracking-[0.06em]">Agent runs · sandboxes</span></div></Swatch>
    </Sheet>
  );
}

export function ContainerStyles() {
  const notes = {
    zone: "Tinted group of members", boundary: "Trust or network edge", binding: "Solid: owns its children",
    region: "Cloud account or region", header: "Box-like group with a bar", panel: "Grey panel, part of an app",
    frame: "What you deploy", exception: "Off the happy path", lane: "Horizontal: one party per lane",
    column: "Vertical: one stage per column", "card-group": "White cards on a tint",
  };
  return (
    <Sheet columns={4} intro="Container styles. A container groups things; its edge says what kind of group. Dashed edges are boundaries you cross, solid edges are things that own their children.">
      {CONTAINER_STYLES.map((variant) => <Swatch key={variant} name={`container/${variant}`} note={notes[variant]} height={176}>
        <ContainerNode variant={variant} title="Control plane" minWidth="150px"
          palette={{ ...DEFAULT_NODE_PALETTE, accent: R.header, border: R.border, tint: R.body }}
          {...(["boundary", "binding", "region"].includes(variant) ? { tag: "Private network" } : {})}>
          <div className={variant === "column" || variant === "card-group" ? "flex flex-col gap-1" : "flex gap-1"}>
            {["API", "Worker"].map(title => <BoxNode key={title} title={title} variant={variant === "card-group" ? "card" : "outlined"} compact shadow="shadow-none" />)}
          </div>
        </ContainerNode>
      </Swatch>)}
      <Swatch name="container/nested" note="Region › network › subnet" height={176}>
        <ContainerNode variant="region" tag="Region"><ContainerNode variant="boundary" tag="Network"><BoxNode title="Subnet" variant="outlined" compact /></ContainerNode></ContainerNode>
      </Swatch>
    </Sheet>
  );
}

export function ContainerColors() {
  return (
    <Sheet columns={4} intro="Container colour schemes. Containers reuse the box roles at lower intensity: a light tint or only a coloured edge, so the boxes inside stay readable.">
      {ROLE_KEYS.map((key) => {
        const role = ROLES[key];
        return (
          <Swatch key={key} name={`zone/${key}`}>
            <div className="flex gap-1.5">
              <div className="h-12 w-[62px] rounded-md border p-1" style={{ borderColor: role.border, backgroundColor: role.body }}><div className="text-[8.5px] font-semibold" style={{ color: role.header }}>tint</div></div>
              <div className="h-12 w-[62px] rounded-md border border-dashed p-1" style={{ borderColor: role.header }}><div className="text-[8.5px] font-semibold" style={{ color: role.header }}>edge</div></div>
            </div>
          </Swatch>
        );
      })}
    </Sheet>
  );
}

export function ContainerDensities() {
  const zone = { borderColor: R.border, backgroundColor: R.body };
  const members = <div className="space-y-0.5">{["Run API", "Scheduler", "Policy"].map((m) => <div key={m} className="flex items-center gap-1 text-[9px] text-slate-800"><span className="h-1 w-1 rounded-full" style={{ backgroundColor: R.header }} />{m}</div>)}</div>;
  return (
    <Sheet columns={5} intro="Container information density. A container needs a name once it is a boundary someone crosses; members and footers are only for containers that are the subject of the figure.">
      <Swatch name="container-density/unlabelled" height={104}><div className="h-16 w-[118px] rounded-md border" style={zone} /></Swatch>
      <Swatch name="container-density/tag" height={104}><div className="relative h-16 w-[118px] rounded-md border border-dashed" style={{ borderColor: R.header }}><span className="absolute -top-[7px] left-2 rounded-[2px] border bg-white px-1 font-mono text-[8px] leading-[12px]" style={{ borderColor: R.header, color: R.header }}>control plane</span></div></Swatch>
      <Swatch name="container-density/titled" height={104}><div className="h-16 w-[118px] rounded-md border p-1.5" style={zone}><Title color={R.header}>Control plane</Title><Detail>Decides and records</Detail></div></Swatch>
      <Swatch name="container-density/members" height={104}><div className="w-[118px] rounded-md border p-1.5" style={zone}><Title color={R.header}>Control plane</Title>{members}</div></Swatch>
      <Swatch name="container-density/footer" height={104}><div className="w-[118px] rounded-md border p-1.5" style={zone}><Title color={R.header}>Control plane</Title>{members}<div className="mt-1 border-t pt-0.5 text-[8px] text-slate-500" style={{ borderColor: R.border }}>3 replicas · 2 AZs</div></div></Swatch>
    </Sheet>
  );
}

function ActorIcon({ icon: Glyph, color, size = 22 }: { icon: Icon; color: string; size?: number }) {
  return <span style={{ color }}><Glyph className={size > 20 ? "h-6 w-6" : "h-4 w-4"} /></span>;
}

export function ActorStyles() {
  return (
    <Sheet columns={4} intro="Actor styles. Actors start or approve work; draw them differently from components so a reader can tell people and agents from systems at a glance.">
      <Swatch name="actor/figure" note="Icon above a label"><div className="flex flex-col items-center gap-0.5"><ActorIcon icon={UiUser} color={INK} /><Title>Engineer</Title></div></Swatch>
      <Swatch name="actor/avatar" note="Initials in a circle"><div className="flex items-center gap-1.5"><span className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: R.header }}>JD</span><Title>Engineer</Title></div></Swatch>
      <Swatch name="actor/stacked" note="An outside party"><div className="relative pb-1.5"><div className="absolute inset-x-1.5 bottom-0 top-1.5 rounded-md border border-slate-300 bg-white" /><div className="relative flex flex-col items-center rounded-md border border-slate-800 bg-white px-3 py-1.5"><ActorIcon icon={UiUser} color={INK} size={16} /><Title>Customer</Title></div></div></Swatch>
      <Swatch name="actor/pill" note="Inline, in a lane or list"><span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10.5px] font-semibold"><UiUser className="h-3.5 w-3.5" />Engineer</span></Swatch>
      <Swatch name="actor/cursor" note="Who did this step"><div className="relative rounded-md border border-slate-200 bg-white px-3 py-2"><Title>Edit and test</Title><span className="absolute -bottom-3 right-1 inline-flex items-center gap-0.5 rounded-full px-1.5 text-[8.5px] font-semibold text-white" style={{ backgroundColor: "#f25533" }}><UiCursorClick className="h-3 w-3" />Agent</span></div></Swatch>
      <Swatch name="actor/agent" note="An AI agent"><div className="flex flex-col items-center gap-0.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: R.body, color: R.header }}><UiRobotAi className="h-5 w-5" /></span><Title color={R.header}>Agent</Title></div></Swatch>
      <Swatch name="actor/group" note="A role, many people"><div className="flex flex-col items-center gap-0.5"><ActorIcon icon={UiUsersThree} color={INK} /><Title>Configurators</Title></div></Swatch>
      <Swatch name="actor/identity" note="A workload identity"><span className="inline-flex items-center gap-1 rounded border border-dashed border-slate-400 bg-white px-1.5 py-0.5 font-mono text-[9px] text-slate-700"><UiKey className="h-3 w-3" />sa/runner</span></Swatch>
    </Sheet>
  );
}

const ACTOR_ROLES: { name: string; icon: Icon; color: string; label: string; note: string }[] = [
  { name: "human", icon: UiUser, color: INK, label: "Engineer", note: "Starts work" },
  { name: "approver", icon: UiUserCheck, color: ROLES.existing.header, label: "Approver", note: "Decides, never executes" },
  { name: "agent", icon: UiRobotAi, color: R.header, label: "Agent", note: "Acts on someone's behalf" },
  { name: "service", icon: UiServerProcess, color: ROLES.external.header, label: "CI pipeline", note: "Automated caller" },
  { name: "external", icon: UiGlobe, color: ROLES.cloud.header, label: "Customer", note: "Outside the organisation" },
  { name: "untrusted", icon: UiUser, color: ROLES.security.header, label: "Visitor", note: "Unauthenticated" },
];

export function ActorColors() {
  return (
    <Sheet columns={6} intro="Actor colour schemes. Colour actors by their authority, not by team, so approval and automation stand out.">
      {ACTOR_ROLES.map(({ name, icon, color, label, note }) => (
        <Swatch key={name} name={`actor-role/${name}`} note={note}><div className="flex flex-col items-center gap-0.5"><ActorIcon icon={icon} color={color} /><Title color={color}>{label}</Title></div></Swatch>
      ))}
    </Sheet>
  );
}

export function ActorDensities() {
  return (
    <Sheet columns={5} intro="Actor information density. Add the role once there is more than one person, and the identity or permissions only in access and security figures.">
      <Swatch name="actor-density/icon" height={96}><ActorIcon icon={UiUser} color={INK} /></Swatch>
      <Swatch name="actor-density/name" height={96}><div className="flex flex-col items-center"><ActorIcon icon={UiUser} color={INK} /><Title>Engineer</Title></div></Swatch>
      <Swatch name="actor-density/role" height={96}><div className="flex flex-col items-center"><ActorIcon icon={UiUser} color={INK} /><Title>Engineer</Title><Detail>Platform team</Detail></div></Swatch>
      <Swatch name="actor-density/identity" height={96}><div className="flex flex-col items-center gap-0.5"><ActorIcon icon={UiUser} color={INK} /><Title>Engineer</Title><span className="inline-flex items-center gap-0.5 rounded border border-dashed border-slate-400 px-1 font-mono text-[8px] text-slate-600"><UiLockKey className="h-2.5 w-2.5" />Azure AD</span></div></Swatch>
      <Swatch name="actor-density/permissions" height={96}><div className="rounded-md border border-slate-200 bg-white px-2 py-1"><div className="flex items-center gap-1"><UiUser className="h-3.5 w-3.5" /><Title>Engineer</Title></div>{["read: UAT", "run: playbooks"].map((p) => <div key={p} className="flex items-center gap-1 font-mono text-[8px] text-slate-600"><UiShieldCheck className="h-2.5 w-2.5 text-emerald-600" />{p}</div>)}</div></Swatch>
    </Sheet>
  );
}

const NIGHT_CANVAS: React.CSSProperties = {
  backgroundColor: NIGHT.bg,
  backgroundImage: `linear-gradient(${NIGHT.grid} 1px, transparent 1px), linear-gradient(90deg, ${NIGHT.grid} 1px, transparent 1px)`,
  backgroundSize: "12px 12px",
};

function NightSwatch({ name, note, children, height = 92 }: { name: string; note: string; children: ReactNode; height?: number }) {
  const visible = useVocabularySample(name);
  if (!visible) return null;
  return (
    <div data-vocabulary-name={name} data-vocabulary-note={note} className="flex flex-col gap-1.5">
      <div className="flex items-center justify-center rounded-md px-3" style={{ ...NIGHT_CANVAS, height }}>{children}</div>
      <code className="text-[10px] font-semibold text-slate-800">{name}</code>
      <div className="text-[9.5px] leading-tight text-slate-500">{note}</div>
    </div>
  );
}

const NightMono = ({ children, color = NIGHT.muted }: { children: ReactNode; color?: string }) => <span className="font-mono text-[9px] uppercase tracking-[0.1em]" style={{ color }}>{children}</span>;

export function RailTypes() {
  return (
    <Sheet columns={4} intro="Numbered rail element types. The rail and its layered stack share one small kit on the night canvas: number the steps only when order matters, frame what runs where, and keep every scene to tiles, cards and chevrons.">
      <NightSwatch name="rail/step" note="Numbered marker on the gradient rail">
        <div className="relative flex h-16 items-center">
          <span className="absolute bottom-0 left-[14px] top-0 w-px" style={{ backgroundImage: `linear-gradient(${NIGHT.rail}, ${NIGHT.railEnd})` }} />
          <span className="relative flex h-[30px] w-[30px] items-center justify-center rounded-full border font-mono text-[12px] font-semibold" style={{ borderColor: NIGHT.rail, backgroundColor: NIGHT.bg, color: NIGHT.text }}>2</span>
          <div className="ml-2"><div className="text-[11px] font-semibold" style={{ color: NIGHT.text }}>Runs survive</div><div className="text-[9px]" style={{ color: NIGHT.muted }}>One sentence</div></div>
        </div>
      </NightSwatch>
      <NightSwatch name="rail/frame" note="Dashed environment or layer, mono label on the edge">
        <div className="w-full"><Frame label="Your app" color={NIGHT.green}><div className="h-5" /></Frame></div>
      </NightSwatch>
      <NightSwatch name="rail/band" note="Layered stack row: label, title, tiles">
        <div className="relative flex w-full items-center gap-2 rounded-md border border-dashed px-2 pb-1.5 pt-2.5" style={{ borderColor: NIGHT.purple }}>
          <span className="absolute -top-2 left-2 px-1 font-mono text-[8px] font-semibold uppercase tracking-[0.14em]" style={{ backgroundColor: NIGHT.bg, color: NIGHT.purple }}>Runtime</span>
          <span className="text-[9px] font-semibold" style={{ color: NIGHT.text }}>Survives</span>
          <span className="ml-auto flex gap-1">{[UiStack, UiServerProcess].map((G, i) => <span key={i} className="flex h-5 w-5 items-center justify-center" style={{ backgroundColor: NIGHT.purple, color: NIGHT.bg }}><G className="h-3 w-3" /></span>)}</span>
        </div>
      </NightSwatch>
      <NightSwatch name="rail/tile" note="Flat square, glyph in the canvas colour"><SquareTile icon={UiDatabase} color={NIGHT.orange} label="History" /></NightSwatch>
      <NightSwatch name="rail/tile-brand" note="Light tile so a brand mark keeps its colours"><SquareTile icon={Captain} color={NIGHT.text} label="Captain" /></NightSwatch>
      <NightSwatch name="rail/card" note="Code or list card on the dark edge">
        <div className="w-[110px] border px-2 py-1.5" style={{ borderColor: NIGHT.edge, backgroundColor: NIGHT.card }}><NightMono color={NIGHT.green}>Agent</NightMono><div className="font-mono text-[10px]" style={{ color: NIGHT.muted }}>plan()</div></div>
      </NightSwatch>
      <NightSwatch name="rail/chevrons" note="Flow between tiles, no arrows"><span className="flex items-center gap-2"><span className="h-6 w-6" style={{ backgroundColor: NIGHT.purple }} /><span className="font-mono text-[14px] font-bold tracking-[-0.15em]" style={{ color: NIGHT.purple }}>{">>"}</span><span className="h-6 w-6" style={{ backgroundColor: NIGHT.green }} /></span></NightSwatch>
      <NightSwatch name="rail/window" note="Window mock for the outcome">
        <div className="w-[96px] border" style={{ borderColor: NIGHT.edge, backgroundColor: NIGHT.card }}>
          <div className="flex gap-1 border-b px-1.5 py-1" style={{ borderColor: NIGHT.edge }}>{[0, 1, 2].map((d) => <span key={d} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: NIGHT.edge }} />)}</div>
          <div className="flex h-8 items-center justify-center"><span className="h-4 w-4 rounded-full" style={{ backgroundColor: NIGHT.green }} /></div>
        </div>
      </NightSwatch>
    </Sheet>
  );
}

const NIGHT_COLORS: { name: string; color: string; note: string; ring?: boolean }[] = [
  { name: "night/canvas", color: NIGHT.bg, note: "Background, with a 7% slate grid", ring: true },
  { name: "night/card", color: NIGHT.card, note: "Card and window fill", ring: true },
  { name: "night/edge", color: NIGHT.edge, note: "Card borders, separators, idle bars" },
  { name: "night/text", color: NIGHT.text, note: "Titles; brand tile fill" },
  { name: "night/muted", color: NIGHT.muted, note: "Body copy, tile labels, people" },
  { name: "night/rail", color: NIGHT.rail, note: "Rail start and step rings" },
  { name: "night/rail-end", color: NIGHT.railEnd, note: "Rail gradient end" },
  { name: "night/green", color: NIGHT.green, note: "Base layer, your environment, success" },
  { name: "night/purple", color: NIGHT.purple, note: "Shared engines, runtime, the platform" },
  { name: "night/orange", color: NIGHT.orange, note: "The domain on top, warnings" },
];

export function RailColors() {
  return (
    <Sheet columns={5} intro="Numbered rail colour theme. Ten tokens from NIGHT in layouts/temporal-styles.tsx. Give each frame or band one role colour and repeat it on its label and tiles; use at most three role colours (green, purple, orange) per figure, bottom layer green.">
      {NIGHT_COLORS.map(({ name, color, note, ring }) => (
        <NightSwatch key={name} name={name} note={note} height={64}>
          <span className="flex flex-col items-center gap-1">
            <span className="h-7 w-12 rounded-sm" style={{ backgroundColor: color, boxShadow: ring ? `inset 0 0 0 1px ${NIGHT.edge}` : undefined }} />
            <NightMono>{color}</NightMono>
          </span>
        </NightSwatch>
      ))}
      <NightSwatch name="night/rail-gradient" note="Rail line: rail to rail-end, top to bottom" height={64}>
        <span className="h-10 w-1 rounded-full" style={{ backgroundImage: `linear-gradient(${NIGHT.rail}, ${NIGHT.railEnd})` }} />
      </NightSwatch>
    </Sheet>
  );
}

const Dot = ({ n, color = R.header, filled = true }: { n?: number; color?: string; filled?: boolean }) => (
  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-bold" style={filled ? { backgroundColor: color, borderColor: color, color: "white" } : { backgroundColor: "white", borderColor: color, color }}>{n}</span>
);

function VerticalRail({ line, done = 0 }: { line: React.CSSProperties; done?: number }) {
  return (
    <div className="relative flex flex-col gap-2.5">
      <span className="absolute bottom-2 left-[9px] top-2 w-0.5" style={line} />
      {[1, 2, 3].map((n) => (
        <div key={n} className="relative flex items-center gap-1.5">
          <Dot n={n} filled={n <= done || done === 0} />
          <span className="text-[9.5px] font-semibold text-slate-800">{["Plan", "Edit", "Verify"][n - 1]}</span>
        </div>
      ))}
    </div>
  );
}

export function RailStyles() {
  const gradient = { backgroundImage: `linear-gradient(${R.header}, ${ROLES.store.header})` };
  return (
    <Sheet columns={4} intro="Rail styles: the spine that numbers an ordered sequence. Use a rail only when order matters; vertical rails pair each step with prose, horizontal rails fit a header or a slide strip.">
      <Swatch name="rail/vertical" note="Numbered steps down the left, prose beside" height={108}><VerticalRail line={{ backgroundColor: R.border }} /></Swatch>
      <Swatch name="rail/gradient" note="Night-theme rail; colour shifts with progress" height={108}><VerticalRail line={gradient} /></Swatch>
      <Swatch name="rail/progress" note="Done steps filled, the rest outlined" height={108}><VerticalRail line={{ backgroundImage: `linear-gradient(${R.header} 50%, ${ROLES.muted.border} 50%)` }} done={2} /></Swatch>
      <Swatch name="rail/dashed" note="Optional or asynchronous hand-offs" height={108}><VerticalRail line={{ backgroundImage: `repeating-linear-gradient(${R.border} 0 3px, transparent 3px 6px)` }} /></Swatch>
      <Swatch name="rail/horizontal" note="Stepper across the top of a figure">
        <div className="flex items-center gap-0.5">{[1, 2, 3].map((n) => <span key={n} className="flex items-center gap-0.5"><Dot n={n} /><span className="text-[8.5px] font-semibold text-slate-800">{["Plan", "Edit", "Verify"][n - 1]}</span>{n < 3 && <span className="h-0.5 w-2" style={{ backgroundColor: R.border }} />}</span>)}</div>
      </Swatch>
      <Swatch name="rail/chevron" note="Stages as arrowed segments">
        <div className="flex">{["Plan", "Edit", "Verify"].map((s, i) => <span key={s} className="py-1 pl-3 pr-2 text-[9px] font-semibold text-white" style={{ backgroundColor: i === 2 ? R.border : R.header, clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%, 6px 50%)" }}>{s}</span>)}</div>
      </Swatch>
      <Swatch name="rail/timeline" note="Dated ticks; when matters more than order">
        <div className="relative w-[150px] pt-3"><span className="absolute inset-x-0 top-[17px] h-px bg-slate-300" />{["Mon", "Wed", "Fri"].map((d, i) => <span key={d} className="absolute flex flex-col items-center" style={{ left: `${10 + i * 60}px`, top: 12 }}><span className="h-2.5 w-2.5 rounded-full border-2 bg-white" style={{ borderColor: R.header }} /><span className="mt-1 font-mono text-[8px] text-slate-500">{d}</span></span>)}<div className="h-8" /></div>
      </Swatch>
      <Swatch name="rail/lettered" note="Parallel paths: A, B, C instead of 1, 2, 3">
        <div className="flex gap-2">{["A", "B", "C"].map((l) => <span key={l} className="flex h-5 w-5 items-center justify-center rounded-[4px] border-2 bg-white text-[9px] font-bold" style={{ borderColor: ROLES.action.header, color: ROLES.action.header }}>{l}</span>)}</div>
      </Swatch>
    </Sheet>
  );
}

function Target({ children = "Create_Class" }: { children?: ReactNode }) {
  return <span className="rounded-md border bg-white px-2 py-1 font-mono text-[9.5px] font-semibold text-slate-800" style={{ borderColor: R.border }}>{children}</span>;
}

export function CalloutStyles() {
  const card = "rounded-md border bg-white px-1.5 py-1 text-[8.5px] leading-tight text-slate-700 shadow-sm";
  return (
    <Sheet columns={4} intro="Callout styles. Diagram callouts point at a part of the figure; step callouts annotate one step of a sequence. Number callouts that the caption or notes refer to, and keep one callout style per figure.">
      <Swatch name="callout/marker" note="Numbered dot; the note lives in the caption"><span className="relative"><Target /><span className="absolute -right-2 -top-2.5"><Marker n={1} /></span></span></Swatch>
      <Swatch name="callout/leader" note="Card joined by a leader line" height={96}>
        <div className="flex w-full items-center">
          <Target />
          <span className="relative h-px min-w-3 flex-1" style={{ backgroundColor: R.header }}><span className="absolute -left-0.5 -top-[2px] h-[5px] w-[5px] rounded-full" style={{ backgroundColor: R.header }} /></span>
          <span className={`${card} w-[64px] shrink-0`} style={{ borderColor: R.border }}>Too many arguments</span>
        </div>
      </Swatch>
      <Swatch name="callout/exploded" note="Detail pulled out beside the subject, elbow leader" height={96}>
        <div className="flex h-14 w-full items-stretch">
          <span className="self-end rounded-sm px-0.5 font-mono text-[8.5px] leading-[14px]" style={{ backgroundColor: "#fee2e2", boxShadow: "inset 0 -1px 0 #b91c1c" }}>EXEC …</span>
          <svg className="min-w-4 flex-1" viewBox="0 0 40 56" preserveAspectRatio="none" aria-hidden>
            <path d="M 0 49 H 20 V 15 H 40" fill="none" stroke="#b91c1c" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
          </svg>
          <span className={`${card} w-[74px] shrink-0 self-start`} style={{ borderColor: "#b91c1c" }}><b className="font-mono text-[#b91c1c]">Create_Class</b><br />Root cause</span>
        </div>
      </Swatch>
      <Swatch name="callout/edge-tag" note="Short tag sitting on the target's border"><span className="relative pt-1"><Target /><span className="absolute -top-1.5 left-2 rounded-[2px] border bg-white px-1 font-mono text-[7.5px]" style={{ borderColor: ROLES.security.header, color: ROLES.security.header }}>failed</span></span></Swatch>
      <Swatch name="callout/bubble" note="Speech bubble for a person or agent's comment" height={96}>
        <div className="flex flex-col items-start gap-1"><span className="relative rounded-lg border bg-white px-2 py-1 text-[8.5px] text-slate-700" style={{ borderColor: R.border }}>Fix the argument list<span className="absolute -bottom-[5px] left-3 h-2 w-2 rotate-45 border-b border-r bg-white" style={{ borderColor: R.border }} /></span><Target /></div>
      </Swatch>
      <Swatch name="step-callout/badge" note="Step number on the box itself"><span className="relative"><Target>Verify</Target><span className="absolute -left-2 -top-2"><Dot n={3} /></span></span></Swatch>
      <Swatch name="step-callout/banner" note="Step label bar above the scene">
        <div className="w-[120px] overflow-hidden rounded-md border" style={{ borderColor: R.border }}><div className="flex items-center gap-1 px-1.5 py-0.5 text-[8.5px] font-bold text-white" style={{ backgroundColor: R.header }}><span className="font-mono">02</span>Edit and test</div><div className="h-6 bg-white" /></div>
      </Swatch>
      <Swatch name="step-callout/note" note="Numbered note under the figure, tied by its marker">
        <div className="flex w-[150px] items-start gap-1 text-[8.5px] leading-tight text-slate-700"><Marker n={2} /><span>ExecCreateClass_SP issues the call; fix its argument list.</span></div>
      </Swatch>
    </Sheet>
  );
}

const Marker = ({ n }: { n: number }) => <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold text-white" style={{ backgroundColor: INK }}>{n}</span>;

