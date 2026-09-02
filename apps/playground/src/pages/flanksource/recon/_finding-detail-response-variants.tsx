import { Badge } from "@flanksource/clicky-ui";
import { UiClock } from "@flanksource/clicky-ui/icons";

import { DETECTION, INCIDENT } from "./_finding-detail-fixture";
import {
  FactList,
  FindingInformation,
  FindingSurface,
  MetricStrip,
  RemediationPanel,
  RiskCallout,
  SectionCard,
  TagGroup,
} from "./_finding-detail-parts";
import { OCSF_VISUALS } from "./_finding-detail-visuals";

export function IncidentVariant() {
  return (
    <div data-testid="finding-variant-incident">
      <FindingSurface
        classInfo={INCIDENT.class}
        findingInfo={INCIDENT.info}
        visual={OCSF_VISUALS.incident}
      >
        <div className="space-y-density-4 p-density-4">
          <IncidentMetrics />
          <RiskCallout risk={INCIDENT.risk} />
          <div className="grid gap-density-4 @min-[56rem]:grid-cols-[minmax(0,1fr)_20rem]">
            <RelatedFindings />
            <IncidentResponse />
          </div>
          <TagGroup label="ATT&CK" tags={INCIDENT.attacks} />
          <RemediationPanel
            guidance={INCIDENT.remediation}
            title="Response plan"
          />
          <FindingInformation
            classInfo={INCIDENT.class}
            findingInfo={INCIDENT.info}
          />
        </div>
      </FindingSurface>
    </div>
  );
}

function IncidentMetrics() {
  return (
    <MetricStrip
      metrics={[
        { label: "Priority", value: INCIDENT.priority, status: "error" },
        { label: "Impact", value: INCIDENT.impact, status: "error" },
        {
          label: "Impact score",
          value: INCIDENT.impactScore,
          status: "warning",
        },
        {
          label: "Suspected breach",
          value: INCIDENT.suspectedBreach,
          status: "error",
        },
      ]}
    />
  );
}

function RelatedFindings() {
  return (
    <SectionCard
      badge="Required primary · finding_info_list"
      visual={OCSF_VISUALS.correlatedFinding}
      title="Correlated findings"
    >
      <div className="space-y-2">
        {INCIDENT.findings.map((finding, index) => (
          <div
            className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-muted/30 p-density-3"
            key={finding.title}
          >
            <Badge
              clickToCopy={false}
              count={index + 1}
              size="xs"
              variant="outlined"
            />
            <Badge
              clickToCopy={false}
              label="Class"
              size="xs"
              value={finding.className}
              variant="label"
            />
            <p className="min-w-48 flex-1 text-sm font-medium text-foreground">
              {finding.title}
            </p>
            <Badge
              clickToCopy={false}
              size="xs"
              status={finding.status === "Resolved" ? "success" : "warning"}
              variant="status"
            >
              {finding.status}
            </Badge>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function IncidentResponse() {
  return (
    <SectionCard
      badge="Required assignee"
      visual={OCSF_VISUALS.responseOwner}
      title="Response ownership"
    >
      <FactList
        facts={[
          { label: "Assignee", value: INCIDENT.assignee },
          { label: "Group", value: INCIDENT.group },
          { label: "Ticket", value: INCIDENT.ticket, mono: true },
          { label: "Status", value: INCIDENT.class.status },
        ]}
      />
    </SectionCard>
  );
}

export function DetectionVariant() {
  return (
    <div data-testid="finding-variant-detection">
      <FindingSurface
        classInfo={DETECTION.class}
        findingInfo={DETECTION.info}
        visual={OCSF_VISUALS.detection}
      >
        <div className="space-y-density-4 p-density-4">
          <DetectionMetrics />
          <RiskCallout risk={DETECTION.risk} />
          <div className="grid gap-density-4 @min-[56rem]:grid-cols-[minmax(0,1fr)_20rem]">
            <DetectionEvidence />
            <SectionCard
              badge="Recommended primary"
              visual={OCSF_VISUALS.cloudResource}
              title="Resources"
            >
              <TagGroup
                compact
                label="Observed entities"
                tags={DETECTION.resources}
              />
              <div className="mt-4">
                <TagGroup compact label="ATT&CK" tags={DETECTION.attacks} />
              </div>
            </SectionCard>
          </div>
          <RemediationPanel
            guidance={DETECTION.remediation}
            title="Containment and validation"
          />
          <FindingInformation
            classInfo={DETECTION.class}
            findingInfo={DETECTION.info}
          />
        </div>
      </FindingSurface>
    </div>
  );
}

function DetectionMetrics() {
  return (
    <MetricStrip
      metrics={[
        { label: "Alert", value: DETECTION.isAlert, status: "error" },
        {
          label: "Confidence",
          value: DETECTION.confidenceScore,
          status: "success",
        },
        { label: "Impact", value: DETECTION.impact, status: "warning" },
        { label: "Risk score", value: DETECTION.riskScore, status: "warning" },
      ]}
    />
  );
}

function DetectionEvidence() {
  return (
    <SectionCard
      badge="Recommended primary"
      visual={OCSF_VISUALS.detection}
      title="Evidence sequence"
    >
      <div className="space-y-2">
        {DETECTION.evidences.map((evidence) => (
          <div
            className="grid gap-2 rounded-md border border-border bg-muted/30 p-density-3 @min-[38rem]:grid-cols-[6rem_minmax(0,1fr)_5rem]"
            key={evidence.label}
          >
            <Badge clickToCopy={false} size="xs" variant="label">
              {evidence.label}
            </Badge>
            <p className="break-all font-mono text-xs text-foreground">
              {evidence.value}
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <UiClock aria-hidden className="size-3.5" />
              {evidence.time}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
