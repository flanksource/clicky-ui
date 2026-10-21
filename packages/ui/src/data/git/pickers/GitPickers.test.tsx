import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GitBranchPicker, GitCommitPicker, GitPipelinePicker, GitRepositoryPicker, GitPipelineExecutionPicker } from "./GitPickers";
import { GitFilePicker } from "./GitFilePicker";
import { GitSourcePicker } from "./GitSourcePicker";
import type { GitPickerClient, GitPickerPage, GitPipelineOption } from "./types";

const sha = "a".repeat(40);
const branch = { name: "feature/eligibility/check-dependent-benefits", sha, author: "Alex Morgan", subject: "Validate dependent benefits", date: "2026-10-20T10:00:00Z" };

describe("controlled Git pickers", () => {
  it("retries a failed connection catalog without losing the controlled source", async () => {
    const connections = vi.fn().mockRejectedValueOnce(new Error("Catalog unavailable")).mockResolvedValueOnce([{ name: "host", type: "git" }]);
    const client: GitPickerClient = { connections, repositories: vi.fn().mockResolvedValue([{ name: "rules", fullName: "acme/rules" }]), refs: vi.fn().mockResolvedValue({ branches: [], tags: [] }), files: vi.fn() };
    render(<GitSourcePicker client={client} value={{ connection: "host", repo: "", ref: "main" }} onChange={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Catalog unavailable");
    fireEvent.click(screen.getByRole("button", { name: "Retry repositories" }));
    await waitFor(() => expect(connections).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole("combobox", { name: "Git ref" })).toHaveValue("main");
  });
  it("emits qualified branches and respects externally controlled updates", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<GitBranchPicker label="Branch" items={[branch, { name: "main", sha }]} value="refs/heads/main" onChange={onChange} />);
    const input = screen.getByRole("combobox", { name: "Branch" });
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "dependent benefits" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(`refs/heads/${branch.name}`, branch);
    expect(onChange).toHaveBeenCalledTimes(1);
    rerender(<GitBranchPicker label="Branch" items={[branch]} value={`refs/heads/${branch.name}`} onChange={onChange} />);
    expect(input).toHaveValue(branch.name);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("shows author metadata and a compact selected SHA while emitting the full SHA", () => {
    render(<GitCommitPicker items={[{ ...branch, subject: "Validate dependent benefits" }]} value={sha} onChange={vi.fn()} />);
    expect(screen.getByRole("combobox", { name: "Commit" })).toHaveValue(sha.slice(0, 7));
    expect(screen.getByText("Validate dependent benefits")).toBeInTheDocument();
    expect(screen.getByText(/Alex Morgan/)).toBeInTheDocument();
  });

  it("renders repositories, pipelines, and executions as independent controlled controls", () => {
    render(<>
      <GitRepositoryPicker items={[{ fullName: "acme/rules", name: "rules" }]} value="acme/rules" onChange={vi.fn()} />
      <GitPipelinePicker items={[{ id: "17", name: "Rules CI", path: ".github/workflows/ci.yml" }]} value="17" onChange={vi.fn()} />
      <GitPipelineExecutionPicker items={[{ id: "91", pipeline: "17", number: "20261020.1", name: "Validate rules", branch: "refs/heads/main", sha, status: "completed", result: "success", createdAt: "2026-10-20T10:00:00Z" }]} value="91" onChange={vi.fn()} />
    </>);
    expect(screen.getByRole("combobox", { name: "Repository" })).toHaveValue("acme/rules");
    expect(screen.getByRole("combobox", { name: "Pipeline" })).toHaveValue("Rules CI");
    expect(screen.getByRole("combobox", { name: "Pipeline execution" })).toHaveValue("#20261020.1");
  });

  it("discards stale loads, retains controlled values, and loads additional pages", async () => {
    let resolveOld!: (page: GitPickerPage<GitPipelineOption>) => void;
    const old = vi.fn(() => new Promise<GitPickerPage<GitPipelineOption>>((resolve) => { resolveOld = resolve; }));
    const current = vi.fn().mockResolvedValueOnce({ items: [{ id: "2", name: "Current pipeline" }], nextCursor: "next" }).mockResolvedValueOnce({ items: [{ id: "3", name: "Older pipeline" }] });
    const { rerender } = render(<GitPipelinePicker load={old} scope="old-repo" value="" onChange={vi.fn()} />);
    rerender(<GitPipelinePicker load={current} scope="new-repo" value="2" onChange={vi.fn()} />);
    await waitFor(() => expect(screen.getByRole("combobox", { name: "Pipeline" })).toHaveValue("Current pipeline"));
    await act(async () => resolveOld({ items: [{ id: "1", name: "Stale pipeline" }] }));
    expect(screen.queryByText("Stale pipeline")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Load more pipelines" }));
    await waitFor(() => expect(current).toHaveBeenCalledTimes(2));
    expect(current.mock.calls[1]?.[0].cursor).toBe("next");
  });

  it("surfaces loader failures with a working retry", async () => {
    const load = vi.fn().mockRejectedValueOnce(new Error("Provider unavailable")).mockResolvedValueOnce({ items: [] });
    render(<GitPipelinePicker load={load} value="" onChange={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Provider unavailable");
    fireEvent.click(screen.getByRole("button", { name: "Retry pipelines" }));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("resets a dependent file when its repository changes and emits the file's resolved SHA", async () => {
    const onChange = vi.fn();
    const client: GitPickerClient = {
      connections: vi.fn().mockResolvedValue([{ name: "host", type: "github" }]),
      repositories: vi.fn().mockResolvedValue([{ name: "rules", fullName: "acme/rules", defaultBranch: "main" }, { name: "other", fullName: "acme/other", defaultBranch: "main" }]),
      refs: vi.fn().mockResolvedValue({ branches: [{ name: "main", sha }], tags: [] }),
      files: vi.fn().mockResolvedValue({ sha, paths: ["reports/grants.xlsx"] }),
    };
    render(<GitFilePicker client={client} value={{ connection: "host", repo: "acme/rules", ref: "refs/heads/main", path: "", sha: "" }} onChange={onChange} accept={[".xlsx"]} />);
    const file = await screen.findByRole("combobox", { name: "Git file" });
    await waitFor(() => expect(client.files).toHaveBeenCalled());
    fireEvent.focus(file);
    fireEvent.keyDown(file, { key: "ArrowDown" });
    fireEvent.keyDown(file, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith({ connection: "host", repo: "acme/rules", ref: "refs/heads/main", path: "reports/grants.xlsx", sha });
    const repository = screen.getByRole("combobox", { name: "Repository" });
    fireEvent.focus(repository);
    fireEvent.change(repository, { target: { value: "acme/other" } });
    fireEvent.keyDown(repository, { key: "ArrowDown" });
    fireEvent.keyDown(repository, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith({ connection: "host", repo: "acme/other", ref: "refs/heads/main", path: "", sha: "" });
  });
});
