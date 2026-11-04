import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GitLink } from "../../git";
import type { GitWebRepository } from "./types";

describe("native provider links in static reports", () => {
  it.each<[GitWebRepository, string]>([
    [
      { provider: "github", web: "https://github.example/acme/rules" },
      "/pull/7",
    ],
    [
      { provider: "gitlab", web: "https://gitlab.example/acme/rules" },
      "/-/merge_requests/7",
    ],
    [
      {
        provider: "azure_devops",
        web: "https://dev.azure.com/acme/core/_git/rules",
      },
      "/pullrequest/7",
    ],
  ])(
    "renders %s without browser APIs or network access",
    (repository, suffix) => {
      const html = renderToStaticMarkup(
        <GitLink repository={repository} target={{ pullRequest: 7 }}>
          Review change
        </GitLink>,
      );
      expect(html).toBe(
        `<a href="${repository.web}${suffix}">Review change</a>`,
      );
    },
  );
});
