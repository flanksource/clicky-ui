import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  createHttpClient,
  fetchIconifySvgs,
  planIconifyBatches,
} from "./icon-fetch";
import {
  iconSourceRequests,
  incumbentSvgPaths,
  isIconifySpec,
  remoteSvgPath,
  selectionsPath,
  type IconSourceRequest,
  type Selections,
} from "./icon-sources";

const flanksourceIconsRawBase =
  "https://raw.githubusercontent.com/flanksource/flanksource-icons/main/svg";

const http = createHttpClient({
  onRetry: ({ url, attempt, status, delayMs, reason }) =>
    console.warn(
      `  retry ${attempt} in ${delayMs}ms (${status ?? "network"}, ${reason}): ${url}`,
    ),
});

async function writeSvg(path: string, svg: string): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, svg);
}

async function downloadSvg(url: string, path: string): Promise<void> {
  const response = await http.fetch(url);
  await writeSvg(path, await response.text());
}

async function downloadIconifySources(
  requests: IconSourceRequest[],
): Promise<number> {
  const missing = [
    ...new Set(
      requests
        .map(({ spec }) => spec)
        .filter(
          (spec) => isIconifySpec(spec) && !existsSync(remoteSvgPath(spec)),
        ),
    ),
  ];
  if (missing.length === 0) return 0;

  const batches = planIconifyBatches({ specs: missing });
  console.log(
    `Fetching ${missing.length} icons from the Iconify API in ${batches.length} queries…`,
  );
  const { svgs, notFound } = await fetchIconifySvgs({
    specs: missing,
    client: http,
  });
  if (notFound.length > 0) {
    throw new Error(`Iconify has no data for: ${notFound.join(", ")}`);
  }
  for (const [spec, svg] of svgs) await writeSvg(remoteSvgPath(spec), svg);
  return svgs.size;
}

async function downloadNonIconifySource(
  request: IconSourceRequest,
): Promise<boolean> {
  const { spec, consumerName } = request;
  if (spec === "incumbent" || spec.startsWith("incumbent:")) {
    const paths = incumbentSvgPaths(spec, consumerName);
    if (paths.some(existsSync)) return false;
    let lastError: unknown;
    for (const path of paths) {
      try {
        await downloadSvg(`${flanksourceIconsRawBase}/${basename(path)}`, path);
        return true;
      } catch (error) {
        lastError = error;
      }
    }
    throw new Error(
      `Unable to download incumbent SVG for "${consumerName}": ${String(lastError)}`,
    );
  }

  const colon = spec.indexOf(":");
  const prefix = spec.slice(0, colon);
  if (colon < 1 || !prefix.startsWith("jb-expui-")) {
    throw new Error(`Unsupported icon source "${spec}"`);
  }
  const path = remoteSvgPath(spec);
  if (existsSync(path)) return false;
  const directory = prefix.slice("jb-expui-".length);
  const name = spec.slice(colon + 1);
  await downloadSvg(
    `https://raw.githubusercontent.com/JetBrains/intellij-community/master/platform/icons/src/expui/${directory}/${name}.svg`,
    path,
  );
  return true;
}

export async function downloadIcons(): Promise<void> {
  const selections = JSON.parse(
    await readFile(selectionsPath, "utf8"),
  ) as Selections;
  const requests = iconSourceRequests(selections);
  let downloaded = await downloadIconifySources(requests);
  for (const request of requests) {
    if (
      !isIconifySpec(request.spec) &&
      (await downloadNonIconifySource(request))
    )
      downloaded++;
  }
  console.log(`Vendored icon sources are complete (${downloaded} downloaded).`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  downloadIcons().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
