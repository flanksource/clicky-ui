// @vitest-environment node
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

import { GavelOwnershipError, onDemandGavel, type GavelEndpoint } from "./gavel-launch-server";

const STUB = fileURLToPath(new URL("./testing/stub-gavel-launch.mjs", import.meta.url));
const WORKSPACE = fileURLToPath(new URL(".", import.meta.url)).replace(/\/$/, "");
const stubCommand = [process.execPath, STUB];

async function freeAddr() {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as AddressInfo;
  await new Promise((resolve) => server.close(resolve));
  return `127.0.0.1:${port}`;
}

const described = async (url: string) =>
  (await (await fetch(new URL("/api/launch?schema", url))).json()) as { args: string[]; cwd: string; pid: number };

describe("onDemandGavel", () => {
  const open: GavelEndpoint[] = [];
  const servers: Server[] = [];
  const endpoint = (options: Partial<Parameters<typeof onDemandGavel>[0]> & { addr: string }) => {
    const created = onDemandGavel({ workspace: WORKSPACE, command: stubCommand, readyTimeoutMs: 5000, log: () => undefined, ...options });
    open.push(created);
    return created;
  };

  afterEach(async () => {
    delete process.env.STUB_GAVEL_FAIL;
    await Promise.all(open.splice(0).map((created) => created.close()));
    await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
  });

  it("starts gavel launch serve over the workspace when nothing answers, once for concurrent callers", async () => {
    const addr = await freeAddr();
    const gavel = endpoint({ addr });
    const urls = await Promise.all([gavel.url(), gavel.url()]);
    const started = await described(urls[0]);
    expect({ urls, args: started.args, cwd: started.cwd, generation: gavel.generation }).toEqual({
      urls: [`http://${addr}`, `http://${addr}`],
      args: ["launch", "serve", "--root", WORKSPACE, "--local-root", WORKSPACE, "--addr", addr],
      cwd: WORKSPACE,
      generation: 1,
    });
  });

  it("reports its address without starting a server for connection checks", async () => {
    const addr = await freeAddr();
    const gavel = endpoint({ addr, command: ["/nonexistent/gavel"] });
    expect({ url: await gavel.url({ start: false }), generation: gavel.generation }).toEqual({ url: `http://${addr}`, generation: 0 });
  });

  it("reuses a launch server that already answers without starting one", async () => {
    const addr = await freeAddr();
    const [host, port] = addr.split(":");
    const running = createServer((_req, res) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify({ paths: { "/api/launch/linters": { get: {} }, "/api/launch/lint/filter": { post: {} }, "/api/launch/lint/ignore": { post: {} } } })); });
    servers.push(running);
    await new Promise<void>((resolve) => running.listen(Number(port), host, resolve));
    const gavel = endpoint({ addr, command: ["/nonexistent/gavel"] });
    expect({ url: await gavel.url(), generation: gavel.generation }).toEqual({ url: `http://${addr}`, generation: 0 });
  });

  it("fails with gavel's stderr when it exits before answering, and tries again on the next call", async () => {
    const addr = await freeAddr();
    const gavel = endpoint({ addr });
    process.env.STUB_GAVEL_FAIL = "listen tcp: bind: address already in use";
    await expect(gavel.url()).rejects.toThrow(/exited \(1\) before .* answered: listen tcp: bind: address already in use/);
    delete process.env.STUB_GAVEL_FAIL;
    await expect(gavel.url()).resolves.toBe(`http://${addr}`);
  });

  it("names the missing binary and PLAYGROUND_GAVEL_URL when gavel cannot be started", async () => {
    const gavel = endpoint({ addr: await freeAddr(), command: ["/nonexistent/gavel"] });
    await expect(gavel.url()).rejects.toThrow(/Cannot start \/nonexistent\/gavel: .*ENOENT.*PLAYGROUND_GAVEL_URL/);
  });

  it("rejects an incompatible existing server without starting or stopping it", async () => {
    const addr = await freeAddr();
    const [host, port] = addr.split(":");
    const running = createServer((_req, res) => { res.setHeader("Content-Type", "application/json"); res.end("{}"); });
    servers.push(running);
    await new Promise<void>(done => running.listen(Number(port), host, done));
    const gavel = endpoint({ addr, command: ["/nonexistent/gavel"] });
    await expect(gavel.url()).rejects.toThrow("is incompatible");
    expect(gavel.generation).toBe(0);
    expect(running.listening).toBe(true);
  });

  it("stops the server it started on close", async () => {
    const addr = await freeAddr();
    const gavel = endpoint({ addr });
    const { pid } = await described(await gavel.url());
    await gavel.close();
    expect(() => process.kill(pid, 0)).toThrow(/ESRCH/);
  });

  it("restarts the server it started as a new process and reports the new pid", async () => {
    const addr = await freeAddr();
    const gavel = endpoint({ addr });
    const first = await described(await gavel.url());
    expect(gavel.managed?.pid()).toBe(first.pid);
    const second = await described(await gavel.managed!.restart());
    expect({ replaced: second.pid !== first.pid, pid: gavel.managed?.pid(), generation: gavel.generation }).toEqual({ replaced: true, pid: second.pid, generation: 2 });
    expect(() => process.kill(first.pid, 0)).toThrow(/ESRCH/);
  });

  it("answers callers that arrive during a restart with the restarted server instead of starting another", async () => {
    const addr = await freeAddr();
    const gavel = endpoint({ addr });
    const first = await described(await gavel.url());
    const restarting = gavel.managed!.restart();
    expect(gavel.unreachable()).toBe(true);
    const [restarted, joined] = await Promise.all([restarting, gavel.url()]);
    const second = await described(joined);
    expect({ restarted, joined, replaced: second.pid !== first.pid, generation: gavel.generation }).toEqual({ restarted: `http://${addr}`, joined: `http://${addr}`, replaced: true, generation: 2 });
  });

  it("starts a server on restart when none is running", async () => {
    const addr = await freeAddr();
    const gavel = endpoint({ addr });
    expect(gavel.managed?.pid()).toBeUndefined();
    const started = await described(await gavel.managed!.restart());
    expect({ pid: gavel.managed?.pid(), generation: gavel.generation }).toEqual({ pid: started.pid, generation: 1 });
  });

  it("refuses to restart a server it did not start and leaves it running", async () => {
    const addr = await freeAddr();
    const [host, port] = addr.split(":");
    const running = createServer((_req, res) => { res.setHeader("Content-Type", "application/json"); res.end("{}"); });
    servers.push(running);
    await new Promise<void>(done => running.listen(Number(port), host, done));
    const gavel = endpoint({ addr, command: ["/nonexistent/gavel"] });
    await expect(gavel.managed!.restart()).rejects.toThrow(new GavelOwnershipError(`http://${addr}`));
    expect({ pid: gavel.managed?.pid(), generation: gavel.generation, listening: running.listening }).toEqual({ pid: undefined, generation: 0, listening: true });
  });

  it("starts a new server after the one it started dies, and reports it lost", async () => {
    const addr = await freeAddr();
    const gavel = endpoint({ addr });
    const first = await described(await gavel.url());
    process.kill(first.pid, "SIGKILL");
    await expect.poll(() => gavel.unreachable(), { timeout: 2000 }).toBe(true);
    const second = await described(await gavel.url());
    expect({ restarted: second.pid !== first.pid, generation: gavel.generation }).toEqual({ restarted: true, generation: 2 });
  });
});
