/** @vitest-environment jsdom */

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ObjectArrayPattern } from "./ObjectArrayPattern";

afterEach(cleanup);

describe("ObjectArrayPattern", () => {
  it("starts with named summary rows and reveals the selected item's form", () => {
    render(<ObjectArrayPattern />);

    const route = screen.getByRole("button", {
      name: "/api/v1/users GET users-svc:8080",
    });
    expect(route.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("textbox", { name: /Path/ })).toBeNull();

    fireEvent.click(route);

    expect(route.getAttribute("aria-expanded")).toBe("true");
    expect((screen.getByRole("textbox", { name: /Path/ }) as HTMLInputElement).value).toBe(
      "/api/v1/users",
    );
  });
});
