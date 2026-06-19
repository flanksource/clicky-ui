import type { BadgeTone } from "./Badge";
import type { StaticIconComponent } from "./Icon";
import type { TimeseriesCoreBarsOrientation } from "./TimeseriesCoreBars";
import type { GaugeSeries } from "./TimeseriesGauge";

export type WorkloadCardKind =
  | "service"
  | "ingress"
  | "deployment"
  | "statefulset"
  | "pod";

export type WorkloadCardIcon = string | StaticIconComponent;

export interface WorkloadCardReplicas {
  ready?: number;
  desired?: number;
  available?: number;
}

export interface WorkloadCardStatus {
  label?: string;
  code?: string;
  health?: string;
  message?: string;
  tone?: BadgeTone;
}

export interface WorkloadCardWorkload {
  kind: WorkloadCardKind;
  name: string;
  namespace?: string;
  role?: string;
  createdAt?: string | number | Date;
  replicas?: WorkloadCardReplicas;
  status?: WorkloadCardStatus;
  icon?: WorkloadCardIcon;
}

export interface WorkloadCardResourceMetric {
  title?: string;
  value: GaugeSeries;
  max?: GaugeSeries | number;
  valueLabel?: string;
  maxLabel?: string;
  unit?: string;
  icon?: WorkloadCardIcon;
  thresholds?: [warning: number, danger: number];
  centerDisplay?: "value" | "percent";
}

export interface WorkloadCardCpuMetric extends WorkloadCardResourceMetric {
  orientation?: TimeseriesCoreBarsOrientation;
  showValue?: boolean;
}

export interface WorkloadCardMetrics {
  cpu?: WorkloadCardCpuMetric;
  memory?: WorkloadCardResourceMetric;
  disk?: WorkloadCardResourceMetric;
}

export function workloadKindLabel(kind: WorkloadCardKind): string {
  switch (kind) {
    case "statefulset":
      return "StatefulSet";
    case "deployment":
      return "Deployment";
    case "service":
      return "Service";
    case "ingress":
      return "Ingress";
    case "pod":
      return "Pod";
  }
}

export function workloadStatusLabel(
  status: WorkloadCardStatus | undefined,
): string | undefined {
  return status?.label ?? status?.code ?? status?.health;
}

export function workloadStatusTone(
  status: WorkloadCardStatus | undefined,
): BadgeTone {
  if (status?.tone) return status.tone;
  const token = [status?.label, status?.code, status?.health]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (!token) return "neutral";
  if (/(unhealthy|error|failed|failure|crash|down|unavailable)/.test(token))
    return "danger";
  if (/(warning|warn|degraded|pending|progress|starting|reconcil)/.test(token))
    return "warning";
  if (/(healthy|ready|running|available|ok|success)/.test(token))
    return "success";
  if (/(info|unknown)/.test(token)) return "info";
  return "neutral";
}

export function formatReplicaCounts(
  replicas: WorkloadCardReplicas | undefined,
): string | undefined {
  if (!replicas) return undefined;
  if (replicas.ready !== undefined && replicas.desired !== undefined) {
    return `${replicas.ready}/${replicas.desired} ready`;
  }
  if (replicas.available !== undefined && replicas.desired !== undefined) {
    return `${replicas.available}/${replicas.desired} available`;
  }
  if (replicas.ready !== undefined) return `${replicas.ready} ready`;
  if (replicas.desired !== undefined) return `${replicas.desired} desired`;
  if (replicas.available !== undefined)
    return `${replicas.available} available`;
  return undefined;
}
