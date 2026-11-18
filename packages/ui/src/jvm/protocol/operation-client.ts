import type { JvmDiagnosticsClient } from "./client";
import type {
  JvmClassLoader,
  JvmClassPage,
  JvmClassSource,
  JvmCompilation,
  JvmEvaluation,
  JvmLogger,
  JvmMetrics,
  JvmPatch,
  JvmStatus,
  JvmThreadStack,
  JvmThreadsSnapshot,
  MBeanAttributeValue,
  MBeanInfo,
} from "./types";

export type JvmOperationCallOptions = {
  /** The call changes the JVM; the agent refuses it unless this is set. */
  allowMutation: boolean;
  signal?: AbortSignal | undefined;
};

/** Sends one `jvm.*` operation to an agent and resolves to its JSON result. */
export type JvmOperationCall = (
  operation: string,
  params: Record<string, unknown>,
  options: JvmOperationCallOptions,
) => Promise<unknown>;

function record(operation: string, value: unknown): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${operation}: expected an object, received ${JSON.stringify(value)}`);
  }
  return value as Record<string, unknown>;
}

function array(operation: string, field: string, value: unknown): unknown[] {
  if (!Array.isArray(value)) throw new Error(`${operation}: expected ${field} to be an array`);
  return value;
}

/** Copies only the keys that are set, so optional params are omitted rather than sent as undefined. */
function defined(params: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined));
}

/** A `JvmDiagnosticsClient` over the agent's `jvm.*` operation catalog. */
export function jvmOperationClient(call: JvmOperationCall): JvmDiagnosticsClient {
  const read = (operation: string, params: Record<string, unknown>, signal?: AbortSignal) =>
    call(operation, defined(params), { allowMutation: false, signal });
  const mutate = (operation: string, params: Record<string, unknown>) =>
    call(operation, defined(params), { allowMutation: true });
  const object = async (operation: string, params: Record<string, unknown>, signal?: AbortSignal) =>
    record(operation, await read(operation, params, signal));
  const list = async (operation: string, params: Record<string, unknown>, signal?: AbortSignal) =>
    array(operation, "result", await read(operation, params, signal));

  return {
    async status(options) {
      const value = await object("jvm.status", {}, options?.signal);
      if (typeof value.allowMutation !== "boolean") throw new Error("jvm.status: expected allowMutation to be a boolean");
      const status: JvmStatus = { allowMutation: value.allowMutation };
      if (typeof value.instrumentation === "boolean") status.instrumentation = value.instrumentation;
      return status;
    },

    async searchMBeans(pattern, options) {
      const names = await list("jvm.jmx.search", { pattern }, options?.signal);
      if (names.some((name) => typeof name !== "string")) throw new Error("jvm.jmx.search: expected ObjectName strings");
      return names as string[];
    },
    async mbeanInfo(objectName, options) {
      const value = await object("jvm.jmx.info", { objectName }, options?.signal);
      array("jvm.jmx.info", "attributes", value.attributes);
      array("jvm.jmx.info", "operations", value.operations);
      return { ...value, notifications: value.notifications ?? [] } as MBeanInfo;
    },
    async readMBeanAttributes(objectName, options) {
      const value = await object("jvm.jmx.read", { objectName }, options?.signal);
      return array("jvm.jmx.read", "attributes", value.attributes) as MBeanAttributeValue[];
    },
    async writeMBeanAttribute({ objectName, attribute, value }) {
      await mutate("jvm.jmx.write", { objectName, attribute, value });
    },
    invokeMBean({ objectName, operation, signature, args }) {
      return mutate("jvm.jmx.invoke", { objectName, operation, signature, args });
    },

    async threads({ sampleMs }, options) {
      const value = await object("jvm.threads", { sampleMs }, options?.signal);
      array("jvm.threads", "threads", value.threads);
      array("jvm.threads", "deadlocked", value.deadlocked ?? []);
      return { ...value, deadlocked: value.deadlocked ?? [] } as JvmThreadsSnapshot;
    },
    async threadStack(id, options) {
      const value = await object("jvm.threads.stack", { id }, options?.signal);
      if (typeof value.text !== "string") throw new Error("jvm.threads.stack: expected text to be a string");
      array("jvm.threads.stack", "frames", value.frames);
      return value as unknown as JvmThreadStack;
    },
    async threadDump(options) {
      const value = await read("jvm.threads.dump", {}, options?.signal);
      if (typeof value !== "string") throw new Error("jvm.threads.dump: expected a string");
      return value;
    },

    async classLoaders(options) {
      return (await list("jvm.loaders", {}, options?.signal)) as JvmClassLoader[];
    },
    async classes(query, options) {
      const value = await object("jvm.classes", { ...query }, options?.signal);
      array("jvm.classes", "classes", value.classes);
      return value as unknown as JvmClassPage;
    },
    async classSource(target, options) {
      const value = await object("jvm.classes.source", { ...target }, options?.signal);
      if (typeof value.source !== "string") throw new Error("jvm.classes.source: expected source to be a string");
      array("jvm.classes.source", "methods", value.methods);
      return { ...value, sourceLineNumbers: value.sourceLineNumbers ?? [] } as JvmClassSource;
    },
    async classBytecode(target, options) {
      const value = await object("jvm.classes.bytecode", { ...target }, options?.signal);
      if (typeof value.bytecode !== "string") throw new Error("jvm.classes.bytecode: expected base64 bytecode");
      return value.bytecode;
    },
    async compileClass(request) {
      const value = await object("jvm.classes.compile", { ...request });
      if (typeof value.success !== "boolean") throw new Error("jvm.classes.compile: expected success to be a boolean");
      array("jvm.classes.compile", "diagnostics", value.diagnostics);
      return value as unknown as JvmCompilation;
    },
    async patchClass(request) {
      const value = record("jvm.classes.patch", await mutate("jvm.classes.patch", { ...request }));
      if (typeof value.success !== "boolean") throw new Error("jvm.classes.patch: expected success to be a boolean");
      return { ...value, diagnostics: value.diagnostics ?? [] } as JvmCompilation;
    },
    async restoreClass(target) {
      await mutate("jvm.classes.restore", { ...target });
    },
    async renewClassLease(target) {
      await mutate("jvm.classes.lease", { ...target });
    },
    async patches(options) {
      return (await list("jvm.classes.patches", {}, options?.signal)) as JvmPatch[];
    },

    async metrics(options) {
      const value = await object("jvm.metrics", {}, options?.signal);
      record("jvm.metrics", value.runtime);
      record("jvm.metrics", value.memory);
      return {
        ...value,
        garbageCollectors: value.garbageCollectors ?? [],
        connectors: value.connectors ?? [],
        dataSources: value.dataSources ?? [],
      } as JvmMetrics;
    },

    async loggers(options) {
      return (await list("jvm.logging.list", {}, options?.signal)) as JvmLogger[];
    },
    async setLoggerLevel({ name, level }) {
      await mutate("jvm.logging.set", { name, level });
    },

    async evaluateOgnl(request) {
      return record("jvm.ognl.eval", await mutate("jvm.ognl.eval", { ...request })) as JvmEvaluation;
    },
    async evaluateGroovy(request) {
      return record("jvm.groovy.eval", await mutate("jvm.groovy.eval", { ...request })) as JvmEvaluation;
    },
  };
}
