import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AppShell, type AppShellNavGroup } from "./AppShell";

// Mirrors the profile hierarchy that motivated nested groups: `jms` is both a
// runnable destination and the parent of `jms.incoming`, which is itself a
// destination and a parent.
function jmsGroup(overrides: Partial<AppShellNavGroup> = {}): AppShellNavGroup {
  return {
    key: "jms",
    label: "jms",
    item: { key: "jms", label: "jms", to: "/profile-jms" },
    items: [{ key: "jms-all", label: "all", to: "/profile-jms-all" }],
    groups: [
      {
        key: "jms/incoming",
        label: "incoming",
        item: {
          key: "jms-incoming",
          label: "incoming",
          to: "/profile-jms-incoming",
        },
        items: [
          {
            key: "jms-incoming-disbursements",
            label: "disbursements",
            to: "/profile-jms-incoming-disbursements",
          },
        ],
      },
    ],
    ...overrides,
  };
}

function renderNav(group: AppShellNavGroup, collapsedRail = false) {
  return render(
    <AppShell
      brand={<span>Brand</span>}
      navSections={[{ label: "Profiles", groups: [group] }]}
      {...(collapsedRail ? { defaultCollapsed: true } : {})}
    >
      <p>content</p>
    </AppShell>,
  );
}

describe("AppShell nested nav groups", () => {
  beforeEach(() => window.localStorage.clear());

  it("renders a third level of hierarchy", () => {
    renderNav(jmsGroup());
    expect(screen.getByRole("link", { name: "disbursements" })).toBeTruthy();
  });

  // The core folder-and-leaf case. Nesting the toggle inside the anchor would be
  // invalid DOM and would make the click target ambiguous, so they must be
  // siblings — this is the assertion that locks that in.
  it("gives a folder that is also a leaf a link and a separate disclosure", () => {
    renderNav(jmsGroup());
    const link = screen.getByRole("link", { name: "jms" });
    const toggle = screen.getByRole("button", { name: /Collapse jms/ });
    expect(link.contains(toggle)).toBe(false);
    expect(toggle.contains(link)).toBe(false);
    expect(link.getAttribute("href")).toBe("/profile-jms");
  });

  it("hides a subtree when its group is collapsed, and restores it", () => {
    renderNav(jmsGroup());
    const toggle = screen.getByRole("button", { name: /Collapse jms$/ });
    expect(toggle.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(toggle);
    expect(screen.queryByRole("link", { name: "all" })).toBeNull();
    expect(screen.queryByRole("link", { name: "disbursements" })).toBeNull();
    // The group's own destination survives — collapsing hides children, not self.
    expect(screen.getByRole("link", { name: "jms" })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Expand jms$/ }));
    expect(screen.getByRole("link", { name: "all" })).toBeTruthy();
  });

  it("keeps a force-expanded group open even when it was collapsed before", () => {
    const { unmount } = renderNav(jmsGroup());
    fireEvent.click(screen.getByRole("button", { name: /Collapse jms$/ }));
    expect(screen.queryByRole("link", { name: "all" })).toBeNull();
    unmount();

    // A deep link to a descendant must not land on a blank branch, so the
    // stored collapsed state is overridden rather than consulted.
    renderNav(jmsGroup({ forceExpanded: true }));
    expect(screen.getByRole("link", { name: "all" })).toBeTruthy();
  });

  it("respects defaultCollapsed for a group the user has never touched", () => {
    renderNav(jmsGroup({ defaultCollapsed: true }));
    expect(screen.queryByRole("link", { name: "all" })).toBeNull();
  });

  it("flattens the whole subtree into the icon strip when the rail is collapsed", () => {
    renderNav(jmsGroup(), true);
    // Every destination stays reachable; no disclosure survives, because a
    // collapsed rail has no room for a heading the user could aim at.
    for (const name of ["/profile-jms", "/profile-jms-all", "/profile-jms-incoming", "/profile-jms-incoming-disbursements"]) {
      expect(document.querySelector(`a[href="${name}"]`)).toBeTruthy();
    }
    expect(screen.queryByRole("button", { name: /Collapse jms/ })).toBeNull();
  });

  // The rail stays mounted (`hidden md:flex`) while the drawer is open, so both
  // NavSections renders are live at once. Group collapse state is owned by
  // AppShell, not by each NavSections, or a toggle in one would leave the other
  // stale (and the two would race each other through localStorage).
  it("shares group collapse state between the rail and the mobile drawer", () => {
    const { container } = render(
      <AppShell
        brand={<span>Brand</span>}
        navSections={[{ label: "Profiles", groups: [jmsGroup()] }]}
      >
        <p>content</p>
      </AppShell>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open Navigation" }));
    const rail = container.querySelector<HTMLElement>(
      '[data-slot="app-shell-sidebar"]',
    );
    if (!rail) throw new Error("expected the desktop rail to stay mounted");
    const drawer = screen.getByRole("dialog", { name: "Navigation" });

    expect(within(rail).getByRole("link", { name: "all" })).toBeTruthy();
    expect(within(drawer).getByRole("link", { name: "all" })).toBeTruthy();

    fireEvent.click(
      within(drawer).getByRole("button", { name: /Collapse jms$/ }),
    );

    expect(within(drawer).queryByRole("link", { name: "all" })).toBeNull();
    expect(within(rail).queryByRole("link", { name: "all" })).toBeNull();
    expect(
      within(rail).getByRole("button", { name: /Expand jms$/ }),
    ).toBeTruthy();
  });

  it("still renders a plain group with no item as a single heading button", () => {
    renderNav({
      key: "logs",
      label: "logs",
      items: [{ key: "logs-api", label: "api", to: "/profile-logs-api" }],
    });
    expect(screen.getByRole("button", { name: /logs/ })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "logs" })).toBeNull();
    expect(screen.getByRole("link", { name: "api" })).toBeTruthy();
  });
});
