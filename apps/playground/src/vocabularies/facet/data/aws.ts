const reference = "apps/playground/src/vocabularies/facet/specimens/vocabulary/layouts.tsx#NodeShowcase";

const term = (id: string, description: string) => ({ catalog: "facet", type: "aws", id, label: id, description, references: [reference], section: "node-showcase" });

export default [
  term("aws/account", "Ownership, billing and IAM boundary; the outermost scope, drawn as the draw.io AWS account group (solid #CD2264 outline, account icon top-left)"),
  term("aws/region", "Regional scope inside an account, drawn as the draw.io AWS region group (dashed #00A4A6 outline, flag icon top-left)"),
  term("aws/availability-zone", "Isolated location inside a region that wraps subnets or node groups, drawn as the draw.io availability zone group (dashed #147EBA outline, centred label, no icon)"),
  term("aws/workload-identity", "The identity a workload runs as: its Kubernetes service account and the IAM role it assumes through STS (IRSA / Pod Identity), drawn as tags/edge chips with icons on the workload box, never as separate boxes or containers"),
  term("aws/eks-topology", "Canonical nesting: account › region › EKS cluster › namespace › pod, with the AWS scopes as draw.io AWS groups and the workload identity as tags/edge on the pod"),
  term("aws/aws-cloud", "draw.io AWS Cloud group (solid #232F3E, AWS logo top-left)"),
  term("aws/aws-cloud-alt", "draw.io AWS Cloud group, alternate dark-tile logo (solid #232F3E)"),
  term("aws/vpc", "draw.io VPC group (solid #8C4FFF, VPC tile top-left); wraps subnets"),
  term("aws/private-subnet", "draw.io private subnet group (solid #00A4A6 on #E6F6F7, lock tile)"),
  term("aws/public-subnet", "draw.io public subnet group (solid #7AA116 on #F2F6E8, lock tile)"),
  term("aws/security-group", "draw.io security group (solid #DD3522, no icon)"),
  term("aws/auto-scaling-group", "draw.io Auto Scaling group (dashed #D86613, icon and label centred on top)"),
  term("aws/ec2-instance-contents", "draw.io EC2 instance contents group (solid #D86613, EC2 tile)"),
  term("aws/spot-fleet", "draw.io Spot Fleet group (solid #D86613)"),
  term("aws/elastic-beanstalk", "draw.io Elastic Beanstalk container group (solid #D86613)"),
  term("aws/step-functions-workflow", "draw.io AWS Step Functions workflow group (solid #CD2264)"),
  term("aws/iot-greengrass", "draw.io AWS IoT Greengrass group (solid #7AA116)"),
  term("aws/iot-greengrass-deployment", "draw.io AWS IoT Greengrass deployment group (solid #7AA116, tile)"),
  term("aws/server-contents", "draw.io server contents group (solid #7D8998, on-premise server icon)"),
  term("aws/corporate-data-center", "draw.io corporate data center group (solid #7D8998, building tile)"),
  term("aws/generic-group", "draw.io generic group (#EFF0F3 fill, no outline, no icon)"),
];
