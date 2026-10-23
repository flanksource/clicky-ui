import { useState } from "react";
import { GitFilePicker } from "./GitFilePicker";
import { GitBranchPicker, GitPipelinePicker, GitPipelineExecutionPicker } from "./GitPickers";
import type { GitFileValue, GitPickerClient } from "./types";

const sha = "ca13cb2938c401821f792ae9c8d4e4b6d12adfb0";
const branches = [{ name: "refs/heads/main", sha, author: "Alex Morgan", subject: "Update authorization workbook", date: "2026-10-20T09:30:00Z" }];
const pipelines = [{ id: "42", name: "Validate configuration", path: ".github/workflows/validate.yml" }];
const executions = [{ id: "123", pipeline: "42", number: "123", name: "Validate configuration", branch: "refs/heads/main", sha,
  status: "completed", result: "succeeded", author: "Alex Morgan", createdAt: "2026-10-20T09:35:00Z" }];
const client: GitPickerClient = {
  connections: async () => [{ name: "example", type: "github" }, { name: "delivery", type: "gitlab" }],
  repositories: async ({ connection }) => [{ fullName: `${connection === "example" ? "acme" : "delivery"}/rules`, name: "rules", defaultBranch: "main" }],
  refs: async () => ({ branches, tags: [] }),
  commits: async () => ({ items: branches.map(({ name: _name, ...commit }) => commit) }),
  files: async () => ({ sha, paths: ["security/authorization.xlsx", "security/review.xlsx"] }),
};

export function GitPickersDemo() {
  const [file, setFile] = useState<GitFileValue>({ connection: "example", repo: "acme/rules", ref: "refs/heads/main", path: "", sha: "" });
  const [branch, setBranch] = useState("refs/heads/main");
  const [pipeline, setPipeline] = useState("42");
  const [execution, setExecution] = useState("");
  return <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
    <section className="min-w-0 space-y-3">
      <h2 className="text-sm font-semibold">Workbook from Git</h2>
      <GitFilePicker client={client} value={file} onChange={setFile} accept={[".xlsx"]} help="Select a workbook at an immutable commit." />
      <output className="block break-all text-xs text-muted-foreground">{file.path ? `${file.path} @ ${file.sha}` : "Choose a workbook"}</output>
    </section>
    <section className="min-w-0 space-y-3">
      <h2 className="text-sm font-semibold">Controlled pipeline controls</h2>
      <GitBranchPicker value={branch} onChange={setBranch} items={branches} />
      <GitPipelinePicker value={pipeline} onChange={(id) => { setPipeline(id); setExecution(""); }} items={pipelines} />
      <GitPipelineExecutionPicker value={execution} onChange={setExecution} items={executions} disabled={!pipeline} />
    </section>
  </div>;
}
