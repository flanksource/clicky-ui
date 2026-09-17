import { describe, expect, it } from "vitest";
import { operationInputSchema } from "./operation-schedule-model";
import type { ResolvedOperation } from "./types";

describe("operationInputSchema", () => {
  it("returns an operation's JSON object request schema", () => {
    const operation: ResolvedOperation = {
      path: "/jobs",
      method: "post",
      operation: {
        operationId: "runJob",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { batchSize: { type: "integer" } },
              },
            },
          },
        },
      },
    };

    expect(operationInputSchema(operation)).toEqual({
      type: "object",
      properties: { batchSize: { type: "integer" } },
    });
  });
});
