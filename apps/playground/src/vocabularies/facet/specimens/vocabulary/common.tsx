import { useContext, type ReactNode } from "react";
import { SampleContext, useVocabularySample } from "./sample-context";

export function Swatch({ name, note, children, height = 92 }: { name: string; note?: string; children: ReactNode; height?: number }) {
  if (!useVocabularySample(name)) return null;
  return (
    <div data-vocabulary-name={name} data-vocabulary-note={note} className="flex flex-col gap-1.5">
      <div className="flex items-center justify-center rounded-md border border-slate-100 bg-slate-50/60 px-2" style={{ height }}>{children}</div>
      <code className="text-[10px] font-semibold text-slate-800">{name}</code>
      {note && <div className="text-[9.5px] leading-tight text-slate-500">{note}</div>}
    </div>
  );
}

export function Sheet({ columns, children, intro, aside }: { columns: number; children: ReactNode; intro: string; aside?: ReactNode }) {
  if (useContext(SampleContext)) return <>{children}</>;
  return (
    <div className="w-[724px] space-y-3">
      <div className="flex items-start gap-4">
        <p className="flex-1 text-[11.5px] leading-snug text-slate-600">{intro}</p>
        {aside}
      </div>
      <div className="grid gap-x-3 gap-y-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>{children}</div>
    </div>
  );
}
