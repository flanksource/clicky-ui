/**
 * The glyphs a profile column's enums render with, and the Combobox options
 * built from them.
 *
 * The params editor gets these from the schema (`x-enum-icons`); the column
 * editor is hand-rolled, so its vocabulary lives here instead — one place both
 * the grid and the inspector read, rather than an icon picked twice.
 */

import type { ReactNode } from "react";
import type { ComboboxOption } from "../../components/combobox-types";
// Monochrome UI glyphs only: the symbol icons (UiString, UiJson, UiField, …)
// carry hardcoded IDE colours, which read as stray dots beside a form label.
import {
  UiActivity,
  UiBraces,
  UiCalendar,
  UiChartPie,
  UiClock,
  UiColumns,
  UiCurrencyDollar,
  UiCursorText,
  UiFingerprint,
  UiHardDrive,
  UiListChecks,
  UiListDashes,
  UiProhibit,
  UiPulse,
  UiShieldCheck,
  UiSigma,
  UiSliders,
  UiTag,
  UiTimer,
  UiToggleOn,
} from "../../icons";
import { PROFILE_FIELD_TYPES } from "./profileFieldTypes";
import {
  PROFILE_COLUMN_FORMAT_OPTIONS,
  PROFILE_COLUMN_UNIT_OPTIONS,
  PROFILE_FILTER_KIND_OPTIONS,
} from "../wizard/profileWizardModel";

const TYPE_ICONS: Record<string, ReactNode> = {
  string: <UiCursorText />,
  number: <UiSigma />,
  boolean: <UiToggleOn />,
  datetime: <UiCalendar />,
  duration: <UiTimer />,
  bytes: <UiHardDrive />,
  status: <UiPulse />,
  health: <UiShieldCheck />,
  key_value: <UiTag />,
  key_values: <UiListDashes />,
  json: <UiBraces />,
};

// A filter borrows the glyph of the type that infers it — duration from
// UiTimer, date from UiCalendar — so the Type and the control it implies read
// as one thing. Time keeps the clock, which is what makes the date/date-and-
// time split legible at a glance.
const FILTER_KIND_ICONS: Record<string, ReactNode> = {
  terms: <UiListChecks />,
  exact: <UiFingerprint />,
  range: <UiSliders />,
  duration: <UiTimer />,
  date: <UiCalendar />,
  time: <UiClock />,
  boolean: <UiToggleOn />,
  text: <UiCursorText />,
  none: <UiProhibit />,
};

const ROLE_ICONS: Record<string, ReactNode> = {
  timestamp: <UiClock />,
  tags: <UiTag />,
  status: <UiPulse />,
};

const FORMAT_ICONS: Record<string, ReactNode> = {
  date: <UiCalendar />,
  float: <UiSigma />,
  duration: <UiTimer />,
  bytes: <UiHardDrive />,
  currency: <UiCurrencyDollar />,
};

const UNIT_ICONS: Record<string, ReactNode> = {
  none: <UiSigma />,
  short: <UiSigma />,
  percent: <UiChartPie />,
  percentunit: <UiChartPie />,
  bytes: <UiHardDrive />,
  decbytes: <UiHardDrive />,
  Bps: <UiActivity />,
  binBps: <UiActivity />,
  ms: <UiTimer />,
  s: <UiTimer />,
};

export function profileTypeIcon(type?: string): ReactNode {
  return (type && TYPE_ICONS[type]) ?? <UiColumns />;
}

export function profileFilterKindIcon(kind: string): ReactNode {
  return FILTER_KIND_ICONS[kind] ?? <UiListChecks />;
}

export const profileTypeOptions: ComboboxOption[] = PROFILE_FIELD_TYPES.map((type) => ({
  value: type,
  label: type,
  icon: TYPE_ICONS[type],
}));

export const profileRoleOptions: ComboboxOption[] = [
  { value: "timestamp", label: "Timestamp", icon: ROLE_ICONS["timestamp"] },
  { value: "tags", label: "Tags", icon: ROLE_ICONS["tags"] },
  { value: "status", label: "Status", icon: ROLE_ICONS["status"] },
];

export const profileFormatOptions: ComboboxOption[] = PROFILE_COLUMN_FORMAT_OPTIONS.map(
  (option) => ({ ...option, icon: FORMAT_ICONS[option.value] }),
);

export const profileUnitOptions: ComboboxOption[] = PROFILE_COLUMN_UNIT_OPTIONS.map(
  (option) => ({ ...option, icon: UNIT_ICONS[option.value] }),
);

export const profileFilterKindOptions: ComboboxOption[] = PROFILE_FILTER_KIND_OPTIONS.map(
  (option) => ({ ...option, icon: FILTER_KIND_ICONS[option.value] }),
);
