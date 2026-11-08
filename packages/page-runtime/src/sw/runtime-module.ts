export const PAGE_AGENT_URL = "/__runtime/page-agent.js";

export async function pageAgentSource(options: { origin: string; fetch: typeof fetch }): Promise<string> {
  const fetcher = options.fetch;
  const response = await fetcher(`${options.origin}/page-agent.js`);
  if (!response.ok) throw new Error(`page-agent.js: HTTP ${response.status}`);
  return response.text();
}
