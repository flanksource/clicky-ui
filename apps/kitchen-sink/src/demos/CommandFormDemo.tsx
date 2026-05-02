import { useState } from "react";
import { CommandForm } from "@flanksource/clicky-ui";
import type { OpenAPIParameter } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const FEW_PARAMETERS: OpenAPIParameter[] = [
  {
    name: "name",
    in: "query",
    required: true,
    description: "Service name",
    schema: { type: "string" },
  },
  { name: "force", in: "query", description: "Skip drain", schema: { type: "boolean" } },
];

const MANY_PARAMETERS: OpenAPIParameter[] = [
  {
    name: "cluster",
    in: "path",
    required: true,
    description: "Cluster id",
    schema: { type: "string" },
  },
  {
    name: "name",
    in: "query",
    required: true,
    description: "Node name",
    schema: { type: "string" },
  },
  {
    name: "instanceType",
    in: "query",
    description: "EC2 instance type",
    schema: { type: "string", default: "m6i.large" },
  },
  {
    name: "region",
    in: "query",
    description: "AWS region",
    schema: { type: "string", enum: ["us-east-1", "us-west-2", "eu-west-1"] },
  },
  { name: "az", in: "query", description: "Availability zone", schema: { type: "string" } },
  {
    name: "diskGb",
    in: "query",
    description: "Root disk size in GB",
    schema: { type: "integer", default: 100 },
  },
  { name: "memoryGb", in: "query", description: "Memory in GB", schema: { type: "integer" } },
  { name: "vcpus", in: "query", description: "Virtual CPUs", schema: { type: "integer" } },
  {
    name: "spot",
    in: "query",
    description: "Use spot instances",
    schema: { type: "boolean", default: false },
  },
  {
    name: "labels",
    in: "query",
    description: "Repeatable key=value labels",
    schema: { type: "array" },
  },
  { name: "taints", in: "query", description: "Repeatable taints", schema: { type: "array" } },
  { name: "ami", in: "query", description: "Custom AMI id", schema: { type: "string" } },
  { name: "subnet", in: "query", description: "Subnet id", schema: { type: "string" } },
  {
    name: "ttl",
    in: "query",
    description: "Auto-terminate after duration (e.g. 24h)",
    schema: { type: "string" },
  },
];

export function CommandFormDemo() {
  const [lastSubmit, setLastSubmit] = useState<string>("");

  return (
    <DemoSection
      id="command-form"
      title="CommandForm"
      description="Renders an OpenAPI operation's parameters as a form. Switches from stacked (label above input) to inline (label beside input) once there are 6 or more visible fields."
    >
      <div className="space-y-density-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Stacked layout · 2 fields</h3>
        <div className="rounded-md border border-border bg-muted/30 p-density-3">
          <CommandForm
            parameters={FEW_PARAMETERS}
            onExecute={(params) => setLastSubmit(JSON.stringify(params))}
            isPending={false}
            method="post"
            path="/api/v1/services/{name}/restart"
            accept="application/json"
          />
        </div>
      </div>

      <div className="space-y-density-2">
        <h3 className="text-sm font-semibold text-muted-foreground">Inline layout · 14 fields</h3>
        <div className="rounded-md border border-border bg-muted/30 p-density-3">
          <CommandForm
            parameters={MANY_PARAMETERS}
            onExecute={(params) => setLastSubmit(JSON.stringify(params))}
            isPending={false}
            method="post"
            path="/api/v1/clusters/{cluster}/nodes"
            accept="application/json"
          />
        </div>
      </div>

      {lastSubmit && (
        <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-density-3 text-xs">
          Last submit: {lastSubmit}
        </pre>
      )}
    </DemoSection>
  );
}
