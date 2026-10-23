import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CompactRecord, CompactRecordList } from "./CompactRecord";

const BUILD_URL = "https://dev.azure.com/acme/rules/_build/results?buildId=411&view=results";

describe("CompactRecord", () => {
  it("links an absolute href in a new tab, with its status and dot-separated meta, skipping empty entries", () => {
    render(
      <CompactRecord
        icon={<svg data-testid="pipeline" />}
        title="Rules validation"
        href={BUILD_URL}
        status={{ label: "approved", tone: "success" }}
        meta={["required", null, "", false, "build 411"]}
        trailing="a1b2c3d"
      />,
    );

    const link = screen.getByRole("link", { name: "Rules validation" });
    const record = document.querySelector<HTMLElement>("[data-compact-record]")!;
    expect({
      href: link.getAttribute("href"),
      target: link.getAttribute("target"),
      status: within(record).getByText("approved").textContent,
      meta: record.querySelector(".text-muted-foreground")?.textContent,
      trailing: within(record).getByText("a1b2c3d").textContent,
    }).toEqual({ href: BUILD_URL, target: "_blank", status: "approved", meta: "required·build 411", trailing: "a1b2c3d" });
  });

  it("keeps an in-app href in the same tab and renders a plain title without one", () => {
    render(
      <>
        <CompactRecord icon={null} title="Promotion record" href="/environment-deployment/d1" />
        <CompactRecord icon={null} title="No link" />
      </>,
    );
    expect([screen.getByRole("link", { name: "Promotion record" }).getAttribute("target"), screen.queryByRole("link", { name: "No link" })])
      .toEqual([null, null]);
  });
});

describe("CompactRecordList", () => {
  it("counts its records under the heading once there is more than one", () => {
    render(
      <>
        <CompactRecordList title="Builds">
          <CompactRecord icon={null} title="Lint" />
          <CompactRecord icon={null} title="Unit tests" />
        </CompactRecordList>
        <CompactRecordList title="Source">
          <CompactRecord icon={null} title="acme/rules#main" />
        </CompactRecordList>
      </>,
    );
    expect(["Builds", "Source"].map((name) => screen.getByRole("region", { name }).querySelector("h3")?.textContent))
      .toEqual(["Builds2", "Source"]);
  });

  it("shows the empty label instead of an empty box", () => {
    render(<CompactRecordList title="Builds" emptyLabel="No pipeline has run." />);
    expect([screen.getByText("No pipeline has run.").tagName, document.querySelector("[data-compact-record]")]).toEqual(["P", null]);
  });
});
