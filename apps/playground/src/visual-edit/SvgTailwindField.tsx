import { useState } from "react";
import { ActionError, TailwindColorPickerField, TailwindNumberPickerField, type TailwindPickerValue } from "@flanksource/clicky-ui";
import { domAttributeName } from "./svg-attributes";
import { mergeSvgUtility, svgPropertyClasses } from "./svg-style-values";

export type SvgTailwindProperty = "fill" | "stroke" | "color" | "fontSize" | "strokeWidth" | "opacity";

export function SvgTailwindField({ element, property, values, baseline, onChange, id, disabled = false }: {
  element: Element;
  property: SvgTailwindProperty;
  values: Record<string, unknown>;
  baseline: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  id?: string;
  disabled?: boolean;
}) {
  const [error, setError] = useState<Error | null>(null);
  const utilities = svgPropertyClasses({ classes: values.className, property }).filter(token => !token.includes(":"));
  const raw = values[property];
  if (raw != null && typeof raw !== "string" && typeof raw !== "number") throw new Error(`Invalid SVG ${property} value`);
  const value: TailwindPickerValue = utilities[0] ? { kind: "utility", value: utilities[0] } : { kind: "literal", value: raw ?? "" };
  const withoutUtility = () => typeof values.className === "string" && utilities.length
    ? { className: values.className.split(/\s+/).filter(token => !utilities.includes(token)).join(" ") }
    : {};
  const change = (next: TailwindPickerValue) => {
    if (next.kind === "utility" && (element as SVGElement).style.getPropertyValue(domAttributeName(property))) {
      setError(new Error(`${property} is controlled by an inline style; open source to edit it`));
      return;
    }
    setError(null);
    onChange(next.kind === "utility"
      ? { ...values, [property]: baseline[property], className: mergeSvgUtility(values.className, next.value) }
      : { ...values, ...withoutUtility(), [property]: next.value });
  };
  const props = {
    ...(id === undefined ? {} : { id }), value, onChange: change, ariaLabel: property, disabled, size: "xs" as const,
    resetLabel: `Remove ${property} attribute`, onReset: () => { setError(null); onChange({ ...values, ...withoutUtility(), [property]: null }); },
  };
  return <div className="min-w-0 space-y-density-1">
    {property === "fill" || property === "stroke" || property === "color"
      ? <TailwindColorPickerField {...props} utility={property === "color" ? "text" : property} resolveColor={color => color.startsWith("var(--") ? getComputedStyle(element).getPropertyValue(color.slice(4, -1)).trim() : color} />
      : <TailwindNumberPickerField {...props} property={property} />}
    {error ? <ActionError error={error} title="Cannot change utility" /> : null}
  </div>;
}
