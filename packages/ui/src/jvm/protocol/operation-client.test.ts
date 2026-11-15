import { describe, expect, it, vi } from "vitest";
import { jvmOperationClient, type JvmOperationCall } from "./operation-client";

function clientReturning(result: unknown) {
  const call = vi.fn<JvmOperationCall>().mockResolvedValue(result);
  return { call, client: jvmOperationClient(call) };
}

describe("jvmOperationClient", () => {
  it("sends reads without mutation and writes with mutation", async () => {
    const { call, client } = clientReturning({ applied: true });
    await client.writeMBeanAttribute({ objectName: "acme:type=Cache", attribute: "Size", value: "10" });
    await client.invokeMBean({ objectName: "java.lang:type=Memory", operation: "gc", signature: [], args: [] });
    call.mockResolvedValueOnce(["java.lang:type=Memory"]);
    await client.searchMBeans("java.lang:*");
    expect(call.mock.calls).toEqual([
      ["jvm.jmx.write", { objectName: "acme:type=Cache", attribute: "Size", value: "10" }, { allowMutation: true }],
      ["jvm.jmx.invoke", { objectName: "java.lang:type=Memory", operation: "gc", signature: [], args: [] }, { allowMutation: true }],
      ["jvm.jmx.search", { pattern: "java.lang:*" }, { allowMutation: false, signal: undefined }],
    ]);
  });

  it("unwraps the attribute list from jvm.jmx.read", async () => {
    const { client } = clientReturning({ objectName: "acme:type=Cache", attributes: [{ name: "Size", value: 3 }] });
    expect(await client.readMBeanAttributes("acme:type=Cache")).toEqual([{ name: "Size", value: 3 }]);
  });

  it("defaults missing notifications on jvm.jmx.info", async () => {
    const { client } = clientReturning({ objectName: "acme:type=Cache", className: "Cache", attributes: [], operations: [] });
    expect(await client.mbeanInfo("acme:type=Cache")).toEqual({
      objectName: "acme:type=Cache",
      className: "Cache",
      attributes: [],
      operations: [],
      notifications: [],
    });
  });

  it("keeps only the known status fields", async () => {
    const { client } = clientReturning({ allowMutation: false, instrumentation: true, observers: {} });
    expect(await client.status()).toEqual({ allowMutation: false, instrumentation: true });
  });

  it("omits unset optional params and flags code, patch, restore and logging calls as mutations", async () => {
    const { call, client } = clientReturning({ success: true, diagnostics: [], classes: [], total: 0, offset: 0, limit: 50 });
    await client.classes({ query: "Order", loader: undefined, limit: 50 });
    await client.compileClass({ class: "com.example.A", source: "class A {}" });
    await client.patchClass({ class: "com.example.A", loader: "6d06d69c", source: "class A {}", leaseSeconds: 120 });
    await client.restoreClass({ class: "com.example.A", loader: "6d06d69c" });
    await client.setLoggerLevel({ name: "com.example", level: null });
    await client.evaluateOgnl({ expression: "@java.lang.System@getProperties()" });
    expect(call.mock.calls.map(([operation, params, options]) => [operation, params, options.allowMutation])).toEqual([
      ["jvm.classes", { query: "Order", limit: 50 }, false],
      ["jvm.classes.compile", { class: "com.example.A", source: "class A {}" }, false],
      ["jvm.classes.patch", { class: "com.example.A", loader: "6d06d69c", source: "class A {}", leaseSeconds: 120 }, true],
      ["jvm.classes.restore", { class: "com.example.A", loader: "6d06d69c" }, true],
      ["jvm.logging.set", { name: "com.example", level: null }, true],
      ["jvm.ognl.eval", { expression: "@java.lang.System@getProperties()" }, true],
    ]);
  });

  it("returns the thread dump text and the base64 bytecode", async () => {
    expect(await clientReturning("Full thread dump").client.threadDump()).toBe("Full thread dump");
    expect(await clientReturning({ bytecode: "yv66vg==" }).client.classBytecode({ class: "com.example.A" })).toBe("yv66vg==");
  });

  it("defaults optional metric and source collections", async () => {
    const metrics = await clientReturning({ capturedAt: "t", runtime: {}, memory: { heap: [], nonHeap: [], buffer: [] }, processCpuPercent: null }).client.metrics();
    expect([metrics.garbageCollectors, metrics.connectors, metrics.dataSources]).toEqual([[], [], []]);
    const source = await clientReturning({ class: "A", loader: "l", source: "", methods: [], decompiler: "CFR", digest: "d" }).client.classSource({ class: "A" });
    expect(source.sourceLineNumbers).toEqual([]);
  });

  it.each([
    ["status", () => clientReturning({}).client.status(), "jvm.status: expected allowMutation to be a boolean"],
    ["threads", () => clientReturning({ sampledMs: 200 }).client.threads({ sampleMs: 200 }), "jvm.threads: expected threads to be an array"],
    ["dump", () => clientReturning({ text: "x" }).client.threadDump(), "jvm.threads.dump: expected a string"],
    ["compile", () => clientReturning({ diagnostics: [] }).client.compileClass({ class: "A", source: "" }), "jvm.classes.compile: expected success to be a boolean"],
    ["loaders", () => clientReturning({}).client.classLoaders(), "jvm.loaders: expected result to be an array"],
    ["search", () => clientReturning([1]).client.searchMBeans(""), "jvm.jmx.search: expected ObjectName strings"],
    ["info", () => clientReturning({ attributes: [] }).client.mbeanInfo("a:b=c"), "jvm.jmx.info: expected operations to be an array"],
    ["read", () => clientReturning(null).client.readMBeanAttributes("a:b=c"), "jvm.jmx.read: expected an object, received null"],
  ])("rejects a malformed %s response", async (_name, run, message) => {
    await expect(run()).rejects.toThrow(message);
  });
});
