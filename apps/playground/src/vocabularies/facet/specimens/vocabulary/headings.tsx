import type { ReactNode } from "react";
import { Sheet, Swatch } from "./common";
import { ROLES } from "./roles";

// Grouping a layout with only titles and rules: no container edges, no tints. The title
// names the group and the underline marks its extent; members sit below it unboxed or as plain boxes.

const INK = "#0f172a";
const MUTED = "#64748b";
const RULE = "#cbd5e1";
const ACCENT = ROLES.new.header;

const Member = ({ children }: { children: ReactNode }) => (
  <div className="rounded border bg-white px-1.5 py-0.5 text-center text-[9px] font-semibold" style={{ borderColor: RULE, color: INK }}>{children}</div>
);

const Head = ({ children, align = "center" }: { children: ReactNode; align?: "left" | "center" }) => (
  <div className={`border-b pb-0.5 text-[8.5px] font-semibold uppercase tracking-[0.12em] ${align === "center" ? "text-center" : ""}`} style={{ borderColor: RULE, color: "#334155" }}>{children}</div>
);

export function HeadingStyles() {
  return (
    <Sheet columns={4} intro="Layouts with just titles and underlines. When the grouping is obvious from position, name each group with a title and an underline instead of drawing a container. The underline spans what the title covers; reserve container edges for boundaries someone crosses.">
      <Swatch name="heading/underline" note="Title over a full-width rule: the default column or section head" height={104}>
        <div className="w-[130px] space-y-1.5"><Head>Build time</Head><div className="flex flex-col gap-1"><Member>Config</Member><Member>Routes</Member></div></div>
      </Swatch>
      <Swatch name="heading/column-heads" note="One underlined title per column, aligned on one baseline" height={104}>
        <div className="grid w-[150px] grid-cols-3 gap-x-2 gap-y-1.5">
          {["Source", "Build", "Runtime"].map((title) => <Head key={title}>{title}</Head>)}
          <Member>MDX</Member><Member>Bundler</Member><Member>Browser</Member>
        </div>
      </Swatch>
      <Swatch name="heading/spanning" note="A spanning title over sub-heads: the rule covers every column it names" height={104}>
        <div className="grid w-[150px] grid-cols-2 gap-x-2 gap-y-1">
          <div className="col-span-2"><Head>Node.js</Head></div>
          <div className="text-center text-[8px] font-semibold" style={{ color: MUTED }}>build</div>
          <div className="text-center text-[8px] font-semibold" style={{ color: MUTED }}>serve</div>
          <Member>Plugins</Member><Member>SSR</Member>
        </div>
      </Swatch>
      <Swatch name="heading/accent" note="Short accent bar under the title: one emphasised group" height={104}>
        <div className="w-[130px] space-y-1.5">
          <div><div className="text-[11px] font-bold" style={{ color: INK }}>Control plane</div><div className="mt-0.5 h-[2px] w-6 rounded-full" style={{ backgroundColor: ACCENT }} /></div>
          <div className="flex gap-1"><Member>API</Member><Member>Scheduler</Member></div>
        </div>
      </Swatch>
      <Swatch name="heading/numbered" note="Numbered title and rule: groups read in order" height={104}>
        <div className="w-[130px] space-y-1.5">
          <div className="flex items-baseline gap-1.5 border-b pb-0.5" style={{ borderColor: RULE }}><span className="font-mono text-[9px] font-bold" style={{ color: ACCENT }}>01</span><span className="text-[10.5px] font-semibold" style={{ color: INK }}>Author</span></div>
          <div className="flex gap-1"><Member>Scenario</Member><Member>Steps</Member></div>
        </div>
      </Swatch>
      <Swatch name="heading/eyebrow" note="Small mono label above a hairline: secondary groups" height={104}>
        <div className="w-[130px] space-y-1.5">
          <div className="border-b pb-0.5 font-mono text-[8px] uppercase tracking-[0.1em]" style={{ borderColor: RULE, color: MUTED }}>stores</div>
          <div className="flex gap-1"><Member>Postgres</Member><Member>S3</Member></div>
        </div>
      </Swatch>
      <Swatch name="heading/divider" note="Title set into the rule: separates stacked bands" height={104}>
        <div className="w-[140px] space-y-1.5">
          <div className="flex gap-1"><Member>Web</Member><Member>CLI</Member></div>
          <div className="flex items-center gap-1.5"><span className="h-px flex-1" style={{ backgroundColor: RULE }} /><span className="text-[8.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: "#334155" }}>runtime</span><span className="h-px flex-1" style={{ backgroundColor: RULE }} /></div>
          <div className="flex gap-1"><Member>API</Member><Member>Workers</Member></div>
        </div>
      </Swatch>
      <Swatch name="heading/row-heads" note="Titles in a left gutter, a rule between rows: lanes without lane fills" height={104}>
        <div className="w-[150px]">
          {[{ title: "People", members: ["Engineer", "Approver"] }, { title: "Systems", members: ["API", "Runner"] }].map(({ title, members }, index) => (
            <div key={title} className={`grid grid-cols-[44px_1fr] items-center gap-1.5 py-1 ${index > 0 ? "border-t" : ""}`} style={{ borderColor: RULE }}>
              <span className="text-[8.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: "#334155" }}>{title}</span>
              <div className="flex gap-1">{members.map((member) => <Member key={member}>{member}</Member>)}</div>
            </div>
          ))}
        </div>
      </Swatch>
    </Sheet>
  );
}
