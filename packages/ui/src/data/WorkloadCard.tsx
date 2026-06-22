import { useMemo, useState, type ReactNode } from "react";
import {
  K8SDeployment,
  K8SIngress,
  K8SPod,
  K8SService,
  K8SStatefulset,
} from "@flanksource/icons/mi";
import { cn } from "../lib/utils";
import { Modal } from "../overlay/Modal";
import { Badge } from "./Badge";
import { Timestamp } from "./cells/Timestamp";
import { Icon, type StaticIconComponent } from "./Icon";
import { TimeseriesCoreBars } from "./TimeseriesCoreBars";
import { TimeseriesGauge } from "./TimeseriesGauge";
import {
  TimeseriesPanel,
  type TimeseriesResponse,
  type TimeseriesSeries,
} from "./TimeseriesPanel";
import { UiChip, UiFullscreen, UiHardDrive, UiMemoryStick } from "../icons";
import {
  formatReplicaCounts,
  workloadKindLabel,
  workloadStatusLabel,
  workloadStatusTone,
  type WorkloadCardIcon,
  type WorkloadCardKind,
  type WorkloadCardMetrics,
  type WorkloadCardResourceMetric,
  type WorkloadCardWorkload,
} from "./WorkloadCard.model";

export interface WorkloadCardProps {
  workload: WorkloadCardWorkload;
  metrics: WorkloadCardMetrics;
  baseUrl?: string;
  range?: string;
  refreshMs?: number;
  expandable?: boolean;
  size?: WorkloadCardSize;
  variant?: WorkloadCardVariant;
  fetcher?: (url: string) => Promise<TimeseriesResponse>;
  className?: string;
}

export type WorkloadCardSize = "sm" | "md" | "lg";
export type WorkloadCardVariant =
  | "default"
  | "outline"
  | "subtle"
  | "elevated"
  | "ghost";

type MetricKey = keyof WorkloadCardMetrics;

type PanelMetric = {
  key: MetricKey;
  title: string;
  unit?: string;
  icon: WorkloadCardIcon;
  metric: WorkloadCardResourceMetric;
};

const KIND_ICONS: Record<WorkloadCardKind, StaticIconComponent> = {
  service: K8SService,
  ingress: K8SIngress,
  deployment: K8SDeployment,
  statefulset: K8SStatefulset,
  pod: K8SPod,
};

type WorkloadCardSizeClasses = {
  root: string;
  header: string;
  titleGap: string;
  icon: string;
  name: string;
  meta: string;
  statusSize: "xxs" | "xs" | "sm";
  action: string;
  actionIcon: number;
  metricGrid: string;
  metricVariant: "default" | "cell";
  empty: string;
};

const SIZE_CLASSES: Record<WorkloadCardSize, WorkloadCardSizeClasses> = {
  sm: {
    root: "p-2",
    header: "mb-2 gap-2",
    titleGap: "gap-1",
    icon: "h-3.5 w-3.5",
    name: "text-xs",
    meta: "mt-0.5 gap-x-1.5 gap-y-0.5 text-[11px] leading-4",
    statusSize: "xxs",
    action: "h-5 w-5",
    actionIcon: 12,
    metricGrid: "grid-cols-1 gap-1.5",
    metricVariant: "cell",
    empty: "px-2 py-3 text-[11px]",
  },
  md: {
    root: "p-3",
    header: "mb-3 gap-2",
    titleGap: "gap-1.5",
    icon: "h-4 w-4",
    name: "text-sm",
    meta: "mt-0.5 gap-x-2 gap-y-0.5 text-xs",
    statusSize: "xs",
    action: "h-6 w-6",
    actionIcon: 14,
    metricGrid: "gap-3",
    metricVariant: "default",
    empty: "px-3 py-4 text-xs",
  },
  lg: {
    root: "p-4",
    header: "mb-4 gap-3",
    titleGap: "gap-2",
    icon: "h-5 w-5",
    name: "text-base",
    meta: "mt-1 gap-x-2 gap-y-1 text-xs",
    statusSize: "sm",
    action: "h-7 w-7",
    actionIcon: 16,
    metricGrid: "gap-4",
    metricVariant: "default",
    empty: "px-4 py-6 text-sm",
  },
};

const VARIANT_CLASSES: Record<WorkloadCardVariant, string> = {
  default: "border-border bg-card text-card-foreground",
  outline: "border-border bg-background text-foreground",
  subtle: "border-transparent bg-muted/35 text-foreground",
  elevated: "border-border/70 bg-card text-card-foreground shadow-sm",
  ghost: "border-transparent bg-transparent text-foreground",
};

function metricGridClass(count: number): string {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  return "grid-cols-3";
}

// Memory renders as cores-style bars at one bar per gigabyte, matching CPU; bytes
// are fed raw and TimeseriesCoreBars divides by perBar so captions read "x GB".
const MEMORY_BAR_UNIT = { perBar: 1024 ** 3, label: "GB", barLabel: "GB" };

function WorkloadIcon({
  icon,
  title,
  className,
}: {
  icon: WorkloadCardIcon;
  title: string;
  className?: string;
}) {
  if (typeof icon === "string") {
    return (
      <Icon name={icon} title={title} {...(className ? { className } : {})} />
    );
  }
  return (
    <Icon icon={icon} title={title} {...(className ? { className } : {})} />
  );
}

function metricSeries(metric: WorkloadCardResourceMetric): TimeseriesSeries[] {
  const series: TimeseriesSeries[] = [
    {
      id: metric.value.id,
      label: metric.valueLabel ?? "usage",
      ...(metric.value.transform ? { transform: metric.value.transform } : {}),
    },
  ];
  if (typeof metric.max === "object") {
    series.push({
      id: metric.max.id,
      label: metric.maxLabel ?? "limit",
      ...(metric.max.transform ? { transform: metric.max.transform } : {}),
    });
  }
  return series;
}

function hasMetric(metrics: WorkloadCardMetrics): boolean {
  return Boolean(metrics.cpu || metrics.memory || metrics.disk);
}

function HeaderMeta({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <span
        className="h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40"
        aria-hidden
      />
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

/**
 * WorkloadCard is a compact resource card for Kubernetes-style workloads. It
 * shows workload identity, status, replica/age metadata, and CPU/memory/disk
 * utilization backed by the existing time-series primitives: CPU and memory as
 * core-style bars (memory at one bar per GB) and disk as a linear progress bar.
 * Callers own the metric ids; the card only composes the supplied series.
 */
export function WorkloadCard({
  workload,
  metrics,
  baseUrl,
  range = "1h",
  refreshMs = 5000,
  expandable = true,
  size = "md",
  variant = "default",
  fetcher,
  className,
}: WorkloadCardProps) {
  const [expanded, setExpanded] = useState(false);
  const kindLabel = workloadKindLabel(workload.kind);
  const statusLabel = workloadStatusLabel(workload.status);
  const replicaText = formatReplicaCounts(workload.replicas);
  const workloadIcon = workload.icon ?? KIND_ICONS[workload.kind];
  const sizeClasses = SIZE_CLASSES[size];

  const panelMetrics = useMemo(() => {
    const list: PanelMetric[] = [];
    if (metrics.cpu) {
      list.push({
        key: "cpu",
        title: metrics.cpu.title ?? "CPU",
        unit: metrics.cpu.unit ?? "short",
        icon: metrics.cpu.icon ?? UiChip,
        metric: metrics.cpu,
      });
    }
    if (metrics.memory) {
      list.push({
        key: "memory",
        title: metrics.memory.title ?? "Memory",
        unit: metrics.memory.unit ?? "bytes",
        icon: metrics.memory.icon ?? UiMemoryStick,
        metric: metrics.memory,
      });
    }
    if (metrics.disk) {
      list.push({
        key: "disk",
        title: metrics.disk.title ?? "Disk",
        unit: metrics.disk.unit ?? "bytes",
        icon: metrics.disk.icon ?? UiHardDrive,
        metric: metrics.disk,
      });
    }
    return list;
  }, [metrics]);

  const metricProps = {
    ...(baseUrl !== undefined ? { baseUrl } : {}),
    range,
    refreshMs,
    ...(fetcher !== undefined ? { fetcher } : {}),
  };
  const canExpand = expandable && hasMetric(metrics);

  return (
    <div
      className={cn(
        "w-full rounded-md border",
        VARIANT_CLASSES[variant],
        sizeClasses.root,
        className,
      )}
      data-size={size}
      data-variant={variant}
    >
      <div
        className={cn("flex items-start justify-between", sizeClasses.header)}
      >
        <div className="min-w-0">
          <div
            className={cn("flex min-w-0 items-center", sizeClasses.titleGap)}
          >
            <WorkloadIcon
              icon={workloadIcon}
              title={kindLabel}
              className={cn("shrink-0 text-muted-foreground", sizeClasses.icon)}
            />
            <span
              className={cn("min-w-0 truncate font-medium", sizeClasses.name)}
              title={workload.name}
            >
              {workload.name}
            </span>
          </div>
          <div
            className={cn(
              "flex flex-wrap items-center text-muted-foreground",
              sizeClasses.meta,
            )}
          >
            <span>{kindLabel}</span>
            {workload.namespace ? (
              <HeaderMeta>{workload.namespace}</HeaderMeta>
            ) : null}
            {workload.role ? <HeaderMeta>{workload.role}</HeaderMeta> : null}
            {replicaText ? <HeaderMeta>{replicaText}</HeaderMeta> : null}
            {workload.createdAt !== undefined ? (
              <HeaderMeta>
                age <Timestamp value={workload.createdAt} format="relative" />
              </HeaderMeta>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {statusLabel ? (
            <span title={workload.status?.message}>
              <Badge
                tone={workloadStatusTone(workload.status)}
                variant="soft"
                size={sizeClasses.statusSize}
              >
                {statusLabel}
              </Badge>
            </span>
          ) : null}
          {canExpand ? (
            <button
              type="button"
              aria-label={`Open ${workload.name} history`}
              title="History"
              onClick={() => setExpanded(true)}
              className={cn(
                "inline-flex items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                sizeClasses.action,
              )}
            >
              <Icon
                icon={UiFullscreen}
                width={sizeClasses.actionIcon}
                height={sizeClasses.actionIcon}
              />
            </button>
          ) : null}
        </div>
      </div>

      {hasMetric(metrics) ? (
        <div
          className={cn(
            "grid items-start gap-3",
            sizeClasses.metricVariant === "cell"
              ? sizeClasses.metricGrid
              : cn(
                  metricGridClass(panelMetrics.length),
                  sizeClasses.metricGrid,
                ),
          )}
        >
          {metrics.cpu ? (
            <TimeseriesCoreBars
              title={metrics.cpu.title ?? "CPU"}
              icon={metrics.cpu.icon ?? UiChip}
              value={metrics.cpu.value}
              {...(metrics.cpu.max !== undefined
                ? { max: metrics.cpu.max }
                : {})}
              {...(metrics.cpu.thresholds
                ? { thresholds: metrics.cpu.thresholds }
                : {})}
              {...(metrics.cpu.orientation
                ? { orientation: metrics.cpu.orientation }
                : {})}
              {...(metrics.cpu.showValue !== undefined
                ? { showValue: metrics.cpu.showValue }
                : {})}
              variant={sizeClasses.metricVariant}
              {...metricProps}
            />
          ) : null}
          {metrics.memory ? (
            <TimeseriesCoreBars
              title={metrics.memory.title ?? "Memory"}
              icon={metrics.memory.icon ?? UiMemoryStick}
              value={metrics.memory.value}
              unit={MEMORY_BAR_UNIT}
              variant={sizeClasses.metricVariant}
              {...(metrics.memory.max !== undefined
                ? { max: metrics.memory.max }
                : {})}
              {...(metrics.memory.thresholds
                ? { thresholds: metrics.memory.thresholds }
                : {})}
              {...metricProps}
            />
          ) : null}
          {metrics.disk ? (
            <TimeseriesGauge
              title={metrics.disk.title ?? "Disk"}
              icon={metrics.disk.icon ?? UiHardDrive}
              value={metrics.disk.value}
              unit={metrics.disk.unit ?? "bytes"}
              shape="linear"
              expandable={false}
              centerDisplay={metrics.disk.centerDisplay ?? "value"}
              variant={sizeClasses.metricVariant}
              {...(metrics.disk.max !== undefined
                ? { max: metrics.disk.max }
                : {})}
              {...(metrics.disk.thresholds
                ? { thresholds: metrics.disk.thresholds }
                : {})}
              {...metricProps}
            />
          ) : null}
        </div>
      ) : (
        <div
          className={cn(
            "rounded-md border border-dashed border-border text-center text-muted-foreground",
            sizeClasses.empty,
          )}
        >
          No metrics configured
        </div>
      )}

      <Modal
        open={expanded}
        onClose={() => setExpanded(false)}
        title={`${workload.name} history`}
        size="xl"
      >
        <div className="flex flex-col gap-3">
          {panelMetrics.map(({ key, title, unit, icon, metric }) => (
            <TimeseriesPanel
              key={key}
              title={title}
              icon={icon}
              series={metricSeries(metric)}
              {...(unit ? { unit } : {})}
              {...metricProps}
              expandable={false}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}
