import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { httpExchangeRows } from "./fixtures";
import { TraceHarView } from "./TraceHarView";

describe("TraceHarView", () => {
  it("lists each exchange by URL", () => {
    render(<TraceHarView rows={httpExchangeRows} />);
    for (const row of httpExchangeRows) expect(screen.getByText(row.url)).toBeInTheDocument();
  });

  it("expands a JSON exchange to its parsed body", () => {
    render(<TraceHarView rows={httpExchangeRows} />);
    fireEvent.click(screen.getByText("https://api.example.com/v1/configs?limit=2"));
    expect(screen.getByText("Response Body")).toBeInTheDocument();
    expect(document.body.textContent).toContain("items");
  });

  it("shows the bytes of a tunnelled CONNECT where a body would be", () => {
    render(<TraceHarView rows={httpExchangeRows} />);
    fireEvent.click(screen.getByText("registry.example.com:443"));
    expect(screen.getByText(/Tunnelled CONNECT relayed without decrypting it: 471 KB in/)).toBeInTheDocument();
  });

  it("shows the transport error of an exchange that got no response", () => {
    render(<TraceHarView rows={httpExchangeRows} />);
    expect(screen.getByText("ERR")).toBeInTheDocument();
  });

  it("renders the empty label when there are no rows", () => {
    render(<TraceHarView rows={[]} />);
    expect(screen.getByText("No HTTP exchanges recorded")).toBeInTheDocument();
  });
});
