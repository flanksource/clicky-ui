import { expect, it } from "vitest";
import { createPageClients } from "./page-clients.ts";
import { LINK_CONTEXT_HEADER } from "./link-route.ts";

const origin = "https://runtime.example";
const FRAME = { id: "frame-1", url: `${origin}/frame/reports/q3.tsx` };
const WORKER = { id: "worker-1", url: `${origin}/npm/acme@1.0.0/worker.js` };
const SHELL = { id: "shell-1", url: `${origin}/` };

function setup() {
  const clients = [FRAME, WORKER, SHELL];
  return createPageClients({ origin, clients: { get: async (id) => clients.find((client) => client.id === id), matchAll: async () => clients } });
}
const event = (options: { url: string; clientId: string; resultingClientId?: string; destination?: RequestDestination }) => {
  const request = new Request(`${origin}${options.url}`);
  if (options.destination) Object.defineProperty(request, "destination", { value: options.destination });
  return { request, clientId: options.clientId, resultingClientId: options.resultingClientId ?? "" };
};
const query = async (clients: ReturnType<typeof setup>, options: Parameters<typeof event>[0]) => Object.fromEntries(new URL((await clients.request(event(options))).request.url).searchParams);

it("adds the requesting frame's page and the link context its document was served with", async () => {
  const clients = setup();
  expect(await query(clients, { url: "/npm/react@18.3.1/index.js", clientId: FRAME.id })).toEqual({ page: "reports/q3.tsx" });
  const frame = event({ url: "/frame/reports/q3.tsx", clientId: SHELL.id, resultingClientId: FRAME.id });
  await clients.served({ event: frame, owner: undefined, response: new Response("", { headers: { [LINK_CONTEXT_HEADER]: "context-a" } }) });
  expect(await query(clients, { url: "/npm/react@18.3.1/index.js", clientId: FRAME.id })).toEqual({ page: "reports/q3.tsx", "link-context": "context-a" });
  expect(await query(clients, { url: "/src/q3.tsx?page=other.tsx", clientId: FRAME.id })).toEqual({ page: "other.tsx", "link-context": "context-a" });
});

it("gives a worker the page of the frame that started it and leaves requests without a page client unchanged", async () => {
  const clients = setup();
  const started = await clients.request(event({ url: "/npm/acme@1.0.0/worker.js", clientId: FRAME.id, resultingClientId: WORKER.id, destination: "worker" }));
  await clients.served({ event: event({ url: "/npm/acme@1.0.0/worker.js", clientId: FRAME.id, resultingClientId: WORKER.id, destination: "worker" }), owner: started.owner, response: new Response("") });
  expect(await query(clients, { url: "/npm/acme@1.0.0/helper.js", clientId: WORKER.id })).toEqual({ page: "reports/q3.tsx" });
  expect(await query(clients, { url: "/npm/react@18.3.1/index.js", clientId: SHELL.id })).toEqual({});
  expect(await query(clients, { url: "/profile.json", clientId: FRAME.id })).toEqual({});
});
