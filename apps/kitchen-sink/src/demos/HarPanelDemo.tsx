import { HarPanel, type HAREntry } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

const entries: HAREntry[] = [
  {
    time: 123,
    request: {
      method: "GET",
      url: "https://api.example.com/v1/configs",
      headers: [
        { name: "accept", value: "application/json" },
        { name: "authorization", value: "Bearer ***" },
      ],
      bodySize: 0,
    },
    response: {
      status: 200,
      headers: [{ name: "content-type", value: "application/json" }],
      content: {
        size: 64,
        mimeType: "application/json",
        text: JSON.stringify({ items: [{ id: 1, name: "db" }] }, null, 2),
      },
      bodySize: 64,
    },
  },
  {
    time: 420,
    request: {
      method: "POST",
      url: "https://api.example.com/v1/configs",
      headers: [{ name: "content-type", value: "application/json" }],
      postData: { mimeType: "application/json", text: JSON.stringify({ name: "new-config" }) },
      bodySize: 24,
    },
    response: {
      status: 201,
      headers: [{ name: "content-type", value: "application/json" }],
      content: { size: 18, mimeType: "application/json", text: '{"id":"abc"}' },
      bodySize: 18,
    },
  },
  {
    time: 88,
    request: { method: "GET", url: "https://api.example.com/v1/missing", headers: [], bodySize: 0 },
    response: {
      status: 404,
      headers: [],
      content: { size: 9, mimeType: "text/plain", text: "Not found" },
      bodySize: 9,
    },
  },
  {
    time: 1200,
    request: { method: "GET", url: "https://api.example.com/v1/slow", headers: [], bodySize: 0 },
    response: {
      status: 503,
      headers: [],
      content: { size: 19, mimeType: "text/plain", text: "Service Unavailable" },
      bodySize: 19,
    },
  },
];

export function HarPanelDemo() {
  return (
    <DemoSection
      id="har-panel"
      title="HarPanel"
      description="HTTP archive (HAR) viewer using the shared sortable/filterable table with expandable rows."
    >
      <div className="h-[calc(100vh-10rem)] min-h-[320px] border border-border rounded-md overflow-hidden">
        <HarPanel entries={entries} />
      </div>
    </DemoSection>
  );
}
