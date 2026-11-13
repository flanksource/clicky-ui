import { describe, expect, it } from "vitest";
import { gitWebLink } from "./git-links";
import type { GitProvider } from "./types";

const sha = "a".repeat(40);
describe("native Git provider links", () => {
  it.each<[GitProvider, string, string]>([
    [
      "github",
      "https://github.example/acme/rules",
      `/blob/${sha}/rules/Customer%20Plan/data.xml`,
    ],
    [
      "gitlab",
      "https://gitlab.example/acme/rules",
      `/-/blob/${sha}/rules/Customer%20Plan/data.xml`,
    ],
    [
      "azure_devops",
      "https://dev.azure.com/acme/Platform/_git/rules",
      `?path=%2Frules%2FCustomer+Plan%2Fdata.xml&version=GC${sha}`,
    ],
  ])("builds a file link for %s", (provider, web, suffix) => {
    expect(
      gitWebLink(
        { provider, web },
        { file: "rules/Customer Plan/data.xml", commit: sha },
      ),
    ).toBe(web + suffix);
  });
  it("keeps Azure branch and tag references distinct", () => {
    const repo = {
      provider: "azure_devops" as const,
      web: "https://dev.azure.com/acme/Platform/_git/rules",
    };
    expect(gitWebLink(repo, { ref: "refs/heads/qa" })).toBe(
      `${repo.web}?version=GBqa`,
    );
    expect(gitWebLink(repo, { ref: "refs/tags/qa" })).toBe(
      `${repo.web}?version=GTqa`,
    );
  });
  it("keeps GitLab branch and tag references distinct", () => {
    const repo = {
      provider: "gitlab" as const,
      web: "https://gitlab.example/acme/rules",
    };
    expect([
      gitWebLink(repo, { ref: "refs/heads/release/qa" }),
      gitWebLink(repo, { ref: "refs/tags/release/qa" }),
    ]).toEqual([
      `${repo.web}/-/tree/release/qa?ref_type=heads`,
      `${repo.web}/-/tree/release/qa?ref_type=tags`,
    ]);
  });
  it("rejects an unqualified ref and abbreviated commit", () => {
    const repo = {
      provider: "github" as const,
      web: "https://github.com/acme/rules",
    };
    expect(() => gitWebLink(repo, { ref: "qa" })).toThrow();
    expect(() => gitWebLink(repo, { commit: "abcdef0" })).toThrow();
  });
  it.each([
    "",
    "/rules/file.xml",
    "../file.xml",
    "rules/../file.xml",
    "rules//file.xml",
    "rules\\file.xml",
  ])("rejects invalid repository-relative file path %s", (file) => {
    expect(() =>
      gitWebLink(
        { provider: "github", web: "https://github.example/acme/rules" },
        { commit: sha, file },
      ),
    ).toThrow("repository-relative path");
  });
  it.each([0, -1, 1.5, Number.NaN])(
    "rejects invalid pull request number %s",
    (pullRequest) => {
      expect(() =>
        gitWebLink(
          { provider: "github", web: "https://github.example/acme/rules" },
          { pullRequest },
        ),
      ).toThrow("positive integer");
    },
  );
});
