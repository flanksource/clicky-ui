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
  /**
   * HAR 1.2 custom field: a stable per-request id, identical on the pending and
   * completed snapshots of one request.
   */
  _id?: string;
  /**
   * HAR 1.2 custom field: the request is still in flight. `response` is empty
   * (status 0) and `time` is the elapsed ms when the snapshot was taken.
   */
  _pending?: boolean;
  /** HAR 1.2 custom field: the transport error of a request that got no response (status 0). */
  _error?: string;
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
