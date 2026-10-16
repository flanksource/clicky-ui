/** A live reading of a running test process. */
export type ProcessMetrics = {
  pid?: number;
  cpu_percent?: number;
  rss?: number;
  vms?: number;
  open_files?: number;
  status?: string;
  command?: string;
};

/**
 * Reads the live metrics of a process by pid. Resolves with the reading, and
 * rejects with {@link ProcessNotFoundError} once the process no longer exists
 * (the poll then stops); any other rejection is shown and the poll continues.
 */
export type FetchProcessMetrics = (pid: number) => Promise<ProcessMetrics>;

/** The process a metrics fetch asked about does not exist (any more). */
export class ProcessNotFoundError extends Error {
  readonly pid: number;

  constructor(pid: number) {
    super(`process ${pid} not found`);
    this.name = "ProcessNotFoundError";
    this.pid = pid;
  }
}
