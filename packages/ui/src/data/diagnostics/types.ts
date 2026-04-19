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

export interface RunMeta {
  version?: string;
  sequence: number;
  kind?: "initial" | "rerun" | string;
  started?: string;
  ended?: string;
  args?: Record<string, unknown>;
}
