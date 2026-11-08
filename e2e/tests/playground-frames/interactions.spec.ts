import { spawn, execFile, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";
import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { test, expect } from "@playwright/test";

const execute = promisify(execFile);
const repository = fileURLToPath(new URL("../../../", import.meta.url));
const session = `playground-interactions-${process.pid}`;
const browser = async (...args: string[]) => (await execute("agent-browser", ["--engine", "chrome", "--allow-file-access", "--session", session, ...args], { timeout: 60000, maxBuffer: 2000000 })).stdout.trim();
let fixtureProcess: ChildProcess;
let fixture: { origin: string; root: string };
let launched = false;

async function clickNamed(name: string) {
  const snapshot = await browser("snapshot");
  const line = snapshot.split("\n").find(line => line.includes(`"${name}"`));
  const reference = line ? /\bref=([^,\]\s]+)/.exec(line)?.[1] : undefined;
  if (!reference) throw new Error(`No accessible target ${name}: ${snapshot}`);
  await browser("click", `@${reference}`);
}

async function ready() {
  await browser("wait", "--fn", 'document.querySelector("[data-testid=playground-frame-status]")?.textContent === "ready" || Boolean(document.querySelector("[aria-label=\\\"Page error\\\"]"))');
  const body = await browser("get", "text", "body");
  expect(body, body).not.toContain("This playground page failed");
  expect(await browser("get", "text", "[data-testid=playground-frame-status]")).toBe("ready");
}

async function inspectFrame() {
  const script = await readFile(new URL("./shape-center.js", import.meta.url), "utf8");
  return JSON.parse(await browser("eval", "--base64", Buffer.from(script).toString("base64"))) as { x: number; y: number; hostNavigation: number; frameNavigation: number; fill: string };
}

test.beforeAll(async () => {
  fixtureProcess = spawn("pnpm", ["--filter", "playground", "exec", "tsx", "../../e2e/tests/playground-frames/fixture-server.ts"], { cwd: repository, detached: true, stdio: ["ignore", "pipe", "pipe"] });
  fixture = await new Promise((done, reject) => {
    let output = "";
    let errors = "";
    const timer = setTimeout(() => reject(new Error(`Fixture startup timed out: ${errors}`)), 150000);
    fixtureProcess.stderr!.on("data", chunk => { errors += String(chunk); });
    fixtureProcess.stdout!.on("data", chunk => {
      output += String(chunk);
      const line = output.split("\n").find(line => line.startsWith('{"origin":'));
      if (line) { clearTimeout(timer); done(JSON.parse(line) as typeof fixture); }
    });
    fixtureProcess.once("error", reject);
    fixtureProcess.once("exit", code => { clearTimeout(timer); reject(new Error(`Fixture exited ${code}: ${errors}`)); });
  });
  await browser("set", "viewport", "1920", "1080"); launched = true;
}, 180000);
test.afterAll(async () => {
  if (launched) await browser("close");
  if (fixtureProcess?.pid) globalThis.process.kill(-fixtureProcess.pid, "SIGTERM");
});

test("a frame comment persists source and re-finds its pin after editing the isolated source", async () => {
  await browser("open", `${fixture.origin}/?page=frame-fixture`); launched = true;
  await ready();
  await browser("storage", "local", "set", "playground.page-reloads", "automatic");
  await browser("reload"); await ready();
  const before = await inspectFrame();
  await clickNamed("Comment on element");
  await clickNamed("Review action");
  await browser("find", "role", "textbox", "fill", "Check the frame action", "--name", "Add a comment…");
  await clickNamed("Post comment");
  await expect.poll(async () => (await (await fetch(`${fixture.origin}/__playground/comments?page=frame-fixture`)).json() as { comments: unknown[] }).comments.length).toBe(1);
  const payload = await (await fetch(`${fixture.origin}/__playground/comments?page=frame-fixture`)).json() as { comments: { element: { source: string; locators: unknown[] } }[] };
  expect(payload.comments[0]!.element.source).toMatch(/^frame-fixture\.tsx:\d+:\d+/);
  expect(payload.comments[0]!.element.locators.length).toBeGreaterThan(0);
  const file = resolve(fixture.root, "src/pages/frame-fixture.tsx");
  await writeFile(file, (await readFile(file, "utf8")).replace('<button id="action">', '<p>Inserted before</p><button id="action">'));
  await expect.poll(() => browser("snapshot"), { timeout: 30000 }).toContain("Inserted before"); await ready();
  const after = await inspectFrame();
  expect(after.hostNavigation).toBe(before.hostNavigation);
  expect(after.frameNavigation).toBeGreaterThan(before.frameNavigation);
  expect(await browser("get", "attr", 'iframe[title="Page: frame-fixture"]', "src")).toContain("/frame/");
  const snapshot = await browser("snapshot", "-i");
  expect(snapshot).toMatch(/Open 1 comments|moved/);
});

test("Design previews in the frame, writes the isolated page and reloads the frame", async () => {
  await test.step("Open the source frame", async () => { await browser("open", `${fixture.origin}/?page=frame-fixture`); launched = true; await ready(); });
  await test.step("Preview and write the shape", async () => {
    await clickNamed("Design");
    const point = await inspectFrame();
    await browser("mouse", "move", String(Math.round(point.x)), String(Math.round(point.y)));
    await browser("mouse", "down"); await browser("mouse", "up");
    await browser("wait", '[aria-label="Frame Design"]');
    await browser("find", "label", "fill", "fill", "blue", "--exact");
    await expect.poll(async () => (await inspectFrame()).fill).toBe("blue");
    expect(await readFile(resolve(fixture.root, "src/pages/frame-fixture.tsx"), "utf8")).toContain('fill="red"');
    await clickNamed("Save style");
    await expect.poll(() => readFile(resolve(fixture.root, "src/pages/frame-fixture.tsx"), "utf8")).toMatch(/fill=["']blue["']/);
    await ready();
    const after = await inspectFrame();
    expect(after.hostNavigation).toBe(point.hostNavigation);
    expect(after.frameNavigation).toBeGreaterThan(point.frameNavigation);
  });
});

test("the bookmarklet posts an external HTML selection and recovers its pin after a document edit", async () => {
  let edited = false;
  const external = createServer((_request, response) => response.writeHead(200, { "Content-Type": "text/html" }).end(`<html><body><h1>External fixture</h1>${edited ? "<p>Inserted before the action</p>" : ""}<button>External action</button><script src="${fixture.origin}/__playground/bookmarklet.js"></script></body></html>`));
  await new Promise<void>(done => external.listen(0, "127.0.0.1", done));
  try {
    const address = external.address();
    if (!address || typeof address === "string") throw new Error("External fixture has no address");
    const url = `http://127.0.0.1:${address.port}/`;
    await browser("open", url); launched = true;
    await expect.poll(() => browser("snapshot", "-i"), { timeout: 30000 }).toContain("Select element");
    await clickNamed("Select element");
    await clickNamed("External action");
    await expect.poll(() => browser("snapshot", "-i"), { timeout: 30000 }).toContain("Post comment");
    await expect.poll(() => browser("snapshot", "-i"), { timeout: 30000 }).toContain("textbox");
    const field = /textbox[^\n]*\[ref=([^\]]+)\]/.exec(await browser("snapshot", "-i"))?.[1];
    if (!field) throw new Error("External floating composer has no textbox reference");
    await browser("fill", `@${field}`, "Check the external action");
    await clickNamed("Post comment");
    const association = await (await fetch(`${fixture.origin}/__playground/external-pages?url=${encodeURIComponent(url)}`)).json() as { page: { id: string } };
    try {
      await expect.poll(async () => (await (await fetch(`${fixture.origin}/__playground/comments?page=${association.page.id}`)).json() as { comments: unknown[] }).comments.length).toBe(1);
    } catch (error) { throw new Error(`${String(error)}\n${await browser("snapshot", "-i")}`); }
    const payload = await (await fetch(`${fixture.origin}/__playground/comments?page=${association.page.id}`)).json() as { comments: { element: { source: string; locators: unknown[] } }[] };
    expect(payload.comments[0]!.element.source).toBe(url);
    expect(payload.comments[0]!.element.locators.length).toBeGreaterThan(0);
    edited = true;
    await browser("reload");
    await expect.poll(() => browser("snapshot", "-i"), { timeout: 30000 }).toContain("Open 1 comments");
  } finally { external.closeAllConnections(); await new Promise<void>((done, reject) => external.close(error => error ? reject(error) : done())); }
});

test("frame review decisions use the agent's source and persist in Gavel", async () => {
  await browser("open", `${fixture.origin}/?page=frame-fixture`); await ready();
  await clickNamed("Approve shape");
  const reviews = async () => (await (await fetch(`${fixture.origin}/__playground/comments?page=frame-fixture`)).json() as { comments: { reviewDecision?: string; element?: { source: string } }[] }).comments;
  await expect.poll(async () => (await reviews()).some(comment => comment.reviewDecision === "approved")).toBe(true);
  await ready();
  expect((await reviews()).find(comment => comment.reviewDecision === "approved")?.element?.source).toMatch(/^frame-fixture\.tsx:\d+:\d+/);
  await clickNamed("Reject shape");
  await browser("find", "label", "Comment", "fill", "Increase shape contrast", "--exact");
  await clickNamed("Save decision");
  await expect.poll(async () => (await reviews()).some(comment => comment.reviewDecision === "rejected")).toBe(true);
  await ready();
  for (const format of ["SVG", "PNG", "HTML"]) {
    await clickNamed("Export shape");
    const menu = await browser("snapshot");
    const target = new RegExp(`StaticText "COPY LINK"[\\s\\S]*?menuitem "${format}" \\[ref=([^\\]]+)\\]`).exec(menu)?.[1];
    if (!target) throw new Error(`Review export menu has no Copy link ${format} action: ${menu}`);
    await browser("click", `@${target}`);
    const exported = `${fixture.origin}/__playground/exports/frame-fixture-shape.${format.toLowerCase()}`;
    await expect.poll(async () => (await fetch(exported)).status).toBe(200);
    const response = await fetch(exported);
    if (format === "PNG") expect(new Uint8Array(await response.arrayBuffer()).slice(0, 8)).toEqual(new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]));
    else expect(await response.text()).toContain('<svg');
  }
});

test("the bookmarklet comments on a file document with canonical source provenance", async () => {
  const file = resolve(fixture.root, "external.html");
  await writeFile(file, `<html><body><h1>File fixture</h1><button>Local file action</button><script src="${fixture.origin}/__playground/bookmarklet.js"></script></body></html>`);
  const url = pathToFileURL(file).href;
  await browser("open", url);
  await expect.poll(() => browser("snapshot"), { timeout: 30000 }).toContain("Select element");
  await clickNamed("Select element"); await clickNamed("Local file action");
  await expect.poll(() => browser("snapshot", "-i"), { timeout: 30000 }).toContain("Post comment");
  const field = /textbox[^\n]*\[ref=([^\]]+)\]/.exec(await browser("snapshot", "-i"))?.[1];
  if (!field) throw new Error("File comment composer has no textbox");
  await browser("fill", `@${field}`, "Check the local document"); await clickNamed("Post comment");
  const association = await (await fetch(`${fixture.origin}/__playground/external-pages?url=${encodeURIComponent(url)}`)).json() as { page: { id: string } };
  const comments = async () => (await (await fetch(`${fixture.origin}/__playground/comments?page=${association.page.id}`)).json() as { comments: { element: { source: string } }[] }).comments;
  await expect.poll(async () => (await comments()).length).toBe(1);
  expect((await comments())[0]!.element.source).toBe(url);
});
