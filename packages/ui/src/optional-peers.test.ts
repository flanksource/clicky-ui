import { describe, expect, it, vi } from "vitest";

// ai and @ai-sdk/react are optional peers: an app that takes the router and
// operation forms from /rpc, or the gauges and tables from /data, and no
// chat, does not install them.
vi.mock("ai", () => {
  throw new Error("an entry without chat loaded the optional peer ai");
});
vi.mock("@ai-sdk/react", () => {
  throw new Error("an entry without chat loaded the optional peer @ai-sdk/react");
});

describe("the entries without chat", () => {
  it("load /rpc without the chat's optional peers, leaving ChatLayer to /chat", async () => {
    const rpc = await import("./rpc");

    expect(rpc.RouterProvider).toBeTypeOf("function");
    expect(rpc).not.toHaveProperty("ChatLayer");
  });

  it("load /data without the chat's optional peers", async () => {
    const data = await import("./data");

    expect(data.Gauge).toBeTypeOf("function");
  });
});
