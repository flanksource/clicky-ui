import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GitSourcePicker } from "./GitSourcePicker";
import type { GitPickerClient } from "./types";

const sha = "a".repeat(40);
function client(): GitPickerClient {
  return {
    connections: vi.fn().mockResolvedValue([{ name: "primary", type: "github" }, { name: "secondary", type: "gitlab" }, { name: "pinned", type: "git" }]),
    repositories: vi.fn().mockResolvedValue([{ name: "rules", fullName: "acme/rules", defaultBranch: "qa" }]),
    refs: vi.fn().mockResolvedValue({ branches: [{ name: "qa", sha }], tags: [{ name: "release", sha }] }),
    files: vi.fn(),
  };
}

describe("GitSourcePicker repository catalog", () => {
  it("lists every repository grouped by connection without a connection dropdown", async () => {
    const api = client();
    const onChange = vi.fn();
    render(<GitSourcePicker client={api} value={{ connection: "primary", repo: "acme/rules", ref: "refs/heads/qa" }} onChange={onChange} />);
    await waitFor(() => expect(api.repositories).toHaveBeenCalledTimes(3));
    const repo = screen.getByRole("combobox", { name: "Repository" });
    await waitFor(() => expect(repo).toHaveValue("acme/rules"));
    expect(screen.queryByRole("combobox", { name: "Git connection" })).not.toBeInTheDocument();
    fireEvent.focus(repo);
    const list = screen.getByRole("listbox", { name: "Repository" });
    expect(within(list).getByText("primary")).toBeInTheDocument();
    expect(within(list).getByText("secondary")).toBeInTheDocument();
    expect(within(list).getByText("pinned")).toBeInTheDocument();
    const options = within(list).getAllByRole("option");
    fireEvent.mouseDown(options[1]!);
    expect(onChange).toHaveBeenCalledWith({ connection: "secondary", repo: "acme/rules", ref: "refs/heads/qa" });
  });

  it("selects a pinned repository without emitting a repository argument", async () => {
    const api = client();
    const onChange = vi.fn();
    render(<GitSourcePicker client={api} value={{ connection: "", repo: "", ref: "" }} onChange={onChange} />);
    await waitFor(() => expect(api.repositories).toHaveBeenCalledTimes(3));
    const repo = screen.getByRole("combobox", { name: "Repository" });
    fireEvent.focus(repo);
    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(3));
    fireEvent.mouseDown(screen.getAllByRole("option")[2]!);
    expect(onChange).toHaveBeenCalledWith({ connection: "pinned", repo: "", ref: "refs/heads/qa" });
  });

  it("shows individual provider failures and retries without hiding other connections' repositories", async () => {
    const api = client();
    vi.mocked(api.repositories).mockImplementation(async (request) => {
      if (request.connection === "secondary") throw new Error("Repository access denied");
      return [{ name: "rules", fullName: "acme/rules", defaultBranch: "qa" }];
    });
    render(<GitSourcePicker client={api} value={{ connection: "primary", repo: "acme/rules", ref: "refs/heads/qa" }} onChange={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("secondary: Repository access denied");
    fireEvent.focus(screen.getByRole("combobox", { name: "Repository" }));
    expect(screen.getAllByRole("option")).toHaveLength(2);
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Repository" }), { key: "Escape" });
    vi.mocked(api.repositories).mockResolvedValue([{ name: "rules", fullName: "acme/rules", defaultBranch: "qa" }]);
    fireEvent.click(screen.getByRole("button", { name: "Retry repositories" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
    expect(screen.getByRole("combobox", { name: "Repository" })).toHaveValue("acme/rules");
  });

  it("offers only branches in branch mode and clears the ref when a repository is cleared", async () => {
    const api = client();
    const onChange = vi.fn();
    render(<GitSourcePicker client={api} branchesOnly value={{ connection: "primary", repo: "acme/rules", ref: "refs/heads/qa" }} onChange={onChange} />);
    const branch = await screen.findByRole("combobox", { name: "Target branch" });
    await waitFor(() => expect(branch).toHaveValue("qa"));
    fireEvent.focus(branch);
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.queryByText("release")).not.toBeInTheDocument();
    fireEvent.keyDown(branch, { key: "Escape" });
    const repo = screen.getByRole("combobox", { name: "Repository" });
    await waitFor(() => expect(repo).toHaveValue("acme/rules"));
    fireEvent.click(screen.getAllByRole("button", { name: "Clear" })[0]!);
    expect(onChange).toHaveBeenCalledWith({ connection: "", repo: "", ref: "" });
  });
});
