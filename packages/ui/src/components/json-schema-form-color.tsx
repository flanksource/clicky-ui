import { cn } from "../lib/utils";

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
// A native color input always holds a #rrggbb value, so a field holding anything else
// (a CSS name, #rgb, rgb(), empty) shows this until the user picks.
const NEUTRAL_SWATCH = "#000000";

// ColorSwatch is the native color picker that prefixes a `format: "color"` string
// field. It is a view onto the field's text: a #rrggbb value is shown as-is, any
// other value leaves the swatch neutral, and the text is only rewritten when the
// user picks a color.
export function ColorSwatch({
  label,
  value,
  disabled,
  onPick,
}: {
  label: string;
  value: string;
  disabled: boolean;
  onPick: (hex: string) => void;
}) {
  const isHex = HEX_COLOR.test(value);
  return (
    <input
      type="color"
      aria-label={`${label} color picker`}
      data-jsf-color-swatch
      value={isHex ? value.toLowerCase() : NEUTRAL_SWATCH}
      disabled={disabled}
      onChange={(e) => onPick(e.target.value)}
      className={cn(
        "size-5 cursor-pointer rounded border border-border bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-60",
        !isHex && "opacity-50",
      )}
    />
  );
}
