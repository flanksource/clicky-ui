import type { ReactNode } from "react";
import type { BadgeTone } from "./Badge";
import type { StaticIconComponent } from "./Icon";
import type { ProgressBarsOrientation } from "./ProgressBars";
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
  /** Badge text; falls back to `code`, then `health`. Never affects the tone. */
  label?: string;
  code?: string;
  /** Drives the tone: healthy → success, warning → warning, unhealthy → danger. */
  health?: string;
  /** Hover text for the status badge. */
  message?: string;
  /** Explicit badge tone; overrides the `health` mapping. */
  tone?: BadgeTone;
}

/** One caller-defined fact shown in the card's subtitle row, e.g. a region. */
export interface WorkloadCardMetadataItem {
  label: string;
  value: ReactNode;
}

/**
 * The workload a card describes. Kubernetes workloads set `kind` (which picks
 * the icon and type label); anything else sets a free-form `type` label and
 * its own `icon`, and describes itself through `metadata`.
 */
export interface WorkloadCardWorkload {
  /** Kubernetes kind; picks the default icon and type label. */
  kind?: WorkloadCardKind;
  /** Display label for the workload type, e.g. "EC2 instance". Overrides the kind label. */
  type?: string;
  name: string;
  namespace?: string;
  role?: string;
  createdAt?: string | number | Date;
  replicas?: WorkloadCardReplicas;
  status?: WorkloadCardStatus;
  icon?: WorkloadCardIcon;
  /** Extra label/value facts rendered after the built-ins in the subtitle row. */
  metadata?: ReadonlyArray<WorkloadCardMetadataItem>;
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
  orientation?: ProgressBarsOrientation;
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

/** The type label shown in the subtitle: `type`, else the kind's label. */
export function workloadTypeLabel(
  workload: Pick<WorkloadCardWorkload, "kind" | "type">,
): string | undefined {
  if (workload.type) return workload.type;
  return workload.kind ? workloadKindLabel(workload.kind) : undefined;
}

export function workloadStatusLabel(
  status: WorkloadCardStatus | undefined,
): string | undefined {
  return status?.label ?? status?.code ?? status?.health;
}

/**
 * The status badge tone: an explicit `tone`, else a fixed mapping of `health`
 * (healthy → success, warning → warning, unhealthy → danger, anything else →
 * neutral). Free-text `label`/`code` never affect the tone — substring guesses
 * misfire ("NotReady" contains "ready", "Broken" contains "ok").
 */
export function workloadStatusTone(
  status: WorkloadCardStatus | undefined,
): BadgeTone {
  if (status?.tone) return status.tone;
  switch (status?.health?.trim().toLowerCase()) {
    case "healthy":
      return "success";
    case "warning":
      return "warning";
    case "unhealthy":
      return "danger";
    default:
      return "neutral";
  }
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
