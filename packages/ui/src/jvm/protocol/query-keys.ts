import type { JvmClassQuery } from "./types";

/**
 * React Query keys for one JVM, identified by the host's opaque `scope`. Hosts
 * use the same keys to invalidate what a surface shows after their own writes.
 */
export function jvmKeys(scope: string) {
  const root = ["jvm", scope] as const;
  return {
    all: root,
    status: [...root, "status"] as const,
    mbeans: (pattern: string) => [...root, "mbeans", pattern] as const,
    mbean: (objectName: string) => [...root, "mbean", objectName] as const,
    mbeanValues: (objectName: string) => [...root, "mbean", objectName, "values"] as const,
    threads: [...root, "threads"] as const,
    threadStack: (id: number) => [...root, "threads", "stack", id] as const,
    classLoaders: [...root, "class-loaders"] as const,
    classes: (query: JvmClassQuery) => [...root, "classes", query] as const,
    /** Prefix of every decompiled source; invalidate it after a patch or restore. */
    classSources: [...root, "class-source"] as const,
    classSource: (className: string, loader: string | undefined) => [...root, "class-source", className, loader ?? ""] as const,
    patches: [...root, "patches"] as const,
    metrics: [...root, "metrics"] as const,
    loggers: [...root, "loggers"] as const,
  };
}
