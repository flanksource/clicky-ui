/**
 * The recon visual vocabulary — one owner.
 *
 * A logo plus a hue per provider and per cloud service. Everything on a recon
 * page that draws one of those concepts reads it from here, so a service that
 * is amber on the dashboard is not indigo three pages later. Before a module
 * like this exists, the same mapping gets re-typed inline on every page and
 * drifts within a week.
 *
 * The split follows the repo's iconography rule: **product logos** come from
 * `@flanksource/icons/mi`, which ships per-service marks for AWS, Azure, GCP
 * and Kubernetes; **UI glyphs** (shield, warning, filter) come from clicky-ui's
 * offline `Ui*` components. A real S3 logo on an S3 bucket row is what makes a
 * mixed-provider inventory scannable without reading a word of it.
 *
 * Services with no dedicated mark fall back to their provider's root logo
 * rather than to a generic box: knowing a row is *some* Azure thing is more
 * than knowing it is a thing.
 */

import {
  Aws,
  AwsCloudfront,
  AwsCloudtrail,
  AwsCloudwatch,
  AwsEc2,
  AwsElb,
  AwsIam,
  AwsKms,
  AwsLambda,
  AwsRds,
  AwsS3,
  Azure,
  AzureAd,
  AzureAdvisor,
  AzureMonitor,
  AzureSqlServer,
  AzureStorage,
  Gcp,
  GcpCloudLogging,
  GcpCloudSql,
  GcpCloudStorage,
  GcpComputeEngine,
  GcpIdentityAndAccessManagement,
  K8S,
  K8SNode,
  K8SRole,
  K8SSecret,
} from "@flanksource/icons/mi";
import type { ComponentType } from "react";

import type { Hue } from "../_shared/hues";

/** The icon components this package exposes take plain SVG props. */
export type Mark = ComponentType<{ className?: string }>;

export const PROVIDER_MARKS: Record<string, Mark> = {
  aws: Aws,
  azure: Azure,
  gcp: Gcp,
  kubernetes: K8S,
};

export const PROVIDER_LABELS: Record<string, string> = {
  aws: "AWS",
  azure: "Azure",
  gcp: "Google Cloud",
  kubernetes: "Kubernetes",
};

/**
 * Provider hues, chosen to be distinguishable from the severity ramp.
 *
 * Severity owns red/orange/amber/sky, so provider identity uses the cool end.
 * A page showing both must never let "this row is AWS" read as "this row is
 * high severity".
 */
export const PROVIDER_HUES: Record<string, Hue> = {
  aws: "indigo",
  azure: "sky",
  gcp: "violet",
  kubernetes: "teal",
};

const SERVICE_MARKS: Record<string, Mark> = {
  // AWS
  "aws/ec2": AwsEc2,
  "aws/iam": AwsIam,
  "aws/s3": AwsS3,
  "aws/rds": AwsRds,
  "aws/cloudwatch": AwsCloudwatch,
  "aws/cloudtrail": AwsCloudtrail,
  "aws/awslambda": AwsLambda,
  "aws/elbv2": AwsElb,
  "aws/cloudfront": AwsCloudfront,
  "aws/kms": AwsKms,
  // Azure
  "azure/storage": AzureStorage,
  "azure/defender": AzureAdvisor,
  "azure/entra": AzureAd,
  "azure/sqlserver": AzureSqlServer,
  "azure/monitor": AzureMonitor,
  // GCP
  "gcp/iam": GcpIdentityAndAccessManagement,
  "gcp/compute": GcpComputeEngine,
  "gcp/cloudstorage": GcpCloudStorage,
  "gcp/cloudsql": GcpCloudSql,
  "gcp/logging": GcpCloudLogging,
  // Kubernetes
  "kubernetes/rbac": K8SRole,
  "kubernetes/apiserver": K8SNode,
  "kubernetes/kubelet": K8SNode,
  "kubernetes/etcd": K8SSecret,
};

/** The mark for a service, falling back to the provider's own logo. */
export function markFor(provider: string, service: string): Mark | null {
  return SERVICE_MARKS[`${provider}/${service}`] ?? PROVIDER_MARKS[provider] ?? null;
}

export function providerLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider;
}
