import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, type AvatarKind, type AvatarVariant } from "./Avatar";
import { Icon } from "./Icon";
import { fnv1a32 } from "../lib/palette";
import { resolveSize, type SizeToken } from "../lib/size";
import { useDensityValue } from "../hooks/use-density";

type SampleUser = {
  email: string;
  full: string;
  initials: string;
  kind?: AvatarKind;
};

const USERS: SampleUser[] = [
  {
    full: "Chen, Nora",
    email: "nora.chen@example.com",
    initials: "CN",
  },
  {
    full: "Singh, Tara",
    email: "tara.singh@example.com",
    initials: "ST",
  },
  {
    full: "Martinez, Theo",
    email: "theo.martinez@example.com",
    initials: "MT",
  },
  {
    full: "Architecture Runway Team",
    email: "[CORP]\\Architecture Runway Team",
    initials: "AR",
    kind: "group",
  },
  {
    full: "QA Group",
    email: "[CORP]\\QA",
    initials: "QA",
    kind: "group",
  },
];

const VARIANTS: Array<{
  description: string;
  title: string;
  variant: AvatarVariant;
}> = [
  {
    title: "Duotone",
    variant: "duotone",
    description: "Soft tint and colored type. Best general-purpose default for people and groups.",
  },
  {
    title: "Solid",
    variant: "solid",
    description: "Dense monogram badge with stronger presence when the avatar needs to carry more weight.",
  },
  {
    title: "Stamp",
    variant: "stamp",
    description: "Mono-leaning approval mark with a slight rotation for report and workflow contexts.",
  },
  {
    title: "Mono",
    variant: "mono",
    description: "Editorial box treatment for tables, printouts, and dense review surfaces.",
  },
];

type StageStatus = "approved" | "pending" | "rejected";

type StageStatusSpec = {
  icon: string;
  cellBg: string;
  tone: "emerald" | "amber" | "rose";
};

const STAGE_STATUS: Record<StageStatus, StageStatusSpec> = {
  approved: { icon: "ph:check-thin", cellBg: "bg-emerald-50/80", tone: "emerald" },
  pending: { icon: "ph:hourglass-medium-thin", cellBg: "bg-amber-50/85", tone: "amber" },
  rejected: { icon: "ph:x-thin", cellBg: "bg-rose-50/85", tone: "rose" },
};

const STAGE_STATES: Array<{ state: StageStatus; user: SampleUser }> = [
  { state: "approved", user: USERS[0]! },
  { state: "pending", user: USERS[1]! },
  { state: "rejected", user: USERS[2]! },
];

function stageCellBorderColor(user: SampleUser, variant: AvatarVariant): string {
  const kind = user.kind ?? "user";
  const hue = fnv1a32(user.full) % 360;

  if (kind === "group") {
    if (variant === "solid") return "#d8d4cc";
    if (variant === "stamp" || variant === "mono") return "#8d8778";
    return "#b8b3a7";
  }

  if (variant === "solid") return `oklch(0.55 0.12 ${hue})`;
  if (variant === "stamp") return `oklch(0.42 0.15 ${hue})`;
  if (variant === "mono") return "#1a1a1a";
  return `oklch(0.55 0.14 ${hue} / 0.25)`;
}

function StageCellPreview({
  state,
  user,
  variant,
  size = "lg",
}: {
  state: StageStatus;
  user: SampleUser;
  variant: AvatarVariant;
  size?: SizeToken;
}) {
  const spec = STAGE_STATUS[state];
  const borderColor = stageCellBorderColor(user, variant);
  const density = useDensityValue();
  const px = resolveSize(size, density);

  return (
    <div
      className={`flex items-center gap-2 overflow-hidden rounded-full border shadow-sm ${spec.cellBg}`}
      style={{ borderColor, height: px }}
    >
      <Avatar
        alt={user.full}
        initials={user.initials}
        kind={user.kind ?? "user"}
        size={size}
        title={user.full}
        variant={variant}
      />
      <span
        className="min-w-0 flex-1 truncate font-medium leading-none text-foreground"
        style={{ fontSize: Math.max(11, Math.round(px * 0.32)) }}
      >
        {user.full}
      </span>
      <Icon name={spec.icon} style="badge" size={size} tone={spec.tone} title={state} />
    </div>
  );
}

const meta: Meta<typeof Avatar> = {
  title: "Data/Avatar",
  component: Avatar,
  args: {
    alt: "Chen, Nora",
    initials: "CN",
    size: "md",
    variant: "duotone",
    kind: "user",
  },
  argTypes: {
    size: {
      control: "inline-radio",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    variant: {
      control: "inline-radio",
      options: VARIANTS.map((entry) => entry.variant),
    },
    kind: {
      control: "inline-radio",
      options: ["user", "group"],
    },
    rounded: {
      control: "inline-radio",
      options: ["full", "md"],
    },
  },
  parameters: {
    layout: "padded",
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

function SampleLine({
  user,
  variant,
  size = "md",
}: {
  size?: SizeToken;
  user: SampleUser;
  variant: AvatarVariant;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar
        alt={user.full}
        initials={user.initials}
        kind={user.kind ?? "user"}
        size={size}
        title={user.full}
        variant={variant}
      />
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{user.full}</div>
        <div className="truncate font-mono text-[11px] text-muted-foreground">{user.email}</div>
      </div>
    </div>
  );
}

function ExplorationCard({
  description,
  title,
  variant,
}: {
  description: string;
  title: string;
  variant: AvatarVariant;
}) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-4">
      <div className="space-y-1 border-b border-border pb-3">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs leading-5 text-muted-foreground">{description}</div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {USERS.map((user) => (
          <SampleLine key={`${variant}-${user.initials}`} user={user} variant={variant} />
        ))}
      </div>

      <div className="rounded-md border border-dashed border-border bg-muted/40 p-3">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          In a stage cell
        </div>
        <div className="space-y-2">
          {STAGE_STATES.map((entry) => (
            <StageCellPreview
              key={`${variant}-${entry.state}`}
              state={entry.state}
              user={entry.user}
              variant={variant}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export const InitialFallback: Story = {};

export const Exploration: Story = {
  render: () => (
    <div className="space-y-5">
      <div className="max-w-2xl space-y-1">
        <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Exploration · Option Set A
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">User representation</h2>
        <p className="text-sm text-muted-foreground">
          Shared avatar variants derived from the pipeline-report exploration sheet. The component keeps
          one API while letting Storybook show the distinct visual tones.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {VARIANTS.map((entry) => (
          <ExplorationCard
            key={entry.variant}
            description={entry.description}
            title={entry.title}
            variant={entry.variant}
          />
        ))}
      </div>
    </div>
  ),
};

export const PipelineContext: Story = {
  render: () => (
    <div className="grid max-w-4xl gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="space-y-1">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Deployment report
          </div>
          <div className="text-sm text-muted-foreground">
            The duotone fallback is the default. Stamp and mono variants support denser review surfaces.
          </div>
        </div>

        <div className="space-y-2">
          {USERS.map((user) => (
            <div
              key={user.initials}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2"
            >
              <SampleLine user={user} variant="duotone" />
              <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                {user.kind ? "group" : "submitter"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Approval lane
        </div>
        <div className="space-y-2">
          {USERS.slice(0, 3).map((user) => (
            <div key={user.initials} className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2">
              <Avatar
                alt={user.full}
                initials={user.initials}
                size="sm"
                title={user.full}
                variant="stamp"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-foreground">{user.full}</div>
                <div className="font-mono text-[11px] text-muted-foreground">approved · 14:32</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-md border border-border bg-background p-3">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Compact list
          </div>
          <div className="space-y-2">
            {USERS.map((user) => (
              <div key={`mono-${user.initials}`} className="flex items-center gap-2">
                <Avatar
                  alt={user.full}
                  initials={user.initials}
                  kind={user.kind ?? "user"}
                  size="sm"
                  title={user.full}
                  variant="mono"
                />
                <span className="truncate text-sm text-foreground">{user.full}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  ),
};

function StageSizesView() {
  const density = useDensityValue();
  return (
    <div className="space-y-6">
      <div className="max-w-2xl space-y-1">
        <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Stage cell · size scaling
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Badge-style icons scale with the row
        </h2>
        <p className="text-sm text-muted-foreground">
          The trailing status is rendered via <code>{'<Icon style="badge" />'}</code>. Pass the same
          size token used by the neighbouring avatar and the chip, glyph, and row height stay in
          proportion.
        </p>
      </div>
      <div className="space-y-4">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
          <div key={size} className="space-y-2">
            <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              size = {size} ({resolveSize(size, density)}px · {density})
            </div>
            <div className="space-y-2">
              {STAGE_STATES.map((entry) => (
                <StageCellPreview
                  key={`${size}-${entry.state}`}
                  state={entry.state}
                  user={entry.user}
                  variant="duotone"
                  size={size}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const StageSizes: Story = {
  render: () => <StageSizesView />,
};

export const SquareRepositories: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Avatar
        alt="flanksource/clicky-ui"
        colorKey="flanksource/clicky-ui"
        rounded="md"
        size="md"
        variant="duotone"
      />
      <Avatar
        alt="other-org/clicky-ui"
        colorKey="other-org/clicky-ui"
        rounded="md"
        size="md"
        variant="solid"
      />
      <Avatar
        alt="internal/release-service"
        colorKey="internal/release-service"
        rounded="md"
        size="md"
        variant="mono"
      />
    </div>
  ),
};

export const Linked: Story = {
  args: {
    alt: "GitHub reviewers",
    href: "https://github.com",
    initials: "GH",
    size: "md",
    variant: "stamp",
  },
};

function SizesWithNamesView() {
  const density = useDensityValue();
  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-1">
        <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Size scale · name pairing
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground">
          Avatar sizes with companion text
        </h2>
        <p className="text-sm text-muted-foreground">
          Each row pairs the avatar with the identity label sized so the glyph is only a touch taller
          than the cap height (font-size ≈ 85% of the avatar box).
        </p>
      </div>

      <div className="space-y-3">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => {
          const px = resolveSize(size, density);
          return (
            <div key={size} className="flex items-center gap-3">
              <Avatar alt="Chen, Nora" initials="CN" size={size} variant="duotone" />
              <span
                className="font-medium leading-none text-foreground"
                style={{ fontSize: Math.round(px * 0.85) }}
              >
                Chen, Nora
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                {size} · {px}px
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {VARIANTS.map((entry) => (
          <div key={entry.variant} className="space-y-3 rounded-lg border border-border bg-card p-4">
            <div className="space-y-1 border-b border-border pb-2">
              <div className="text-sm font-semibold text-foreground">{entry.title}</div>
              <div className="text-xs leading-5 text-muted-foreground">{entry.description}</div>
            </div>
            {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => {
              const px = resolveSize(size, density);
              return (
                <div key={`${entry.variant}-${size}`} className="flex items-center gap-2">
                  <Avatar alt="Chen, Nora" initials="CN" size={size} variant={entry.variant} />
                  <span
                    className="font-medium leading-none text-foreground"
                    style={{ fontSize: Math.round(px * 0.85) }}
                  >
                    Chen, Nora
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export const SizesWithNames: Story = {
  render: () => <SizesWithNamesView />,
};
