import { SegmentedControl, cn } from "@flanksource/clicky-ui";
import { useState } from "react";

import {
  ComplianceVariant,
  IamAnalysisVariant,
  VulnerabilityVariant,
} from "../flanksource/recon/_finding-detail-primary-variants";
import {
  DetectionVariant,
  IncidentVariant,
} from "../flanksource/recon/_finding-detail-response-variants";
import { RECON_SCOPE } from "../_reconctl/recon-scope";
import { VariantFrame } from "../_shared/variant-frame";

export const meta = {
  title: "Finding detail — OCSF",
  description:
    "OCSF 1.9 finding-class variants using Clicky UI badges and tags",
  group: "Recon",
  navOrder: 4,
};

const VARIANTS = [
  { id: "compliance", label: "Compliance" },
  { id: "vulnerability", label: "Vulnerability" },
  { id: "iam", label: "IAM analysis" },
  { id: "incident", label: "Incident" },
  { id: "detection", label: "Detection" },
] as const;

type Variant = (typeof VARIANTS)[number]["id"];

const WIDTHS = [
  { id: "wide", label: "1440", px: 1440 },
  { id: "medium", label: "960", px: 960 },
  { id: "panel", label: "720", px: 720 },
] as const;

type WidthId = (typeof WIDTHS)[number]["id"];

export default function FindingDetailOcsfPage() {
  const [variant, setVariant] = useState<Variant>("compliance");
  const [widthId, setWidthId] = useState<WidthId>("wide");
  const width = WIDTHS.find((entry) => entry.id === widthId)?.px;

  return (
    <main className={cn(RECON_SCOPE, "space-y-density-6")}>
      <header className="max-w-4xl space-y-density-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Recon · OCSF 1.9
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          OCSF finding class variants
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Each treatment leads with the decision or action its finding class
          demands, then preserves the shared Finding Information object as
          evidence. Clicky UI badges carry compact state while interactive tags
          keep OCSF labels, evidence, ATT&amp;CK mappings, resources, and
          identity scope scannable.
        </p>
      </header>

      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border bg-background/95 py-2 backdrop-blur">
        <SegmentedControl<Variant>
          aria-label="OCSF finding class"
          onChange={setVariant}
          options={VARIANTS.map(({ id, label }) => ({ id, label }))}
          size="sm"
          value={variant}
          wrap
        />
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Frame
          <SegmentedControl<WidthId>
            aria-label="Frame width"
            onChange={setWidthId}
            options={WIDTHS.map(({ id, label }) => ({ id, label }))}
            size="sm"
            value={widthId}
          />
        </label>
      </div>

      {variant === "compliance" && (
        <VariantFrame
          selected
          showHeight={false}
          title="Compliance Finding"
          verdict="Required compliance result, recommended resources, and contextual evidence and remediation are modeled from the OCSF 1.9 class."
          width={width}
        >
          <ComplianceVariant />
        </VariantFrame>
      )}
      {variant === "vulnerability" && (
        <VariantFrame
          showHeight={false}
          title="Vulnerability Finding"
          verdict="The required vulnerabilities array becomes the visual anchor, with exploitability metrics and the affected resource beside the fix."
          width={width}
        >
          <VulnerabilityVariant />
        </VariantFrame>
      )}
      {variant === "iam" && (
        <VariantFrame
          showHeight={false}
          title="IAM Analysis Finding"
          verdict="Identity activity metrics and permission-analysis results lead, satisfying the class constraint with an identity-centric access review."
          width={width}
        >
          <IamAnalysisVariant />
        </VariantFrame>
      )}
      {variant === "incident" && (
        <VariantFrame
          showHeight={false}
          title="Incident Finding"
          verdict="The required finding_info_list is presented as a correlated case with ownership, priority, impact, breach state, and ATT&CK context."
          width={width}
        >
          <IncidentVariant />
        </VariantFrame>
      )}
      {variant === "detection" && (
        <VariantFrame
          showHeight={false}
          title="Detection Finding"
          verdict="Alert, confidence, impact, and risk metrics frame an evidence-first sequence, with resources and ATT&CK mappings kept scannable as tags."
          width={width}
        >
          <DetectionVariant />
        </VariantFrame>
      )}
    </main>
  );
}
