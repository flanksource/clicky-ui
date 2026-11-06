// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/src/utils/is-document-node.ts
import { DOCUMENT_NODE_TYPE } from "../constants.js";

export const isDocumentNode = (node: unknown): node is Document =>
  typeof node === "object" &&
  node !== null &&
  "nodeType" in node &&
  node.nodeType === DOCUMENT_NODE_TYPE;
