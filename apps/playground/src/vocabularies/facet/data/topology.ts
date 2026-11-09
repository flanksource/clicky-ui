export default [
  {
    "catalog": "facet",
    "type": "topology",
    "id": "topology/decentralized",
    "label": "topology/decentralized",
    "description": "Two independent authorities distribute policies to local PDPs; each service enforces its own decision.",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/authorization.tsx#AuthorizationModels"
    ],
    "section": "authorization-models"
  },
  {
    "catalog": "facet",
    "type": "topology",
    "id": "topology/delegated",
    "label": "topology/delegated",
    "description": "The issuer exchanges a scoped token; the service checks the distinct subject and actor, audience and scope.",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/authorization.tsx#AuthorizationModels"
    ],
    "section": "authorization-models"
  }
];
