const reference = "apps/playground/src/vocabularies/facet/specimens/vocabulary/layouts.tsx#NodeShowcase";

const term = (id: string, description: string) => ({ catalog: "facet", type: "k8s", id, label: id, description, references: [reference], section: "node-showcase" });

export default [
  term("k8s/eks-cluster", "Regional EKS control plane spanning zones, drawn as a draw.io-style AWS group (solid #ED7100 outline, EKS tile top-left)"),
  term("k8s/namespace", "Logical scope inside one cluster, never inside a zone, drawn as box/aws in Kubernetes blue (#326CE5) with the namespace icon tile"),
  term("k8s/pod", "A pod is box/accent with the pod icon; add box-density/detailed fields (image, ready, node) only in spec figures"),
];
