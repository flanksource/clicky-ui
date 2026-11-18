import { readFileSync } from "node:fs";
import { expect, test, type FrameLocator, type Page } from "@playwright/test";

// Runs against the playground's `?form-extensions` route (apps/playground/src/form-extensions): PageForm with the shared
// fixture packages/ui/src/components/examples/form-extensions. The fixture schema declares its own module in
// `x-clicky-extensions` (a `ref` the demo serves through `files`); the host supplies only an inline-TSX extension that
// registers slots.NoMatches, so host and schema sources compose. Needs the built shell: `pnpm --filter playground playground:prod`
// once (or the build step of `playground:prod`), as for the other playground-frames specs.
test.use({ channel: "chrome", viewport: { width: 1920, height: 1080 }, baseURL: `http://127.0.0.1:${process.env.PLAYGROUND_FRAMES_PORT ?? "5276"}` });

const READY = 90_000;
let host: Page;
let form: FrameLocator;
const hostValue = async () => JSON.parse(await host.getByTestId("form-value").innerText()) as Record<string, unknown>;
const iframeHeight = () => host.locator('iframe[title="Form extensions"]').evaluate((frame) => Math.round(frame.getBoundingClientRect().height));
const rootHeight = () => host.locator('iframe[title="Form extensions"]').evaluate((frame) => Math.ceil((frame as HTMLIFrameElement).contentDocument!.getElementById("root")!.getBoundingClientRect().height));

test.beforeEach(async ({ page }) => {
  host = page;
  await page.goto("/?form-extensions");
  form = page.frameLocator('iframe[title="Form extensions"]');
  await expect(form.locator("[data-example-title]")).toHaveText("Service", { timeout: READY });
  await expect(page.getByRole("alert")).toHaveCount(0);
});

test("the fixture schema alone declares the extension module; the host passes only the inline source", async () => {
  const fixture = JSON.parse(readFileSync(new URL("../../../packages/ui/src/components/examples/form-extensions/schema.json", import.meta.url), "utf8")) as Record<string, unknown>;
  expect(fixture["x-clicky-extensions"]).toEqual([{ ref: "examples/form-extensions/extension.tsx" }]);
  await expect(host.getByTestId("host-sources")).toHaveText('["inline"]');
  await expect(form.locator("[data-example-cards]")).toBeVisible();
  await expect(form.locator("[data-example-color]").getByRole("radio")).toHaveCount(3);
  await expect(form.locator("[data-example-stepper]")).toBeVisible();
  await expect(form.locator("[data-inline-version]")).toHaveText("v1");
});

test("the whole form renders inside the frame with every extension point", async () => {
  await expect(host.locator("[data-example-title], [data-example-cards]")).toHaveCount(0);
  await expect(form.locator("[data-example-cards]")).toBeVisible();
  await expect(form.locator("[data-example-card]")).toHaveCount(5);
  await expect(form.locator("[data-example-chips=endpoints]")).toBeVisible();
  await expect(form.locator("[data-example-color]").getByRole("radio")).toHaveCount(3);
  await expect(form.locator("[data-example-stepper]")).toBeVisible();
  await expect(form.locator("[data-example-color-mark]")).toHaveCount(1);
  await expect(form.getByText("id", { exact: true })).toBeVisible();
  await expect(form.getByRole("combobox", { name: /^Owner/ })).toHaveValue("Ada Lovelace");
  await expect(form.getByRole("textbox", { name: /^Name/ })).toHaveValue("checkout-api");
});

test("typing in the custom controls reaches the host's onChange", async () => {
  await form.getByRole("button", { name: "Increase" }).click({ clickCount: 2 });
  await form.getByRole("radio", { name: "#22c55e" }).click();
  await form.getByRole("textbox", { name: /^Name/ }).fill("payments-api");
  await expect.poll(hostValue).toMatchObject({ replicas: 5, color: "#22c55e", name: "payments-api", owner: "ada" });
  await expect(form.getByRole("textbox", { name: /^Name/ })).toHaveValue("payments-api");
  await expect(form.getByRole("radio", { name: "#22c55e" })).toBeChecked();
});

test("the iframe height follows the form content as the host changes the schema", async () => {
  await expect.poll(async () => Math.abs((await iframeHeight()) - (await rootHeight()))).toBeLessThanOrEqual(1);
  const before = await iframeHeight();
  expect(before).toBeGreaterThan(400);
  await host.getByRole("button", { name: "Hide notes" }).click();
  await expect(form.locator("[data-example-card=notes]")).toHaveCount(0);
  await expect.poll(iframeHeight).toBeLessThan(before - 100);
  await expect.poll(async () => Math.abs((await iframeHeight()) - (await rootHeight()))).toBeLessThanOrEqual(1);
  await host.getByRole("button", { name: "Show notes" }).click();
  await expect.poll(iframeHeight).toBeGreaterThanOrEqual(before - 1);
});

test("a changed inline extension is applied to the live frame without remounting the iframe", async () => {
  await expect(form.locator("[data-inline-version]")).toHaveText("v1");
  await host.locator('iframe[title="Form extensions"]').evaluate((frame) => { (frame as HTMLIFrameElement & { kept?: string }).kept = "same element"; });
  const navigation = await form.locator("html").evaluate(() => performance.timeOrigin);
  await form.getByRole("textbox", { name: /^Name/ }).fill("kept-while-editing-source");
  await host.getByRole("button", { name: "Update inline extension" }).click();
  await expect(form.locator("[data-inline-version]")).toHaveText("v2", { timeout: 30_000 });
  expect(await host.locator('iframe[title="Form extensions"]').evaluate((frame) => (frame as HTMLIFrameElement & { kept?: string }).kept)).toBe("same element");
  expect(await form.locator("html").evaluate(() => performance.timeOrigin)).toBe(navigation);
  await expect(form.getByRole("textbox", { name: /^Name/ })).toHaveValue("kept-while-editing-source");
  await expect(host.getByRole("alert")).toHaveCount(0);
});
