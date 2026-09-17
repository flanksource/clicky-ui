import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  componentNameForSelection,
  downloadedSvgPath,
  hasJetbrainsApacheHeader,
  pascalCase,
  selectionsPath,
  validateDownloadedSvg,
  type SelectionRow,
  type Selections,
} from "./icon-sources";

const unzip = promisify(execFile);

export function archiveIdentity(archive: string): {
  stem: string;
  slug: string;
} {
  const match = /^([A-Za-z][A-Za-z0-9]*)(?: \((\d+)\))?\.zip$/.exec(archive);
  if (!match)
    throw new Error(`Unsupported JetBrains archive name "${archive}"`);
  const stem = match[1];
  const slug =
    stem.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase() +
    (match[2] ? `-alt-${match[2]}` : "");
  return { stem, slug };
}

function title(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
}

export function programmingConcept(stem: string): string {
  if (/variable|gvariable|fieldValue|returnValue|valueMuted/i.test(stem))
    return "Variable";
  if (/function|indexFun/i.test(stem)) return "Function";
  if (/method|constructor|interceptor/i.test(stem)) return "Method";
  if (/class|interface|bean/i.test(stem)) return "Class and type";
  if (/field|property|attribute|parameter|argument/i.test(stem))
    return "Field and parameter";
  if (/breakpoint/i.test(stem)) return "Breakpoint";
  if (/stepInto|stepOut|stepOver|runCursor|runToCursor/i.test(stem))
    return "Debugger step";
  if (/^index|Index$/i.test(stem)) return "Index";
  if (/sequence/i.test(stem)) return "Sequence";
  if (/column/i.test(stem)) return "Column";
  if (/table|view/i.test(stem)) return "Table and view";
  if (/^test|junit/i.test(stem)) return "Test";
  if (/^run|rerun|restart|^stop|launch/i.test(stem)) return "Run control";
  if (/profile|flame|trace/i.test(stem)) return "Profile and trace";
  return title(stem);
}

export function programmingFamily(stem: string): string {
  if (
    /breakpoint|debug|step|attach|detach|evaluate|frame|dumpThreads|profile|flame|trace/i.test(
      stem,
    )
  )
    return "Debugging and profiling";
  if (/^run|rerun|restart|^stop|timer|launch|pending|failed|deploy/i.test(stem))
    return "Execution and status";
  if (
    /column|table|index|schema|sequence|foreign|procedure|routine|view|constraint|partition|projection|aggregate|key|database|dataShare|transaction|rollback|role|stream|collection|connector|materialized|extension|subscription|mapping|submitDB|dataSchema/i.test(
      stem,
    )
  )
    return "Database and data";
  if (
    /hibernate|spring|bean|pointcut|junit|plugin|webService|messageQueue|freemarker|xpath|regex|template|typeScript|configMap|customResource|models/i.test(
      stem,
    )
  )
    return "Frameworks and platforms";
  if (
    /groupBy|sort|project|folder|module|artifact|showMembers|showToImplement|openBlock|shortcutFilter/i.test(
      stem,
    )
  )
    return "Navigation and organization";
  return "Code symbols and members";
}

export function programmingTone(stem: string): string {
  if (/error|failed|exception|breakpoint|debugDisabled|^stop|kill/i.test(stem))
    return "danger";
  if (/pending|ignored|important|muted/i.test(stem)) return "warning";
  if (/success|passed/i.test(stem)) return "success";
  if (
    /^run|rerun|restart|step|create|rename|refresh|attach|detach|deploy|add|submit|start|evaluate|goTo/i.test(
      stem,
    )
  )
    return "action";
  return "identity";
}

export function assignProgrammingComponentNames(options: {
  existing: SelectionRow[];
  imported: SelectionRow[];
  reservedNames: ReadonlySet<string>;
}): SelectionRow[] {
  const rows = options.existing.map((row) => ({ ...row }));
  const rowIndexes = new Map(rows.map((row, index) => [row.consumerName, index]));
  if (rowIndexes.size !== rows.length)
    throw new Error("Duplicate existing programming icon name");
  for (const row of options.imported) {
    const index = rowIndexes.get(row.consumerName);
    if (index === undefined) {
      rowIndexes.set(row.consumerName, rows.length);
      rows.push({ ...row });
    } else {
      const assignedName = rows[index]!.componentName;
      rows[index] = {
        ...row,
        ...(assignedName ? { componentName: assignedName } : {}),
      };
    }
  }

  const used = new Set(options.reservedNames);
  for (const row of rows) {
    if (!row.componentName) continue;
    if (
      !/^Ui[A-Z][A-Za-z0-9]*$/.test(row.componentName) ||
      used.has(row.componentName)
    )
      throw new Error(
        `Invalid or duplicate programming component name "${row.componentName}"`,
      );
    used.add(row.componentName);
  }

  const groups = new Map<string, SelectionRow[]>();
  for (const row of rows) {
    if (row.componentName) continue;
    if (!row.concept) throw new Error(`Missing concept for "${row.consumerName}"`);
    const base = programmingConceptBase(row.concept);
    groups.set(base, [...(groups.get(base) ?? []), row]);
  }
  for (const [base, group] of groups) {
    const preferredName = `Ui${base}`;
    const preferredId = `programming-${base.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()}`;
    const preferred =
      group.find(
        (row) =>
          row.consumerName ===
          (base === "Step" ? "programming-step-into" : preferredId),
      ) ?? group[0];
    if (!used.has(preferredName) && preferred) {
      preferred.componentName = preferredName;
      used.add(preferredName);
    }
    let alternative = 1;
    for (const row of group) {
      if (row.componentName) continue;
      while (used.has(`${preferredName}${alternative}`)) alternative++;
      row.componentName = `${preferredName}${alternative++}`;
      used.add(row.componentName);
    }
  }
  return rows;
}

function programmingConceptBase(concept: string): string {
  const shortNames: Record<string, string> = {
    "Class and type": "Class",
    "Field and parameter": "Field",
    "Table and view": "Table",
    "Profile and trace": "Profile",
    "Run control": "Run",
    "Debugger step": "Step",
  };
  return shortNames[concept] ?? pascalCase(concept);
}

async function readArchive(
  path: string,
  archive: string,
): Promise<{
  row: SelectionRow;
  archive: string;
  headerVerified: boolean;
  light: string;
  dark: string;
}> {
  const { stem, slug } = archiveIdentity(archive);
  const { stdout: listing } = await unzip("unzip", ["-Z", "-1", path]);
  const entries = listing.trim().split("\n").sort();
  const expected = [`${stem}.svg`, `${stem}_dark.svg`].sort();
  if (JSON.stringify(entries) !== JSON.stringify(expected)) {
    throw new Error(
      `Archive "${archive}" must contain exactly ${expected.join(" and ")}`,
    );
  }
  const [lightResult, darkResult] = await Promise.all([
    unzip("unzip", ["-p", path, `${stem}.svg`], { maxBuffer: 1024 * 1024 }),
    unzip("unzip", ["-p", path, `${stem}_dark.svg`], {
      maxBuffer: 1024 * 1024,
    }),
  ]);
  const light = validateDownloadedSvg(archive, lightResult.stdout);
  const dark = validateDownloadedSvg(archive, darkResult.stdout);
  const headerVerified =
    hasJetbrainsApacheHeader(light) && hasJetbrainsApacheHeader(dark);
  const sourcePrefix = headerVerified
    ? "jb-download:"
    : "jb-download-unverified:";
  return {
    archive,
    headerVerified,
    row: {
      consumerName: `programming-${slug}`,
      group: "programming",
      status: "NEW",
      outline: `${sourcePrefix}${slug}`,
      filled: null,
      dark: `${sourcePrefix}${slug}-dark`,
      label: title(stem),
      family: programmingFamily(stem),
      concept: programmingConcept(stem),
      variation: archive.includes(" (")
        ? `Alternative ${archive.match(/\((\d+)\)/)?.[1]}`
        : title(stem),
      tone: programmingTone(stem),
      note: `JetBrains IntelliJ icon catalog download: ${archive}${headerVerified ? "" : " (no embedded Apache header)"}`,
    },
    light,
    dark,
  };
}

export async function importJetbrainsZips(options: {
  inputDir: string;
  since: string;
  dryRun?: boolean;
  licensedOnly?: boolean;
  includeWithoutHeader?: boolean;
}): Promise<number> {
  if (options.licensedOnly && options.includeWithoutHeader)
    throw new Error(
      "Choose either --licensed-only or --include-without-header",
    );
  const since = Date.parse(options.since);
  if (!Number.isFinite(since))
    throw new Error(`Invalid --since value "${options.since}"`);
  const names = (await readdir(options.inputDir))
    .filter((name) => name.endsWith(".zip"))
    .sort();
  const recent = (
    await Promise.all(
      names.map(async (name) => ({
        name,
        mtime: (await stat(join(options.inputDir, name))).mtimeMs,
      })),
    )
  )
    .filter(({ mtime }) => mtime >= since)
    .map(({ name }) => name);
  if (recent.length === 0) throw new Error("No recent ZIP archives found");

  const outcomes = await Promise.allSettled(
    recent.map((name) => readArchive(join(options.inputDir, name), name)),
  );
  const failures = outcomes.flatMap((outcome, index) =>
    outcome.status === "rejected"
      ? [`${recent[index]}: ${String(outcome.reason)}`]
      : [],
  );
  if (failures.length > 0)
    throw new Error(
      `Unable to import ${failures.length} archives:\n${failures.join("\n")}`,
    );
  const valid = outcomes.flatMap((outcome) =>
    outcome.status === "fulfilled" ? [outcome.value] : [],
  );
  const missingHeaders = valid.filter(({ headerVerified }) => !headerVerified);
  if (
    missingHeaders.length > 0 &&
    !options.licensedOnly &&
    !options.includeWithoutHeader
  )
    throw new Error(
      `${missingHeaders.length} archives have no embedded Apache header; pass --include-without-header to import them explicitly`,
    );
  const omitted = options.licensedOnly
    ? missingHeaders.map(({ archive }) => archive)
    : [];
  const imported = options.licensedOnly
    ? valid.filter(({ headerVerified }) => headerVerified)
    : valid;
  const selections = JSON.parse(
    await readFile(selectionsPath, "utf8"),
  ) as Selections;
  const otherRows = selections.rows.filter((row) => row.group !== "programming");
  const existing = selections.rows.filter((row) => row.group === "programming");
  const namesInUse = new Set(otherRows.map((row) => row.consumerName));
  for (const { row } of imported) {
    if (namesInUse.has(row.consumerName))
      throw new Error(`Duplicate icon name "${row.consumerName}"`);
    namesInUse.add(row.consumerName);
  }
  const programmingRows = assignProgrammingComponentNames({
    existing,
    imported: imported.map(({ row }) => row),
    reservedNames: new Set(
      otherRows
        .filter((row) => row.group !== "change-types")
        .map(componentNameForSelection),
    ),
  });
  if (options.dryRun) {
    if (missingHeaders.length > 0)
      console.warn(
        `Archives without Apache headers (${missingHeaders.length}): ${missingHeaders.map(({ archive }) => archive).join(", ")}`,
      );
    return imported.length;
  }

  await mkdir(join(dirname(selectionsPath), "svg", "downloaded"), {
    recursive: true,
  });
  for (const { row, light, dark } of imported) {
    await writeFile(downloadedSvgPath(row.outline!), light);
    await writeFile(downloadedSvgPath(row.dark!), dark);
  }
  await writeFile(
    selectionsPath,
    JSON.stringify(
      {
        rows: [...otherRows, ...programmingRows],
      },
      null,
      2,
    ) + "\n",
  );
  await writeFile(
    join(dirname(selectionsPath), "jetbrains-download-audit.json"),
    JSON.stringify(
      {
        downloadedOn: options.since,
        archives: recent.length,
        imported: imported.map(({ archive }) => archive),
        withoutHeader: imported
          .filter(({ headerVerified }) => !headerVerified)
          .map(({ archive }) => archive),
        withoutHeaderReason:
          "No embedded Apache 2.0 header in one or both downloaded SVGs; license not verified by this import",
        omissionReason: options.licensedOnly
          ? "No embedded Apache 2.0 header in the downloaded SVG pair"
          : null,
        omitted,
      },
      null,
      2,
    ) + "\n",
  );
  return imported.length;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const inputDir = process.argv[2];
  const since = process.argv[3];
  if (!inputDir || !since)
    throw new Error(
      "Usage: import-jetbrains-zips <input-dir> <since-ISO> [--dry-run] [--licensed-only | --include-without-header]",
    );
  importJetbrainsZips({
    inputDir,
    since,
    dryRun: process.argv.includes("--dry-run"),
    licensedOnly: process.argv.includes("--licensed-only"),
    includeWithoutHeader: process.argv.includes("--include-without-header"),
  })
    .then((count) =>
      console.log(
        `${process.argv.includes("--dry-run") ? "Validated" : "Imported"} ${count} JetBrains ZIP archives`,
      ),
    )
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
