import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ConnectionDashboardLanes } from "./connectionDashboard";
import type { ConnectionDashboardItem } from "./connectionDashboardModel";

afterEach(cleanup);

it("renders per-connection actions outside the connection link", () => {
  const item: ConnectionDashboardItem = { id: "orders", name: "Orders", namespace: "", type: "sqlite", secretCount: 0, inlineCredential: false, insecureTLS: false, profileCount: 0, updatedAt: "2026-10-26T00:00:00Z" };
  render(<ConnectionDashboardLanes connections={[item]} renderConnectionLink={(_item, link) => <a href="/edit">{link.children}</a>} renderConnectionActions={(connection) => <button type="button">Inspect {connection.name}</button>} />);
  const action = screen.getByRole("button", { name: "Inspect Orders" });
  expect(action.closest("a")).toBeNull();
  expect(screen.getByRole("link").getAttribute("href")).toBe("/edit");
});
