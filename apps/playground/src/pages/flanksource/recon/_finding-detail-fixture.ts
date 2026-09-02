export type FindingInfo = {
  uid: string;
  title: string;
  analytic: string;
  description: string;
  firstSeen: string;
  lastSeen: string;
  types: string[];
  tags: string[];
  dataSources: string[];
};

export const FINDING_SEVERITIES = [
  "Critical",
  "High",
  "Medium",
  "Low",
  "Informational",
  "Unknown",
] as const;

export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

export type FindingClass = {
  name: string;
  classUid: string;
  typeUid: string;
  activity: string;
  status: string;
  severity: FindingSeverity;
  confidence: string;
};

export type FindingFact = {
  label: string;
  value: string;
  mono?: boolean;
};

export type ComplianceGroup = {
  framework: string;
  requirements: string[];
};

export type RemediationSnippet = {
  id: string;
  label: string;
  language: string;
  source: string;
};

export const COMPLIANCE = {
  class: {
    name: "Compliance Finding",
    classUid: "2003",
    typeUid: "200301",
    activity: "Create",
    status: "New",
    severity: "Medium",
    confidence: "High",
  } satisfies FindingClass,
  info: {
    uid: "01a05c27-6428-5425-d3a5-0d0bf876b5c5",
    title: "Cloud DNS managed zone has DNSSEC enabled",
    analytic: "gcp/dns_dnssec_disabled",
    description:
      "Cloud DNS managed zones are assessed for DNSSEC status. Zones without it remain unsigned and unauthenticated.",
    firstSeen: "2026-09-01T08:44:29.107Z",
    lastSeen: "2026-09-01T08:44:29.107Z",
    types: ["Misconfiguration", "Cloud Security Posture"],
    tags: [
      "category=encryption",
      "provider=gcp",
      "service=dns",
      "resource_type=dns.googleapis.com/ManagedZone",
    ],
    dataSources: ["Cloud configuration", "Managed zone inventory"],
  } satisfies FindingInfo,
  verdict: "Fail",
  detail:
    "Cloud DNS cloud-sql-psa-dns-1070031607832 doesn't have DNSSEC enabled.",
  impact:
    "Unsigned DNS responses can be forged or poisoned, redirecting traffic and exposing credentials or data.",
  remediation:
    "Enable DNSSEC on public zones and complete the chain of trust by publishing a DS record at the registrar.",
  remediationSnippets: [
    {
      id: "cli",
      label: "CLI",
      language: "bash",
      source: "gcloud dns managed-zones update <zone-name> --dnssec-state=on",
    },
    {
      id: "terraform",
      label: "Terraform",
      language: "hcl",
      source: `resource "google_dns_managed_zone" "example" {
  name     = "<zone-name>"
  dns_name = "example.com."

  dnssec_config {
    state = "on"
  }
}`,
    },
    {
      id: "console",
      label: "Console",
      language: "markdown",
      source:
        "Open Cloud DNS, select the public zone, choose DNSSEC, then enable it. Publish the generated DS record at the domain registrar to complete the chain of trust.",
    },
  ] satisfies RemediationSnippet[],
  reference: "https://hub.prowler.com/check/dns_dnssec_disabled",
  resource: {
    name: "cloud-sql-psa-dns-1070031607832",
    type: "dns.googleapis.com/ManagedZone",
    uid: "464475500848182954",
    account: "flanksource-prod",
    region: "global",
  },
  evidence: ["dnssec.state=off", "visibility=public", "scan_line=11"],
  scan: "01a05c24-1ef4-4e6b-46cf-66b9e5f0cdde",
  frameworks: [
    { framework: "CIS 5.0", requirements: ["3.3"] },
    { framework: "NIS2", requirements: ["6.7.2.i", "9.2.a"] },
    { framework: "PCI 4.0", requirements: ["5.3.4.31"] },
    { framework: "SOC2", requirements: ["cc_6_7"] },
  ] satisfies ComplianceGroup[],
} as const;

export const VULNERABILITY = {
  class: {
    name: "Vulnerability Finding",
    classUid: "2002",
    typeUid: "200202",
    activity: "Update",
    status: "In Progress",
    severity: "Critical",
    confidence: "High",
  } satisfies FindingClass,
  info: {
    uid: "vuln-demo-001",
    title: "OpenSSL package contains a critical vulnerability",
    analytic: "container-image-vulnerability-scan",
    description:
      "A vulnerable OpenSSL package was found in the production checkout API container image.",
    firstSeen: "2026-08-29T06:12:10Z",
    lastSeen: "2026-09-01T09:18:42Z",
    types: ["Software Vulnerability", "Container Image"],
    tags: ["environment=production", "service=checkout-api", "package=openssl"],
    dataSources: ["Package inventory", "Container image manifest"],
  } satisfies FindingInfo,
  vulnerability: {
    uid: "CVE-2025-0282",
    cvss: "9.1",
    epss: "92%",
    cwe: "CWE-787",
    exploit: "Public exploit",
    package: "openssl 3.0.15-r2",
    fixedVersion: "3.0.16-r0",
  },
  risk: "A public exploit and a **92% EPSS probability** make this an active compromise path, not a version-hygiene issue. The vulnerable package is present in a production image.",
  remediation:
    "Rebuild the image from the patched OpenSSL package, redeploy the workload, and confirm the old digest is no longer running.",
  remediationSnippets: [
    {
      id: "dockerfile",
      label: "Dockerfile",
      language: "dockerfile",
      source: `RUN apk upgrade --no-cache openssl=3.0.16-r0`,
    },
  ] satisfies RemediationSnippet[],
  resource: {
    name: "checkout-api:2026.09.01",
    type: "Container Image",
    uid: "sha256:54b90c5ca14c…42ed",
    account: "acme-prod",
    region: "eu-west-1",
  },
} as const;

export const IAM_ANALYSIS = {
  class: {
    name: "IAM Analysis Finding",
    classUid: "2008",
    typeUid: "200801",
    activity: "Create",
    status: "New",
    severity: "High",
    confidence: "High",
  } satisfies FindingClass,
  info: {
    uid: "iam-demo-001",
    title: "Deployer service account has unused administrator access",
    analytic: "cloud-iam-access-analysis",
    description:
      "The deployer identity can administer production resources but used only a small fraction of its granted actions.",
    firstSeen: "2026-08-31T23:40:00Z",
    lastSeen: "2026-09-01T09:21:00Z",
    types: ["Excessive Privileges", "Unused Access"],
    tags: [
      "environment=production",
      "identity_type=service_account",
      "team=platform",
    ],
    dataSources: ["IAM policy", "Cloud audit logs"],
  } satisfies FindingInfo,
  user: "svc-deployer@acme-prod",
  applications: ["CI pipeline", "Cloud Console"],
  metrics: {
    granted: "284 actions",
    used: "17 actions",
    lastUsed: "94 days ago",
  },
  permissionResults: [
    "roles/administrator=271 unused actions",
    "storage.admin=delete buckets unused",
    "iam.admin=manage service accounts unused",
  ],
  resources: ["projects/acme-prod", "artifact-registry/production"],
  risk: "The identity can administer production resources with **267 actions it has never used**. A leaked CI credential would inherit destructive privileges unrelated to deployment.",
  remediation:
    "Replace the administrator role with a deployment role limited to the 17 observed actions.",
} as const;

export const INCIDENT = {
  class: {
    name: "Incident Finding",
    classUid: "2005",
    typeUid: "200502",
    activity: "Update",
    status: "In Progress",
    severity: "Critical",
    confidence: "High",
  } satisfies FindingClass,
  info: {
    uid: "incident-demo-001",
    title: "Suspicious access followed by data staging",
    analytic: "incident-correlation",
    description:
      "Three related findings form an active incident involving unusual access, privilege use, and archive staging.",
    firstSeen: "2026-09-01T07:42:13Z",
    lastSeen: "2026-09-01T09:24:51Z",
    types: ["Account Compromise", "Data Staging"],
    tags: [
      "environment=production",
      "incident_type=account_compromise",
      "queue=soc",
    ],
    dataSources: [
      "Identity provider",
      "Endpoint telemetry",
      "Object access logs",
    ],
  } satisfies FindingInfo,
  priority: "P1",
  impact: "High",
  impactScore: "92 / 100",
  suspectedBreach: "Yes",
  assignee: "Maya Chen",
  group: "SOC",
  ticket: "IR-2841",
  attacks: [
    "tactic=Credential Access",
    "technique=T1078 Valid Accounts",
    "technique=T1560 Archive Collected Data",
  ],
  findings: [
    {
      className: "Detection",
      title: "Impossible travel sign-in",
      status: "Resolved",
    },
    {
      className: "IAM Analysis",
      title: "New administrator grant",
      status: "In Progress",
    },
    {
      className: "Detection",
      title: "Large encrypted archive created",
      status: "New",
    },
  ],
  risk: "The correlated sequence combines suspicious access, privilege escalation, and archive staging. Treat it as a **suspected breach** until containment and scoping disprove the chain.",
  remediation:
    "Disable the affected session, preserve the endpoint and identity evidence, confirm the administrator grant, and scope access to the staged archive before closing any child finding.",
} as const;

export const DETECTION = {
  class: {
    name: "Detection Finding",
    classUid: "2004",
    typeUid: "200401",
    activity: "Create",
    status: "New",
    severity: "High",
    confidence: "High",
  } satisfies FindingClass,
  info: {
    uid: "detection-demo-001",
    title: "Encoded PowerShell spawned from office process",
    analytic: "endpoint-behavior-detection",
    description:
      "A document process launched encoded PowerShell and contacted a newly observed domain.",
    firstSeen: "2026-09-01T09:31:44Z",
    lastSeen: "2026-09-01T09:32:18Z",
    types: ["Behavioral Detection", "Command and Control"],
    tags: ["environment=production", "endpoint=ws-finance-044", "sensor=edr"],
    dataSources: ["Process telemetry", "DNS activity", "File activity"],
  } satisfies FindingInfo,
  isAlert: "True",
  impact: "High",
  riskScore: "89 / 100",
  confidenceScore: "96%",
  attacks: [
    "tactic=Execution",
    "technique=T1059.001 PowerShell",
    "technique=T1204 User Execution",
  ],
  evidences: [
    {
      label: "Process",
      value: "winword.exe → powershell.exe -enc …",
      time: "09:31:44",
    },
    {
      label: "DNS",
      value: "new-domain.example → 203.0.113.42",
      time: "09:31:59",
    },
    {
      label: "File",
      value: "C:\\Users\\acme\\AppData\\Local\\stage.zip",
      time: "09:32:18",
    },
  ],
  resources: [
    "endpoint=ws-finance-044",
    "user=acme\\jordan",
    "process_id=6192",
  ],
  risk: "Encoded PowerShell launched by an office process and followed by a newly observed domain is a high-confidence execution chain. The archive creation suggests collection or staging on the endpoint.",
  remediation:
    "Isolate the endpoint, terminate the process tree, block the observed domain, preserve the document and archive, and validate whether the associated identity initiated other sessions.",
} as const;

export const SOURCE_URL = `http://localhost:8030/findings/${COMPLIANCE.info.uid}`;
