import { describe, expect, it } from "vitest";
import { UiDatabase } from "../icons";
import { surfaceNavSection, type SurfaceNavOptions } from "./surfaceNav";
import type { ClickySurface } from "./types";

function surface(
  title: string,
  extra: Partial<ClickySurface> = {},
): ClickySurface {
  const key = `profile-${title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  return { key, entity: key, title, parent: "profiles", ...extra };
}

// Mirrors how the backend emits the hierarchy: it has already applied its own
// delimiter, so `path` always arrives "/"-separated.
function hierarchical(title: string, path: string, extra: Partial<ClickySurface> = {}) {
  return surface(title, { path, ...extra });
}

function options(activeKey?: string): SurfaceNavOptions {
  return {
    isActive: (item) => item.key === activeKey,
    hrefFor: (item) => `/${item.key}`,
  };
}

describe("surfaceNavSection", () => {
  // The backward-compatibility guarantee: every backend that has not opted into
  // x-clicky-path must keep producing exactly the flat list it produced before.
  it("renders a flat item list when no surface declares a path", () => {
    const section = surfaceNavSection(
      "Profiles",
      [surface("SQL Users"), surface("HTTP Status")],
      options(),
    );
    expect(section).toEqual({
      label: "Profiles",
      items: [
        {
          key: "profile-sql-users",
          label: "SQL Users",
          active: false,
          to: "/profile-sql-users",
        },
        {
          key: "profile-http-status",
          label: "HTTP Status",
          active: false,
          to: "/profile-http-status",
        },
      ],
    });
  });

  it("nests declared paths into groups", () => {
    const section = surfaceNavSection(
      "Profiles",
      [
        hierarchical("logs.api", "logs/api"),
        hierarchical("logs.cycle", "logs/cycle"),
      ],
      options(),
    );
    expect(section.items).toEqual([]);
    expect(section.groups?.map((group) => group.label)).toEqual(["logs"]);
    expect(section.groups?.[0]?.items.map((item) => item.label)).toEqual([
      "api",
      "cycle",
    ]);
  });

  it("labels a nested item with its own segment, not the full name", () => {
    const section = surfaceNavSection(
      "Profiles",
      [hierarchical("jms.incoming.disbursements", "jms/incoming/disbursements")],
      options(),
    );
    const leaf = section.groups?.[0]?.groups?.[0]?.items[0];
    expect(leaf?.label).toBe("disbursements");
    expect(leaf?.to).toBe("/profile-jms-incoming-disbursements");
  });

  // A node that is both a folder and a leaf is the common case, not an edge
  // case: `jms` is a runnable profile *and* the parent of `jms.incoming`.
  it("gives a folder that is also a leaf its own destination", () => {
    const section = surfaceNavSection(
      "Profiles",
      [hierarchical("jms", "jms"), hierarchical("jms.all", "jms/all")],
      options(),
    );
    const group = section.groups?.[0];
    expect(group?.label).toBe("jms");
    expect(group?.item?.to).toBe("/profile-jms");
    expect(group?.items.map((item) => item.label)).toEqual(["all"]);
  });

  it("leaves a pure folder with no destination of its own", () => {
    const section = surfaceNavSection(
      "Profiles",
      [hierarchical("logs.api", "logs/api")],
      options(),
    );
    expect(section.groups?.[0]?.item).toBeUndefined();
  });

  it("keeps a root-level surface out of the group list", () => {
    const section = surfaceNavSection(
      "Profiles",
      [hierarchical("http", "http"), hierarchical("logs.api", "logs/api")],
      options(),
    );
    expect(section.items?.map((item) => item.label)).toEqual(["http"]);
    expect(section.groups?.map((group) => group.label)).toEqual(["logs"]);
  });

  // The tree exists to make a long surface list scannable; expanding every
  // branch on load would put back the wall it replaces.
  it("folds branches until asked for, and reads folders as nav rows", () => {
    const section = surfaceNavSection(
      "Profiles",
      [hierarchical("logs.api", "logs/api")],
      options(),
    );
    expect(section.variant).toBe("tree");
    expect(section.groups?.[0]?.defaultCollapsed).toBe(true);
  });

  it("leaves a flat section on the list styling it has always had", () => {
    expect(surfaceNavSection("Profiles", [surface("Orders")], options()).variant).toBeUndefined();
  });

  it("force-expands every ancestor of the active surface", () => {
    const section = surfaceNavSection(
      "Profiles",
      [
        hierarchical("jms.incoming.disbursements", "jms/incoming/disbursements"),
        hierarchical("logs.api", "logs/api"),
      ],
      options("profile-jms-incoming-disbursements"),
    );
    const jms = section.groups?.find((group) => group.label === "jms");
    expect(jms?.forceExpanded).toBe(true);
    expect(jms?.groups?.[0]?.forceExpanded).toBe(true);
    // An unrelated branch keeps whatever state the user left it in.
    expect(
      section.groups?.find((group) => group.label === "logs")?.forceExpanded,
    ).toBeUndefined();
  });

  it("resolves a known icon name to clicky-ui's own glyph", () => {
    const section = surfaceNavSection(
      "Profiles",
      [surface("SQL Users", { icon: "database" })],
      options(),
    );
    expect(section.items?.[0]?.icon).toBe(UiDatabase);
  });

  // Vendor marks (postgres, loki, opensearch, …) live in the consumer's runtime
  // icon provider, not in clicky-ui's closed map. Dropping them here is what
  // made every profile in the rail wear the same generic glyph.
  it("passes an unknown icon name through for the runtime provider", () => {
    const section = surfaceNavSection(
      "Profiles",
      [surface("Orders", { icon: "postgres" })],
      options(),
    );
    expect(section.items?.[0]?.icon).toBe("postgres");
  });

  it("omits the icon entirely when the backend declares none", () => {
    const section = surfaceNavSection("Profiles", [surface("Orders")], options());
    expect(section.items?.[0]).not.toHaveProperty("icon");
  });

  it("treats a title containing a slash as one segment when no path is declared", () => {
    const section = surfaceNavSection(
      "Profiles",
      [surface("a/b"), hierarchical("logs.api", "logs/api")],
      options(),
    );
    expect(section.items?.map((item) => item.label)).toEqual(["a/b"]);
  });
});
