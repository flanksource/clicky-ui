import { useEffect, useState } from "react";
import { ActionError, Button, DropdownMenu } from "@flanksource/clicky-ui";
import { SVG_STYLE_PROPERTIES, mergeSvgUtility, svgUtility, type SvgStyleProperty } from "./svg-style-values";

const WEIGHTS = ["thin", "extralight", "light", "normal", "medium", "semibold", "bold", "extrabold", "black"];

function choices(property: SvgStyleProperty): string[] {
  if (property === "fontWeight") return WEIGHTS;
  if (property === "fontFamily") return ["sans", "mono", "serif"];
  if (property === "strokeWidth") return ["0", "1", "2", "3", "4"];
  return ["0", "5", "10", "20", "25", "30", "40", "50", "60", "70", "75", "80", "90", "95", "100"];
}

export function SvgStyleOptions({ element, values, onChange }: {
  element: Element;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}) {
  const [computed, setComputed] = useState<Record<string, string>>({});
  const [error, setError] = useState<Error | null>(null);
  useEffect(() => {
    const read = () => {
      const style = getComputedStyle(element);
      setComputed(Object.fromEntries(SVG_STYLE_PROPERTIES.map(property => [property, style.getPropertyValue(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`))])));
    };
    read();
    window.addEventListener("playground-svg-preview-css", read);
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["class", "style", "data-theme"] });
    return () => { observer.disconnect(); window.removeEventListener("playground-svg-preview-css", read); };
  }, [element]);
  const text = element.localName === "text" || element.localName === "tspan";
  return <div className="space-y-density-1">
    <p className="font-semibold">Tailwind & theme</p>
    {SVG_STYLE_PROPERTIES.filter(property => !["fill", "stroke", "color", "fontSize", "strokeWidth", "opacity"].includes(property) && (text || !property.startsWith("font"))).map(property => <div key={property} className="flex items-center justify-between gap-density-2">
      <span className="min-w-0 flex-1 truncate" title={computed[property]}>{property} <span className="text-muted-foreground">{computed[property]}</span></span>
      <Button size="xs" variant="ghost" type="button" aria-label={`Remove ${property} attribute`} onClick={() => onChange({ ...values, [property]: null })}>Reset</Button>
      <DropdownMenu menuLabel={`${property} Tailwind utilities`} trigger={<Button size="xs" variant="outline" type="button">Choose utility</Button>}
        items={choices(property).map(value => ({ label: svgUtility({ property, value }), onSelect: () => {
          const inline = (element as SVGElement).style.getPropertyValue(property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`));
          if (inline) { setError(new Error(`${property} is controlled by an inline style; open source to edit it`)); return; }
          setError(null);
          onChange({ ...values, className: mergeSvgUtility(values.className, svgUtility({ property, value })) });
        } }))} />
    </div>)}
    <p className="text-muted-foreground">Utilities override presentation attributes. Theme colors follow the selected element’s theme.</p>
    {error ? <ActionError error={error} title="Cannot change utility" /> : null}
  </div>;
}
