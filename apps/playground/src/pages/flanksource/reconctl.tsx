import { Callout } from "@flanksource/clicky-ui";

import { designSystemPage } from "../../design-system/catalog";
import { DesignSystemPage, SpecimenSection, type SectionLink } from "../../design-system/DesignSystemPage";
import { CHOSEN, palette } from "../_reconctl/palettes";
import {
  EngineGrid,
  EntityGrid,
  PaletteBand,
  ProviderRow,
  ToneLegend,
  VocabularyTable,
} from "../_reconctl/sections";
import { VOCABULARIES } from "../_reconctl/vocabulary";

import "../_reconctl/palettes.css";

export const meta = designSystemPage("flanksource/reconctl");

// This page publishes the reconctl layer rather than restating it: every hue,
// glyph and term below is read from the modules the product pages draw from, so
// a change there shows up here instead of drifting. The palette specimens are
// scoped subtrees — `[data-theme] > .rc-violet-grid` — so both themes can be
// shown at once regardless of the shell's own theme.

const SECTIONS: SectionLink[] = [
  { id: "palette", label: "Palette" },
  { id: "tones", label: "Tones" },
  { id: "findings", label: "Findings & scans" },
  { id: "targets", label: "Targets & hosts" },
  { id: "resources", label: "Resources & engines" },
  { id: "entities", label: "Entities" },
];

const WINNER = palette(CHOSEN);

const FINDINGS_IDS = ["severity", "phase"];
const TARGET_IDS = ["kind", "class", "credential", "probe", "tls"];
const RESOURCE_IDS = ["resource-kind", "resource-state"];

function vocabulariesFor(ids: readonly string[]) {
  return ids.map((id) => {
    const found = VOCABULARIES.find((vocabulary) => vocabulary.id === id);
    if (!found) throw new Error(`reconctl: unknown vocabulary "${id}"`);
    return found;
  });
}

export default function ReconctlSystem() {
  return (
    <DesignSystemPage
      description={meta.description}
      eyebrow="Product system"
      icon={meta.icon}
      sections={SECTIONS}
      title={meta.title}
    >
      <Callout title="Emerald means observed, never inferred" variant="important">
        recon&rsquo;s Prowler integration drops <code>PASS</code> records before they are written, so an
        account with no findings and an account that was never scanned are the same absence. Only three
        values on this page are emerald — a completed scan, a resource seen in the latest run, and a host
        that answered — and each is something recon watched happen. Everything unobserved is a dashed
        outline, so it reads as a missing answer rather than a good one.
      </Callout>

      <SpecimenSection
        description={`${WINNER.character}. ${WINNER.rationale}`}
        id="palette"
        title="Palette — violet grid"
      >
        <div className="grid gap-density-3 2xl:grid-cols-2">
          <div data-theme="dark">
            <div className={`${WINNER.className} rounded-xl`}>
              <PaletteBand theme="dark" />
            </div>
          </div>
          <div data-theme="light">
            <div className={`${WINNER.className} rounded-xl`}>
              <PaletteBand theme="light" />
            </div>
          </div>
        </div>
        <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
          <strong className="text-foreground">The split is the point.</strong> Violet carries structural
          identity — which entity, which engine, which kind — and cyan is spent on nothing but interaction.
          On a dense triage screen that turns &ldquo;is this a control?&rdquo; into a colour question rather
          than a shape question. The cost is that violet is also GCP&rsquo;s provider hue, so the chrome tint
          and a GCP resource row share a family; provider marks are real logos partly for that reason.
        </p>
        <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
          Cyan was available because it is the one hue recon had not already spent: severity owns red,
          orange, amber and sky, and provider identity owns indigo, sky, violet and teal. The four
          runners-up are kept on the palette picker so the choice stays checkable.
        </p>
      </SpecimenSection>

      <SpecimenSection
        description="Severity is not redefined here — _recon/severity.ts owns that ramp and this page imports it. These four are what reconctl adds on top, for the axes severity cannot express."
        id="tones"
        title="Tones"
      >
        <ToneLegend />
        <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
          <code>unknown</code> and <code>absent</code> are deliberately different. Unknown is filled grey:
          there is a value and recon could not classify it. Absent is a dashed outline: there is no value at
          all. Collapsing the two hides parse failures behind &ldquo;nothing here&rdquo;.
        </p>
      </SpecimenSection>

      <SpecimenSection
        description="What a finding is worth, and what a run is doing. The two axes an operator reads first."
        id="findings"
        title="Findings & scans"
      >
        <div className="space-y-density-4">
          {vocabulariesFor(FINDINGS_IDS).map((vocabulary) => (
            <VocabularyTable key={vocabulary.id} vocabulary={vocabulary} />
          ))}
        </div>
      </SpecimenSection>

      <SpecimenSection
        description="What recon is pointed at, and whether it could reach it. Class is the axis with a trap in it."
        id="targets"
        title="Targets & hosts"
      >
        <div className="space-y-density-4">
          {vocabulariesFor(TARGET_IDS).map((vocabulary) => (
            <VocabularyTable key={vocabulary.id} vocabulary={vocabulary} />
          ))}
        </div>
      </SpecimenSection>

      <SpecimenSection
        description="What a scan found and what found it. Resource kind is identity rather than state, so none of it takes a severity colour."
        id="resources"
        title="Resources & engines"
      >
        <div className="space-y-density-4">
          {vocabulariesFor(RESOURCE_IDS).map((vocabulary) => (
            <VocabularyTable key={vocabulary.id} vocabulary={vocabulary} />
          ))}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Providers</h3>
            <ProviderRow />
            <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
              Product logos from <code>@flanksource/icons/mi</code>, not glyphs — a mixed-provider inventory
              is scannable without reading a word only when the AWS row carries the AWS mark. The hues sit at
              the cool end on purpose, so &ldquo;this row is AWS&rdquo; can never read as &ldquo;this row is
              high severity&rdquo;.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Engines</h3>
            <EngineGrid />
          </div>
        </div>
      </SpecimenSection>

      <SpecimenSection
        description="The eleven entities recon registers. Each one is simultaneously a CLI noun, a REST resource and a nav destination, so one mark has to serve all three."
        id="entities"
        title="Entities"
      >
        <EntityGrid />
        <p className="max-w-3xl text-xs leading-5 text-muted-foreground">
          Every entity takes the chrome hue, because an entity is identity and never a state. A target is not
          more or less severe than a scan — only its class and its findings are. Reserving colour for state is
          what keeps a severity chip legible on a row that already carries an entity mark.
        </p>
      </SpecimenSection>
    </DesignSystemPage>
  );
}
