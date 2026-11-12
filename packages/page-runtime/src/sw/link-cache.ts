export function createLinkCache(persistent: Promise<Cache>) {
  const memory = new Map<string, { bytes: ArrayBuffer; headers: Array<[string, string]> }>();
  return {
    async match(key: string): Promise<{ response: Response; layer: "memory" | "storage" } | undefined> {
      const stored = memory.get(key);
      if (stored) return { response: new Response(stored.bytes, { headers: stored.headers }), layer: "memory" };
      const response = await (await persistent).match(key);
      if (response) memory.set(key, { bytes: await response.clone().arrayBuffer(), headers: [...response.headers] });
      return response ? { response, layer: "storage" } : undefined;
    },
    async put(key: string, response: Response): Promise<void> {
      const bytes = await response.clone().arrayBuffer();
      await (await persistent).put(key, response);
      memory.set(key, { bytes, headers: [...response.headers] });
    },
    async keys(): Promise<readonly Request[]> { return (await persistent).keys(); },
    async delete(key: Request): Promise<boolean> { memory.delete(key.url); return (await persistent).delete(key); },
  };
}
