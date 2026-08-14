import { describe, expect, it } from "vitest";

import {
  effectiveConfig,
  effectiveType,
  pagingBlock,
  reorder,
  resolveConfig,
  validateProcessor,
  type ProcessorPreset,
} from "./processorConfig";

const JAVA: ProcessorPreset = {
  type: "cel.batch",
  title: "Java stack trace merge",
  config: {
    partition: ["pod", "container"],
    order: "desc",
    continuation: '(row.message + "").matches("^\\\\s*at\\\\s")',
    when: "count > 1",
    keep: "first",
    set: { message: "dyn(batch)", stack_depth: "count - 1" },
  },
};

const DEDUPE: ProcessorPreset = {
  type: "cel.dedupe",
  title: "Collapse repeated log lines",
  config: { partition: ["hash"], keep: "first", set: { count: "count" } },
};

describe("processor configuration", () => {
  it("shows every inherited key and marks an override", () => {
    const resolved = resolveConfig(
      { use: "java.stacktrace", config: { partition: ["pod"] } },
      JAVA,
    );

    expect(effectiveType({ use: "java.stacktrace" }, JAVA)).toBe("cel.batch");
    expect(effectiveConfig({ use: "java.stacktrace" }, JAVA)).toEqual(
      JAVA.config,
    );
    expect(resolved.find((entry) => entry.key === "partition")).toEqual({
      key: "partition",
      value: ["pod"],
      origin: "override",
      presetValue: ["pod", "container"],
    });
    expect(resolved.find((entry) => entry.key === "continuation")?.origin).toBe(
      "preset",
    );
  });

  it("validates log helpers and configuration keys before execution", () => {
    expect(
      validateProcessor(
        { type: "logs.parse", config: { format: "json" } },
        undefined,
      ),
    ).toEqual([]);
    expect(
      validateProcessor(
        { type: "logs.parse", config: { format: "ndjson" } },
        undefined,
      )[0]?.key,
    ).toBe("format");
    expect(
      validateProcessor(
        { use: "logs.dedupe", config: { partitions: ["hash"] } },
        DEDUPE,
      )[0],
    ).toMatchObject({
      key: "partitions",
      severity: "warning",
    });
  });

  it("distinguishes inherent whole-result stages from paging gaps", () => {
    expect(pagingBlock("cel.dedupe")?.kind).toBe("inherent");
    expect(pagingBlock("cel.batch")?.kind).toBe("gap");
    expect(pagingBlock("logs.parse")).toBeUndefined();
  });

  it("moves a processor without changing the other stages", () => {
    expect(reorder(["parse", "stack", "dedupe"], 2, 0)).toEqual([
      "dedupe",
      "parse",
      "stack",
    ]);
  });
});
