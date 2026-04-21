import { fireEvent, render, screen } from "@testing-library/react";
import { HarPanel } from "./HarPanel";
import { sampleHarEntries } from "./fixtures";

describe("HarPanel", () => {
  it("keeps controlled search behavior and expands row details", () => {
    render(<HarPanel entries={sampleHarEntries} search="slow" />);

    expect(screen.getByText("https://api.example.com/v1/slow")).toBeInTheDocument();
    expect(screen.queryByText("https://api.example.com/v1/configs")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/filter url, method, or body/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("https://api.example.com/v1/slow"));

    expect(screen.getByText("Response Body")).toBeInTheDocument();
    expect(screen.getByText("Service Unavailable")).toBeInTheDocument();
  });
});
