import {
  UiArray,
  UiArrowsCounterClockwise,
  UiAsterisk,
  UiBoolean,
  UiCalendarBlank,
  UiCircleOutline,
  UiColumns,
  UiConstant1,
  UiConstant1Dark,
  UiDataSchema,
  UiDataSchemaDark,
  UiDatabaseLink,
  UiDatabaseLinkDark,
  UiEditMode,
  UiEditModeDark,
  UiEnum,
  UiEvaluateExpression,
  UiEvaluateExpressionDark,
  UiExtension,
  UiExtensionDark,
  UiEye,
  UiEyeClosed,
  UiFileCode,
  UiFileFormat,
  UiFileFormatDark,
  UiHibernateEvent,
  UiHibernateEventDark,
  UiLayoutDashboard,
  UiLink,
  UiListOrdered,
  UiLock,
  UiLockOpen,
  UiNull,
  UiNumeric,
  UiObject,
  UiPalette,
  UiPluginModule,
  UiPluginModuleDark,
  UiProhibit,
  UiQuestion,
  UiReadAccess,
  UiReadAccessDark,
  UiRegex,
  UiRegexDark,
  UiRows,
  UiSelect,
  UiSortAlphabetically,
  UiSortAlphabeticallyDark,
  UiString,
  UiText,
  UiVariable5,
  UiVariable5Dark,
  UiWriteAccess,
  UiWriteAccessDark,
} from "../icons";
import type { IconComponent } from "../icons/types";
import type { KeywordGroup } from "./json-schema-form-debug-groups";
import type { ChangeActions, FieldControlKind } from "./json-schema-form-types";

// Glyphs the debug card draws from the programming icon palette. A palette icon
// is a coloured pair: `dark` is its dark-theme artwork, where one exists.
export interface DebugGlyphPair {
  light: IconComponent;
  dark?: IconComponent;
}

const pair = (light: IconComponent, dark?: IconComponent): DebugGlyphPair => (dark ? { light, dark } : { light });

export const GROUP_GLYPH: Record<KeywordGroup, DebugGlyphPair> = {
  behaviour: pair(UiHibernateEvent, UiHibernateEventDark),
  presentation: pair(UiPalette),
  "opt-in": pair(UiPluginModule, UiPluginModuleDark),
  consumer: pair(UiExtension, UiExtensionDark),
  schema: pair(UiDataSchema, UiDataSchemaDark),
};

export const KIND_GLYPH: Record<FieldControlKind, DebugGlyphPair> = {
  string: pair(UiString),
  textarea: pair(UiText),
  markdown: pair(UiFileCode),
  number: pair(UiNumeric),
  boolean: pair(UiBoolean),
  enum: pair(UiEnum),
  lookup: pair(UiSelect),
  date: pair(UiCalendarBlank),
  "string-map": pair(UiDataSchema, UiDataSchemaDark),
  array: pair(UiArray),
  object: pair(UiObject),
  display: pair(UiText),
  link: pair(UiLink),
};

// The JSON Schema `type` names, read by the `type` keyword row.
const TYPE_GLYPH: Record<string, DebugGlyphPair> = {
  string: KIND_GLYPH.string,
  integer: KIND_GLYPH.number,
  number: KIND_GLYPH.number,
  boolean: KIND_GLYPH.boolean,
  array: KIND_GLYPH.array,
  object: KIND_GLYPH.object,
  null: pair(UiNull),
};

const KEYWORD_GLYPH: Record<string, DebugGlyphPair> = {
  enum: KIND_GLYPH.enum,
  const: pair(UiConstant1, UiConstant1Dark),
  default: pair(UiConstant1, UiConstant1Dark),
  format: pair(UiFileFormat, UiFileFormatDark),
  pattern: pair(UiRegex, UiRegexDark),
  readOnly: pair(UiReadAccess, UiReadAccessDark),
  writeOnly: pair(UiWriteAccess, UiWriteAccessDark),
  "x-hidden": pair(UiEyeClosed),
  "x-hidden-by": pair(UiEyeClosed),
  "x-disabled": pair(UiLock),
  "x-on-change": GROUP_GLYPH.behaviour,
  "x-on-load": GROUP_GLYPH.behaviour,
  "x-clicky-lookup": pair(UiDatabaseLink, UiDatabaseLinkDark),
  "x-discriminator": KIND_GLYPH.enum,
  "x-order": pair(UiSortAlphabetically, UiSortAlphabeticallyDark),
  "x-clicky-order": pair(UiListOrdered),
  "x-item": pair(UiRows),
  "x-help": pair(UiQuestion),
  "x-help-display": pair(UiQuestion),
  "x-md-editor": KIND_GLYPH.markdown,
  "x-columns": pair(UiColumns),
  "x-col-span": pair(UiColumns),
  "x-layout": pair(UiLayoutDashboard),
  "x-label-position": pair(UiLayoutDashboard),
};

// keywordGlyph is the glyph beside a keyword row; `type` is marked by the
// type it names. A keyword the palette has no symbol for has none.
export function keywordGlyph(keyword: string, raw: unknown): DebugGlyphPair | undefined {
  if (keyword === "type" && typeof raw === "string") return TYPE_GLYPH[raw];
  return KEYWORD_GLYPH[keyword];
}

export const ACTION_GLYPH: Record<keyof ChangeActions, DebugGlyphPair> = {
  hide: pair(UiEyeClosed),
  show: pair(UiEye),
  enable: pair(UiLockOpen),
  disable: pair(UiLock),
  require: pair(UiAsterisk),
  optional: pair(UiCircleOutline),
  reset: pair(UiArrowsCounterClockwise),
  set: pair(UiVariable5, UiVariable5Dark),
  patch: pair(UiEditMode, UiEditModeDark),
};

// One glyph per predicate a `when` can state.
export const CONDITION_GLYPH = {
  const: pair(UiConstant1, UiConstant1Dark),
  enum: KIND_GLYPH.enum,
  not: pair(UiProhibit),
  expr: pair(UiEvaluateExpression, UiEvaluateExpressionDark),
  schema: pair(UiDataSchema, UiDataSchemaDark),
  always: pair(UiCircleOutline),
} satisfies Record<string, DebugGlyphPair>;
