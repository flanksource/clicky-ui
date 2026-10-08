import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { AccessMark } from "../AccessMark";
import { Badge } from "../Badge";
import type { DataAccess } from "../data-access";
import type { MemberAccess, MemberAccessKind } from "./call-graph-labels";

/** How many chips or names a list shows before a "+N more" button reveals the rest. */
const MEMBER_LIMIT = 8;

const ACCESS_MARK: Record<MemberAccessKind, { access: DataAccess; words: string }> = {
  read: { access: "read", words: "read" },
  write: { access: "write", words: "written" },
  both: { access: "readwrite", words: "read and written" },
};

/** The first `limit` items on one wrapping line, then a button that shows the rest. */
function Overflowing({ label, items, limit, className }: { label: string; items: ReactNode[]; limit: number; className?: string }) {
  const [expanded, setExpanded] = useState(false);
  const hidden = expanded ? 0 : Math.max(0, items.length - limit);
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      <ul className={cn("flex min-w-0 flex-wrap items-center gap-1", className)} aria-label={label}>
        {hidden > 0 ? items.slice(0, limit) : items}
      </ul>
      {hidden > 0 && (
        <button type="button" className="rounded px-1 text-xs font-medium text-primary hover:underline" onClick={() => setExpanded(true)}>
          +{hidden} more
        </button>
      )}
    </div>
  );
}

/**
 * The columns or fields a read or write touches, as chips on one wrapping line. When they are not all
 * touched the same way, each chip carries its `AccessMark`.
 */
export function MemberChipList({ label, members, limit = MEMBER_LIMIT }: { label: string; members: readonly MemberAccess[]; limit?: number }) {
  const marked = new Set(members.map((member) => member.access)).size > 1;
  const chips = members.map((member) => {
    const mark = ACCESS_MARK[member.access];
    return (
      <li key={member.name} data-member={member.name} {...(marked ? { "data-access": member.access, title: `${member.name}: ${mark.words}` } : {})}>
        <Badge variant="outline" size="sm" clickToCopy={false} className="gap-1 font-mono">
          {member.name}
          {marked && <AccessMark access={mark.access} className="text-xs" />}
        </Badge>
      </li>
    );
  });
  return <Overflowing label={label} items={chips} limit={limit} />;
}

/** `MemberChipList` after its label, or nothing when there are no members. */
export function MemberChips({ label, members }: { label: string; members: readonly MemberAccess[] }) {
  if (members.length === 0) return null;
  return (
    <div className="flex items-start gap-1.5 text-xs">
      <span className="shrink-0 leading-5 text-muted-foreground">{label}</span>
      <MemberChipList label={label} members={members} />
    </div>
  );
}

/** Node names on one wrapping line, such as who reads or writes a column. */
export function NameList({ label, names, limit = MEMBER_LIMIT }: { label: string; names: readonly string[]; limit?: number }) {
  // Two rules in different tiers can share a name.
  const items = names.map((name, index) => <li key={`${index}:${name}`} className="break-words text-xs">{name}</li>);
  return <Overflowing label={label} items={items} limit={limit} className="gap-x-2" />;
}
