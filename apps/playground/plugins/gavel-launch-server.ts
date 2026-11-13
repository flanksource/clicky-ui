/** Where the playground reaches Gavel unless `PLAYGROUND_GAVEL_URL` says otherwise. */
export const DEFAULT_GAVEL_URL = "http://127.0.0.1:9330";

/**
 * Where the playground reaches Gavel's launch API (`gavel launch serve`). Gavel
 * runs outside the playground, for example
 * `gavel launch serve --root <repo> --local-root <repo>`; the playground never
 * starts, stops or restarts it.
 */
export type GavelEndpoint = {
  url(): Promise<string>;
};

export function fixedGavel(url: string = DEFAULT_GAVEL_URL): GavelEndpoint {
  return { url: async () => url };
}
