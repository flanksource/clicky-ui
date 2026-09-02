/**
 * The printable report — what you would hand an assessor on paper.
 *
 * On screen it renders inside an A4-width frame so the preview is honest about
 * where the page edge falls; `PRINT_CSS` then makes ⌘P produce the same thing by
 * hiding the playground chrome and letting the report fill the sheet. The two are
 * the same component, so the preview cannot drift from what actually prints.
 *
 * Colour is kept rather than converted to greyscale: the whole vocabulary encodes
 * state as hue, and a greyscale print would collapse "observed off" and "never
 * assessed" into the same grey — the one distinction this page exists to hold
 * apart. `print-color-adjust: exact` is what stops the browser helpfully dropping
 * the backgrounds.
 */

import { OBSERVED_AT, type SupplyChainPosture } from "./fixture";
import { Legend } from "./legend";
import { PostureRows } from "./designs";

/**
 * A4 landscape at 96dpi (297mm), the sheet `@page` below asks for.
 *
 * Landscape is not a preference: the six columns need about 830px, and A4 portrait
 * leaves 703px once margins are taken. The preview frame is the *sheet*, and the
 * padding stands in for the 12mm print margin, so what fits here fits on paper —
 * a preview narrower than the real page would quietly hide the last two columns.
 */
export const PAGE_WIDTH = "1122px";

export const PRINT_ID = "supply-chain-print-report";

/**
 * Everything outside the report is hidden rather than removed, so React keeps
 * owning the DOM it rendered. `visibility` collapses the chrome without the
 * reflow that `display: none` on a flex shell would cause.
 */
export const PRINT_CSS = `
@media print {
  @page { size: A4 landscape; margin: 12mm; }
  body * { visibility: hidden; }
  #${PRINT_ID}, #${PRINT_ID} * { visibility: visible; }

  /* The shell scrolls in a positioned, fixed-height container. Absolute
     positioning resolves against the nearest positioned ancestor, so without this
     the report starts wherever that container happens to sit — which printed as a
     quarter-page of white space above the title. Every ancestor is forced back to
     static, visible and auto-height so the report anchors to the sheet itself. */
  body:has(#${PRINT_ID}) *:has(#${PRINT_ID}) {
    position: static !important;
    overflow: visible !important;
    height: auto !important;
    max-height: none !important;
  }
  #${PRINT_ID} {
    position: absolute;
    left: 0;
    top: 0;
    /* Beats the inline width the on-screen preview sets: on paper the sheet
       decides the width, not a pixel value picked for the preview frame. */
    width: 100% !important;
    padding: 0;
    border: 0;
    box-shadow: none;
  }
  /* The screen frame keeps a min-width so columns never crush; on paper the sheet
     is the constraint and the table must compress into it rather than clip. */
  #${PRINT_ID} table { min-width: 0 !important; }

  /* State is encoded as hue; dropping backgrounds would erase the distinction
     between a control observed off and one nobody assessed. */
  #${PRINT_ID} * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
  #${PRINT_ID} [data-print-hint] { display: none; }
  #${PRINT_ID} tr { break-inside: avoid; }
  #${PRINT_ID} thead { display: table-header-group; }
}
`;

export function PrintReport({
  postures,
  scopeLabel,
}: {
  postures: SupplyChainPosture[];
  scopeLabel: string;
}) {
  return (
    <div
      className="mx-auto border border-border bg-white p-8 text-black shadow-lg [[data-theme=dark]_&]:bg-white [[data-theme=dark]_&]:text-black"
      id={PRINT_ID}
      style={{ width: PAGE_WIDTH, maxWidth: "100%" }}
    >
      <header className="mb-4 border-b-2 border-black/80 pb-3">
        <p className="m-0 text-[10px] font-semibold tracking-[0.12em] uppercase opacity-70">
          Flanksource · SDLC control applicability register
        </p>
        <h1 className="mt-1 mb-0 text-xl font-bold tracking-tight">Supply chain posture</h1>
        <p className="mt-1.5 mb-0 text-[11px] opacity-70">
          {postures.length} {postures.length === 1 ? "repository" : "repositories"} · {scopeLabel} ·
          register observed {OBSERVED_AT}
        </p>
      </header>

      {/* The legend leads the report: on paper there is no tooltip to fall back on. */}
      <div className="mb-4">
        <Legend compact />
      </div>

      <PostureRows postures={postures} />

      <footer className="mt-4 border-t border-black/30 pt-2 text-[10px] opacity-70">
        Confidential. A control with no record has not been assessed — it has not been found
        compliant. Source of truth is the register, not this snapshot.
      </footer>
    </div>
  );
}
