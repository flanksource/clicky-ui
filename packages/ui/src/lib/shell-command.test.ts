import { describe, expect, it } from "vitest";
import { shellCommandLine, shellQuote } from "./shell-command";

describe("shellQuote", () => {
  it.each([
    ["oipa-cli", "oipa-cli"],
    ["--batch-size=500", "--batch-size=500"],
    ["/usr/local/bin/openscad", "/usr/local/bin/openscad"],
    ["", "''"],
    ["cycle one", "'cycle one'"],
    ["nightly's run", "'nightly'\"'\"'s run'"],
    ["/models/box output.stl", "'/models/box output.stl'"],
  ])("quotes %j as %s", (value, expected) => {
    expect(shellQuote(value)).toBe(expected);
  });
});

describe("shellCommandLine", () => {
  it("joins the command and each argument through shellQuote", () => {
    expect(shellCommandLine({ command: "git", args: ["commit", "-m", "fix bug"] })).toBe(
      "git commit -m 'fix bug'",
    );
  });

  it("quotes an empty argument rather than dropping it", () => {
    expect(shellCommandLine({ command: "printf", args: [""] })).toBe("printf ''");
  });

  it("prefixes a cd when cwd is a non-empty string", () => {
    expect(shellCommandLine({ command: "git", args: ["status"], cwd: "/repo path" })).toBe(
      "cd '/repo path' && git status",
    );
  });

  it("omits the cd prefix when cwd is undefined", () => {
    expect(shellCommandLine({ command: "git", args: ["status"] })).toBe("git status");
  });

  it("omits the cd prefix when cwd is an empty string", () => {
    expect(shellCommandLine({ command: "git", args: ["status"], cwd: "" })).toBe("git status");
  });

  it("quotes a command path containing a space", () => {
    expect(shellCommandLine({ command: "/opt/my tool/run", args: [] })).toBe("'/opt/my tool/run'");
  });
});
