export default [
  {
    "catalog": "facet",
    "type": "interface",
    "id": "interface/https",
    "label": "interface/https",
    "description": "HTTP request over TLS",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolInterfaces"
    ],
    "section": "protocol-interfaces"
  },
  {
    "catalog": "facet",
    "type": "interface",
    "id": "interface/grpc",
    "label": "interface/grpc",
    "description": "Unary or streaming RPC; show the direction",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolInterfaces"
    ],
    "section": "protocol-interfaces"
  },
  {
    "catalog": "facet",
    "type": "interface",
    "id": "interface/graphql",
    "label": "interface/graphql",
    "description": "Query or mutation over HTTP",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolInterfaces"
    ],
    "section": "protocol-interfaces"
  },
  {
    "catalog": "facet",
    "type": "interface",
    "id": "interface/amqp",
    "label": "interface/amqp",
    "description": "Publish through a messaging protocol",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolInterfaces"
    ],
    "section": "protocol-interfaces"
  },
  {
    "catalog": "facet",
    "type": "interface",
    "id": "interface/sql",
    "label": "interface/sql",
    "description": "Database interface, not a network transport",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolInterfaces"
    ],
    "section": "protocol-interfaces"
  },
  {
    "catalog": "facet",
    "type": "interface",
    "id": "interface/oidc",
    "label": "interface/oidc",
    "description": "OpenID Connect identity interaction",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolInterfaces"
    ],
    "section": "protocol-interfaces"
  },
  {
    "catalog": "facet",
    "type": "interface",
    "id": "interface/mtls",
    "label": "interface/mtls",
    "description": "Both peers present certificates on one TLS session",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolInterfaces"
    ],
    "section": "protocol-interfaces"
  },
  {
    "catalog": "facet",
    "type": "interface",
    "id": "interface/jwt",
    "label": "interface/jwt",
    "description": "Signed bearer token the API validates per request",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolInterfaces"
    ],
    "section": "protocol-interfaces"
  },
  {
    "catalog": "facet",
    "type": "interface",
    "id": "interface/k8s-service-account",
    "label": "interface/k8s-service-account",
    "description": "Projected service account token authenticates the pod",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolInterfaces"
    ],
    "section": "protocol-interfaces"
  },
  {
    "catalog": "facet",
    "type": "interface",
    "id": "interface/aws-workload-identity",
    "label": "interface/aws-workload-identity",
    "description": "Pod exchanges its token for IAM role credentials (IRSA / Pod Identity)",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolInterfaces"
    ],
    "section": "protocol-interfaces"
  }
];
