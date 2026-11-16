import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Badge } from "../data/Badge";
import { DRIFT_LABEL, driftNote } from "./anchoring/drift";
import { DriftBadge, DriftList, type DriftItem } from "./DriftList";

const ITEMS: DriftItem[] = [
  { ids: ["c1"], anchor: "r:outdated", label: "Lines 7–8", drift: { state: "outdated", note: driftNote("outdated", "lines") } },
  { ids: ["c2"], anchor: "r:ambiguous", label: "Line 10", drift: { state: "ambiguous", note: driftNote("ambiguous", "lines") } },
  { ids: ["c3"], anchor: "e:orphaned", label: "Element", drift: { state: "orphaned", note: driftNote("orphaned", "element") } },
  { ids: ["c4", "c5"], anchor: "e:moved", label: "Element", drift: { state: "moved", note: driftNote("moved", "element") } },
];

describe("DriftList", () => {
  it("lists patch outdated and ambiguous threads with orphaned and moved element threads in one list", () => {
    const { container } = render(<DriftList items={ITEMS} />);
    const rows = [...container.querySelectorAll<HTMLElement>("[data-drift-item]")].map((row) => ({
      anchor: row.dataset.driftItem,
      badge: within(row).getByText(/^(Outdated|Ambiguous|Orphaned|Moved)$/).textContent,
      label: within(row).getByText(/^(Lines 7–8|Line 10|Element)$/).textContent,
      note: row.querySelector("[data-drift-note]")?.textContent,
    }));
    expect({ lists: container.querySelectorAll("[data-drift-list]").length, rows }).toEqual({
      lists: 1,
      rows: [
        { anchor: "r:outdated", badge: "Outdated", label: "Lines 7–8", note: driftNote("outdated", "lines") },
        { anchor: "r:ambiguous", badge: "Ambiguous", label: "Line 10", note: driftNote("ambiguous", "lines") },
        { anchor: "e:orphaned", badge: "Orphaned", label: "Element", note: driftNote("orphaned", "element") },
        { anchor: "e:moved", badge: "Moved", label: "Element", note: driftNote("moved", "element") },
      ],
    });
  });

  it.each([
    { state: "moved" as const, tone: "warning" as const },
    { state: "ambiguous" as const, tone: "warning" as const },
    { state: "outdated" as const, tone: "danger" as const },
    { state: "orphaned" as const, tone: "danger" as const },
  ])("badges $state with the shared Badge in its $tone tone, not a hand-rolled colour", ({ state, tone }) => {
    const { container } = render(<DriftBadge state={state} />);
    const expected = render(
      <Badge tone={tone} variant="soft" size="xs" clickToCopy={false}>
        {DRIFT_LABEL[state]}
      </Badge>,
    ).container.firstElementChild!;
    expect(container.querySelector("[data-drift-badge] > *")!.className).toBe(expected.className);
    expect(container.querySelector("[data-drift-badge]")!.textContent).toBe(DRIFT_LABEL[state]);
  });

  it("renders nothing when no anchor has drifted", () => {
    const { container } = render(<DriftList items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("offers Re-anchor only when the host can retarget", () => {
    const { rerender } = render(<DriftList items={ITEMS} />);
    const without = screen.queryAllByRole("button", { name: "Re-anchor" }).length;
    rerender(<DriftList items={ITEMS} retarget={{ pickAnchor: vi.fn(), onRetarget: vi.fn() }} />);
    expect({ without, with: screen.getAllByRole("button", { name: "Re-anchor" }).length }).toEqual({ without: 0, with: 4 });
  });

  it("leaves Re-anchor off an item its surface cannot re-pick", () => {
    render(<DriftList items={[{ ...ITEMS[0]!, drift: { state: "outdated", reanchor: false } }, ITEMS[2]!]} retarget={{ pickAnchor: vi.fn(), onRetarget: vi.fn() }} />);
    expect(screen.getAllByRole("button", { name: "Re-anchor" })).toHaveLength(1);
  });

  it("hands a picked text selection's quote to onRetarget beside the anchor, for every thread on it", async () => {
    const quote = { prefix: "with the", exact: "next version", suffix: "and push" };
    const pickAnchor = vi.fn(async () => ({ anchor: "r:new", quote }));
    const onRetarget = vi.fn();
    render(<DriftList items={[ITEMS[3]!]} retarget={{ pickAnchor, onRetarget }} />);
    fireEvent.click(screen.getByRole("button", { name: "Re-anchor" }));
    await waitFor(() => expect(onRetarget).toHaveBeenCalledTimes(2));
    expect(onRetarget.mock.calls).toEqual([["c4", "r:new", quote], ["c5", "r:new", quote]]);
  });

  it("starts a pick for the drifted anchor, then calls onRetarget(id, anchor) for every thread on it", async () => {
    const pickAnchor = vi.fn(async () => ({ anchor: "e:new" }));
    const onRetarget = vi.fn();
    render(<DriftList items={[ITEMS[3]!]} retarget={{ pickAnchor, onRetarget }} />);
    fireEvent.click(screen.getByRole("button", { name: "Re-anchor" }));
    await waitFor(() => expect(onRetarget).toHaveBeenCalledTimes(2));
    expect({ picked: pickAnchor.mock.calls, retargeted: onRetarget.mock.calls }).toEqual({
      picked: [["e:moved"]],
      retargeted: [
        ["c4", "e:new"],
        ["c5", "e:new"],
      ],
    });
  });

  it("does not retarget when the pick is cancelled", async () => {
    const pickAnchor = vi.fn(async () => null);
    const onRetarget = vi.fn();
    render(<DriftList items={[ITEMS[0]!]} retarget={{ pickAnchor, onRetarget }} />);
    fireEvent.click(screen.getByRole("button", { name: "Re-anchor" }));
    await waitFor(() => expect(pickAnchor).toHaveBeenCalled());
    await waitFor(() => expect((screen.getByRole("button", { name: "Re-anchor" }) as HTMLButtonElement).disabled).toBe(false));
    expect(onRetarget).not.toHaveBeenCalled();
  });

  it("says so when the host's retarget fails, rather than swallowing it", async () => {
    const onRetarget = vi.fn(async () => {
      throw new Error("revision is stale");
    });
    render(<DriftList items={[ITEMS[0]!]} retarget={{ pickAnchor: async () => ({ anchor: "r:new" }), onRetarget }} />);
    fireEvent.click(screen.getByRole("button", { name: "Re-anchor" }));
    expect((await screen.findByRole("alert")).textContent).toMatch(/Could not re-anchor.*revision is stale/);
  });

  it("selects an item by its label", () => {
    const onSelect = vi.fn();
    render(<DriftList items={ITEMS} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: /Line 10/ }));
    expect(onSelect.mock.calls).toEqual([[ITEMS[1]]]);
  });
});
