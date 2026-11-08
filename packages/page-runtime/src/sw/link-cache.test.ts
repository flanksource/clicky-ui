import { expect, it } from "vitest";
import { createLinkCache } from "./link-cache.ts";
import { memoryCaches } from "../link/testing-cache.ts";

it("reports storage on the first persistent read and memory on subsequent reads", async () => {
  const persistent = memoryCaches().open("links");
  const key = "https://runtime.example/cache/module";
  await (await persistent).put(key, new Response("module", { headers: { "x-link-source-bytes": "12" } }));
  const cache = createLinkCache(persistent);
  const first = await cache.match(key);
  const second = await cache.match(key);
  expect([first?.layer, second?.layer, await first?.response.text(), await second?.response.text()]).toEqual(["storage", "memory", "module", "module"]);
  await cache.delete(new Request(key));
  expect(await cache.match(key)).toBeUndefined();
});
