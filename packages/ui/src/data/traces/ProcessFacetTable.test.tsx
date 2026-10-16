import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProcessFacetTable } from "./ProcessFacetTable";
import type { ProcessDescriptor } from "./types";

const files: ProcessDescriptor[] = [
  { fd: "3", type: "REG", name: "/var/log/app.log" },
  { fd: "4", type: "DIR", name: "/srv/data" },
];
const sockets: ProcessDescriptor[] = [
  { fd: "7", type: "IPv4", name: "10.0.0.1:443->10.0.0.9:51000", protocol: "tcp", state: "ESTABLISHED", localAddr: "10.0.0.1:443", remoteAddr: "10.0.0.9:51000" },
  { fd: "8", type: "udp", name: "0.0.0.0:5353" },
];
const ports: ProcessDescriptor[] = [{ fd: "9", type: "IPv4", name: "*:8080", protocol: "tcp", localAddr: "0.0.0.0", port: 8080 }];
const readAt = "2026-10-01T09:00:10.000Z";

describe("ProcessFacetTable", () => {
  it("lists open files with the time the list was read", () => {
    render(<ProcessFacetTable facet="openFiles" reading={{ rows: files, readAt }} />);
    expect(screen.getByText("/var/log/app.log")).toBeInTheDocument();
    expect(screen.getByText(/^Read at \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)).toBeInTheDocument();
    for (const header of ["FD", "Type", "Path"]) expect(screen.getByRole("columnheader", { name: new RegExp(header) })).toBeInTheDocument();
  });

  it.each(["sockets", "connections"] as const)(
    "shows the %s columns, falling back to type and name when protocol and local address are absent",
    (facet) => {
      render(<ProcessFacetTable facet={facet} reading={{ rows: sockets, readAt }} />);
      expect(screen.getByText("0.0.0.0:5353")).toBeInTheDocument();
      expect(screen.getByText("udp")).toBeInTheDocument();
      for (const header of ["FD", "Protocol", "State", "Local", "Remote"]) {
        expect(screen.getByRole("columnheader", { name: new RegExp(header) })).toBeInTheDocument();
      }
    },
  );

  it("shows the port columns", () => {
    render(<ProcessFacetTable facet="ports" reading={{ rows: ports, readAt }} />);
    expect(screen.getByText("8080")).toBeInTheDocument();
    for (const header of ["Port", "Protocol", "Address", "FD"]) {
      expect(screen.getByRole("columnheader", { name: new RegExp(header) })).toBeInTheDocument();
    }
  });

  it.each([
    ["openFiles", "No open files"],
    ["sockets", "No open sockets"],
    ["ports", "Not listening on any port"],
    ["connections", "No network connections"],
  ] as const)("says so when the stored %s list is empty", (facet, message) => {
    render(<ProcessFacetTable facet={facet} reading={{ rows: [], readAt }} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it("says nothing was stored, and draws no table, without a reading", () => {
    render(<ProcessFacetTable facet="openFiles" reading={undefined} />);
    expect(screen.getByText("No reading stored for this process yet")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("lists the environment sorted by name", () => {
    render(<ProcessFacetTable facet="env" environment={{ ZED: "1", ALPHA: "2", MID: "3" }} />);
    const names = screen.getAllByRole("row").slice(1).map((row) => row.textContent ?? "");
    expect(names.map((text) => text.match(/ALPHA|MID|ZED/)?.[0])).toEqual(["ALPHA", "MID", "ZED"]);
  });

  it("surfaces an environment read error and draws no table", () => {
    render(<ProcessFacetTable facet="env" error="permission denied" />);
    expect(screen.getByRole("alert")).toHaveTextContent("permission denied");
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });
});
