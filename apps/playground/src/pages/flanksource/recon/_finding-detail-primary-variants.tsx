import { Badge, Panel } from "@flanksource/clicky-ui";

import {
  COMPLIANCE,
  IAM_ANALYSIS,
  SOURCE_URL,
  VULNERABILITY,
} from "./_finding-detail-fixture";
import {
  ExternalReference,
  FactList,
  FindingInformation,
  FindingSurface,
  MetricStrip,
  RemediationPanel,
  ResourceCard,
  RiskCallout,
  SectionCard,
  TagGroup,
} from "./_finding-detail-parts";
import { OCSF_VISUALS } from "./_finding-detail-visuals";

export function ComplianceVariant() {
  return (
    <div data-testid="finding-variant-compliance">
      <FindingSurface
        classInfo={COMPLIANCE.class}
        findingInfo={COMPLIANCE.info}
        visual={OCSF_VISUALS.compliance}
        sourceUrl={SOURCE_URL}
      >
        <div className="space-y-density-4 p-density-4">
          <div className="grid gap-density-3 @min-[52rem]:grid-cols-[20rem_minmax(0,1fr)]">
            <ResourceCard {...COMPLIANCE.resource} />
            <ComplianceResult />
          </div>
          <RiskCallout risk={COMPLIANCE.impact} />
          <RemediationPanel
            guidance={COMPLIANCE.remediation}
            snippets={COMPLIANCE.remediationSnippets}
          />
          <div className="grid gap-density-4 @min-[58rem]:grid-cols-[20rem_minmax(0,1fr)]">
            <Panel padded title="Evidence">
              <TagGroup compact label="evidences" tags={COMPLIANCE.evidence} />
            </Panel>
            <ComplianceFrameworks />
          </div>
          <FindingInformation
            classInfo={COMPLIANCE.class}
            findingInfo={COMPLIANCE.info}
          />
          <ExternalReference
            href={COMPLIANCE.reference}
            label="Open check guidance"
          />
        </div>
      </FindingSurface>
    </div>
  );
}

function ComplianceResult() {
  return (
    <SectionCard
      badge="Required primary"
      visual={OCSF_VISUALS.compliance}
      title="Compliance"
    >
      <MetricStrip
        metrics={[
          { label: "Verdict", value: COMPLIANCE.verdict, status: "error" },
          {
            label: "Severity",
            value: COMPLIANCE.class.severity,
            status: "warning",
          },
        ]}
      />
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        {COMPLIANCE.detail}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        {COMPLIANCE.impact}
      </p>
    </SectionCard>
  );
}

function ComplianceFrameworks() {
  return (
    <SectionCard
      badge="Required primary"
      visual={OCSF_VISUALS.compliance}
      title="Mapped controls"
    >
      <div className="grid gap-2 @min-[44rem]:grid-cols-2">
        {COMPLIANCE.frameworks.map((group) => (
          <div
            className="rounded-md border border-border bg-muted/30 p-density-3"
            key={group.framework}
          >
            <Badge
              clickToCopy={false}
              label="Framework"
              size="xs"
              value={group.framework}
              variant="label"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {group.requirements.map((requirement) => (
                <Badge
                  clickToCopy={false}
                  key={requirement}
                  size="xxs"
                  variant="outlined"
                >
                  {requirement}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export function VulnerabilityVariant() {
  return (
    <div data-testid="finding-variant-vulnerability">
      <FindingSurface
        classInfo={VULNERABILITY.class}
        findingInfo={VULNERABILITY.info}
        visual={OCSF_VISUALS.vulnerability}
      >
        <div className="space-y-density-4 p-density-4">
          <div className="grid gap-density-4 @min-[58rem]:grid-cols-[minmax(0,1fr)_20rem]">
            <VulnerabilityRecord />
            <ResourceCard {...VULNERABILITY.resource} />
          </div>
          <RiskCallout risk={VULNERABILITY.risk} />
          <RemediationPanel
            guidance={VULNERABILITY.remediation}
            snippets={VULNERABILITY.remediationSnippets}
          />
          <FindingInformation
            classInfo={VULNERABILITY.class}
            findingInfo={VULNERABILITY.info}
          />
        </div>
      </FindingSurface>
    </div>
  );
}

function VulnerabilityRecord() {
  const vulnerability = VULNERABILITY.vulnerability;
  return (
    <SectionCard
      badge="Required primary"
      title="Vulnerabilities"
      visual={OCSF_VISUALS.vulnerability}
    >
      <MetricStrip
        metrics={[
          { label: "CVE", value: vulnerability.uid, status: "error" },
          { label: "CVSS", value: vulnerability.cvss, status: "error" },
          { label: "EPSS", value: vulnerability.epss, status: "warning" },
          { label: "Exploit", value: vulnerability.exploit, status: "warning" },
          {
            label: "Fixed in",
            value: vulnerability.fixedVersion,
            status: "success",
          },
        ]}
      />
      <div className="mt-4 rounded-md border border-border bg-muted/30 p-density-3">
        <FactList
          facts={[
            { label: "Weakness", value: vulnerability.cwe, mono: true },
            { label: "Package", value: vulnerability.package, mono: true },
            {
              label: "Fixed in",
              value: vulnerability.fixedVersion,
              mono: true,
            },
          ]}
        />
      </div>
    </SectionCard>
  );
}

export function IamAnalysisVariant() {
  return (
    <div data-testid="finding-variant-iam">
      <FindingSurface
        classInfo={IAM_ANALYSIS.class}
        findingInfo={IAM_ANALYSIS.info}
        visual={OCSF_VISUALS.iamAnalysis}
      >
        <div className="space-y-density-4 p-density-4">
          <IamIdentitySummary />
          <RiskCallout risk={IAM_ANALYSIS.risk} />
          <div className="grid gap-density-3 @min-[52rem]:grid-cols-[minmax(0,1fr)_20rem]">
            <SectionCard
              badge="Recommended primary"
              visual={OCSF_VISUALS.permissionAnalysis}
              title="Permission analysis results"
            >
              <TagGroup
                label="Unused access"
                tags={IAM_ANALYSIS.permissionResults}
              />
            </SectionCard>
            <SectionCard
              badge="Recommended primary"
              visual={OCSF_VISUALS.iamAnalysis}
              title="Scope"
            >
              <TagGroup
                compact
                label="Applications"
                tags={IAM_ANALYSIS.applications}
              />
              <div className="mt-3">
                <TagGroup
                  compact
                  label="Resources"
                  tags={IAM_ANALYSIS.resources}
                />
              </div>
            </SectionCard>
          </div>
          <RemediationPanel guidance={IAM_ANALYSIS.remediation} />
          <FindingInformation
            classInfo={IAM_ANALYSIS.class}
            findingInfo={IAM_ANALYSIS.info}
          />
        </div>
      </FindingSurface>
    </div>
  );
}

function IamIdentitySummary() {
  return (
    <SectionCard
      badge="Identity-centric"
      visual={OCSF_VISUALS.iamAnalysis}
      title="User and identity activity metrics"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge
          clickToCopy={false}
          label="User"
          maxWidth={34}
          size="sm"
          truncate="auto"
          value={IAM_ANALYSIS.user}
          variant="label"
        />
        <MetricStrip
          metrics={[
            { label: "Granted", value: IAM_ANALYSIS.metrics.granted },
            {
              label: "Used",
              value: IAM_ANALYSIS.metrics.used,
              status: "warning",
            },
            {
              label: "Last used",
              value: IAM_ANALYSIS.metrics.lastUsed,
              status: "warning",
            },
          ]}
        />
      </div>
    </SectionCard>
  );
}
