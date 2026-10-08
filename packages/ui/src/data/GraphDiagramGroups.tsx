import type { ReactNode } from "react";
import { IconButton } from "../components/IconButton";
import { UiChevronDown, UiChevronRight, UiChevronUp } from "../icons";
import { cn } from "../lib/utils";
import type { GraphLayoutGroupBox, GroupMemberWindow } from "./graph-columns-layout";
import { windowRows, type WindowStarts } from "./graph-group-window";
import { groupName, type GraphDiagramGroup } from "./graph-diagram-model";

export interface GraphDiagramGroupBoxesProps {
  boxes: GraphLayoutGroupBox[];
  groups: GraphDiagramGroup[] | undefined;
  /** Window starts by box id. */
  starts: WindowStarts;
  onScroll: (boxId: string, rows: number) => void;
  /** Shows a chevron on every group whose `collapsed` is set. */
  onGroupToggle: ((groupId: string) => void) | undefined;
  /** The stand-in node of each collapsed group, by group id: its header selects it. */
  standIns: ReadonlyMap<string, string>;
  selectedId: string | undefined;
  onNodeSelect: ((id: string) => void) | undefined;
}

function Chevron({ group, name, onToggle }: { group: GraphDiagramGroup; name: string; onToggle: () => void }) {
  const collapsed = group.collapsed === true;
  return (
    <IconButton icon={collapsed ? UiChevronRight : UiChevronDown} label={`${collapsed ? "Expand" : "Collapse"} ${name}`} aria-expanded={!collapsed}
      className="pointer-events-auto size-4" onClick={onToggle} />
  );
}

/** A record's header, or a collapsed group's whole box: chevron, caption, and what it holds. */
function Header({ box, caption, title, chevron, aside, select }: {
  box: GraphLayoutGroupBox;
  caption: ReactNode;
  title: string | undefined;
  chevron: ReactNode;
  aside: ReactNode;
  select: { name: string; selected: boolean; onSelect: () => void } | undefined;
}) {
  return (
    <div data-graph-record-header="" title={title} className="pointer-events-auto flex items-center gap-1 bg-muted px-1.5 text-[11px] font-semibold" style={{ height: box.headerHeight }}>
      {chevron}
      {select ? (
        <button type="button" aria-label={`Select ${select.name}`} aria-pressed={select.selected} onClick={select.onSelect}
          className={cn("min-w-0 truncate rounded-sm text-left hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", select.selected && "text-primary")}>
          {caption}
        </button>
      ) : <span className="min-w-0 truncate">{caption}</span>}
      {aside != null && <span className="ml-auto shrink-0 pl-2 text-[10px] font-normal text-muted-foreground">{aside}</span>}
    </div>
  );
}

/** "rows a–b of n" under a windowed group's rows, with buttons that page it. */
function WindowFooter({ box, rows, start, name, onScroll }: { box: GraphLayoutGroupBox; rows: GroupMemberWindow; start: number; name: string; onScroll: (rows: number) => void }) {
  const { first, last, total } = windowRows(rows, start);
  return (
    <div data-graph-window-footer="" className="pointer-events-auto absolute inset-x-0 flex items-center gap-1 px-2 text-[10px] text-muted-foreground"
      style={{ top: rows.top + rows.height - box.y, height: rows.footerHeight }}>
      <span className="min-w-0 flex-1 truncate tabular-nums">rows {first}–{last} of {total}</span>
      <IconButton icon={UiChevronUp} label={`Scroll ${name} up`} className="size-4" disabled={first === 1} onClick={() => onScroll(-rows.rows)} />
      <IconButton icon={UiChevronDown} label={`Scroll ${name} down`} className="size-4" disabled={last === total} onClick={() => onScroll(rows.rows)} />
    </div>
  );
}

/**
 * Group rectangles, drawn behind the edges and nodes. A record is captioned by a header, a box on its top
 * border; a collapsed group is its header alone. A box lets the pointer through to the stage, so a click
 * inside it never lands on the box; only its caption, chevron and footer take the pointer. A windowed box
 * takes the wheel too, to scroll its members.
 */
export function GraphDiagramGroupBoxes({ boxes, groups, starts, onScroll, onGroupToggle, standIns, selectedId, onNodeSelect }: GraphDiagramGroupBoxesProps) {
  const entries = new Map(groups?.map((group) => [group.id, group]));
  return (
    <>
      {boxes.map((box) => {
        const group = entries.get(box.group);
        const name = groupName(group, box.group);
        const caption = group ? group.label : box.group;
        const chevron = group && group.collapsed !== undefined && onGroupToggle ? <Chevron group={group} name={name} onToggle={() => onGroupToggle(box.group)} /> : null;
        const standIn = box.collapsed ? standIns.get(box.group) : undefined;
        const select = standIn !== undefined && onNodeSelect ? { name, selected: selectedId === standIn, onSelect: () => onNodeSelect(standIn) } : undefined;
        return (
          <div
            key={box.id}
            data-graph-group={box.id}
            data-graph-group-variant={box.record ? "record" : "box"}
            {...(box.collapsed ? { "data-graph-group-collapsed": "" } : {})}
            {...(box.window ? { "data-graph-window": box.id } : {})}
            className={cn(
              "absolute border border-border",
              box.window ? "pointer-events-auto" : "pointer-events-none",
              box.record || box.collapsed ? "overflow-hidden rounded-md bg-card shadow-sm" : "rounded-xl bg-muted/30",
              !box.record && "border-dashed",
            )}
            style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
          >
            {box.record || box.collapsed ? (
              <Header box={box} caption={caption} title={group?.title} chevron={chevron} aside={group?.aside} select={select} />
            ) : (
              <span className="pointer-events-auto absolute left-2 top-0 flex max-w-[calc(100%-1rem)] -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-background px-1.5 text-[10px] font-medium leading-4 text-muted-foreground">
                {chevron}
                <span title={group?.title} className="pointer-events-auto min-w-0 truncate">{caption}</span>
              </span>
            )}
            {box.window && <WindowFooter box={box} rows={box.window} start={starts[box.id] ?? 0} name={name} onScroll={(rows) => onScroll(box.id, rows)} />}
          </div>
        );
      })}
    </>
  );
}
