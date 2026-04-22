import { Avatar, type AvatarKind, type AvatarVariant } from "../../../../packages/ui/src/data/Avatar";
import { Icon, fnv1a32 } from "@flanksource/clicky-ui";
import { resolveSize, type SizeToken } from "../../../../packages/ui/src/lib/size";
import { useDensityValue } from "../../../../packages/ui/src/hooks/use-density";
import { DemoRow, DemoSection } from "./Section";

type SampleUser = {
  email: string;
  full: string;
  initials: string;
  kind?: AvatarKind;
};

const USERS: SampleUser[] = [
  { full: "Chen, Nora", email: "nora.chen@example.com", initials: "CN" },
  { full: "Singh, Tara", email: "tara.singh@example.com", initials: "ST" },
  { full: "Martinez, Theo", email: "theo.martinez@example.com", initials: "MT" },
  {
    full: "Architecture Runway Team",
    email: "[CORP]\\Architecture Runway Team",
    initials: "AR",
    kind: "group",
  },
  { full: "QA Group", email: "[CORP]\\QA", initials: "QA", kind: "group" },
];

const VARIANTS: Array<{ description: string; title: string; variant: AvatarVariant }> = [
  {
    title: "Duotone",
    variant: "duotone",
    description: "Soft tint with colored initials for the default user treatment.",
  },
  {
    title: "Solid",
    variant: "solid",
    description: "Stronger monogram badge when the icon should carry more weight.",
  },
  {
    title: "Stamp",
    variant: "stamp",
    description: "Approval-mark styling for workflow and sign-off surfaces.",
  },
  {
    title: "Mono",
    variant: "mono",
    description: "Compact editorial box for dense lists and tables.",
  },
];

type StageStatus = "approved" | "pending" | "rejected";

type StageStatusSpec = {
  icon: string;
  cellBg: string;
  tone: "emerald" | "amber" | "rose";
};

const STAGE_STATUS: Record<StageStatus, StageStatusSpec> = {
  approved: { icon: "codicon:check", cellBg: "bg-emerald-50/80", tone: "emerald" },
  pending: { icon: "mdi:hourglass-sand", cellBg: "bg-amber-50/85", tone: "amber" },
  rejected: { icon: "codicon:close", cellBg: "bg-rose-50/85", tone: "rose" },
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

function IdentityLine({
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

function VariantCard({
  description,
  title,
  variant,
}: {
  description: string;
  title: string;
  variant: AvatarVariant;
}) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-lg border border-border bg-background p-4">
      <div className="space-y-1 border-b border-border pb-3">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs leading-5 text-muted-foreground">{description}</div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {USERS.map((user) => (
          <IdentityLine key={`${variant}-${user.initials}`} user={user} variant={variant} />
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

export function AvatarDemo() {
  const density = useDensityValue();
  return (
    <DemoSection
      id="avatar"
      title="Avatar"
      description="Exploration-sheet variants for people and groups, with shared fallback logic for initials, repo badges, and approval lanes."
    >
      <div className="space-y-1">
        <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
          Exploration · Option Set A
        </div>
        <div className="text-sm text-muted-foreground">
          The shared avatar now supports duotone, solid, stamp, and mono treatments instead of a single pastel fallback.
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {VARIANTS.map((entry) => (
          <VariantCard
            key={entry.variant}
            description={entry.description}
            title={entry.title}
            variant={entry.variant}
          />
        ))}
      </div>

      <DemoRow label="Square repos">
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
      </DemoRow>

      <DemoRow label="Sizes">
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
          <Avatar key={size} alt="Chen, Nora" initials="CN" size={size} variant="duotone" />
        ))}
      </DemoRow>

      <div className="space-y-3 rounded-lg border border-border bg-background p-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Stage cell · badge icon scales with size
        </div>
        <div className="space-y-4">
          {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
            <div key={size} className="space-y-2">
              <div className="font-mono text-[10px] text-muted-foreground">
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

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-2 rounded-lg border border-border bg-background p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Deployment report
          </div>
          {USERS.map((user) => (
            <div
              key={`report-${user.initials}`}
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2"
            >
              <IdentityLine user={user} variant="duotone" />
              <span className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                {user.kind ? "group" : "submitter"}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-2 rounded-lg border border-border bg-background p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Approval lane
          </div>
          {USERS.slice(0, 3).map((user) => (
            <div key={`approval-${user.initials}`} className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2">
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
      </div>
    </DemoSection>
  );
}
