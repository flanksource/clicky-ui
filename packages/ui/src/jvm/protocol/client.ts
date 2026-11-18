import type {
  JvmClassLoader,
  JvmClassPage,
  JvmClassQuery,
  JvmClassSource,
  JvmClassTarget,
  JvmCompilation,
  JvmCompileRequest,
  JvmEvaluation,
  JvmGroovyRequest,
  JvmLogger,
  JvmMetrics,
  JvmOgnlRequest,
  JvmPatch,
  JvmPatchRequest,
  JvmStatus,
  JvmThreadStack,
  JvmThreadsSnapshot,
  MBeanAttributeValue,
  MBeanInfo,
  MBeanInvokeRequest,
  MBeanWriteRequest,
} from "./types";

export type JvmRequestOptions = { signal?: AbortSignal | undefined };

/**
 * The data port every JVM surface talks through. A host implements it once
 * against its own transport: `jvmOperationClient` covers agents that speak the
 * `jvm.*` operation protocol; a REST backend writes an adapter.
 *
 * Mutating methods are only called after the operator has passed the
 * `MutationGate`, so an implementation can send them with mutation allowed.
 */
export interface JvmDiagnosticsClient {
  status(options?: JvmRequestOptions): Promise<JvmStatus>;

  /** Canonical ObjectNames matching a JMX pattern; `""` matches every MBean. */
  searchMBeans(pattern: string, options?: JvmRequestOptions): Promise<string[]>;
  mbeanInfo(objectName: string, options?: JvmRequestOptions): Promise<MBeanInfo>;
  /** Values of every readable attribute. A failed read is omitted, not nulled. */
  readMBeanAttributes(objectName: string, options?: JvmRequestOptions): Promise<MBeanAttributeValue[]>;
  writeMBeanAttribute(request: MBeanWriteRequest): Promise<void>;
  invokeMBean(request: MBeanInvokeRequest): Promise<unknown>;

  /** Every live thread with CPU measured over `sampleMs`. */
  threads(request: { sampleMs: number }, options?: JvmRequestOptions): Promise<JvmThreadsSnapshot>;
  /** Rejects when the thread has ended. */
  threadStack(id: number, options?: JvmRequestOptions): Promise<JvmThreadStack>;
  /** The whole JVM's thread dump in jstack format. */
  threadDump(options?: JvmRequestOptions): Promise<string>;

  classLoaders(options?: JvmRequestOptions): Promise<JvmClassLoader[]>;
  classes(query: JvmClassQuery, options?: JvmRequestOptions): Promise<JvmClassPage>;
  classSource(target: JvmClassTarget, options?: JvmRequestOptions): Promise<JvmClassSource>;
  /** The loaded class file, base64 encoded. */
  classBytecode(target: JvmClassTarget, options?: JvmRequestOptions): Promise<string>;
  /** Compiles replacement source without applying it. */
  compileClass(request: JvmCompileRequest): Promise<JvmCompilation>;
  /** Compiles and redefines the class under a restore lease. */
  patchClass(request: JvmPatchRequest): Promise<JvmCompilation>;
  restoreClass(target: JvmClassTarget): Promise<void>;
  renewClassLease(target: JvmClassTarget & { seconds: number }): Promise<void>;
  patches(options?: JvmRequestOptions): Promise<JvmPatch[]>;

  metrics(options?: JvmRequestOptions): Promise<JvmMetrics>;

  loggers(options?: JvmRequestOptions): Promise<JvmLogger[]>;
  /** `level: null` inherits the parent's level. */
  setLoggerLevel(request: { name: string; level: string | null }): Promise<void>;

  /** Evaluations can call arbitrary code, so they are mutations. */
  evaluateOgnl(request: JvmOgnlRequest): Promise<JvmEvaluation>;
  evaluateGroovy(request: JvmGroovyRequest): Promise<JvmEvaluation>;
}
