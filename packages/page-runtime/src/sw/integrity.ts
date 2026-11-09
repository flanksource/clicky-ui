import { RuntimeFailure } from "./errors.ts";

export async function digest(bytes: Uint8Array<ArrayBuffer>, algorithm = "SHA-384"): Promise<string> {
  return `${algorithm.toLowerCase().replace("-", "")}-${btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.digest(algorithm, bytes))))}`;
}

export async function verifyIntegrity(bytes: Uint8Array<ArrayBuffer>, expected: string, path: string): Promise<void> {
  const algorithm = /^(sha256|sha384|sha512)-/.exec(expected)?.[1];
  if (!algorithm || await digest(bytes, algorithm.toUpperCase().replace("SHA", "SHA-")) !== expected) throw new RuntimeFailure({ phase: "fetch", file: path, message: `integrity mismatch for ${path}` });
}
