import type { ReactNode } from "react";

import { BOX_STYLES, BoxNode, ContainerNode, DiagramStyleProvider, PLACEMENT_SHAPES, useDiagramStyle } from "@flanksource/facet";

import { UiServerProcess } from "@flanksource/clicky-ui/icons";

import { LAYOUT_CATALOG } from "../layouts/catalog";

import { LINKS, ORDERS, OTHER_STACKS, PLACEMENTS, SCHEMES, SLOTS, THEMES, type LayoutTaxonomy, type Placement, type Scheme, type Theme } from "../layouts/taxonomy";

import { NIGHT } from "../layouts/temporal-styles";

import { WIRE } from "../layouts/tailscale-styles";

import { KINDS, STROKES } from "../layouts/archify-styles";

import { THEME_STYLES } from "../layouts/themes";

import { useVocabularySample } from "./sample-context";
import { Sheet, Swatch } from "./common";

import { ROLES } from "./roles";
const { new: BLUE, existing: GREEN, store: VIOLET, action: ORANGE, muted: GREY, security: ROSE } = ROLES;

const W = 120;

const H = 64;

type Role = (typeof ROLES)[keyof typeof ROLES];

const Box = ({ x, y, w, h, role = BLUE, dashed, fill, r = 2 }: { x: number; y: number; w: number; h: number; role?: Role | undefined; dashed?: boolean; fill?: string | undefined; r?: number }) => (
  <rect x={x} y={y} width={w} height={h} rx={r} fill={fill ?? role.body} stroke={role.border} strokeWidth={1} strokeDasharray={dashed ? "3 2" : undefined} />
);

const Line = ({ d, color = GREY.header, dash }: { d: string; color?: string; dash?: string }) => (
  <path d={d} fill="none" stroke={color} strokeWidth={1} strokeDasharray={dash} />
);

const Svg = ({ children }: { children: ReactNode }) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">{children}</svg>
);

const SKETCHES: Record<Placement, ReactNode> = {
  bands: <Svg>{[BLUE, VIOLET, GREEN, GREY].map((role, i) => <Box key={i} x={4} y={4 + i * 15} w={112} h={11} role={role} />)}</Svg>,
  "framed-tiers": (
    <Svg>
      {[30, 52, 74].map((x) => <Box key={x} x={x} y={2} w={18} h={7} role={GREY} />)}
      <Box x={24} y={14} w={72} h={44} role={GREY} fill="#ffffff" />
      {[0, 1, 2].map((i) => <Box key={i} x={28} y={20 + i * 12} w={64} h={9} role={BLUE} fill={i === 0 ? BLUE.border : BLUE.body} />)}
      {[0, 1, 2].map((i) => <Box key={`l${i}`} x={4} y={20 + i * 12} w={14} h={9} role={GREY} />)}
      {[0, 1, 2].map((i) => <Box key={`r${i}`} x={102} y={20 + i * 12} w={14} h={9} role={GREY} />)}
    </Svg>
  ),
  matrix: (
    <Svg>
      {[0, 1, 2, 3].map((row) => (
        <g key={row}>
          <Box x={4} y={4 + row * 14} w={16} h={11} role={GREEN} />
          {[0, 1, 2].map((col) => <Box key={col} x={24 + col * 24} y={4 + row * 14} w={21} h={11} role={ORANGE} />)}
        </g>
      ))}
      <Box x={98} y={4} w={18} h={53} role={ROSE} />
    </Svg>
  ),
  subgrid: (
    <Svg>
      {[0, 1, 2].map((col) => <Box key={col} x={4 + col * 38} y={4} w={34} h={16} role={col === 1 ? VIOLET : BLUE} />)}
      <Box x={4} y={26} w={110} h={10} role={GREY} dashed />
      {[0, 1, 2].map((col) => <Line key={col} d={`M ${21 + col * 38} 20 V 26 M ${21 + col * 38} 36 V 44`} />)}
      <Box x={4} y={44} w={110} h={14} role={GREEN} />
    </Svg>
  ),
  iso: (
    <Svg>
      {[0, 1, 2].map((i) => {
        const y = 40 - i * 13;
        return <path key={i} d={`M 60 ${y - 10} L 96 ${y} L 60 ${y + 10} L 24 ${y} Z`} fill={i === 1 ? GREEN.body : "#f8fafc"} stroke={i === 1 ? GREEN.header : "#1f2937"} strokeWidth={1} />;
      })}
      <Line d="M 96 27 H 112" dash="1.5 2" />
    </Svg>
  ),
  radial: (
    <Svg>
      {[52, 38, 22].map((r, i) => <path key={r} d={`M ${60 - r} 60 A ${r} ${r} 0 0 1 ${60 + r} 60 Z`} fill={[GREY.body, ORANGE.body, ORANGE.header][i]} stroke={ORANGE.border} strokeWidth={1} />)}
      {[-50, 0, 50].map((deg) => <Line key={deg} d={`M 60 60 L ${60 + 52 * Math.sin((deg * Math.PI) / 180)} ${60 - 52 * Math.cos((deg * Math.PI) / 180)}`} color={ORANGE.border} />)}
    </Svg>
  ),
  planes: <Svg>{[VIOLET, BLUE, GREEN].map((role, i) => <Box key={i} x={4 + i * 39} y={4} w={34} h={56} role={role} />)}<Line d="M 38 32 H 43 M 77 32 H 82" /></Svg>,
  nested: <Svg><Box x={4} y={4} w={112} h={56} role={GREY} dashed /><Box x={16} y={14} w={74} h={40} role={GREEN} /><Box x={28} y={24} w={40} h={20} role={BLUE} fill="#ffffff" /><Box x={98} y={26} w={14} h={12} role={GREY} /></Svg>,
  hub: (
    <Svg>
      <Line d="M 22 32 H 48 M 72 32 H 98 M 60 12 V 24 M 60 40 V 50" />
      <Box x={48} y={24} w={24} h={16} role={GREY} fill="#1f1f1f" />
      <Box x={4} y={25} w={18} h={14} />
      <Box x={98} y={25} w={18} h={14} />
      <Box x={51} y={2} w={18} h={10} role={GREY} />
      <Box x={4} y={50} w={112} h={10} role={GREEN} />
    </Svg>
  ),
  grid: <Svg>{[0, 1, 2].flatMap((c) => [0, 1].map((r) => <Box key={`${c}${r}`} x={6 + c * 40} y={8 + r * 30} w={28} h={18} role={c === 1 && r === 0 ? BLUE : GREY} fill={c === 1 && r === 0 ? BLUE.border : undefined} />))}<Line d="M 34 17 H 46 M 74 17 H 86 M 60 26 V 38 M 34 47 H 46" /></Svg>,
  graph: (
    <Svg>
      <Line d="M 18 32 C 34 32 34 14 48 14 M 18 32 C 34 32 34 50 48 50 M 64 14 C 80 14 80 32 96 32 M 64 50 C 80 50 80 32 96 32" />
      {[[10, 32, VIOLET], [56, 14, BLUE], [56, 50, BLUE], [104, 32, GREEN]].map(([x, y, role], i) => <Box key={i} x={(x as number) - 8} y={(y as number) - 6} w={16} h={12} role={role as Role} r={6} />)}
    </Svg>
  ),
  columns: (
    <Svg>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <Box x={4 + i * 29} y={4} w={25} h={56} role={GREY} dashed fill="#ffffff" />
          <text x={8 + i * 29} y={12} fontSize={6} fill={GREY.header} fontFamily="monospace">0{i + 1}</text>
          <Box x={8 + i * 29} y={22 + (i % 2) * 12} w={17} h={10} role={[BLUE, ORANGE, VIOLET, GREEN][i]} />
        </g>
      ))}
    </Svg>
  ),
  lanes: (
    <Svg>
      {[BLUE, GREEN, VIOLET].map((role, i) => (
        <g key={i}>
          <Box x={4} y={4 + i * 19} w={112} h={16} role={role} />
          <Box x={6 + 26 + i * 26} y={8 + i * 19} w={18} h={8} role={role} fill="#ffffff" r={4} />
        </g>
      ))}
      <Line d="M 50 12 V 31 M 76 31 V 50" />
    </Svg>
  ),
  snake: <Svg><Line d="M 22 14 H 98 V 50 H 22" />{[[4, 8], [51, 8], [98, 8], [98, 44], [51, 44], [4, 44]].map(([x, y], i) => <Box key={i} x={x!} y={y!} w={18} h={12} role={i === 4 ? ROSE : BLUE} dashed={i === 4} />)}</Svg>,
  "fan-out": <Svg><Box x={46} y={2} w={28} h={10} role={ORANGE} r={5} /><Line d="M 60 12 V 22 M 17 22 H 103 M 17 22 V 34 M 46 22 V 34 M 74 22 V 34 M 103 22 V 34" />{[4, 33, 61, 90].map((x) => <Box key={x} x={x} y={34} w={26} h={24} role={GREY} fill="#ffffff" />)}</Svg>,
  ring: <Svg><circle cx={60} cy={32} r={24} fill="none" stroke={BLUE.header} strokeWidth={1} /><Box x={50} y={26} w={20} h={12} role={GREY} />{[0, 90, 180, 270].map((deg) => <circle key={deg} cx={60 + 24 * Math.sin((deg * Math.PI) / 180)} cy={32 - 24 * Math.cos((deg * Math.PI) / 180)} r={5} fill={BLUE.header} />)}</Svg>,
  rail: <Svg><Line d="M 10 6 V 58" color={NIGHT.rail} />{[0, 1, 2].map((i) => <g key={i}><circle cx={10} cy={12 + i * 20} r={5} fill="#ffffff" stroke={NIGHT.rail} /><Box x={22} y={8 + i * 20} w={26} h={8} role={GREY} /><Box x={58} y={5 + i * 20} w={56} h={14} role={[GREEN, VIOLET, ORANGE][i]} dashed /></g>)}</Svg>,
  gantt: (
    <Svg>
      {[0, 1, 2].map((i) => <Box key={`s${i}`} x={30 + i * 30} y={2} w={15} h={60} role={GREY} fill="#f8fafc" r={0} />)}
      {[0, 1, 2, 3].map((i) => <g key={i}><Box x={4} y={6 + i * 14} w={20} h={8} role={GREY} /><Box x={30 + i * 14} y={6 + i * 14} w={36} h={8} role={i === 3 ? VIOLET : BLUE} dashed={i === 3} /></g>)}
      <Line d="M 78 2 V 62" color={BLUE.header} dash="2 2" />
    </Svg>
  ),
};

const CLASSIFIED: (LayoutTaxonomy & { label: string })[] = [
  ...LAYOUT_CATALOG.map((entry) => ({ ...entry, label: entry.key })),
  ...OTHER_STACKS.map((stack) => ({ ...stack, label: stack.source })),
];

const usedBy = (match: (entry: LayoutTaxonomy) => boolean) =>
  CLASSIFIED.filter(match).map((entry) => entry.label).join(", ");

const list = (prefix: string, names: Record<string, string>) =>
  Object.entries(names).map(([name, note]) => `${prefix}/${name} (${note.toLowerCase()})`).join("; ");

export function LayoutPlacements() {
  return (
    <Sheet columns={4} intro={`Layout placement: the primary topology of a whole figure, one per diagram. Qualify it with slots for secondary elements — ${list("slot", SLOTS)}. Add a reading order — ${list("order", ORDERS)} — and say how connectors are made — ${list("link", LINKS)}.`}>
      {(Object.keys(PLACEMENTS) as Placement[]).map((key) => (
        <Swatch key={key} name={`layout/${key}`} note={`${PLACEMENTS[key]}. ${usedBy((entry) => entry.layout === key)}`} height={84}>
          {SKETCHES[key]}
        </Swatch>
      ))}
    </Sheet>
  );
}

const Dot = ({ color }: { color: string }) => <circle r={3} fill={color} />;

const SCHEME_SKETCHES: Record<Scheme, ReactNode> = {
  "per-layer": <Svg>{[BLUE, VIOLET, GREEN].map((role, i) => <g key={i}><Box x={4} y={4 + i * 20} w={112} h={16} role={role} />{[0, 1, 2].map((t) => <Box key={t} x={60 + t * 18} y={8 + i * 20} w={12} h={8} role={role} fill={role.header} />)}</g>)}</Svg>,
  "per-tier": <Svg>{[BLUE.header, BLUE.border, BLUE.body].map((fill, i) => <Box key={i} x={4} y={4 + i * 20} w={112} h={16} fill={fill} />)}</Svg>,
  "per-zone": <Svg><Box x={4} y={4} w={52} h={56} role={VIOLET} /><Box x={64} y={4} w={52} h={56} role={GREEN} />{[12, 64].flatMap((x) => [14, 34].map((y) => <Box key={`${x}${y}`} x={x + 4} y={y} w={36} h={12} role={GREY} fill="#ffffff" />))}</Svg>,
  "per-kind": <Svg>{[BLUE, ORANGE, VIOLET, GREEN].map((role, i) => <Box key={i} x={4 + i * 29} y={10} w={24} h={22} role={role} />)}{[BLUE, ORANGE, VIOLET, GREEN].map((role, i) => <g key={`l${i}`} transform={`translate(${10 + i * 29} 50)`}><Dot color={role.header} /></g>)}</Svg>,
  "per-lane": <Svg>{[BLUE, GREEN, ORANGE].map((role, i) => <Box key={i} x={4} y={4 + i * 20} w={112} h={16} role={role} />)}</Svg>,
  "per-flow": <Svg>{[[4, 6], [84, 6], [4, 42], [84, 42]].map(([x, y], i) => <Box key={i} x={x!} y={y!} w={32} h={16} role={GREY} fill="#ffffff" />)}<Line d="M 36 14 H 84" color={STROKES.primary.color} /><Line d="M 36 50 H 84" color={STROKES.policy.color} dash={STROKES.policy.dash} /><Line d="M 20 22 V 42" color={STROKES.async.color} dash={STROKES.async.dash} /></Svg>,
  focal: <Svg>{[4, 44, 84].map((x) => <Box key={x} x={x} y={24} w={32} h={16} role={GREY} fill={x === 44 ? WIRE.hub : "#f4f4f3"} />)}<Line d="M 36 32 H 44 M 76 32 H 84" color={WIRE.line} /></Svg>,
  brand: <Svg>{[NIGHT.green, KINDS.surface.border, NIGHT.orange, NIGHT.rail].map((color, i) => <g key={i}><Box x={4 + i * 29} y={14} w={24} h={36} role={GREY} fill="#ffffff" /><rect x={10 + i * 29} y={20} width={12} height={12} rx={2} fill={color} /></g>)}</Svg>,
};

export function LayoutSchemes() {
  return (
    <Sheet columns={4} intro="Layout colour schemes: the rule for assigning colour across a whole figure, independent of the palette (theme/…). Pick one per diagram; a legend is required for per-kind and per-flow, and focal allows exactly one emphasised node.">
      {(Object.keys(SCHEMES) as Scheme[]).map((key) => (
        <Swatch key={key} name={`scheme/${key}`} note={`${SCHEMES[key]}. ${usedBy((entry) => entry.scheme === key)}`} height={84}>
          {SCHEME_SKETCHES[key]}
        </Swatch>
      ))}
    </Sheet>
  );
}

function ThemedSwatch({ name, note, children }: { name: string; note?: string; children: ReactNode }) {
  const visible = useVocabularySample(name);
  const { palette } = useDiagramStyle();
  if (!visible) return null;
  return (
    <div data-vocabulary-name={name} data-vocabulary-note={note} className="flex min-w-0 flex-col gap-1.5">
      <div className="flex min-h-[120px] items-center justify-center overflow-x-auto rounded-md border border-slate-200 p-3" style={{ backgroundColor: palette?.containerTint ?? "#f8fafc" }}>{children}</div>
      <code className="text-[10px] font-semibold text-slate-800">{name}</code>
      {note && <div className="text-[9.5px] leading-tight text-slate-500">{note}</div>}
    </div>
  );
}

export function NodeShowcase() {
  return (
    <div className="space-y-6">
      <Sheet columns={4} intro="Box styles with no palette or density of their own: switch theme/… and density in the toolbar and every box follows. A palette, density or compact prop on a node still wins.">
        {BOX_STYLES.map((variant) => (
          <ThemedSwatch key={variant} name={`box/${variant}`}>
            <BoxNode variant={variant} title="Run API" description="Validates requests" shadow="shadow-none" {...(variant === "tile" || variant === "pill" ? { icon: <UiServerProcess className="h-4 w-4" /> } : {})} />
          </ThemedSwatch>
        ))}
      </Sheet>
      <Sheet columns={2} intro="Placement-aware nodes. Each swatch wraps the same group and three members in a DiagramStyleProvider with one layout/… placement; with no variant set, the container picks its style and direction and the members their box style from facet's PLACEMENT_SHAPES.">
        {(Object.keys(PLACEMENTS) as Placement[]).map((placement) => {
          const shape = PLACEMENT_SHAPES[placement];
          return (
            <ThemedSwatch key={placement} name={`layout/${placement}`} note={`container/${shape.container} · box/${shape.box} · ${shape.orientation}`}>
              <DiagramStyleProvider placement={placement}>
                <ContainerNode title="Control plane">
                  {["API", "Worker", "Store"].map((title) => <BoxNode key={title} title={title} shadow="shadow-none" />)}
                </ContainerNode>
              </DiagramStyleProvider>
            </ThemedSwatch>
          );
        })}
      </Sheet>
    </div>
  );
}

export function LayoutThemes() {
  return (
    <Sheet columns={4} intro="Layout themes: the palette family and canvas a figure is drawn in. Each is an existing constant in layouts/, so name the theme instead of copying its hexes. Choose once per document.">
      {(Object.keys(THEMES) as Theme[]).map((key) => {
        const { canvas, swatches } = THEME_STYLES[key];
        return (
          <Swatch key={key} name={`theme/${key}`} note={`${THEMES[key].source} · ${THEMES[key].canvas}. ${usedBy((entry) => entry.theme === key)}`} height={84}>
            <div className="flex h-[60px] w-full flex-wrap content-center items-center justify-center gap-1 rounded border border-slate-200 px-2" style={canvas}>
              {swatches.map((color, i) => <span key={`${color}${i}`} className="h-4 w-4 rounded-sm border border-black/10" style={{ backgroundColor: color }} />)}
            </div>
          </Swatch>
        );
      })}
    </Sheet>
  );
}
