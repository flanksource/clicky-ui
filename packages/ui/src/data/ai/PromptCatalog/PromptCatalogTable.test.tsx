import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { PromptCatalogTable } from "./PromptCatalogTable";
import type {
  PromptCatalogEntry,
  PromptCatalogFilterState,
  PromptCatalogLayer,
} from "./types";

const home: PromptCatalogLayer = {
  origin: "user-home",
  path: "/home/dev/.gavel.yaml",
  scope: "scope=global",
  editable: true,
  source: "inline",
  fields: ["model"],
};

const commit: PromptCatalogEntry = {
  id: "commit.message",
  title: "Commit message",
  description: "Writes the commit subject and body",
  owner: "gavel",
  usedBy: ["gavel commit"],
  source: "inline",
  variables: ["diff"],
  version: "0c9f6601ed6035f3",
  effective: {
    model: "claude-haiku",
    backend: "claude-agent",
    modelSource: "operation",
  },
  provenance: { model: "user-home", body: "prompt default" },
  layers: [home],
};

const lint: PromptCatalogEntry = {
  id: "lint.fix",
  title: "Lint fix",
  owner: "gavel",
  usedBy: ["gavel lint --ai-fix"],
  source: "builtin",
  body: "Fix these {{violations}}.",
  variables: ["violations"],
  version: "f35cb1bdce2f9738",
  effective: { modelSource: "runtime" },
  layers: [{ ...home, source: "none", fields: undefined }],
};

const broken: PromptCatalogEntry = {
  id: "todos.prompts.security",
  title: "Security audit",
  owner: "gavel",
  usedBy: ["gavel todos run --prompt security"],
  source: "file",
  parseError: "yaml: line 2: did not find expected key",
  effective: { modelSource: "runtime" },
  layers: [],
};

describe("PromptCatalogTable", () => {
  it("renders one row per entry with source, model and override provenance", () => {
    render(<PromptCatalogTable entries={[commit, lint, broken]} />);

    expect(screen.getByText("Commit message")).toBeInTheDocument();
    expect(screen.getByText("commit.message")).toBeInTheDocument();
    expect(screen.getByText("claude-haiku · claude-agent")).toBeInTheDocument();
    expect(
      screen.getByText("model ← Home (~/.gavel.yaml)"),
    ).toBeInTheDocument();
    expect(screen.getByText("Fix these {{violations}}.")).toBeInTheDocument();
    expect(screen.getAllByText("inherited at run time (runtime)")).toHaveLength(
      2,
    );
    expect(screen.getByText("Parse error")).toBeInTheDocument();
    expect(screen.getByText("0c9f6601")).toBeInTheDocument();
  });

  it("narrows rows by the search box", async () => {
    render(<PromptCatalogTable entries={[commit, lint, broken]} />);

    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search prompts" }),
      {
        target: { value: "lint" },
      },
    );

    await waitFor(() =>
      expect(screen.queryByText("Commit message")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Lint fix")).toBeInTheDocument();
    expect(screen.queryByText("Security audit")).not.toBeInTheDocument();
  });

  it("keeps only overridden prompts when the facet is on", async () => {
    render(<PromptCatalogTable entries={[commit, lint, broken]} />);

    fireEvent.click(screen.getByText("Overridden only"));

    await waitFor(() =>
      expect(screen.queryByText("Lint fix")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Commit message")).toBeInTheDocument();
    expect(screen.getByText("Security audit")).toBeInTheDocument();
  });

  it("reports the clicked entry", () => {
    const onSelect = vi.fn();
    render(<PromptCatalogTable entries={[commit, lint]} onSelect={onSelect} />);

    fireEvent.click(screen.getByText("Lint fix"));

    expect(onSelect).toHaveBeenCalledWith(lint);
  });

  it("preserves controlled filters when the catalog unmounts for a detail page", async () => {
    function Host() {
      const [showCatalog, setShowCatalog] = useState(true);
      const [filterState, setFilterState] = useState<PromptCatalogFilterState>({
        query: "",
        commands: [],
        sources: [],
        models: [],
        owners: [],
        overriddenOnly: false,
      });
      return (
        <>
          <button
            type="button"
            onClick={() => setShowCatalog((shown) => !shown)}
          >
            Toggle catalog
          </button>
          {showCatalog ? (
            <PromptCatalogTable
              entries={[commit, lint, broken]}
              filterState={filterState}
              onFilterStateChange={setFilterState}
            />
          ) : null}
        </>
      );
    }

    render(<Host />);
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search prompts" }),
      {
        target: { value: "lint" },
      },
    );
    await waitFor(() =>
      expect(screen.queryByText("Commit message")).not.toBeInTheDocument(),
    );

    fireEvent.click(screen.getByRole("button", { name: "Toggle catalog" }));
    fireEvent.click(screen.getByRole("button", { name: "Toggle catalog" }));

    expect(
      screen.getByRole("searchbox", { name: "Search prompts" }),
    ).toHaveValue("lint");
    expect(screen.getByText("Lint fix")).toBeInTheDocument();
    expect(screen.queryByText("Commit message")).not.toBeInTheDocument();
  });
});
