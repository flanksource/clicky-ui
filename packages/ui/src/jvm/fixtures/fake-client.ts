import type { JvmDiagnosticsClient } from "../protocol/client";
import type { JvmLogger, JvmPatch, JvmStatus, MBeanAttributeValue } from "../protocol/types";
import { APP_LOADER, CLASS_LOADERS, CLASSES, EVALUATION_GRAPH, LOGGERS, METRICS, PLATFORM_CLASSES, classSourceFixture, compileFixture } from "./classes";
import { CACHE_MBEAN, CACHE_VALUES, MBEAN_NAMES, genericMBeanInfo } from "./mbeans";
import { THREADS_SNAPSHOT, threadDumpFixture, threadStackFixture } from "./threads";

export type FakeJvmCall = { method: keyof JvmDiagnosticsClient; request?: unknown };

export type FakeJvmClient = JvmDiagnosticsClient & {
  /** Every mutating call, in order, for assertions and request logs. */
  mutations: FakeJvmCall[];
  writes: Array<{ objectName: string; attribute: string; value: unknown }>;
  invocations: Array<{ objectName: string; operation: string; args: unknown[] }>;
};

export type FakeJvmOptions = {
  status?: JvmStatus;
  names?: string[];
  /** Start with OrderService patched under a 2-minute lease. Default true. */
  patched?: boolean;
};

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 30));
}

/**
 * An in-memory JVM for stories, tests and playgrounds. Mutations change what
 * later reads return (attribute values, logger levels, patches). Every mutation
 * is refused when `status.allowMutation` is false, as a real agent would.
 */
export function fakeJvmClient({ status = { allowMutation: true }, names = MBEAN_NAMES, patched = true }: FakeJvmOptions = {}): FakeJvmClient {
  const values = new Map<string, MBeanAttributeValue[]>([[CACHE_MBEAN.objectName, CACHE_VALUES.map((entry) => ({ ...entry }))]]);
  const loggers: JvmLogger[] = LOGGERS.map((logger) => ({ ...logger }));
  const patches = new Map<string, JvmPatch>(
    patched
      ? [[`${APP_LOADER}:com.example.orders.OrderService`, { class: "com.example.orders.OrderService", loader: APP_LOADER, patched: true, leaseExpiresAt: Date.now() + 120_000 }]]
      : [],
  );
  const mutate = (method: keyof JvmDiagnosticsClient, request?: unknown) => {
    if (!status.allowMutation) throw new Error(`mutation disabled for ${method}`);
    client.mutations.push({ method, request });
  };

  const client: FakeJvmClient = {
    mutations: [],
    writes: [],
    invocations: [],
    status: () => delay(status),

    searchMBeans: () => delay(names),
    mbeanInfo: async (objectName) => {
      if (!names.includes(objectName)) throw new Error(`javax.management.InstanceNotFoundException: ${objectName}`);
      return delay(objectName === CACHE_MBEAN.objectName ? CACHE_MBEAN : genericMBeanInfo(objectName));
    },
    readMBeanAttributes: (objectName) => delay(values.get(objectName) ?? [{ name: "Uptime", value: 90_000 }]),
    writeMBeanAttribute: async (request) => {
      mutate("writeMBeanAttribute", request);
      client.writes.push(request);
      const current = values.get(request.objectName) ?? [];
      values.set(request.objectName, [...current.filter((entry) => entry.name !== request.attribute), { name: request.attribute, value: request.value }]);
    },
    invokeMBean: async (request) => {
      mutate("invokeMBean", request);
      client.invocations.push({ objectName: request.objectName, operation: request.operation, args: request.args });
      return delay(request.operation === "lookup" ? `order ${String(request.args[0])}` : null);
    },

    threads: () => delay(THREADS_SNAPSHOT),
    threadStack: async (id) => delay(threadStackFixture(id)),
    threadDump: () => delay(threadDumpFixture()),

    classLoaders: () => delay(CLASS_LOADERS),
    classes: async ({ query = "", loader, limit = 100, offset = 0, includePlatform = false }) => {
      const matches = [...CLASSES, ...(includePlatform ? PLATFORM_CLASSES : [])].filter(
        (entry) => entry.name.toLowerCase().includes(query.toLowerCase()) && (!loader || entry.loader === loader),
      );
      return delay({ total: matches.length, offset, limit, classes: matches.slice(offset, offset + limit) });
    },
    classSource: async (target) => {
      const known = [...CLASSES, ...PLATFORM_CLASSES].find((entry) => entry.name === target.class && (!target.loader || entry.loader === target.loader));
      if (!known) throw new Error(`java.lang.ClassNotFoundException: ${target.class}`);
      return delay(classSourceFixture(known.name, known.loader));
    },
    classBytecode: () => delay("yv66vgAAAEEAEQ=="),
    compileClass: async (request) => delay(compileFixture(request.source)),
    patchClass: async (request) => {
      mutate("patchClass", request);
      const result = compileFixture(request.source);
      if (!result.success) return delay(result);
      const loader = request.loader ?? APP_LOADER;
      patches.set(`${loader}:${request.class}`, { class: request.class, loader, patched: true, leaseExpiresAt: Date.now() + request.leaseSeconds * 1000 });
      return delay({ ...result, applied: true });
    },
    restoreClass: async (target) => {
      mutate("restoreClass", target);
      patches.delete(`${target.loader ?? APP_LOADER}:${target.class}`);
    },
    renewClassLease: async (target) => {
      mutate("renewClassLease", target);
      const patch = patches.get(`${target.loader ?? APP_LOADER}:${target.class}`);
      if (!patch) throw new Error(`${target.class} is not patched`);
      patch.leaseExpiresAt = Date.now() + target.seconds * 1000;
    },
    patches: () => delay([...patches.values()].map((patch) => ({ ...patch }))),

    metrics: () => delay({ ...METRICS, capturedAt: new Date().toISOString() }),

    loggers: () => delay(loggers.map((logger) => ({ ...logger }))),
    setLoggerLevel: async (request) => {
      mutate("setLoggerLevel", request);
      const logger = loggers.find((candidate) => candidate.name === request.name);
      if (!logger) throw new Error(`Unknown logger ${request.name}`);
      logger.level = request.level;
    },

    evaluateOgnl: async (request) => {
      mutate("evaluateOgnl", request);
      if (request.expression.includes("@java.lang.System@getProperties"))
        return delay({ value: { "java.version": "21.0.5", "os.name": "Linux", "user.timezone": "UTC" } });
      if (request.expression.includes("throw")) throw new Error("ognl.OgnlException: source is null for getProperty(null, \"throw\")");
      return delay({ value: { id: "ORD-1042", total: 129.5 }, graph: EVALUATION_GRAPH });
    },
    evaluateGroovy: async (request) => {
      mutate("evaluateGroovy", request);
      return delay({ value: 7, graph: EVALUATION_GRAPH, stdout: "Inspecting order ORD-1042\n3 line items\n", stderr: "", elapsedMs: 18 });
    },
  };
  return client;
}
