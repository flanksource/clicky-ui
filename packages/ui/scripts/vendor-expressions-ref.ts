export interface VendorRefOptions {
  check: boolean;
  explicitRef?: string;
  stamp: string;
}

export function resolveVendorRef({ check, explicitRef, stamp }: VendorRefOptions): string {
  if (explicitRef) return explicitRef;
  if (!check) return "main";

  const commit = stamp.match(/^commit:\s*([0-9a-f]{40})\s*$/m)?.at(1);
  if (!commit) throw new Error("VENDOR must record an exact 40-character commit for --check");
  return commit;
}
