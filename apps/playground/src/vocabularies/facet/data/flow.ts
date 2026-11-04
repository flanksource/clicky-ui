export default [
  {
    "catalog": "facet",
    "type": "flow",
    "id": "flow/request",
    "label": "flow/request",
    "description": "Request direction; response omitted",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolFlows"
    ],
    "section": "protocol-flows"
  },
  {
    "catalog": "facet",
    "type": "flow",
    "id": "flow/websocket",
    "label": "flow/websocket",
    "description": "Both peers can send messages",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolFlows"
    ],
    "section": "protocol-flows"
  },
  {
    "catalog": "facet",
    "type": "flow",
    "id": "flow/sse",
    "label": "flow/sse",
    "description": "Client starts the request; events flow server to client",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolFlows"
    ],
    "section": "protocol-flows"
  },
  {
    "catalog": "facet",
    "type": "flow",
    "id": "flow/webhook",
    "label": "flow/webhook",
    "description": "Producer sends an event over HTTPS POST",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolFlows"
    ],
    "section": "protocol-flows"
  },
  {
    "catalog": "facet",
    "type": "flow",
    "id": "flow/publish",
    "label": "flow/publish",
    "description": "Subscriber receives events on a separate flow",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolFlows"
    ],
    "section": "protocol-flows"
  },
  {
    "catalog": "facet",
    "type": "flow",
    "id": "flow/subscription",
    "label": "flow/subscription",
    "description": "GraphQL subscription events; transport can be WS or SSE",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/protocols-and-elements.tsx#ProtocolFlows"
    ],
    "section": "protocol-flows"
  },
  {
    "catalog": "facet",
    "type": "flow",
    "id": "flow/data",
    "label": "flow/data",
    "description": "Primary data path",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/vocabulary.tsx#LineColors"
    ],
    "section": "line-colors"
  },
  {
    "catalog": "facet",
    "type": "flow",
    "id": "flow/control",
    "label": "flow/control",
    "description": "Commands and API calls",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/vocabulary.tsx#LineColors"
    ],
    "section": "line-colors"
  },
  {
    "catalog": "facet",
    "type": "flow",
    "id": "flow/policy",
    "label": "flow/policy",
    "description": "Sensitive, identity, secrets",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/vocabulary.tsx#LineColors"
    ],
    "section": "line-colors"
  },
  {
    "catalog": "facet",
    "type": "flow",
    "id": "flow/async",
    "label": "flow/async",
    "description": "Queues and batch",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/vocabulary.tsx#LineColors"
    ],
    "section": "line-colors"
  },
  {
    "catalog": "facet",
    "type": "flow",
    "id": "flow/context",
    "label": "flow/context",
    "description": "Background, out of focus",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/vocabulary.tsx#LineColors"
    ],
    "section": "line-colors"
  },
  {
    "catalog": "facet",
    "type": "flow",
    "id": "flow/error",
    "label": "flow/error",
    "description": "Failure or exception path",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/vocabulary.tsx#LineColors"
    ],
    "section": "line-colors"
  }
];
