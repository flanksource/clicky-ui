import { cn } from "../lib/utils";
import { UnitStepControls } from "./UnitStepControls";
import type { FieldControl, PreExtension } from "./json-schema-form-types";

export type UnitInputKind = "count" | "bytes";

type UnitScale = {
  label: string;
  multiplier: bigint;
};

const COUNT_SCALES: UnitScale[] = [
  { label: "", multiplier: 1n },
  { label: "K", multiplier: 1_000n },
  { label: "M", multiplier: 1_000_000n },
  { label: "B", multiplier: 1_000_000_000n },
  { label: "T", multiplier: 1_000_000_000_000n },
];

const BYTE_SCALES: UnitScale[] = [
  { label: "B", multiplier: 1n },
  { label: "KiB", multiplier: 1_024n },
  { label: "MiB", multiplier: 1_048_576n },
  { label: "GiB", multiplier: 1_073_741_824n },
  { label: "TiB", multiplier: 1_099_511_627_776n },
];

const scales = (kind: UnitInputKind) => kind === "bytes" ? BYTE_SCALES : COUNT_SCALES;

function canonicalInteger(value: unknown): string | null {
  if (typeof value === "number") {
    return Number.isSafeInteger(value) && value > 0 ? String(value) : null;
  }
  if (typeof value !== "string" || !/^[1-9][0-9]*$/.test(value)) return null;
  return value;
}

function scaledDecimal(value: bigint, multiplier: bigint): string | null {
  const integer = value / multiplier;
  let remainder = value % multiplier;
  if (remainder === 0n) return String(integer);

  let fraction = "";
  while (remainder !== 0n && fraction.length < 3) {
    remainder *= 10n;
    fraction += String(remainder / multiplier);
    remainder %= multiplier;
  }
  return remainder === 0n ? `${integer}.${fraction}` : null;
}

export function formatUnitAwareValue(value: unknown, kind: UnitInputKind): unknown {
  const canonical = canonicalInteger(value);
  if (canonical === null) return value;

  const integer = BigInt(canonical);
  for (const scale of scales(kind).toReversed()) {
    if (integer < scale.multiplier) continue;
    const amount = scaledDecimal(integer, scale.multiplier);
    if (amount !== null) return `${amount}${scale.label}`;
  }
  return canonical;
}

function scaleForLabel(kind: UnitInputKind, label: string): UnitScale | undefined {
  if (kind === "count") {
    return COUNT_SCALES.find((scale) => scale.label.toLowerCase() === label.toLowerCase());
  }
  const normalized = label.toLowerCase();
  const aliases: Record<string, string> = {
    "": "B",
    k: "KiB",
    kb: "KiB",
    m: "MiB",
    mb: "MiB",
    g: "GiB",
    gb: "GiB",
    t: "TiB",
    tb: "TiB",
  };
  const canonical = aliases[normalized] ?? label;
  return BYTE_SCALES.find((scale) => scale.label.toLowerCase() === canonical.toLowerCase());
}

export function parseUnitAwareValue(value: string, kind: UnitInputKind): string | null {
  const match = value.trim().replaceAll(",", "").replaceAll("_", "").match(
    /^(\d+(?:\.\d+)?|\.\d+)\s*([a-zA-Z]*)$/,
  );
  if (!match) return null;

  const amount = match[1];
  const scale = scaleForLabel(kind, match[2] ?? "");
  if (!amount || !scale) return null;
  const [whole, fraction = ""] = amount.split(".");
  const denominator = 10n ** BigInt(fraction.length);
  const numerator = BigInt(`${whole || "0"}${fraction}`) * scale.multiplier;
  if (numerator % denominator !== 0n) return null;

  const canonical = numerator / denominator;
  return canonical > 0n ? String(canonical) : null;
}

function unitKind(field: FieldControl): UnitInputKind | null {
  const unit = field.schema["x-clicky-unit"];
  return unit === "count" || unit === "bytes" ? unit : null;
}

function steppedValue(value: unknown, direction: "decrease" | "increase"): string | null {
  const canonical = canonicalInteger(value);
  if (canonical === null) return null;
  const integer = BigInt(canonical);
  const next = direction === "increase" ? integer * 2n : integer / 2n;
  return next > 0n ? String(next) : null;
}

export function createUnitFormExtensions(): { pre: PreExtension[] } {
  const pre: PreExtension = (field) => {
    const kind = unitKind(field);
    if (!kind) return field;
    return {
      ...field,
      value: formatUnitAwareValue(field.value, kind),
      suffix: (
        <UnitStepControls
          label={field.label}
          suffix={field.suffix}
          decrease={steppedValue(field.value, "decrease")}
          increase={steppedValue(field.value, "increase")}
          schemaReadOnly={field.readOnly === true}
          onChange={field.onChange}
        />
      ),
      inputClassName: cn(field.inputClassName, field.suffix ? "pr-28" : "pr-20"),
      onChange: (next) => {
        const text = typeof next === "string" ? next : String(next ?? "");
        field.onChange(parseUnitAwareValue(text, kind) ?? text);
      },
    };
  };
  return { pre: [pre] };
}
