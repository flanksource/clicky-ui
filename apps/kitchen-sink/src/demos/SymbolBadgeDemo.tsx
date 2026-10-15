import { SymbolBadge, type SymbolBadgeStyle } from "@flanksource/clicky-ui";
import { UiCalculator, UiFileCode, UiFunctionSquare, UiTable } from "@flanksource/clicky-ui/icons";
import { DemoRow, DemoSection } from "./Section";

const STYLES: SymbolBadgeStyle[] = ["badge", "badge-outline", "inline"];

export function SymbolBadgeDemo() {
  return <DemoSection id="symbol-badge" title="SymbolBadge" description="Symbols and expressions share a glyph, color and optional language across three presentation styles.">
    {STYLES.map((style) => <DemoRow key={style} label={style}>
      <SymbolBadge style={style} color="indigo" icon={UiFunctionSquare}>CalculatePremium(CoverMV) = …</SymbolBadge>
      <SymbolBadge style={style} color="violet" icon={UiCalculator}>PremiumMV * TaxRateMV</SymbolBadge>
      <SymbolBadge style={style} color="slate" icon={UiTable}>dbo.AsPolicy</SymbolBadge>
    </DemoRow>)}
    <DemoRow label="SQL formatting">
      <SymbolBadge language="sql" icon={UiFileCode}>COALESCE(FloatValue, 0) * 12</SymbolBadge>
    </DemoRow>
    <DemoRow label="Function formatting">
      <SymbolBadge style="badge-outline" language="javascript" icon={UiFunctionSquare}>CalculatePremium(CoverMV) = …</SymbolBadge>
    </DemoRow>
    <DemoRow label="CSS color">
      <SymbolBadge color="var(--color-violet-700)" icon={UiCalculator}>AnnualPremiumMV</SymbolBadge>
    </DemoRow>
  </DemoSection>;
}
