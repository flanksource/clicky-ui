import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { VIEWPORT_PRESETS } from "../../packages/ui/src/lib/breakpoints";

// Sweeps every kitchen-sink demo across the sub-desktop presets and fails on
// layout that escapes the viewport. Narrow the sweep while iterating:
//   RESPONSIVE_VIEWPORTS=phone-sm,phone RESPONSIVE_DEMOS=data-table pnpm --filter e2e test:responsive
// RESPONSIVE_SCREENSHOTS=1 also writes .tmp/responsive/<viewport>/<demo>.png.
// Every test writes .tmp/responsive/<viewport>/<demo>.json with its findings,
// including undersized (<24px) tap targets, which are reported but not failed.

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "../../.tmp/responsive");
const csv = (value: string | undefined) => value?.split(",").map((s) => s.trim()).filter(Boolean);
const viewportFilter = csv(process.env.RESPONSIVE_VIEWPORTS);
const demoFilter = csv(process.env.RESPONSIVE_DEMOS);
const screenshots = process.env.RESPONSIVE_SCREENSHOTS === "1";

const viewports = VIEWPORT_PRESETS.filter((preset) =>
  viewportFilter ? viewportFilter.includes(preset.id) : preset.kind !== "desktop",
);

type LayoutFindings = {
  pageOverflowPx: number;
  escaping: string[];
  scrollingLayout: string[];
  smallTargets: string[];
};

// Test ids must exist at collection time, so read them from the catalog source
// rather than the rendered nav.
function demoIds(): string[] {
  const catalog = readFileSync(resolve(HERE, "../../apps/kitchen-sink/src/demo-catalog.tsx"), "utf8");
  const groups = catalog.slice(catalog.indexOf("export const DEMO_GROUPS"));
  const ids = [...groups.matchAll(/\bid: "([^"]+)"/g)].map((match) => match[1]!);
  if (ids.length === 0) throw new Error("no demo ids found in demo-catalog.tsx DEMO_GROUPS");
  return demoFilter ? ids.filter((id) => demoFilter.includes(id)) : ids;
}

// Runs in the page. An element "escapes" when it reaches past the viewport and
// no ancestor inside the viewport clips it. A "scrolling layout" is a
// horizontally scrolling box whose first overflowing descendant is not tabular,
// preformatted, a tree/grid, or opted in with data-scroll-x — i.e. ordinary layout that
// slides sideways instead of wrapping.
function measureLayout(): LayoutFindings {
  const vw = document.documentElement.clientWidth;
  const describe = (el: Element) => {
    const id = el.id ? `#${el.id}` : "";
    const cls = typeof el.className === "string" ? el.className.split(/\s+/).slice(0, 4).join(".") : "";
    const text = (el.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 40);
    const r = el.getBoundingClientRect();
    return `${el.tagName.toLowerCase()}${id}${cls ? `.${cls}` : ""} [${Math.round(r.left)}→${Math.round(r.right)}] "${text}"`;
  };
  const clippedWithinViewport = (el: Element) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (getComputedStyle(a).overflowX !== "visible" && a.getBoundingClientRect().right <= vw + 1) {
        return true;
      }
    }
    return false;
  };
  // The outermost descendants that cross the scroller's right edge while their
  // parent does not — the elements actually forcing the overflow.
  const overflowCulprits = (scroller: Element) => {
    const edge = scroller.getBoundingClientRect().left + scroller.clientWidth + 1;
    const clippedBelow = (el: Element) => {
      for (let a = el.parentElement; a && a !== scroller; a = a.parentElement) {
        if (getComputedStyle(a).overflowX !== "visible") return true;
      }
      return false;
    };
    return Array.from(scroller.querySelectorAll("*")).filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.right <= edge) return false;
      const parent = el.parentElement;
      const first = parent === scroller || (parent !== null && parent.getBoundingClientRect().right <= edge);
      return first && !clippedBelow(el);
    });
  };
  const isTabularOrPreformatted = (el: Element) =>
    el.closest("[data-scroll-x], table, pre, code, [role=grid], [role=tablist], [role=tree]") !== null ||
    el.querySelector("table, pre, [data-scroll-x], [role=grid], [role=tree]") !== null ||
    getComputedStyle(el).whiteSpace.startsWith("pre");

  const escaping: string[] = [];
  const scrollingLayout: string[] = [];
  const smallTargets: string[] = [];
  for (const el of Array.from(document.querySelectorAll("body *"))) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const style = getComputedStyle(el);
    if (style.visibility === "hidden" || style.position === "fixed") continue;
    // Entirely off-screen boxes are parked a11y live regions, not layout.
    const parked = r.right < 0 || r.left > vw;
    if (!parked && (r.right > vw + 1 || r.left < -1) && !clippedWithinViewport(el)) {
      const parent = el.parentElement;
      const parentEscapes =
        parent && parent !== document.body && parent.getBoundingClientRect().right > vw + 1;
      if (!parentEscapes) escaping.push(describe(el));
    }
    if ((style.overflowX === "auto" || style.overflowX === "scroll") && el.scrollWidth > el.clientWidth + 1) {
      const culprits = overflowCulprits(el).filter((c) => !isTabularOrPreformatted(c));
      if (culprits.length > 0) {
        scrollingLayout.push(
          `${describe(el)} scrollWidth=${el.scrollWidth} clientWidth=${el.clientWidth} ← ${culprits.slice(0, 2).map(describe).join(" | ")}`,
        );
      }
    }
    if (el.matches("button, a[href], [role=button], input:not([type=hidden]), select") && (r.width < 24 || r.height < 24)) {
      smallTargets.push(`${describe(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
  }
  return {
    pageOverflowPx: document.documentElement.scrollWidth - vw,
    escaping,
    scrollingLayout,
    smallTargets,
  };
}

const demos = demoIds();

for (const viewport of viewports) {
  test.describe(`responsive @ ${viewport.id} (${viewport.width}×${viewport.height})`, () => {
    test.describe.configure({ mode: "parallel" });
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const id of demos) {
      test(`${id} stays inside the viewport`, async ({ page }) => {
        await page.goto(`/?demo=${encodeURIComponent(id)}`, { waitUntil: "domcontentloaded" });
        await page.locator(`#demo-panel-${id}`).waitFor();
        // Streaming/polling demos never reach networkidle; one settle beat lets
        // ResizeObserver-driven layouts (FilterBar overflow, tables) finish.
        await page.waitForTimeout(400);
        const findings = await page.evaluate(measureLayout);

        mkdirSync(`${OUT_DIR}/${viewport.id}`, { recursive: true });
        writeFileSync(`${OUT_DIR}/${viewport.id}/${id}.json`, `${JSON.stringify(findings, null, 2)}\n`);
        if (screenshots) {
          await page.screenshot({ path: `${OUT_DIR}/${viewport.id}/${id}.png`, fullPage: true });
        }

        expect({
          pageOverflowPx: Math.max(0, findings.pageOverflowPx),
          escaping: findings.escaping,
          scrollingLayout: findings.scrollingLayout,
        }).toEqual({ pageOverflowPx: 0, escaping: [], scrollingLayout: [] });
      });
    }
  });
}

