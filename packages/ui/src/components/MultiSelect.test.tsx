import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { MultiSelect } from "./MultiSelect";

function MultiSelectHarness() {
  const [value, setValue] = useState<string[]>([]);

  return (
    <MultiSelect
      placeholder="Status"
      value={value}
      onChange={setValue}
      options={[
        { value: "healthy", label: "Healthy" },
        { value: "degraded", label: "Degraded" },
        { value: "pending", label: "Pending" },
      ]}
    />
  );
}

describe("MultiSelect", () => {
  it("uses the density control height for the default trigger", () => {
    render(<MultiSelectHarness />);

    expect(screen.getByRole("button", { name: /status filter/i }).className).toContain(
      "h-control-h",
    );
  });

  it("lets triggerClassName override the default height for compact contexts", () => {
    render(
      <MultiSelect
        placeholder="Status"
        value={[]}
        onChange={() => {}}
        triggerClassName="h-6"
        options={[{ value: "healthy", label: "Healthy" }]}
      />,
    );

    const trigger = screen.getByRole("button", { name: /status filter/i });
    expect(trigger.className).toContain("h-6");
    expect(trigger.className).not.toContain("h-control-h");
  });

  it("selects values and clears them", () => {
    render(<MultiSelectHarness />);

    fireEvent.click(screen.getByRole("button", { name: /status filter/i }));
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /healthy/i }));
    expect(screen.getByRole("button", { name: /status filter/i })).toHaveTextContent("Healthy");

    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /degraded/i }));
    expect(screen.getByRole("button", { name: /status filter/i })).toHaveTextContent(
      "Healthy, Degraded",
    );

    fireEvent.click(screen.getByRole("button", { name: /clear all/i }));
    expect(screen.getByRole("button", { name: /status filter/i })).toHaveTextContent("Status");
  });

  it("filters choices by counted facets without losing hidden selections", () => {
    const onChange = vi.fn();
    render(<MultiSelect placeholder="Columns" value={["reviewers"]} onChange={onChange}
      facets={[{ key: "change", label: "Change", labels: { changed: "Changed", unchanged: "No changes", added: "Added column" } }]}
      options={[
        { value: "operators", label: "Operators", facets: { change: "changed" } },
        { value: "reviewers", label: "Reviewers", facets: { change: "unchanged" } },
        { value: "new", label: "New", facets: { change: "added" } },
      ]} />);
    fireEvent.click(screen.getByRole("button", { name: "Columns filter" }));
    const facet = screen.getByRole("combobox", { name: "Change" });
    expect(screen.getByRole("option", { name: "Changed (1)" })).toBeInTheDocument();
    fireEvent.change(facet, { target: { value: "changed" } });
    expect(screen.queryByRole("menuitemcheckbox", { name: "Reviewers" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitemcheckbox", { name: "Operators" }));
    expect(onChange).toHaveBeenLastCalledWith(["reviewers", "operators"]);
    fireEvent.change(facet, { target: { value: "unchanged" } });
    expect(screen.getByRole("menuitemcheckbox", { name: "Reviewers" })).toBeChecked();
  });
});
