// Wire types for clicky's generic cache-browser API
// (github.com/flanksource/clicky/cache). Field names match the Go JSON tags
// exactly.

/** One entry in a tree level: a prefix group or a leaf key. */
export type CacheTreeNode = {
  /** Display segment: the next path segment for groups, the key tail for leaves. */
  name: string;
  /** Group nodes only: full logical prefix including the trailing separator. */
  prefix?: string;
  /** Leaf nodes only: the full logical key. */
  key?: string;
  /** Total keys under this node (1 for a leaf). */
  keys: number;
  /** Group nodes: number of distinct child segments. */
  children?: number;
  /** Leaf value type: string | hash | list | set | zset | stream. */
  type?: string;
  /** Leaf TTL in seconds; -1 means no expiry. */
  ttlSeconds?: number;
  /** Leaf MEMORY USAGE when the server supports it. */
  bytes?: number;
};

export type CacheTreeResponse = {
  prefix: string;
  nodes: CacheTreeNode[];
  /** Total keys scanned under prefix, including keys inside group nodes. */
  keys: number;
  /** Node list or scan hit a cap; counts are lower bounds. */
  truncated?: boolean;
  /** Whether per-key byte sizes were available (MEMORY USAGE). */
  bytesSupported: boolean;
};

export type CacheScoredMember = {
  member: string;
  score: number;
};

/** Full detail for one key. Exactly one value field is set, per `type`. */
export type CacheKeyDetail = {
  key: string;
  type: string;
  ttlSeconds: number;
  bytes?: number;
  /** Full value length: STRLEN, HLEN, LLEN, SCARD or ZCARD. */
  length: number;
  value?: string;
  fields?: Record<string, string>;
  items?: string[];
  members?: CacheScoredMember[];
  /** The returned value was capped; `length` still reports the full size. */
  truncated?: boolean;
};

export type CacheSearchResponse = {
  keys: CacheTreeNode[];
  truncated?: boolean;
};

export type CacheStats = {
  keys: number;
  keysTruncated?: boolean;
  usedMemoryBytes?: number;
  maxMemoryBytes?: number;
  hits?: number;
  misses?: number;
  evictedKeys?: number;
  expiredKeys?: number;
  connectedClients?: number;
  version?: string;
  uptimeSeconds?: number;
  /** Set when the backend's INFO failed; server fields above are then absent. */
  infoError?: string;
};

export type CacheDeleteResponse = {
  deleted: number;
};

/** True when the node is a leaf key (vs a prefix group). */
export function isLeaf(node: CacheTreeNode): node is CacheTreeNode & { key: string } {
  return node.key !== undefined && node.key !== "";
}
