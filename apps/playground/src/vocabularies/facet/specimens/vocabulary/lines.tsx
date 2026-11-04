import { useId, type ReactNode } from "react";
import { UiProhibit } from "@flanksource/clicky-ui/icons";
import { Sheet, Swatch } from "./common";
import { ROLES } from "./roles";
const R = ROLES.new;

const LINE_W = 140;

function LineSample({ d = `M 8 20 L ${LINE_W - 10} 20`, color = R.header, dash, width = 1.6, start, end = "arrow", label, chip = "plain", height = 40 }: {
  d?: string; color?: string; dash?: string | undefined; width?: number; start?: "arrow" | "dot"; end?: "arrow" | "open" | "dot" | "diamond" | "none"; label?: ReactNode; chip?: "plain" | "pill" | "pill-filled" | "box" | "box-filled" | "alert" | "step" | "verb"; height?: number;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9-]/g, "");
  const heads = {
    arrow: <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />,
    open: <path d="M 1 1 L 9 5 L 1 9" fill="none" stroke={color} strokeWidth={1.6} />,
    dot: <circle cx={5} cy={5} r={3.5} fill={color} />,
    diamond: <path d="M 0 5 L 5 1 L 10 5 L 5 9 z" fill="white" stroke={color} strokeWidth={1.2} />,
  };
  const marker = (kind: keyof typeof heads, suffix: string) => (
    <marker id={`${uid}${suffix}`} viewBox="0 0 10 10" refX={kind === "dot" ? 5 : 9} refY={5} markerWidth={7} markerHeight={7} orient="auto-start-reverse">{heads[kind]}</marker>
  );
  const chipClass = { plain: "bg-slate-50 px-0.5", pill: "rounded-full border bg-white px-1.5", "pill-filled": "rounded-full border px-1.5 font-semibold", box: "rounded-[2px] border bg-white px-1", "box-filled": "rounded-[2px] border px-1 font-semibold", alert: "inline-flex items-center gap-1 rounded border border-red-300 bg-red-100 px-1.5 py-0.5 font-semibold text-red-700", step: "", verb: "bg-slate-50 px-0.5 font-mono uppercase tracking-[0.1em] text-[7.5px]" }[chip];
  const chipStyle = chip === "alert" ? undefined : chip.endsWith("-filled") ? { color: "white", backgroundColor: color, borderColor: color } : { color, borderColor: color };
  return (
    <div className="relative" style={{ width: LINE_W, height }}>
      <svg width={LINE_W} height={height} aria-hidden="true">
        <defs>{end !== "none" && marker(end, "e")}{start && marker(start, "s")}</defs>
        <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" markerEnd={end !== "none" ? `url(#${uid}e)` : undefined} markerStart={start ? `url(#${uid}s)` : undefined} />
      </svg>
      {label && (
        <span className={`absolute left-1/2 top-[20px] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[8.5px] leading-[13px] ${chipClass}`} style={chipStyle}>
          {label}
        </span>
      )}
    </div>
  );
}

const Step = ({ n, children }: { n: number; children: ReactNode }) => (
  <span className="inline-flex items-center gap-1 rounded bg-white px-1 font-semibold text-slate-700"><span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] text-white" style={{ backgroundColor: R.header }}>{n}</span>{children}</span>
);

export function LineStyles() {
  return (
    <Sheet columns={4} intro="Line styles. The stroke says how the connection behaves; the head says direction. Route straight when aligned, orthogonal in dense layouts, and curve only to avoid an obstacle.">
      <Swatch name="line/solid" note="Synchronous call or data"><LineSample /></Swatch>
      <Swatch name="line/dashed" note="Async, optional or revoke"><LineSample dash="6 4" /></Swatch>
      <Swatch name="line/dotted" note="Batch or derived"><LineSample dash="1.5 3.5" width={2} /></Swatch>
      <Swatch name="line/thick" note="The primary path"><LineSample width={3} /></Swatch>
      <Swatch name="line/both" note="Request and response pair"><LineSample start="arrow" /></Swatch>
      <Swatch name="line/plain" note="Association, no direction"><LineSample end="none" /></Swatch>
      <Swatch name="line/orthogonal" note="Right angles, dense layouts" height={56}><LineSample d="M 8 10 L 70 10 L 70 46 L 130 46" height={56} /></Swatch>
      <Swatch name="line/curved" note="Detours around an obstacle" height={56}><LineSample d="M 8 46 C 50 46, 80 10, 130 10" height={56} /></Swatch>
      <Swatch name="line/bus" note="Many sources combed into one" height={56}><LineSample d="M 8 8 L 50 8 M 8 28 L 50 28 M 8 48 L 50 48 M 50 8 L 50 48 M 50 28 L 130 28" height={56} /></Swatch>
      <Swatch name="head/open" note="Lighter arrowhead"><LineSample end="open" /></Swatch>
      <Swatch name="head/dot" note="Attachment or subscription"><LineSample end="dot" /></Swatch>
      <Swatch name="head/diamond" note="Ownership or composition"><LineSample end="diamond" /></Swatch>
    </Sheet>
  );
}

const LINE_ROLES: { name: string; color: string; dash?: string; note: string }[] = [
  { name: "data", color: "#059669", note: "Primary data path" },
  { name: "control", color: R.header, note: "Commands and API calls" },
  { name: "policy", color: "#e11d48", dash: "6 4", note: "Sensitive, identity, secrets" },
  { name: "async", color: "#7c3aed", dash: "1.5 3.5", note: "Queues and batch" },
  { name: "context", color: "#94a3b8", note: "Background, out of focus" },
  { name: "error", color: "#dc2626", note: "Failure or exception path" },
];

export function LineColors() {
  return (
    <Sheet columns={3} intro="Line colour schemes and label styles. Colour a line by what flows on it, and keep one label style per diagram.">
      {LINE_ROLES.map(({ name, color, dash, note }) => <Swatch key={name} name={`flow/${name}`} note={note} height={56}><LineSample color={color} dash={dash} label={name} /></Swatch>)}
      <Swatch name="label/plain" note="Text on the line" height={56}><LineSample label="tool calls" /></Swatch>
      <Swatch name="label/pill" note="Rounded, for busy canvases" height={56}><LineSample label="plan" chip="pill" /></Swatch>
      <Swatch name="label/pill-filled" note="Solid pill, for the label that must stand out" height={56}><LineSample label="plan" chip="pill-filled" /></Swatch>
      <Swatch name="label/box" note="Boxed, for boundary crossings" height={56}><LineSample label="mTLS" chip="box" /></Swatch>
      <Swatch name="label/box-filled" note="Solid box, for an emphasized boundary crossing" height={56}><LineSample label="mTLS" chip="box-filled" /></Swatch>
      <Swatch name="label/alert" note="Warning chip with icon, for a denied or forbidden path" height={56}><LineSample color="#dc2626" dash="6 4" label={<><UiProhibit className="h-3 w-3" />No Direct Access</>} chip="alert" /></Swatch>
      <Swatch name="label/step" note="Numbered sequence" height={56}><LineSample label={<Step n={2}>Grant</Step>} chip="step" /></Swatch>
      <Swatch name="label/verb" note="Uppercase verb" height={56}><LineSample label="invokes" chip="verb" /></Swatch>
    </Sheet>
  );
}

export function LineDensities() {
  return (
    <Sheet columns={3} intro="Line information density. Label a line only when the endpoints do not already say what flows; add a protocol only where it is the point.">
      <Swatch name="line-density/bare" note="Endpoints say it all" height={56}><LineSample /></Swatch>
      <Swatch name="line-density/verb" note="What happens" height={56}><LineSample label="dispatches" /></Swatch>
      <Swatch name="line-density/protocol" note="Verb plus transport" height={56}><LineSample label="dispatches · gRPC" /></Swatch>
      <Swatch name="line-density/step" note="Order matters" height={56}><LineSample label={<Step n={3}>dispatches</Step>} chip="step" /></Swatch>
      <Swatch name="line-density/condition" note="Only sometimes" height={56}><LineSample label="when approved" dash="6 4" /></Swatch>
      <Swatch name="line-density/payload" note="What travels, for data flows" height={56}><div className="flex flex-col items-center"><LineSample label="run event" height={30} /><span className="font-mono text-[8px] text-slate-500">{"{ id, cost, status }"}</span></div></Swatch>
    </Sheet>
  );
}

