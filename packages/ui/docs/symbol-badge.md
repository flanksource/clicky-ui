# SymbolBadge

`SymbolBadge` displays a single-line symbol, identifier or expression beside an imported icon. Import the package stylesheet once at the app root and wrap the app in `ThemeProvider` as described in the package README.

```tsx
import { SymbolBadge } from "@flanksource/clicky-ui/data";
import { UiFunctionSquare } from "@flanksource/clicky-ui/icons";

export function FunctionReference() {
  return (
    <SymbolBadge
      style="badge-outline"
      color="indigo"
      icon={UiFunctionSquare}
      language="javascript"
    >
      {"CalculatePremium(CoverMV) = …"}
    </SymbolBadge>
  );
}
```

`style` accepts `badge` (the default, with a tinted color fill), `badge-outline` (colored border, glyph and text), or `inline` (glyph and text without a frame or padding).

Choose the style for the reading context:

| Style | Use when | Datasheet example |
| --- | --- | --- |
| `badge` | The identifier needs to stand out as a discrete item in a list, mapping or recorded value. | A policy field beside its read/write badge. |
| `badge-outline` | A named reference points to a separate reusable definition. | A function or copybook call. |
| `inline` | The symbol belongs inside a sentence, formula, filter or dense source annotation. | Fields and operators inside an expression. |

The frame controls emphasis; the icon and color identify the symbol kind. Keep the same icon, hue and font when a symbol moves between contexts. A filled badge does not mean success or verified evidence. In datasheets, a dashed outline marks a conditional call and a red asterisk marks a required field; neither meaning comes from choosing a different `style` value.

`color` defaults to `indigo`. Named hues `blue`, `cyan`, `indigo`, `sky`, `slate` and `violet` adapt their foreground to the page's light or dark theme. `neutral` and `primary` use the corresponding theme tokens. Other values are CSS colors, including custom properties such as `var(--color-violet-700)`; the caller controls their contrast in each theme.

`icon` accepts an imported React icon component, including the generated `Ui*` icons. `iconClassName` can adjust the glyph; artwork with fixed fills or strokes retains those colors unless the caller explicitly overrides them.

The default type scale is 12 px text with a 16 px line height and a 15 px icon. This scale stays consistent when a document changes its surrounding typography tokens. Symbols align on the text baseline, including when an expression contains nested symbols or MathML. Preserve these defaults when comparing symbol types on one line.

`language` uses `CodeLine`'s Shiki grammar and the surrounding page theme to format the text. Install the optional `shiki` and `@shikijs/*` peers for highlighting. Omit it to keep the entire symbol in the chosen color. Syntax token colors take precedence over the symbol's text color when formatting is enabled; the frame and glyph retain the chosen color. Supported languages include SQL, XML, JavaScript and TypeScript. There is no bundled JEP grammar, so JEP expressions should omit `language`.

`children` accepts a nonempty string without line breaks, or a React element already formatted by the caller. Strings preserve their literal source and expose the full text in the default tooltip when a constrained container truncates it. Use `CodeBlock` for multiline source. Formatted content, such as MathML, retains its markup and wrapping; omit `language` and supply a descriptive `title`. Native span attributes, `className` and `aria-label` are forwarded to the wrapper.

Explore all variants in Storybook's `Data/SymbolBadge` stories or the kitchen-sink `symbol-badge` demo.
