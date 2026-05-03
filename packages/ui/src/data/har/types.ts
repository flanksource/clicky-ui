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
