import { CompletionContext } from "@codemirror/autocomplete";
import { PostgreSQL, schemaCompletionSource, sql } from "@codemirror/lang-sql";
import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";
import {
  openSearchJSONCompletionSource,
  sqlCompletionNamespace,
} from "./QueryBrowser.completion";

describe("QueryBrowser completion", () => {
  it("builds a schema/table/column SQL namespace", () => {
    const namespace = sqlCompletionNamespace([
      {
        name: "public",
        relations: [
          {
            name: "users",
            type: "table",
            columns: [{ name: "email", types: ["text"] }],
          },
        ],
      },
    ]) as Record<string, any>;

    expect(namespace.public.users.self.label).toBe("users");
    expect(namespace.public.users.children).toEqual([
      expect.objectContaining({ label: "email", detail: "text" }),
    ]);
  });

  it("completes columns through SQL table aliases", async () => {
    const schema = sqlCompletionNamespace([
      {
        name: "public",
        relations: [
          { name: "users", columns: [{ name: "email", types: ["text"] }] },
        ],
      },
    ]);
    const doc = "SELECT u. FROM users AS u";
    const pos = doc.indexOf("u.") + 2;
    const state = EditorState.create({
      doc,
      extensions: sql({ dialect: PostgreSQL, schema, defaultSchema: "public" }),
    });
    const result = await schemaCompletionSource({
      dialect: PostgreSQL,
      schema,
      defaultSchema: "public",
    })(new CompletionContext(state, pos, true));

    expect(result?.options.map((option) => option.label)).toContain("email");
  });

  it("suggests inspected fields in OpenSearch field contexts", async () => {
    const doc = `{"query":{"range":{"dur`;
    const source = openSearchJSONCompletionSource([
      { name: "duration", types: ["long", "double"], conflicting: true },
      { name: "service.name", types: ["keyword"] },
    ]);
    const state = EditorState.create({ doc });
    const result = await source(new CompletionContext(state, doc.length, true));

    expect(result?.options.map((option) => option.label)).toEqual([
      "duration",
      "service.name",
    ]);
    expect(result?.options[0]?.detail).toContain("type conflict");
  });

  it("suggests query DSL vocabulary outside a field context", async () => {
    const doc = `{"que`;
    const source = openSearchJSONCompletionSource([
      { name: "duration", types: ["long"] },
    ]);
    const state = EditorState.create({ doc });
    const result = await source(new CompletionContext(state, doc.length, true));

    expect(result?.options.map((option) => option.label)).toContain("query");
    expect(result?.options.map((option) => option.label)).not.toContain(
      "duration",
    );
  });
});
