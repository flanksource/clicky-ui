const l=`<!--section:Headings-->
# Heading level 1

## Heading level 2

### Heading level 3

#### Heading level 4

##### Heading level 5

###### Heading level 6

Setext level 1
==============

Setext level 2
--------------

<!--section:Paragraphs and line breaks-->
A paragraph is one or more lines of text. Source lines that are merely wrapped
join back into a single line when rendered.

Two trailing spaces force a hard break,  
so this continues on its own line. A trailing backslash does the same,\\
and so does this one.

<!--section:Emphasis and inline styles-->
*Single asterisks* and _single underscores_ mark emphasis. **Double asterisks**
and __double underscores__ mark strong text, and ***the two together*** combine
them. GFM adds ~~strikethrough~~.

Inline \`code\` uses single backticks. \`\`A span containing a \` backtick\`\` doubles
the fence.

<!--section:Escapes and entities-->
Backslash escapes keep markdown punctuation literal: \\*not emphasis\\*,
\\_not emphasis\\_, \\\`not code\\\`, and \\# not a heading.

Named and numeric HTML entities resolve: &copy; 2026, A &amp; B, an em dash
&mdash; an ellipsis &hellip; and a non-breaking&nbsp;space.

<!--section:Lists-->
- A bullet item
- Another bullet item
  - Nested one level
    - Nested two levels
- Back to the top level

The \`-\`, \`*\`, and \`+\` markers are interchangeable.

1. An ordered item
2. Another ordered item
   1. Nested one level
   2. Still nested
3. Back to the top level

Only the first number matters; the rest are renumbered on render.

1. A list item holds any block content while its continuation stays indented.

   \`\`\`bash
   pnpm --filter @flanksource/clicky-ui build
   \`\`\`

2. Blank lines between items make the list loose, so every item is wrapped in a
   paragraph of its own.

<!--section:Task lists-->
- [x] A completed task
- [ ] An outstanding task
- [ ] A task with **emphasis**, \`code\`, and a [link](https://example.com)

<!--section:Links-->
An [inline link](https://example.com), one
[with a title](https://example.com "Shown on hover"), and one pointing at
[a page fragment](#tables).

Angle autolinks render their target: <https://example.com>.

GFM literal autolinks need no markup at all — https://example.com,
www.example.com, and hello@example.com all become links.

<!--section:Images-->
![A blue swatch](/samples/markdown/swatch.svg "Images take an optional title")

Relative and \`http(s)\` sources render. Inline \`data:\` sources are refused by the
sanitizer, which substitutes a placeholder:

![A blocked inline image](data:image/svg+xml;base64,PHN2Zy8+)

<!--section:Blockquotes-->
> A single-level quote.

> A quote carries any block content:
>
> - a list,
> - **inline formatting**,
>
> > and a nested quote.

<!--section:Code-->
A fence with a language hint renders through the library \`CodeBlock\`, which adds
copy, download, and per-block theme controls:

\`\`\`ts
export function greet(name: string): string {
  return \`Hello, \${name}\`;
}
\`\`\`

A fence with no language falls back to plain text:

\`\`\`
No language hint here.
\`\`\`

Four-space indentation also opens a code block:

    indented code block
    second line

<!--section:Tables-->
The delimiter row sets column alignment — \`:--\` left, \`:-:\` center, \`--:\` right.

| Feature   | Supported |  Since |
| :-------- | :-------: | -----: |
| Tables    |    yes    |    GFM |
| Alignment |    yes    |    GFM |
| Footnotes |    yes    |    GFM |

Cells take inline formatting, escape a literal pipe as \`\\|\`, and may be empty.

| Cell        | Renders                      |
| ----------- | ---------------------------- |
| formatting  | **bold**, \`code\`, ~~struck~~ |
| escaped bar | a \\| b                       |
| empty       |                              |

<!--section:Footnotes-->
Footnotes are a GFM extension[^1]; labels may be words[^label], and the
definitions collect at the end of the rendered block wherever they are written.

[^1]: A numbered footnote definition.
[^label]: Definitions are ordered by first reference, not by label.

<!--section:Thematic breaks-->
Three or more hyphens, asterisks, or underscores alone on a line draw a rule.

---

***

___

<!--section:Inline HTML-->
Raw HTML inside the allow list passes through: press <kbd>Ctrl</kbd>+<kbd>C</kbd>,
write H<sub>2</sub>O and E=mc<sup>2</sup>, mark text <ins>inserted</ins> or
<del>deleted</del>, and break a line<br />like this.

<details>
<summary>A collapsible section</summary>

Markdown keeps working inside, including **emphasis** and lists:

- one
- two

</details>

<dl>
  <dt>Definition list</dt>
  <dd>Rendered from raw <code>dl</code>, <code>dt</code> and <code>dd</code> tags.</dd>
</dl>

<div align="center">A centered block.</div>

<!--section:Sanitized HTML-->
Markup outside the allow list is removed. A script tag is dropped whole —
<script>alert('xss')<\/script>leaving nothing behind.

Unlisted tags are unwrapped to their text, so <mark>mark</mark> and
<abbr title="HyperText Markup Language">abbr</abbr> keep the words but lose the
element. HTML comments never reach the DOM:

<!-- this comment is not rendered -->

<!--section:Unsupported syntax-->
### Reference links

A link reference definition is a block of its own, which the streaming parser
never joins back up, so [reference links][ref] and ![reference images][ref] stay
literal.

[ref]: https://example.com

### Math

KaTeX arrives with the optional \`@streamdown/math\` plugin, which this build does
not install, so $E = mc^2$ and $$a^2 + b^2 = c^2$$ render as plain text.

### Mermaid

Diagrams need the optional \`@streamdown/mermaid\` plugin. Without it a \`mermaid\`
fence is just another code block:

\`\`\`mermaid
graph TD;
  A[Start] --> B[Finish];
\`\`\`

### Front matter

YAML front matter is not stripped: the \`---\` delimiters parse as a thematic
break followed by a setext heading.
`,d=/^<!--section:(.+?)-->$/m;function c(e){return e.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}function m(e){var i,o;const t=e.split(d),a=[];for(let n=1;n<t.length;n+=2){const s=(i=t[n])==null?void 0:i.trim(),r=(o=t[n+1])==null?void 0:o.trim();if(!s||!r)throw new Error(`markdown-syntax.md: empty section at marker ${n}`);a.push({id:c(s),title:s,markdown:r})}if(a.length===0)throw new Error("markdown-syntax.md: no <!--section:...--> markers found");return a}const h=m(l),p=["# Markdown syntax reference",...h.map(e=>`## ${e.title}

${e.markdown}`)].join(`

`);export{p as M,h as a};
