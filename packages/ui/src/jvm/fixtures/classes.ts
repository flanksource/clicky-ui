import type { JvmClassLoader, JvmClassRef, JvmClassSource, JvmCompilation, JvmLogger, JvmMetrics } from "../protocol/types";

export const APP_LOADER = "6d06d69c";

export const CLASS_LOADERS: JvmClassLoader[] = [
  { hash: APP_LOADER, label: "Order application", className: "jdk.internal.loader.ClassLoaders$AppClassLoader", classCount: 2841, kind: "application" },
  { hash: "7852e922", label: "Platform", className: "jdk.internal.loader.ClassLoaders$PlatformClassLoader", classCount: 412, kind: "platform" },
  { hash: "bootstrap", label: "Bootstrap", className: "bootstrap", classCount: 1670, kind: "bootstrap" },
];

export const CLASSES: JvmClassRef[] = [
  "com.example.orders.OrderService",
  "com.example.orders.OrderController",
  "com.example.orders.Inventory",
  "com.example.orders.Ledger",
  "com.example.orders.PriceCalculator",
  "com.example.orders.model.Order",
  "com.example.orders.model.LineItem",
  "com.example.payments.PaymentClient",
  "com.example.payments.PaymentClient$Retry",
].map((name) => ({ name, loader: APP_LOADER }));

export const PLATFORM_CLASSES: JvmClassRef[] = ["java.lang.Thread", "java.util.HashMap", "java.util.concurrent.ConcurrentHashMap"].map((name) => ({
  name,
  loader: "bootstrap",
}));

const ORDER_SERVICE_SOURCE = `package com.example.orders;

import com.example.orders.model.Order;

public class OrderService {
    private final Inventory inventory;
    private final PriceCalculator prices;

    public OrderService(Inventory inventory, PriceCalculator prices) {
        this.inventory = inventory;
        this.prices = prices;
    }

    public double checkout(String orderId) {
        Order order = Order.load(orderId);
        inventory.reserve(order);
        double total = prices.total(order);
        return total;
    }

    public void cancel(String orderId) {
        inventory.release(Order.load(orderId));
    }
}
`;

export function classSourceFixture(className: string, loader: string): JvmClassSource {
  const source =
    className === "com.example.orders.OrderService"
      ? ORDER_SERVICE_SOURCE
      : `package ${className.slice(0, className.lastIndexOf("."))};\n\npublic class ${className.slice(className.lastIndexOf(".") + 1).replaceAll("$", "_")} {\n    public String toString() {\n        return "${className}";\n    }\n}\n`;
  const lines = source.split("\n");
  const methods =
    className === "com.example.orders.OrderService"
      ? [
          { name: "<init>", descriptor: "(Lcom/example/orders/Inventory;Lcom/example/orders/PriceCalculator;)V", line: 9, endLine: 12 },
          { name: "checkout", descriptor: "(Ljava/lang/String;)D", line: 14, endLine: 19 },
          { name: "cancel", descriptor: "(Ljava/lang/String;)V", line: 21, endLine: 23 },
        ]
      : [{ name: "toString", descriptor: "()Ljava/lang/String;", line: 4, endLine: 6 }];
  return {
    class: className,
    loader,
    source,
    methods,
    sourceLineNumbers: lines.map((_, index) => (methods.some((method) => index + 1 > method.line && index + 1 < method.endLine) ? index + 3 : 0)),
    decompiler: "CFR 0.152",
    digest: `sha256:${className.length.toString(16).padStart(8, "0")}`,
  };
}

/** Compiles "successfully" unless the source still contains a `TODO compile error` marker or unbalanced braces. */
export function compileFixture(source: string): JvmCompilation {
  const open = source.split("{").length;
  const close = source.split("}").length;
  if (open !== close) return { success: false, diagnostics: [{ kind: "ERROR", line: source.split("\n").length, column: 1, message: "reached end of file while parsing" }] };
  const marker = source.split("\n").findIndex((line) => line.includes("TODO compile error"));
  if (marker >= 0) return { success: false, diagnostics: [{ kind: "ERROR", line: marker + 1, column: 9, message: "incompatible types: java.lang.String cannot be converted to double" }] };
  return { success: true, diagnostics: [{ kind: "WARNING", line: 1, column: 1, message: "[deprecation] Order.load(String) in Order has been deprecated" }] };
}

export const LOGGERS: JvmLogger[] = [
  { name: "", level: "INFO", parent: null },
  { name: "com.example", level: null, parent: "" },
  { name: "com.example.orders", level: "FINE", parent: "com.example" },
  { name: "com.example.orders.OrderService", level: null, parent: "com.example.orders" },
  { name: "com.example.payments", level: "WARNING", parent: "com.example" },
  { name: "org.apache.catalina", level: "INFO", parent: "" },
  { name: "org.apache.catalina.core.ContainerBase", level: null, parent: "org.apache.catalina" },
];

const MB = 1024 * 1024;

export const METRICS: JvmMetrics = {
  capturedAt: "2026-11-15T08:00:00Z",
  runtime: { javaVersion: "21.0.5", javaHome: "/usr/lib/jvm/java-21", osName: "Linux", osVersion: "6.8.0", processors: 8, systemLoadAverage: 2.4, uptime: 27 * 3600_000 + 14 * 60_000 },
  processCpuPercent: 37.5,
  memory: {
    heap: [
      { name: "G1 Eden Space", type: "HEAP", used: 182 * MB, committed: 256 * MB, max: -1 },
      { name: "G1 Old Gen", type: "HEAP", used: 611 * MB, committed: 768 * MB, max: 1024 * MB },
      { name: "G1 Survivor Space", type: "HEAP", used: 12 * MB, committed: 16 * MB, max: -1 },
    ],
    nonHeap: [
      { name: "Metaspace", type: "NON_HEAP", used: 148 * MB, committed: 152 * MB, max: -1 },
      { name: "CodeHeap 'non-profiled nmethods'", type: "NON_HEAP", used: 38 * MB, committed: 40 * MB, max: 117 * MB },
      { name: "Compressed Class Space", type: "NON_HEAP", used: 17 * MB, committed: 19 * MB, max: 1024 * MB },
    ],
    buffer: [
      { name: "direct", type: "BUFFER", used: 9 * MB, committed: 9 * MB, max: -1 },
      { name: "mapped", type: "BUFFER", used: 0, committed: 0, max: -1 },
    ],
  },
  garbageCollectors: [
    { name: "G1 Young Generation", collectionCount: 1842, collectionTime: 21_340 },
    { name: "G1 Concurrent GC", collectionCount: 96, collectionTime: 1_210 },
    { name: "G1 Old Generation", collectionCount: 2, collectionTime: 3_480 },
  ],
  connectors: [{ name: '"http-nio-8080"', objectName: 'Catalina:name="http-nio-8080",type=ThreadPool', currentThreadsBusy: 37, maxThreads: 200 }],
  dataSources: [{ name: "HikariPool-1", objectName: "com.zaxxer.hikari:type=Pool (HikariPool-1)", ActiveConnections: 8, IdleConnections: 2, TotalConnections: 10 }],
};

export const EVALUATION_GRAPH = {
  id: "result",
  label: "result",
  type: "com.example.orders.model.Order",
  children: [
    { id: "result.id", label: "id", type: "java.lang.String", value: "ORD-1042" },
    { id: "result.total", label: "total", type: "double", value: 129.5, path: ".total" },
    {
      id: "result.items",
      label: "items",
      type: "java.util.ArrayList",
      path: ".items",
      children: [
        {
          id: "result.items.0",
          label: "[0]",
          type: "com.example.orders.model.LineItem",
          children: [
            { id: "result.items.0.sku", label: "sku", type: "java.lang.String", value: "SKU-101" },
            { id: "result.items.0.quantity", label: "quantity", type: "int", value: 3 },
          ],
        },
      ],
    },
    { id: "result.notes", label: "notes", type: "java.lang.String", kind: "truncated", value: "Leave at the side door…", raw: "String character limit reached." },
  ],
};
