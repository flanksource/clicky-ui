import { normalizeLogsTableRows } from "./logs-normalize";

const firstPage = [
  JSON.stringify({
    pod: "policy-api-1",
    timestamp: "2026-05-03T10:09:30.288Z",
    line: JSON.stringify({ "log.level": "INFO", message: "started" }),
  }),
  JSON.stringify({
    pod: "policy-api-1",
    timestamp: "2026-05-03T10:09:31.100Z",
    line: JSON.stringify({ "log.level": "WARN", message: "retrying" }),
  }),
];

const secondPage = [
  JSON.stringify({
    pod: "policy-api-1",
    timestamp: "2026-05-03T10:09:32.400Z",
    line: JSON.stringify({ "log.level": "ERROR", message: "gave up" }),
  }),
];

function ids(logs: string | string[]): string[] {
  return normalizeLogsTableRows(logs).map((row) => row.id);
}

describe("normalizeLogsTableRows row identity", () => {
  it("keeps the id a record had when later pages are appended after it", () => {
    const beforeAppend = ids(firstPage);
    const afterAppend = ids([...firstPage, ...secondPage]);

    expect(afterAppend.slice(0, firstPage.length)).toEqual(beforeAppend);
  });

  it("gives a record the same id whatever position it lands at", () => {
    const [target] = secondPage;

    expect(ids([target!])).toEqual(ids([...firstPage, target!]).slice(-1));
  });

  it("distinguishes records that differ only in their message", () => {
    const [first, second] = ids(firstPage);

    expect(first).not.toEqual(second);
  });

  it("discriminates genuinely identical records without re-keying the first", () => {
    const [line] = firstPage;
    const duplicated = ids([line!, line!, line!]);

    expect(duplicated[0]).toEqual(ids([line!])[0]);
    expect(new Set(duplicated).size).toBe(3);
  });

  it("keeps plain unparsable lines identifiable by their own text", () => {
    const rendered = ids('plain line\n{"not valid"');

    expect(rendered).toEqual(ids(["plain line", '{"not valid"']));
    expect(new Set(rendered).size).toBe(2);
  });
});
