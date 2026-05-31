import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { CommandForm } from "./CommandForm";
import type { OpenAPIParameter } from "./types";

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

const meta: Meta<typeof CommandForm> = {
  title: "Clicky-RPC/CommandForm",
  component: CommandForm,
  parameters: {
    docs: {
      description: {
        component:
          "Renders an OpenAPI operation's parameters as a form. It switches from a stacked layout (label above the input) to an inline layout (label beside the input) once there are 6 or more visible fields.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CommandForm>;

export const StackedLayout: Story = {
  args: {
    parameters: FEW_PARAMETERS,
    onExecute: fn(),
    isPending: false,
    method: "post",
    path: "/api/v1/services/{name}/restart",
    accept: "application/json",
  },
};

export const InlineLayout: Story = {
  args: {
    parameters: MANY_PARAMETERS,
    onExecute: fn(),
    isPending: false,
    method: "post",
    path: "/api/v1/clusters/{cluster}/nodes",
    accept: "application/json",
  },
};
