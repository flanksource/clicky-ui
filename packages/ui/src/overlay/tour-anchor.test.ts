import { afterEach, describe, expect, it } from "vitest";
import { queryAnchor, resolveAnchor, resolveTourRoot } from "./tour-anchor";
import type { TourRoot } from "./tour-types";

const TIMEOUT = 200;
const cleanups: Array<() => void> = [];

afterEach(() => {
  while (cleanups.length) cleanups.pop()?.();
  document.body.innerHTML = "";
});

function mount(html: string): HTMLElement {
  const container = document.createElement("div");
  container.innerHTML = html;
  document.body.appendChild(container);
  cleanups.push(() => container.remove());
  return container;
}

function mountShadow(html: string): { host: HTMLElement; shadow: ShadowRoot } {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = html;
  cleanups.push(() => host.remove());
  return { host, shadow };
}

describe("resolveTourRoot", () => {
  it("passes a root through", () => {
    expect(resolveTourRoot(document)).toBe(document);
  });

  it("invokes a getter, and reports a not-yet-attached root as null", () => {
    expect(resolveTourRoot(() => document)).toBe(document);
    expect(resolveTourRoot(() => null)).toBeNull();
  });
});

describe("queryAnchor", () => {
  it("resolves a selector, an element, and a resolver", () => {
    const container = mount('<button data-tour="go">Go</button>');
    const button = container.querySelector("button")!;

    expect(queryAnchor(document, '[data-tour="go"]')).toBe(button);
    expect(queryAnchor(document, button)).toBe(button);
    expect(queryAnchor(document, (root) => root.querySelector<HTMLElement>("button"))).toBe(button);
  });

  it("throws when a resolver returns something unusable, rather than silently missing", () => {
    expect(() => queryAnchor(document, () => "#nope" as unknown as HTMLElement)).toThrow(
      /expected an HTMLElement/,
    );
  });

  it("returns null for a selector that matches nothing", () => {
    expect(queryAnchor(document, "#absent")).toBeNull();
  });
});

describe("resolveAnchor", () => {
  it("resolves an element that is already present", async () => {
    mount('<div data-tour="panel">Panel</div>');

    const result = await resolveAnchor({
      root: document,
      target: '[data-tour="panel"]',
      timeoutMs: TIMEOUT,
    });

    expect(result.status).toBe("found");
  });

  it("waits for an element that mounts later", async () => {
    const container = mount("<div></div>");
    setTimeout(() => {
      container.innerHTML = '<div data-tour="late">Late</div>';
    }, 20);

    const result = await resolveAnchor({
      root: document,
      target: '[data-tour="late"]',
      timeoutMs: 1000,
    });

    expect(result).toMatchObject({ status: "found" });
  });

  it("finds an anchor inside a shadow root, which document.querySelector cannot see", async () => {
    const { shadow } = mountShadow('<div data-tour="mock">Mock</div>');

    // The hard constraint: the same steps must run over a mocked UI mounted in a
    // shadow root. A `document`-scoped lookup finds nothing there.
    expect(document.querySelector('[data-tour="mock"]')).toBeNull();

    const result = await resolveAnchor({
      root: shadow as unknown as TourRoot,
      target: '[data-tour="mock"]',
      timeoutMs: TIMEOUT,
    });

    expect(result).toMatchObject({ status: "found" });
  });

  it("waits for a root that attaches after the step is entered", async () => {
    let shadow: ShadowRoot | null = null;
    setTimeout(() => {
      shadow = mountShadow('<div data-tour="deferred">Deferred</div>').shadow;
    }, 30);

    const result = await resolveAnchor({
      root: () => shadow,
      target: '[data-tour="deferred"]',
      timeoutMs: 1000,
    });

    expect(result).toMatchObject({ status: "found" });
  });

  it("times out when the anchor never appears", async () => {
    const result = await resolveAnchor({
      root: document,
      target: "#never",
      timeoutMs: 60,
    });

    expect(result).toEqual({ status: "timeout" });
  });

  it("ignores a hidden element until it is displayed", async () => {
    const container = mount('<div data-tour="collapsed" style="display: none">Hidden</div>');
    const element = container.querySelector<HTMLElement>('[data-tour="collapsed"]')!;
    setTimeout(() => {
      element.style.display = "block";
    }, 20);

    const result = await resolveAnchor({
      root: document,
      target: '[data-tour="collapsed"]',
      timeoutMs: 1000,
    });

    expect(result).toMatchObject({ status: "found" });
  });

  it("gives up immediately on an already-aborted signal", async () => {
    const controller = new AbortController();
    controller.abort();

    const result = await resolveAnchor({
      root: document,
      target: "#never",
      timeoutMs: 10_000,
      signal: controller.signal,
    });

    expect(result).toEqual({ status: "timeout" });
  });

  it("stops waiting when the step changes mid-flight", async () => {
    const controller = new AbortController();
    const pending = resolveAnchor({
      root: document,
      target: "#never",
      timeoutMs: 10_000,
      signal: controller.signal,
    });
    controller.abort();

    await expect(pending).resolves.toEqual({ status: "timeout" });
  });
});
