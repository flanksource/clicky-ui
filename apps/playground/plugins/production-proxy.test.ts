// @vitest-environment node
import { createServer, type Server } from "node:http";
import { expect, it } from "vitest";
import { productionMiddleware } from "./production-middleware";
import { productionProxy } from "./production-proxy";

async function listen(server: Server) {
  await new Promise<void>(done => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Proxy fixture has no address");
  return `http://127.0.0.1:${address.port}`;
}

async function close(server: Server) {
  server.closeAllConnections();
  await new Promise<void>((done, reject) => server.close(error => error ? reject(error) : done()));
}

it("forwards the API path, query, method, headers and request body without proxying adjacent routes", async () => {
  const upstream = createServer(async (request, response) => {
    const body: Buffer[] = [];
    for await (const chunk of request) body.push(Buffer.from(chunk));
    response.writeHead(201, { "Content-Type": "application/json", "X-Fixture": "upstream" });
    response.end(JSON.stringify({ url: request.url, method: request.method, tenant: request.headers["x-tenant"], body: Buffer.concat(body).toString() }));
  });
  const target = await listen(upstream);
  const app = productionMiddleware();
  app.middlewares.use(productionProxy({ prefix: "/oipa-api", target: `${target}/api` }));
  const origin = await listen(app.server);
  try {
    const response = await fetch(`${origin}/oipa-api/items?state=open`, { method: "POST", headers: { "X-Tenant": "example" }, body: "request payload" });
    expect({ status: response.status, upstream: response.headers.get("x-fixture"), result: await response.json() }).toEqual({ status: 201, upstream: "upstream", result: { url: "/api/items?state=open", method: "POST", tenant: "example", body: "request payload" } });
    expect((await fetch(`${origin}/oipa-api-adjacent/items`)).status).toBe(404);
  } finally {
    await close(app.server);
    await close(upstream);
  }
});

it("returns a contextual gateway error when the configured API is unavailable", async () => {
  const upstream = createServer();
  const target = await listen(upstream);
  await close(upstream);
  const app = productionMiddleware();
  app.middlewares.use(productionProxy({ prefix: "/oipa-api", target }));
  const origin = await listen(app.server);
  try {
    const response = await fetch(`${origin}/oipa-api/items`);
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: expect.stringContaining(`Proxy ${target}:`) });
  } finally {
    await close(app.server);
  }
});
