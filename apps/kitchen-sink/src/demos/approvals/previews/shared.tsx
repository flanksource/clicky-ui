import type { ReactNode } from "react";
import { Icon, Panel, cn } from "@flanksource/clicky-ui";
import {
  MV_BODY,
  MV_CARD,
  MV_HEAD,
  MV_KEY,
  MvBadge,
  MvMark,
  MvSecTitle,
} from "../chrome";
import { ACCOUNT_CLASS_TONES, ICONS, ICON_TONES, money } from "../meta";
import type { AccountClass, ApprovalIconKey } from "../types";

/** Merivio's `.apr-card` + `SecHead`: eyebrow, title and a right-hand slot. */
export function PreviewCard({
  icon,
  eyebrow,
  title,
  actions,
  padded = true,
  children,
}: {
  icon: ApprovalIconKey;
  eyebrow: string;
  title: ReactNode;
  actions?: ReactNode;
  padded?: boolean;
  children: ReactNode;
}) {
  return (
    <Panel
      className={MV_CARD}
      headerClassName={MV_HEAD}
      icon={ICONS[icon]}
      title={<MvSecTitle eyebrow={eyebrow} title={title} />}
      {...(actions !== undefined ? { actions } : {})}
      {...(padded ? { bodyClassName: `${MV_BODY} space-y-density-3` } : {})}
      padded={padded}
    >
      {children}
    </Panel>
  );
}

/** Small tinted glyph chip, the tint shared with `EntityCell` and `MvMark`. */
export function IconChip({
  icon,
  className,
}: {
  icon: ApprovalIconKey;
  className?: string;
}) {
  return (
    <MvMark
      icon={ICONS[icon]}
      tone={ICON_TONES[icon]}
      className={cn("size-5 rounded-[5px] text-[13px]", className)}
    />
  );
}

/** Inline account reference: chip, mono code, name, class tag. */
export function AcctRef({
  code,
  name,
  cls,
  icon,
}: {
  code: string;
  name: string;
  cls?: AccountClass | undefined;
  icon?: ApprovalIconKey | undefined;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      {icon && <IconChip icon={icon} />}
      <span className="font-mono text-mv-sm text-mv-muted">{code}</span>
      <span className="truncate text-mv-md text-mv-ink-2">{name}</span>
      {cls && cls !== "sub" && (
        <MvBadge tone={ACCOUNT_CLASS_TONES[cls]} dot={false} className="uppercase">
          {cls}
        </MvBadge>
      )}
    </span>
  );
}

/** Right-aligned ledger figure: monospace, tabular, negatives in red. */
export function Amount({
  value,
  strong,
  dim,
  decimals,
}: {
  value: number;
  strong?: boolean;
  dim?: boolean;
  decimals?: number;
}) {
  return (
    <span
      className={cn(
        "font-mono text-mv-base tabular-nums text-mv-ink-2",
        strong && "font-medium text-mv-ink",
        dim && "text-mv-muted-2",
        value < 0 && "text-mv-negative",
      )}
    >
      {money(value, decimals)}
    </span>
  );
}

/** A labelled fact in the document grid above a preview table. */
export function DocFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <div className={MV_KEY}>{label}</div>
      <div className="truncate text-mv-md text-mv-ink-2">{value}</div>
    </div>
  );
}

export function DocGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-density-3 rounded-mv-md border border-mv-hair bg-mv-surface-2 px-density-3 py-density-2 md:grid-cols-4">
      {children}
    </div>
  );
}

/** The arrow between a before and after cell. */
export function FlowArrow() {
  return (
    <Icon
      icon={ICONS.posting}
      className="shrink-0 text-base text-mv-muted-2"
    />
  );
}

export const TH_CLASS =
  "text-left text-mv-sm font-medium uppercase tracking-[0.04em] text-mv-muted";
export const TH_NUM_CLASS = `${TH_CLASS} text-right`;
export const TD_CLASS = "align-top text-mv-md text-mv-ink-2";
export const TD_NUM_CLASS = `${TD_CLASS} text-right`;

export function PreviewTable({
  minWidth,
  children,
}: {
  minWidth: number;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-mv-md border border-mv-border">
      <table className="w-full border-collapse" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}
