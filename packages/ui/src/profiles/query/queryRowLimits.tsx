/**
 * The four row caps, edited beside the filters they bound rather than buried in
 * the generic options form. They answer different questions and so get a field
 * each: Limit is how many rows the query asks the source for (a provider
 * option), while the page a caller gets by default, the largest page it may ask
 * for and where an export stops belong to the profile. A cap the profile leaves
 * empty shows the inherited default as its placeholder.
 */

import { InputField } from "../../components/InputField";
import type {
  BrowserRowLimits,
  ProfileRowLimits,
} from "../connections/connectionBrowserModel";
import { applyRowLimit } from "./queryRowLimitsModel";

const profileCaps: {
  key: keyof ProfileRowLimits;
  label: string;
  title: string;
  fallback: keyof BrowserRowLimits;
}[] = [
  {
    key: "pageSize",
    label: "Page size",
    title: "Rows one page returns when the caller asks for no size.",
    fallback: "pageSize",
  },
  {
    key: "maxPageSize",
    label: "Max page",
    title: "Largest single page a caller may ask this profile for.",
    fallback: "maxPageSize",
  },
  {
    key: "maxExportRows",
    label: "Max export",
    title: "Where an all-row export of this profile stops.",
    fallback: "maxExportRows",
  },
];

export function QueryRowLimits({
  value,
  onChange,
  defaults,
  limits,
  onLimitsChange,
}: {
  value: string;
  onChange: (limit: string) => void;
  defaults?: BrowserRowLimits;
  limits?: ProfileRowLimits;
  onLimitsChange?: (limits: ProfileRowLimits | undefined) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <RowLimitField
        label="Limit"
        title="Rows this query asks the source for."
        value={value}
        placeholder="rows"
        onChange={onChange}
      />
      {onLimitsChange
        ? profileCaps.map((cap) => (
            <RowLimitField
              key={cap.key}
              label={cap.label}
              title={cap.title}
              value={limits?.[cap.key] === undefined ? "" : String(limits[cap.key])}
              placeholder={
                defaults ? defaults[cap.fallback].toLocaleString("en-US") : ""
              }
              onChange={(text) =>
                onLimitsChange(applyRowLimit(limits, cap.key, text))
              }
            />
          ))
        : null}
    </div>
  );
}

function RowLimitField({
  label,
  title,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  title: string;
  value: string;
  placeholder: string;
  onChange: (text: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <InputField
        aria-label={label}
        className="w-24"
        type="number"
        min="1"
        placeholder={placeholder}
        title={title}
        value={value}
        onChange={onChange}
      />
    </label>
  );
}
