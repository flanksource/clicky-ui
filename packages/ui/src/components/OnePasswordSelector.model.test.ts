import { describe, expect, it } from "vitest";
import {
  buildOnePasswordReference,
  parseOnePasswordReference,
} from "./OnePasswordSelector.model";

describe("1Password reference model", () => {
  it("parses vault, item, and field path", () => {
    expect(parseOnePasswordReference("op://prod/database/password")).toEqual({
      vault: "prod",
      item: "database",
      field: "password",
    });
  });

  it("decodes names while preserving a section-qualified field", () => {
    expect(
      parseOnePasswordReference(
        "op://Private/API%20Credential/credentials/password",
      ),
    ).toEqual({
      vault: "Private",
      item: "API Credential",
      field: "credentials/password",
    });
  });

  it("builds an encoded custom reference", () => {
    expect(
      buildOnePasswordReference({
        vault: "Private",
        item: "API Credential",
        field: "credentials/password",
      }),
    ).toBe("op://Private/API%20Credential/credentials/password");
  });

  it("keeps an incomplete draft out of persisted form state", () => {
    expect(
      buildOnePasswordReference({ vault: "Private", item: "", field: "" }),
    ).toBe("");
  });

  it("rejects malformed persisted references", () => {
    expect(() => parseOnePasswordReference("https://example.com/secret"))
      .toThrow("expected op://<vault>/<item>/<field>");
    expect(() => parseOnePasswordReference("op://vault/item"))
      .toThrow("expected op://<vault>/<item>/<field>");
  });
});
