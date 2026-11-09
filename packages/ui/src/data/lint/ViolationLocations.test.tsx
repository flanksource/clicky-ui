import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ViolationLocations } from "./ViolationLocations";
import type { ViolationLocation } from "./types";

const WORK_DIR = "/repo/rules";
const POLICY_ID = "7f3a2c10-5b0a-4c53-9a73-0c9d3f5e8b11";
const PAGE = "https://oipa.example.com/entity/policy/7f3a2c10";

const rows = () => screen.getAllByTestId("lint-violation-location");

describe("ViolationLocations", () => {
  it("shows a file's git ref as a muted prefix and opens the work-dir-relative file at its line", () => {
    const onOpenFile = vi.fn();
    render(
      <ViolationLocations
        workDir={WORK_DIR}
        onOpenFile={onOpenFile}
        locations={[{ ref: "main", file: `${WORK_DIR}/tr/Billing/data.xml`, line: 12, column: 3 }]}
      />,
    );
    const [row] = rows();
    expect(within(row!).getByText("main")).toHaveAttribute("title", "git ref main");
    expect(row!.textContent).toContain("maintr/Billing/data.xml:12:3");
    fireEvent.click(within(row!).getByRole("button", { name: /Open in Files/ }));
    expect(onOpenFile).toHaveBeenCalledWith({ file: "tr/Billing/data.xml", workDir: WORK_DIR, line: 12 });
  });

  it("links an entity where the host resolves it and leaves it a chip where it does not", () => {
    const entityHref = vi.fn((entity: { kind: string; id: string }) =>
      entity.kind === "Policy" ? `/entity/policy/${entity.id}` : undefined,
    );
    render(
      <ViolationLocations
        workDir={WORK_DIR}
        entityHref={entityHref}
        locations={[
          { entity: { kind: "Policy", id: POLICY_ID, name: "P-1001" } },
          { entity: { kind: "AsTransaction", id: "t-9" } },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Policy · P-1001" })).toHaveAttribute("href", `/entity/policy/${POLICY_ID}`);
    expect(screen.queryByRole("link", { name: /AsTransaction/ })).toBeNull();
    expect(within(rows()[1]!).getByText("AsTransaction · t-9")).toHaveAttribute("title", "AsTransaction t-9");
  });

  it("renders an entity as a chip when the host gives no entityHref", () => {
    render(<ViolationLocations workDir={WORK_DIR} locations={[{ entity: { kind: "Policy", id: POLICY_ID } }]} />);
    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.getByText(`Policy · ${POLICY_ID}`)).toBeInTheDocument();
  });

  it("links a url externally, with its selector inline and in the link's tooltip", () => {
    render(<ViolationLocations workDir={WORK_DIR} locations={[{ url: { url: PAGE, testId: "activity-status" } }]} />);
    const link = screen.getByRole("link", { name: PAGE });
    expect(link).toHaveAttribute("href", PAGE);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
    expect(link).toHaveAttribute("title", `${PAGE}\ntestId: activity-status`);
    expect(screen.getByText("testId: activity-status").tagName).toBe("CODE");
  });

  it("previews an image region cropped to its rectangle, linking to the full image", () => {
    const src = "https://artefacts.example.com/run-7/shot.png";
    render(<ViolationLocations workDir={WORK_DIR} locations={[{ image: { src, x: 0, y: 80, width: 480, height: 40 } }]} />);
    const link = screen.getByRole("link", { name: /Region 0,80 480×40/ });
    expect(link).toHaveAttribute("href", src);
    const img = within(link).getByRole("img");
    expect(img).toHaveAttribute("src", src);
    expect(img.style.objectPosition).toBe("0px -80px");
    expect(img.style.transform).toBe("scale(0.5)");
    expect(img.parentElement!.style.width).toBe("240px");
    expect(img.parentElement!.style.height).toBe("20px");
    expect(screen.getByText("0,80 480×40")).toBeInTheDocument();
  });

  it("lists every location, the first one primary, each with its message", () => {
    const locations: ViolationLocation[] = [
      { file: `${WORK_DIR}/a.sql`, line: 120, message: "the purge statement" },
      { entity: { kind: "Policy", id: POLICY_ID, name: "P-1001" }, message: "spawned 3 times" },
      { url: { url: PAGE } },
    ];
    render(<ViolationLocations workDir={WORK_DIR} locations={locations} />);
    expect(screen.getByText("3 locations")).toBeInTheDocument();
    expect(rows().map((row) => [row.hasAttribute("data-primary"), row.textContent])).toEqual([
      [true, "a.sql:120the purge statement"],
      [false, "Policy · P-1001spawned 3 times"],
      [false, PAGE],
    ]);
  });

  it("titles a single location in the singular", () => {
    render(<ViolationLocations workDir={WORK_DIR} locations={[{ url: { url: PAGE } }]} />);
    expect(screen.getByText("Location")).toBeInTheDocument();
  });
});
