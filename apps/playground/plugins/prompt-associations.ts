import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  randomUUID,
} from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";

import type { PromptRun } from "./prompt-runs-server";
import type { StoredAuthor } from "./comments-store";
import type { LinterResult } from "../../../packages/ui/src/data/lint/types";

export type PromptAssociation = PromptRun & {
  associationId: string;
  workspace: string;
  origin: string;
  requestedBy: StoredAuthor;
  callbackSent?: boolean;
  files?: string[];
  results?: LinterResult[];
};

export class PromptAssociations {
  private readonly file: string;
  private readonly inputs: string;
  private readonly key: Buffer;
  constructor(readonly dir: string) {
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    this.file = join(dir, "prompt-associations.json");
    this.inputs = join(dir, "prompt-inputs");
    mkdirSync(this.inputs, { recursive: true, mode: 0o700 });
    const keyPath = join(this.inputs, ".key");
    if (!existsSync(keyPath)) this.atomic(keyPath, randomBytes(32));
    this.key = readFileSync(keyPath);
    if (this.key.length !== 32)
      throw new Error("invalid protected prompt-input key");
  }
  all(): PromptAssociation[] {
    if (!existsSync(this.file)) return [];
    const value: unknown = JSON.parse(readFileSync(this.file, "utf8"));
    if (!Array.isArray(value))
      throw new Error("prompt association store must contain an array");
    return value as PromptAssociation[];
  }
  save(association: PromptAssociation): void {
    const records = this.all();
    const index = records.findIndex(
      (entry) => entry.associationId === association.associationId,
    );
    if (index < 0) records.unshift(association);
    else records[index] = association;
    this.atomic(this.file, JSON.stringify(records, null, 2));
  }
  protect(id: string, input: unknown): void {
    const nonce = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.key, nonce);
    const ciphertext = Buffer.concat([
      cipher.update(JSON.stringify(input), "utf8"),
      cipher.final(),
    ]);
    this.atomic(
      this.inputPath(id),
      Buffer.concat([nonce, cipher.getAuthTag(), ciphertext]),
    );
  }
  input<T>(id: string): T {
    const data = readFileSync(this.inputPath(id));
    const cipher = createDecipheriv(
      "aes-256-gcm",
      this.key,
      data.subarray(0, 12),
    );
    cipher.setAuthTag(data.subarray(12, 28));
    return JSON.parse(
      Buffer.concat([
        cipher.update(data.subarray(28)),
        cipher.final(),
      ]).toString("utf8"),
    ) as T;
  }
  forget(id: string): void {
    const path = this.inputPath(id);
    if (existsSync(path)) unlinkSync(path);
  }
  private inputPath(id: string): string {
    if (!/^[a-f0-9-]{36}$/.test(id))
      throw new Error("invalid prompt association identity");
    return join(this.inputs, `${id}.bin`);
  }
  private atomic(path: string, value: string | Buffer): void {
    const temporary = `${path}.${randomUUID()}.tmp`;
    writeFileSync(temporary, value, { mode: 0o600, flag: "wx", flush: true });
    renameSync(temporary, path);
    const directory = openSync(dirname(path), "r");
    try {
      fsyncSync(directory);
    } finally {
      closeSync(directory);
    }
  }
}
