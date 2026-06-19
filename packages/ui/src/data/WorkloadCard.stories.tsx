import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, type ComponentProps } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  WorkloadCard,
  type WorkloadCardSize,
  type WorkloadCardVariant,
} from "./WorkloadCard";
import type { TimeseriesResponse } from "./TimeseriesPanel";
import type {
  WorkloadCardKind,
  WorkloadCardMetrics,
  WorkloadCardWorkload,
} from "./WorkloadCard.model";

const BASE_TIME = Date.parse("2026-06-02T12:00:00Z");
const STORY_WIDTH: Record<WorkloadCardSize, string> = {
  sm: "w-72",
  md: "w-[24rem]",
  lg: "w-[30rem]",
};

type WorkloadCardStoryArgs = ComponentProps<typeof WorkloadCard> & {
  kind: WorkloadCardKind;
  name: string;
  namespace: string;
  role: string;
  statusHealth: string;
  statusCode: string;
  readyReplicas: number;
  desiredReplicas: number;
  cpuValue: number;
  cpuMax: number;
  memoryValue: number;
  memoryMax: number;
  diskValue: number;
  diskMax: number;
  showDisk: boolean;
};

function buildPoints(latest: number): TimeseriesResponse["points"] {
  return Array.from({ length: 12 }, (_, i) => ({
    at: new Date(BASE_TIME + i * 30_000).toISOString(),
    value: latest * (0.72 + (i / 11) * 0.28),
  }));
}

function makeFetcher(latestByMatch: { match: string; latest: number }[]) {
  return async (url: string): Promise<TimeseriesResponse> => {
    const entry =
      latestByMatch.find((e) => url.includes(e.match)) ?? latestByMatch[0];
    return { id: url, points: buildPoints(entry?.latest ?? 0) };
  };
}

function storyFetcher(args: WorkloadCardStoryArgs) {
  return makeFetcher([
    { match: "cpu.usage", latest: args.cpuValue },
    { match: "cpu.limit", latest: args.cpuMax },
    { match: "memory.usage", latest: args.memoryValue },
    { match: "memory.limit", latest: args.memoryMax },
    { match: "disk.usage", latest: args.diskValue },
    { match: "disk.limit", latest: args.diskMax },
  ]);
}

function workloadFromArgs(args: WorkloadCardStoryArgs): WorkloadCardWorkload {
  return {
    kind: args.kind,
    name: args.name,
    ...(args.namespace ? { namespace: args.namespace } : {}),
    ...(args.role ? { role: args.role } : {}),
    createdAt: "2026-06-01T08:00:00Z",
    replicas: {
      ready: args.readyReplicas,
      desired: args.desiredReplicas,
    },
    status: {
      health: args.statusHealth,
      code: args.statusCode,
      message: `${args.name} is ${args.statusHealth}`,
    },
  };
}

function metricsFromArgs(args: WorkloadCardStoryArgs): WorkloadCardMetrics {
  return {
    cpu: {
      value: { id: "workload.cpu.usage" },
      max: { id: "workload.cpu.limit" },
      orientation: "vertical",
    },
    memory: {
      value: { id: "workload.memory.usage" },
      max: { id: "workload.memory.limit" },
    },
    ...(args.showDisk
      ? {
          disk: {
            value: { id: "workload.disk.usage" },
            max: { id: "workload.disk.limit" },
          },
        }
      : {}),
  };
}

function WorkloadCardShowcase(args: WorkloadCardStoryArgs) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      }),
    [
      args.cpuValue,
      args.cpuMax,
      args.memoryValue,
      args.memoryMax,
      args.diskValue,
      args.diskMax,
      args.showDisk,
    ],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <div className={STORY_WIDTH[args.size ?? "md"]}>
        <WorkloadCard
          workload={workloadFromArgs(args)}
          metrics={metricsFromArgs(args)}
          {...(args.baseUrl !== undefined ? { baseUrl: args.baseUrl } : {})}
          {...(args.range !== undefined ? { range: args.range } : {})}
          {...(args.refreshMs !== undefined
            ? { refreshMs: args.refreshMs }
            : {})}
          {...(args.expandable !== undefined
            ? { expandable: args.expandable }
            : {})}
          {...(args.size !== undefined ? { size: args.size } : {})}
          {...(args.variant !== undefined ? { variant: args.variant } : {})}
          {...(args.className !== undefined
            ? { className: args.className }
            : {})}
          fetcher={args.fetcher ?? storyFetcher(args)}
        />
      </div>
    </QueryClientProvider>
  );
}

function WorkloadCardGrid() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      }),
    [],
  );
  const cards: WorkloadCardStoryArgs[] = [
    {
      ...DEFAULT_ARGS,
      name: "cycle",
      role: "api",
      statusHealth: "healthy",
      statusCode: "Ready",
    },
    {
      ...DEFAULT_ARGS,
      kind: "statefulset",
      name: "activemq",
      role: "queue",
      statusHealth: "warning",
      statusCode: "Degraded",
      cpuValue: 3200,
      cpuMax: 4000,
      memoryValue: 6_600_000_000,
    },
    {
      ...DEFAULT_ARGS,
      kind: "pod",
      name: "cycle-worker-746bc9",
      role: "worker",
      readyReplicas: 1,
      desiredReplicas: 1,
      cpuValue: 950,
      cpuMax: 1000,
      memoryValue: 1_700_000_000,
      memoryMax: 2_000_000_000,
      diskValue: 9_200_000_000,
      size: "sm",
      variant: "outline",
    },
    {
      ...DEFAULT_ARGS,
      kind: "ingress",
      name: "edge.example.com",
      role: "edge",
      showDisk: false,
      readyReplicas: 0,
      desiredReplicas: 0,
      cpuValue: 120,
      cpuMax: 500,
      memoryValue: 180_000_000,
      memoryMax: 512_000_000,
      size: "sm",
      variant: "ghost",
    },
  ];
  return (
    <QueryClientProvider client={queryClient}>
      <div className="grid w-[52rem] grid-cols-2 gap-3">
        {cards.map((card) => (
          <WorkloadCard
            key={`${card.kind}:${card.name}`}
            workload={workloadFromArgs(card)}
            metrics={metricsFromArgs(card)}
            {...(card.baseUrl !== undefined ? { baseUrl: card.baseUrl } : {})}
            {...(card.range !== undefined ? { range: card.range } : {})}
            {...(card.refreshMs !== undefined
              ? { refreshMs: card.refreshMs }
              : {})}
            {...(card.expandable !== undefined
              ? { expandable: card.expandable }
              : {})}
            {...(card.size !== undefined ? { size: card.size } : {})}
            {...(card.variant !== undefined ? { variant: card.variant } : {})}
            fetcher={storyFetcher(card)}
          />
        ))}
      </div>
    </QueryClientProvider>
  );
}

function WorkloadCardSizeGallery() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      }),
    [],
  );
  const sizes: WorkloadCardSize[] = ["sm", "md", "lg"];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="grid w-[64rem] grid-cols-[18rem_24rem_30rem] items-start gap-4">
        {sizes.map((size) => {
          const args = {
            ...DEFAULT_ARGS,
            size,
            name: size === "sm" ? "cycle-worker" : "cycle",
            variant: size === "sm" ? "subtle" : "default",
          } satisfies WorkloadCardStoryArgs;
          return (
            <WorkloadCard
              key={size}
              size={size}
              variant={args.variant}
              workload={workloadFromArgs(args)}
              metrics={metricsFromArgs(args)}
              fetcher={storyFetcher(args)}
              refreshMs={0}
            />
          );
        })}
      </div>
    </QueryClientProvider>
  );
}

function WorkloadCardVariantGallery() {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false, gcTime: 0 } },
      }),
    [],
  );
  const variants: WorkloadCardVariant[] = [
    "default",
    "outline",
    "subtle",
    "elevated",
    "ghost",
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <div className="grid w-[64rem] grid-cols-2 gap-3 bg-background p-1">
        {variants.map((variant) => {
          const args = {
            ...DEFAULT_ARGS,
            variant,
            name: `${variant}-cycle`,
            statusHealth: variant === "ghost" ? "warning" : "healthy",
            statusCode: variant === "ghost" ? "Reconciling" : "Ready",
          } satisfies WorkloadCardStoryArgs;
          return (
            <WorkloadCard
              key={variant}
              variant={variant}
              workload={workloadFromArgs(args)}
              metrics={metricsFromArgs(args)}
              fetcher={storyFetcher(args)}
              refreshMs={0}
            />
          );
        })}
      </div>
    </QueryClientProvider>
  );
}

const DEFAULT_ARGS: WorkloadCardStoryArgs = {
  workload: {
    kind: "deployment",
    name: "cycle",
  },
  metrics: {
    cpu: {
      value: { id: "workload.cpu.usage" },
      max: { id: "workload.cpu.limit" },
    },
    memory: {
      value: { id: "workload.memory.usage" },
      max: { id: "workload.memory.limit" },
    },
    disk: {
      value: { id: "workload.disk.usage" },
      max: { id: "workload.disk.limit" },
    },
  },
  kind: "deployment",
  name: "cycle",
  namespace: "ops",
  role: "api",
  statusHealth: "healthy",
  statusCode: "Ready",
  readyReplicas: 3,
  desiredReplicas: 3,
  cpuValue: 2300,
  cpuMax: 4000,
  memoryValue: 3_200_000_000,
  memoryMax: 8_000_000_000,
  diskValue: 18_000_000_000,
  diskMax: 64_000_000_000,
  showDisk: true,
  baseUrl: "/api/v1/metrics/",
  range: "1h",
  refreshMs: 0,
  expandable: true,
  size: "md",
  variant: "default",
};

const meta = {
  title: "Charts/WorkloadCard",
  component: WorkloadCard,
  parameters: {
    docs: {
      description: {
        component:
          "Compact workload resource card backed by the shared time-series primitives. Callers pass explicit CPU, memory, and disk series; the card composes live CPU core bars, memory/disk gauges, and a card-level history modal.",
      },
    },
  },
  args: DEFAULT_ARGS,
  argTypes: {
    kind: {
      control: "select",
      options: ["service", "ingress", "deployment", "statefulset", "pod"],
    },
    name: { control: "text" },
    namespace: { control: "text" },
    role: { control: "text" },
    statusHealth: {
      name: "status",
      control: "select",
      options: ["healthy", "warning", "unhealthy", "unknown"],
    },
    statusCode: { control: "text" },
    readyReplicas: { control: { type: "number", min: 0, step: 1 } },
    desiredReplicas: { control: { type: "number", min: 0, step: 1 } },
    cpuValue: {
      name: "CPU usage",
      control: { type: "number", min: 0, step: 100 },
    },
    cpuMax: {
      name: "CPU max",
      control: { type: "number", min: 100, step: 100 },
    },
    memoryValue: {
      name: "memory usage",
      control: { type: "number", min: 0, step: 100_000_000 },
    },
    memoryMax: {
      name: "memory max",
      control: { type: "number", min: 1, step: 100_000_000 },
    },
    diskValue: {
      name: "disk usage",
      control: { type: "number", min: 0, step: 1_000_000_000 },
    },
    diskMax: {
      name: "disk max",
      control: { type: "number", min: 1, step: 1_000_000_000 },
    },
    showDisk: { control: "boolean" },
    size: {
      control: "inline-radio",
      options: ["sm", "md", "lg"],
    },
    variant: {
      control: "select",
      options: ["default", "outline", "subtle", "elevated", "ghost"],
    },
    baseUrl: { control: "text" },
    range: { control: "text" },
    refreshMs: { control: { type: "number", min: 0, step: 1000 } },
    expandable: { control: "boolean" },
    workload: { table: { disable: true } },
    metrics: { table: { disable: true } },
    fetcher: { table: { disable: true } },
    className: { table: { disable: true } },
  },
  render: (args) => <WorkloadCardShowcase {...args} />,
} satisfies Meta<WorkloadCardStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Deployment: Story = {};

export const StatefulSet: Story = {
  args: {
    kind: "statefulset",
    name: "activemq",
    role: "queue",
    statusHealth: "warning",
    statusCode: "Degraded",
    cpuValue: 3200,
    memoryValue: 6_600_000_000,
  },
};

export const Pod: Story = {
  args: {
    kind: "pod",
    name: "cycle-worker-746bc9",
    role: "worker",
    readyReplicas: 1,
    desiredReplicas: 1,
    cpuValue: 950,
    cpuMax: 1000,
    memoryValue: 1_700_000_000,
    memoryMax: 2_000_000_000,
  },
};

export const Service: Story = {
  args: {
    kind: "service",
    name: "cycle-svc",
    role: "internal",
    showDisk: false,
    cpuValue: 260,
    cpuMax: 500,
    memoryValue: 256_000_000,
    memoryMax: 512_000_000,
  },
};

export const Ingress: Story = {
  args: {
    kind: "ingress",
    name: "edge.example.com",
    role: "edge",
    showDisk: false,
    readyReplicas: 0,
    desiredReplicas: 0,
    cpuValue: 120,
    cpuMax: 500,
    memoryValue: 180_000_000,
    memoryMax: 512_000_000,
  },
};

export const Danger: Story = {
  args: {
    statusHealth: "unhealthy",
    statusCode: "CrashLoopBackOff",
    cpuValue: 3900,
    cpuMax: 4000,
    memoryValue: 7_700_000_000,
    diskValue: 61_000_000_000,
  },
};

export const WithoutDisk: Story = {
  args: {
    showDisk: false,
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    variant: "subtle",
    name: "cycle-worker",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    variant: "elevated",
    name: "cycle-api",
  },
};

export const Sizes: Story = {
  render: () => <WorkloadCardSizeGallery />,
};

export const Variants: Story = {
  render: () => <WorkloadCardVariantGallery />,
};

export const Grid: Story = {
  render: () => <WorkloadCardGrid />,
};
