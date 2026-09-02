import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell, type AppShellNavSection } from "./AppShell";
import type { AppShellNavDrag, AppShellNavDropTarget } from "./AppShell.nav.drag";

// A tree with the two shapes that matter: a plain leaf at the root, a folder,
// and a row that is both a folder and a leaf (`guides` is a page AND a parent).
function pagesSection(drag: AppShellNavDrag): AppShellNavSection {
  return {
    label: "Pages",
    variant: "tree",
    drag,
    items: [{ key: "welcome", label: "welcome", to: "?page=welcome" }],
    groups: [
      {
        key: "guides",
        label: "guides",
        item: { key: "guides", label: "guides", to: "?page=guides" },
        items: [
          { key: "guides/intro", label: "intro", to: "?page=guides/intro" },
        ],
      },
      { key: "drafts", label: "drafts", items: [] },
    ],
  };
}

function renderNav(drag: AppShellNavDrag, collapsedRail = false) {
  return render(
    <AppShell
      brand={<span>Brand</span>}
      navSections={[pagesSection(drag)]}
      {...(collapsedRail ? { defaultCollapsed: true } : {})}
    >
      <p>content</p>
    </AppShell>,
  );
}

// jsdom has no DataTransfer; the handlers only ever touch these three members.
function dataTransfer() {
  const data = new Map<string, string>();
  return {
    effectAllowed: "none",
    dropEffect: "none",
    setData: (type: string, value: string) => data.set(type, value),
    getData: (type: string) => data.get(type) ?? "",
  };
}

/** The row wrapper carrying the drag props — the link's nearest nav row. */
function row(name: string): HTMLElement {
  // AppShell renders the rail and the mobile drawer, so every query matches
  // twice; the tests consistently drive the last rendering.
  const link = screen.getAllByRole("link", { name }).at(-1);
  const wrapper = link?.closest("[data-nav-row]");
  if (!(wrapper instanceof HTMLElement)) {
    throw new Error(`no nav row for "${name}"`);
  }
  return wrapper;
}

function folderRow(name: string): HTMLElement {
  const heading = screen.getAllByText(name).at(-1)?.closest("[data-nav-row]");
  if (!(heading instanceof HTMLElement)) {
    throw new Error(`no folder row for "${name}"`);
  }
  return heading;
}

function drag(from: HTMLElement, to: HTMLElement) {
  const transfer = dataTransfer();
  fireEvent.dragStart(from, { dataTransfer: transfer });
  fireEvent.dragOver(to, { dataTransfer: transfer });
  fireEvent.drop(to, { dataTransfer: transfer });
  return transfer;
}

function dropSpy() {
  return vi.fn<(a: AppShellNavDropTarget, b: AppShellNavDropTarget) => void>();
}

/**
 * Dispatches a drag event the way the browser does — no `act()` around it, so
 * React has not necessarily re-rendered since the previous one.
 */
function dispatch(
  el: HTMLElement,
  type: string,
  transfer: ReturnType<typeof dataTransfer>,
): Event {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "dataTransfer", { value: transfer });
  el.dispatchEvent(event);
  return event;
}

describe("AppShell nav drag and drop", () => {
  beforeEach(() => window.localStorage.clear());

  it("reports the dragged item and the folder it was dropped on", () => {
    const onDrop = dropSpy();
    renderNav({ onDrop });

    drag(row("welcome"), folderRow("drafts"));

    expect(onDrop).toHaveBeenCalledWith(
      { key: "welcome", kind: "item" },
      { key: "drafts", kind: "group" },
    );
  });

  it("drops a nested page on the section root", () => {
    const onDrop = dropSpy();
    renderNav({ onDrop, rootKey: "" });

    // The section wrapper is the root zone; its heading is the visible part.
    const section = screen
      .getAllByText("Pages")
      .at(-1)
      ?.closest("[data-nav-row]");
    if (!(section instanceof HTMLElement)) throw new Error("no section");
    drag(row("intro"), section);

    expect(onDrop).toHaveBeenCalledWith(
      { key: "guides/intro", kind: "item" },
      { key: "", kind: "section" },
    );
  });

  // `guides` is one row wearing two hats: dragged it is the page, dropped on it
  // is the folder. Getting this wrong silently moves the wrong thing.
  it("treats a folder-and-leaf row as a page to drag and a folder to drop on", () => {
    const onDrop = dropSpy();
    renderNav({ onDrop });

    drag(row("welcome"), row("guides"));
    expect(onDrop).toHaveBeenCalledWith(
      { key: "welcome", kind: "item" },
      { key: "guides", kind: "group" },
    );

    onDrop.mockClear();
    drag(row("guides"), folderRow("drafts"));
    expect(onDrop).toHaveBeenCalledWith(
      { key: "guides", kind: "item" },
      { key: "drafts", kind: "group" },
    );
  });

  // Chrome can fire the first dragover in the same frame as dragstart. If the
  // row only accepted drops once a re-render had carried the new drag source,
  // it would decline that dragover — and a declined dragover means the browser
  // never sends a drop at all, so a quick drag would silently do nothing.
  it("accepts a drop whose dragover lands before React re-renders", () => {
    const onDrop = dropSpy();
    renderNav({ onDrop });
    const transfer = dataTransfer();

    dispatch(row("welcome"), "dragstart", transfer);
    const over = dispatch(folderRow("drafts"), "dragover", transfer);
    expect(over.defaultPrevented).toBe(true);

    dispatch(folderRow("drafts"), "drop", transfer);
    expect(onDrop).toHaveBeenCalledWith(
      { key: "welcome", kind: "item" },
      { key: "drafts", kind: "group" },
    );
  });

  // A pointer-driven drag in Chrome never reaches `drop` unless the row cancels
  // dragenter as well as dragover — the synthetic-event tests above pass either
  // way, so this is the assertion that keeps real drags working.
  it("cancels dragenter on a row that accepts the drop, and only there", () => {
    renderNav({
      onDrop: dropSpy(),
      canDrop: (_source, target) => target.kind !== "item",
    });
    const transfer = dataTransfer();

    dispatch(row("welcome"), "dragstart", transfer);
    expect(
      dispatch(folderRow("drafts"), "dragenter", transfer).defaultPrevented,
    ).toBe(true);
    expect(dispatch(row("intro"), "dragenter", transfer).defaultPrevented).toBe(
      false,
    );
  });

  it("refuses a drop the consumer rejects", () => {
    const onDrop = dropSpy();
    renderNav({
      onDrop,
      canDrop: (_source, target) => target.key !== "drafts",
    });

    drag(row("welcome"), folderRow("drafts"));
    expect(onDrop).not.toHaveBeenCalled();

    drag(row("welcome"), folderRow("guides"));
    expect(onDrop).toHaveBeenCalledTimes(1);
  });

  it("does not pick up a row the consumer will not let go", () => {
    const onDrop = dropSpy();
    renderNav({ onDrop, canDrag: (source) => source.kind === "group" });

    expect(row("welcome").getAttribute("draggable")).toBe(null);
    drag(row("welcome"), folderRow("drafts"));
    expect(onDrop).not.toHaveBeenCalled();
  });

  it("marks the dragged row and the hovered target, and clears both on drop", () => {
    renderNav({ onDrop: dropSpy() });
    const source = row("welcome");
    const target = folderRow("drafts");
    const transfer = dataTransfer();

    fireEvent.dragStart(source, { dataTransfer: transfer });
    expect(source.getAttribute("data-nav-drag")).toBe("source");

    fireEvent.dragOver(target, { dataTransfer: transfer });
    expect(target.getAttribute("data-nav-drop")).toBe("over");
    expect(transfer.dropEffect).toBe("move");

    fireEvent.drop(target, { dataTransfer: transfer });
    expect(target.getAttribute("data-nav-drop")).toBe(null);
    expect(source.getAttribute("data-nav-drag")).toBe(null);
  });

  // An <a> drags its own URL by default, which would make the row's payload
  // whatever the router happened to render.
  it("carries the row key rather than the link's href", () => {
    renderNav({ onDrop: dropSpy() });
    const transfer = drag(row("welcome"), folderRow("drafts"));
    expect(transfer.getData("text/plain")).toBe("welcome");
    expect(transfer.getData("application/x-clicky-nav")).toBe("welcome");
  });

  it("makes a configured section's rows draggable", () => {
    renderNav({ onDrop: dropSpy() });
    expect(row("welcome").getAttribute("draggable")).toBe("true");
  });

  it("leaves rows alone when the section has no drag config", () => {
    const section = pagesSection({ onDrop: dropSpy() });
    delete section.drag;
    render(
      <AppShell brand={<span>Brand</span>} navSections={[section]}>
        <p>content</p>
      </AppShell>,
    );
    expect(
      screen
        .getAllByRole("link", { name: "welcome" })
        .at(-1)
        ?.closest("[data-nav-row]"),
    ).toBe(null);
  });

  // Nothing in a collapsed rail says where a row would land.
  it("does not drag in a collapsed rail", () => {
    renderNav({ onDrop: dropSpy() }, true);
    expect(
      screen
        .getAllByRole("link", { name: "welcome" })
        .at(-1)
        ?.closest("[data-nav-row]"),
    ).toBe(null);
  });
});
