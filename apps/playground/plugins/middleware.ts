import type { IncomingMessage, ServerResponse } from "node:http";

export type Middleware = (request: IncomingMessage, response: ServerResponse, next: (error?: unknown) => void) => void;
export type MiddlewareApp = {
  use(route: string, handler: Middleware): unknown;
  use(handler: Middleware): unknown;
};
export type ErrorLogger = { error(message: string): void };
