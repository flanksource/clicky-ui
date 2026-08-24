export interface HARHeader {
  name: string;
  value: string;
}

export interface HARPostData {
  mimeType: string;
  text: string;
}

export interface HARContent {
  size: number;
  mimeType?: string;
  text?: string;
  truncated?: boolean;
}

export interface HARRequest {
  method: string;
  url: string;
  httpVersion?: string;
  headers?: HARHeader[];
  queryString?: HARHeader[];
  postData?: HARPostData;
  headersSize?: number;
  bodySize?: number;
}

export interface HARResponse {
  status: number;
  statusText?: string;
  httpVersion?: string;
  headers?: HARHeader[];
  content?: HARContent;
  redirectURL?: string;
  headersSize?: number;
  bodySize: number;
}

export interface HAREntry extends Record<string, unknown> {
  startedDateTime?: string;
  time: number;
  request: HARRequest;
  response: HARResponse;
  cache?: unknown;
  timings?: { send?: number; wait?: number; receive?: number };
}

export interface HARCreator {
  name: string;
  version: string;
}

export interface HARLog {
  version: string;
  creator: HARCreator;
  pages?: unknown[];
  entries: HAREntry[];
}

/**
 * A whole HAR 1.2 document — the envelope `HAREntry[]` arrives in, and the shape
 * a file has to be in for Chrome devtools to import it. Panels take entries;
 * anything that saves or loads a capture takes this.
 */
export interface HARFile {
  log: HARLog;
}
