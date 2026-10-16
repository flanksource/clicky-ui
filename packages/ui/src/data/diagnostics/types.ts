export interface ProcessNode {
  pid: number;
  ppid?: number;
  name?: string;
  command?: string;
  status?: string;
  cpu_percent?: number;
  rss?: number;
  vms?: number;
  open_files?: number;
  is_root?: boolean;
  children?: ProcessNode[];
  stack_capture?: StackCapture;
}

export interface StackCapture {
  status: "ready" | "unsupported" | "error";
  supported?: boolean;
  text?: string;
  error?: string;
  collected_at?: string;
}

/** The test-runner run metadata; diagnostics shares it rather than keeping a duplicate. */
export type { RunMeta } from "../test-runner/types";
