import type { ResourceIconCategory } from "../src/resource-icon-palette";
import type { ResourceBackground } from "./resource-icon-composition";
import type { SelectionRow } from "./icon-sources";

export const KUBERNETES_COMMUNITY_COMMIT =
  "a0b641801c6099de5886621cf8d667d6b75615b4";

export type ResourceIconOptions = {
  category: ResourceIconCategory;
  backgrounds: ResourceBackground[];
  providerBadges?: boolean;
};

export type ResourceSelectionRow = SelectionRow & {
  resource: ResourceIconOptions;
};

function cloud(
  name: string,
  source: string,
  category: ResourceIconCategory,
  backgrounds: ResourceBackground[] = [],
): ResourceSelectionRow {
  return {
    consumerName: `cloud-${name}`,
    group: "cloud-resources",
    status: "NEW",
    outline: `ph:${source}-light`,
    filled: "skip",
    note: "",
    resource: { category, backgrounds, providerBadges: true },
  };
}

function kubernetes(
  name: string,
  source: string,
  category: ResourceIconCategory,
): ResourceSelectionRow {
  return {
    consumerName: `kube-${name}`,
    group: "kubernetes",
    status: "NEW",
    outline: `k8s-community:${source}`,
    filled: "skip",
    note: "",
    resource: { category, backgrounds: ["octagon"] },
  };
}

export const cloudResourceRows: ResourceSelectionRow[] = [
  cloud("vm", "computer-tower", "compute", ["square"]),
  cloud("container", "cube", "compute"),
  cloud("cluster", "squares-four", "compute"),
  cloud("disk", "hard-drive", "storage", ["circle"]),
  cloud("bucket", "archive", "storage"),
  cloud("network", "network", "network", ["octagon"]),
  cloud("subnet", "share-network", "network"),
  cloud("load-balancer", "arrows-split", "network"),
  cloud("config", "sliders-horizontal", "config"),
  cloud("secret", "key", "security"),
  cloud("policy", "scroll", "policy"),
  cloud("firewall", "wall", "security", ["shield"]),
];

export const kubernetesResourceRows: ResourceSelectionRow[] = [
  kubernetes("cluster-role", "resources/unlabeled/c-role", "policy"),
  kubernetes("config-map", "resources/unlabeled/cm", "config"),
  kubernetes("cluster-role-binding", "resources/unlabeled/crb", "policy"),
  kubernetes("custom-resource-definition", "resources/unlabeled/crd", "config"),
  kubernetes("cron-job", "resources/unlabeled/cronjob", "compute"),
  kubernetes("deployment", "resources/unlabeled/deploy", "compute"),
  kubernetes("daemon-set", "resources/unlabeled/ds", "compute"),
  kubernetes("endpoints", "resources/unlabeled/ep", "network"),
  kubernetes("group", "resources/unlabeled/group", "security"),
  kubernetes("horizontal-pod-autoscaler", "resources/unlabeled/hpa", "compute"),
  kubernetes("ingress", "resources/unlabeled/ing", "network"),
  kubernetes("job", "resources/unlabeled/job", "compute"),
  kubernetes("limit-range", "resources/unlabeled/limits", "policy"),
  kubernetes("network-policy", "resources/unlabeled/netpol", "policy"),
  kubernetes("namespace", "resources/unlabeled/ns", "config"),
  kubernetes("pod", "resources/unlabeled/pod", "compute"),
  kubernetes("pod-security-policy", "resources/unlabeled/psp", "policy"),
  kubernetes("persistent-volume", "resources/unlabeled/pv", "storage"),
  kubernetes("persistent-volume-claim", "resources/unlabeled/pvc", "storage"),
  kubernetes("resource-quota", "resources/unlabeled/quota", "policy"),
  kubernetes("role-binding", "resources/unlabeled/rb", "policy"),
  kubernetes("role", "resources/unlabeled/role", "policy"),
  kubernetes("replica-set", "resources/unlabeled/rs", "compute"),
  kubernetes("service-account", "resources/unlabeled/sa", "security"),
  kubernetes("storage-class", "resources/unlabeled/sc", "storage"),
  kubernetes("secret", "resources/unlabeled/secret", "security"),
  kubernetes("stateful-set", "resources/unlabeled/sts", "compute"),
  kubernetes("service", "resources/unlabeled/svc", "network"),
  kubernetes("user", "resources/unlabeled/user", "security"),
  kubernetes("volume", "resources/unlabeled/vol", "storage"),
  kubernetes(
    "control-plane",
    "infrastructure_components/unlabeled/control-plane",
    "compute",
  ),
  kubernetes("etcd", "infrastructure_components/unlabeled/etcd", "storage"),
  kubernetes("node", "infrastructure_components/unlabeled/node", "compute"),
  kubernetes("api-server", "control_plane_components/labeled/api", "compute"),
  kubernetes(
    "cloud-controller-manager",
    "control_plane_components/labeled/c-c-m",
    "compute",
  ),
  kubernetes(
    "controller-manager",
    "control_plane_components/labeled/c-m",
    "compute",
  ),
  kubernetes("proxy", "control_plane_components/labeled/k-proxy", "network"),
  kubernetes("kubelet", "control_plane_components/labeled/kubelet", "compute"),
  kubernetes("scheduler", "control_plane_components/labeled/sched", "compute"),
];
