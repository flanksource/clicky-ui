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

  it("shows the newest 50 branches and 10 tags, reveals more per group, and searches every ref", async () => {
    const api = client();
    const day = (n: number) => new Date(Date.UTC(2026, 0, 1 + n)).toISOString();
    vi.mocked(api.refs).mockResolvedValue({
      branches: Array.from({ length: 60 }, (_, n) => ({ name: `b${String(n).padStart(2, "0")}`, sha, date: day(n) })),
      tags: Array.from({ length: 12 }, (_, n) => ({ name: `t${String(n).padStart(2, "0")}`, sha, date: day(n) })),
    });
    render(<GitSourcePicker client={api} value={{ connection: "primary", repo: "acme/rules", ref: "" }} onChange={vi.fn()} />);
    const ref = await screen.findByRole("combobox", { name: "Git ref" });
    await waitFor(() => expect(api.refs).toHaveBeenCalled());
    fireEvent.focus(ref);
    const labels = () => screen.getAllByRole("option").map((option) => option.title.split("\n")[0]);
    await waitFor(() => expect(labels()).toHaveLength(60));
    expect([labels()[0], labels()[49], labels()[50], labels()[59]])
      .toEqual(["refs/heads/b59", "refs/heads/b10", "refs/tags/t11", "refs/tags/t02"]);

    fireEvent.click(screen.getByRole("button", { name: "Show 10 more branches" }));
    expect(labels()).toHaveLength(70);
    expect(screen.queryByRole("button", { name: /more branches/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Show 2 more tags" }));
    expect(labels()).toHaveLength(72);

    fireEvent.change(ref, { target: { value: "b0" } });
    // The typed text is also offered as a custom ref; the listed refs are every match.
    await waitFor(() => expect(labels().filter((label) => label?.startsWith("refs/")))
      .toEqual(Array.from({ length: 10 }, (_, n) => `refs/heads/b0${9 - n}`)));
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
