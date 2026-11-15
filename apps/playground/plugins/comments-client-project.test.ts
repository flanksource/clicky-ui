import { afterEach, describe, expect, it, vi } from "vitest";
import { commentsClient, configureComments, gavelProject, projectScope } from "./comments-client";
import { fixedGavel } from "./gavel-launch-server";

const gavel = fixedGavel("http://gavel.local");
const registered = [
  { name: "Flanksource", dir: "/src/flanksource" },
  { name: "Clicky UI", dir: "/src/flanksource/clicky-ui" },
  { name: "Clicky UI docs", dir: "/src/flanksource/clicky-ui-docs" },
  { name: "Remote only" },
];

function serveProjects(projects: unknown[]) {
  const fetch = vi.fn(async (input: string | URL | Request) => {
    expect(String(input)).toBe("http://gavel.local/api/projects");
    return Response.json(projects);
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

afterEach(() => vi.unstubAllGlobals());

describe("gavelProject", () => {
  it.each([
    ["the project whose directory is the workspace", "/src/flanksource/clicky-ui", "Clicky UI"],
    ["the most specific project holding a nested workspace", "/src/flanksource/clicky-ui/apps/playground", "Clicky UI"],
    ["an enclosing project, never a sibling sharing a name prefix", "/src/flanksource/other", "Flanksource"],
  ])("picks %s", async (_case, workspace, expected) => {
    serveProjects(registered);
    await expect(gavelProject(gavel, workspace)).resolves.toBe(expected);
  });

  it("fails naming the workspace when no registered project holds it", async () => {
    serveProjects(registered);
    await expect(gavelProject(gavel, "/elsewhere/clicky-ui")).rejects.toMatchObject({
      status: 422,
      message: expect.stringContaining("/elsewhere/clicky-ui"),
    });
  });
});

describe("commentsClient", () => {
  it("scopes threads to the project holding the workspace, with page targets under pages/", async () => {
    serveProjects(registered);
    configureComments({ dir: "/data/project-scope", endpoint: gavel, workspace: "/src/flanksource/clicky-ui" });
    const client = await commentsClient("/data/project-scope");
    expect(client.target("team/summary")).toEqual({
      uri: "gavel://project/Clicky%20UI/pages/team%2Fsummary",
      scopeUri: "gavel://project/Clicky%20UI",
      kind: "playground-page",
      label: "team/summary",
    });
  });

  it("retries the lookup after it failed", async () => {
    const fetch = serveProjects([]);
    configureComments({ dir: "/data/project-retry", endpoint: gavel, workspace: "/src/flanksource/clicky-ui" });
    await expect(commentsClient("/data/project-retry")).rejects.toMatchObject({ status: 422 });
    serveProjects(registered);
    await expect(commentsClient("/data/project-retry")).resolves.toMatchObject({ scope: projectScope("Clicky UI") });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("escapes a project name the way Go's url.PathEscape does", () => {
    expect(projectScope("acme (eu)!")).toBe("gavel://project/acme%20%28eu%29%21");
  });
});
