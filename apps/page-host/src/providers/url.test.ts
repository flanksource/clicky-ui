import { beforeEach, describe, expect, it, vi } from "vitest";
import { urlProvider } from "./url";
import { STARTER } from "../starter";

const { browserProject } = vi.hoisted(() => ({ browserProject: vi.fn() }));
vi.mock("./browser-store", () => ({ browserProject }));
beforeEach(() => browserProject.mockReset().mockResolvedValue(null));

describe("URL sources", () => {
  it("opens CORS raw sources with explicitly supplied library defaults", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("export default () => <h1>Report</h1>"));
    const provider = urlProvider({ url: "https://example.com/report.tsx", manifest: STARTER.files["package.json"]!, fetch: fetcher });
    expect((await provider.read())?.files).toEqual({ "package.json": STARTER.files["package.json"], "report.tsx": "export default () => <h1>Report</h1>" });
    expect(fetcher).toHaveBeenCalledWith("https://example.com/report.tsx", { mode: "cors", credentials: "omit" });
  });
  it("loads a multi-file project document without flattening its paths", async () => {
    const provider = urlProvider({ url: "https://example.com/project.json", manifest: STARTER.files["package.json"]!, fetch: vi.fn<typeof fetch>().mockResolvedValue(Response.json(STARTER)) });
    expect(await provider.read()).toEqual(STARTER);
  });
  it("surfaces remote errors even when a browser copy exists", async () => {
    browserProject.mockResolvedValue(STARTER);
    const provider = urlProvider({ url: "https://example.com/page.tsx", manifest: STARTER.files["package.json"]!, fetch: vi.fn<typeof fetch>().mockResolvedValue(new Response("missing", { status: 404 })) });
    await expect(provider.read()).rejects.toThrow(/HTTP 404/);
  });
  it.each(["file:///secret", "https://user:password@example.com/page.tsx"])("rejects unsafe URL %s", (url) => {
    expect(() => urlProvider({ url, manifest: STARTER.files["package.json"]! })).toThrow(/HTTP/);
  });
});
