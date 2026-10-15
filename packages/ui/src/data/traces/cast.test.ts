import { describe, expect, it } from "vitest";
import { parseCast } from "./cast";

// The sample the Go terminal kind exports (commons-db tracing/terminal/testdata/sample.cast).
const GO_EXPORT = [
  '{"version":2,"width":80,"height":24,"duration":1.5,"command":"/bin/sh -c echo hi","_gavel":{"exit_code":3,"snapshots":[[500,"hi"],[1500,"hi\\nhi\\nbye"]],"final":"hi\\nhi\\nbye","duplicates":[{"count":2,"text":"hi"}],"truncated":true}}',
  '[0.01,"o","hi\\r\\n"]',
  '[0.75,"o","\\u001b[32mhi\\u001b[0m \\"quoted\\" \\u003cé\\u003e\\r\\n"]',
  '[1.2,"o","bye\\r\\n"]',
  "",
].join("\n");

describe("parseCast", () => {
  it("reads the header line and the output events of an asciinema v2 cast", () => {
    const events = parseCast('{"version":2,"width":100,"height":30}\n[0.5,"o","a"]\n[1.25,"o","b"]\n');
    expect(events).toEqual([
      { offset: 0.5, kind: "o", data: "a", width: 100, height: 30 },
      { offset: 1.25, kind: "o", data: "b", width: 100, height: 30 },
    ]);
  });

  it("turns an r event into a resize and applies the new size to the events after it", () => {
    const events = parseCast('{"version":2,"width":80,"height":24}\n[0.1,"o","a"]\n[0.2,"r","120x40"]\n[0.3,"o","b"]');
    expect(events.map((e) => [e.kind, e.width, e.height])).toEqual([
      ["o", 80, 24],
      ["r", 120, 40],
      ["o", 120, 40],
    ]);
  });

  it("skips input and marker events, which draw nothing", () => {
    const events = parseCast('{"version":2,"width":80,"height":24}\n[0.1,"i","x"]\n[0.2,"m","chapter"]\n[0.3,"o","y"]');
    expect(events.map((e) => e.kind)).toEqual(["o"]);
  });

  it("restores the snapshots, exit code, command and truncation a gavel export carries", () => {
    const events = parseCast(GO_EXPORT);
    expect(events.filter((e) => e.kind === "snapshot").map((e) => [e.offset, e.data])).toEqual([
      [0.5, "hi"],
      [1.5, "hi\nhi\nbye"],
    ]);
    expect(events.at(-1)).toEqual({
      offset: 1.5,
      kind: "exit",
      data: "",
      width: 80,
      height: 24,
      exitCode: 3,
      truncated: true,
      command: "/bin/sh -c echo hi",
    });
    expect(events.find((e) => e.data.includes("quoted"))?.data).toBe('\u001b[32mhi\u001b[0m "quoted" <é>\r\n');
  });

  it("falls back to the final screen when a gavel export carries no snapshots", () => {
    const events = parseCast(
      '{"version":2,"width":80,"height":24,"duration":2,"_gavel":{"exit_code":-1,"final":"done"}}\n[1,"o","done"]',
    );
    expect(events.map((e) => [e.kind, e.offset, e.data, e.exitCode])).toEqual([
      ["o", 1, "done", undefined],
      ["snapshot", 2, "done", undefined],
      ["exit", 2, "", undefined],
    ]);
  });

  it("leaves a plain asciinema cast without an exit event", () => {
    expect(parseCast('{"version":2,"width":80,"height":24}\n[0.1,"o","a"]').some((e) => e.kind === "exit")).toBe(false);
  });

  it.each([
    ["empty text", "", /empty/],
    ["a header that is not JSON", "not json\n[0,\"o\",\"x\"]", /header/],
    ["a v1 cast", '{"version":1,"width":80,"height":24}', /version 2/],
    ["a header without a size", '{"version":2}', /width and height/],
    ["an event line that is not JSON", '{"version":2,"width":80,"height":24}\nnope', /line 2/],
    ["an event that is not a triple", '{"version":2,"width":80,"height":24}\n{"a":1}', /line 2/],
    ["an unknown event type", '{"version":2,"width":80,"height":24}\n[0,"z","x"]', /unknown event type "z"/],
    ["a malformed resize", '{"version":2,"width":80,"height":24}\n[0,"r","big"]', /resize/],
  ])("rejects %s", (_name, text, message) => {
    expect(() => parseCast(text)).toThrow(message);
  });
});
