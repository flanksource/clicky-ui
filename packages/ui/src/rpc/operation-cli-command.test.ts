import { describe, expect, it } from "vitest";
import { operationCLICommand } from "./operation-cli-command";
import type { ResolvedOperation } from "./types";

const operation: ResolvedOperation = {
  path: "/api/v1/cycle/truncate",
  method: "post",
  operation: {
    operationId: "cycle_truncate",
    "x-clicky": {
      command: "cycle/truncate",
      verb: "action",
      scope: "collection",
    },
  },
};

describe("operation CLI command", () => {
  it("renders executable, global context, operation command, positional args, and flags", () => {
    expect(
      operationCLICommand(
        operation,
        {
          args: ["cycle one"],
          "batch-size": 500,
          enabled: false,
          label: "nightly's run",
          targets: ["first", "second"],
        },
        { executable: "oipa-cli", globalFlags: { context: "dev" } },
      ),
    ).toBe(
      "oipa-cli --context=dev cycle truncate 'cycle one' --batch-size=500 --enabled=false --label='nightly'\"'\"'s run' --targets=first,second",
    );
  });

  it("returns no preview until an operation publishes x-clicky.command", () => {
    expect(
      operationCLICommand(
        {
          ...operation,
          operation: { ...operation.operation, "x-clicky": undefined },
        },
        {},
        { executable: "oipa-cli" },
      ),
    ).toBeUndefined();
  });
});
