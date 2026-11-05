import { createElement, type ReactNode } from "react";

import { AwsEksCluster } from "@flanksource/icons/mi";

import { AWS_GROUP_ICONS } from "./aws-group-icons";

function DrawioIcon({ name }: { name: string }) {
  const icon = AWS_GROUP_ICONS[name];
  if (!icon) throw new Error(`no draw.io group icon ${JSON.stringify(name)}; regenerate aws-group-icons.ts`);
  return (
    <svg viewBox={icon.viewBox} className="h-[25px] w-[25px] shrink-0" aria-hidden="true">
      {icon.parts.map(({ tag, attrs }, i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}

export type AwsGroupStyle ={ label: string; stroke: string; font: string; fill?: string; dashed?: boolean; icon?: ReactNode; centered?: boolean };

const drawio = (name: string) => <DrawioIcon name={name} />;

/*
 * draw.io's mxgraph.aws4 group shapes, matched to the exported Sidebar-AWS4
 * styles: a square-cornered 1px outline, the group icon flush in the top-left
 * corner (or centred on top for groupCenter shapes) and the label in the font
 * colour. Icons are the draw.io artwork, extracted by hack/drawio-icons.mjs.
 */
export const AWS_GROUPS = {
  "aws-cloud": { label: "AWS Cloud", stroke: "#232F3E", font: "#232F3E", icon: drawio("aws-cloud") },
  "aws-cloud-alt": { label: "AWS Cloud (alt)", stroke: "#232F3E", font: "#232F3E", icon: drawio("aws-cloud-alt") },
  account: { label: "AWS Account", stroke: "#CD2264", font: "#CD2264", icon: drawio("account") },
  region: { label: "Region", stroke: "#00A4A6", font: "#147EBA", dashed: true, icon: drawio("region") },
  "availability-zone": { label: "Availability Zone", stroke: "#147EBA", font: "#147EBA", dashed: true, centered: true },
  vpc: { label: "VPC", stroke: "#8C4FFF", font: "#AAB7B8", icon: drawio("vpc2") },
  "private-subnet": { label: "Private subnet", stroke: "#00A4A6", font: "#147EBA", fill: "#E6F6F7", icon: drawio("private-subnet") },
  "public-subnet": { label: "Public subnet", stroke: "#7AA116", font: "#248814", fill: "#F2F6E8", icon: drawio("public-subnet") },
  "security-group": { label: "Security group", stroke: "#DD3522", font: "#DD3522" },
  "auto-scaling-group": { label: "Auto Scaling group", stroke: "#D86613", font: "#D86613", dashed: true, icon: drawio("auto-scaling-group") },
  "eks-cluster": { label: "EKS cluster", stroke: "#ED7100", font: "#ED7100", icon: <span className="flex h-[25px] w-[25px] shrink-0 [&>svg]:h-full [&>svg]:w-full"><AwsEksCluster /></span> },
  "ec2-instance-contents": { label: "EC2 instance contents", stroke: "#D86613", font: "#D86613", icon: drawio("ec2-instance-contents") },
  "spot-fleet": { label: "Spot Fleet", stroke: "#D86613", font: "#D86613", icon: drawio("spot-fleet") },
  "elastic-beanstalk": { label: "Elastic Beanstalk container", stroke: "#D86613", font: "#D86613", icon: drawio("elastic-beanstalk") },
  "step-functions-workflow": { label: "AWS Step Functions workflow", stroke: "#CD2264", font: "#CD2264", icon: drawio("aws-step-functions-workflow") },
  "iot-greengrass": { label: "AWS IoT Greengrass", stroke: "#7AA116", font: "#3F8624", icon: drawio("iot-greengrass") },
  "iot-greengrass-deployment": { label: "AWS IoT Greengrass Deployment", stroke: "#7AA116", font: "#3F8624", icon: drawio("iot-greengrass-deployment") },
  "server-contents": { label: "Server contents", stroke: "#7D8998", font: "#5A6C86", icon: drawio("on-premise") },
  "corporate-data-center": { label: "Corporate data center", stroke: "#7D8998", font: "#5A6C86", icon: drawio("corporate-data-center") },
  "generic-group": { label: "Generic group", stroke: "transparent", font: "#232F3D", fill: "#EFF0F3" },
} satisfies Record<string, AwsGroupStyle>;

export type AwsGroupKind = keyof typeof AWS_GROUPS;

/** A 25px square filled with the box colour, holding a white glyph: the draw.io group icon tile. */
export const IconTile = ({ color, children }: { color: string; children: ReactNode }) => (
  <span className="flex h-[25px] w-[25px] shrink-0 items-center justify-center text-white [&>svg]:h-4 [&>svg]:w-4" style={{ backgroundColor: color }}>{children}</span>
);

/**
 * box/aws: the draw.io AWS group look for any box. A square-cornered 1px border
 * in one colour, the icon tile flush in the top-left corner, the title beside it
 * in the same colour. AwsGroup is box/aws with the AWS4 sidebar presets.
 */
export function AwsBox({ box, title, children, ...data }: { box: AwsGroupStyle; title: string; children?: ReactNode; "data-aws-group"?: string }) {
  return (
    <div {...data} data-box-style="aws" className="w-max min-w-[150px] shrink-0" style={{ border: `1px ${box.dashed ? "dashed" : "solid"} ${box.stroke}`, backgroundColor: box.fill ?? "transparent" }}>
      <div className={`flex min-h-[25px] text-[12px] leading-tight ${box.centered ? "flex-col items-center" : "items-center gap-1.5"}`} style={{ color: box.font }}>
        {box.icon}
        <span className={box.icon && !box.centered ? "pr-2" : "px-2 pt-1"}>{title}</span>
      </div>
      {children != null && <div className="flex flex-col gap-2 p-2.5 pt-2">{children}</div>}
    </div>
  );
}

export function AwsGroup({ kind, title, children }: { kind: AwsGroupKind; title: string; children?: ReactNode }) {
  return <AwsBox data-aws-group={kind} box={AWS_GROUPS[kind]} title={title}>{children}</AwsBox>;
}

/** box/aws for any colour and glyph. */
export const awsBox = (color: string, glyph: ReactNode): AwsGroupStyle => ({ label: "box/aws", stroke: color, font: color, icon: <IconTile color={color}>{glyph}</IconTile> });
