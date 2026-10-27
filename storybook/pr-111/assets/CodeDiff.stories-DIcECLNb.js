import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./CodeDiff-B8fKXjBR.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{n(),i=t(),{expect:a,userEvent:o,waitFor:s,within:c}=__STORYBOOK_MODULE_TEST__,l={title:`Data/CodeDiff`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:"Language-aware diff viewer. Computes an LCS line diff from `{ original, modified }` (or parses a `{ unified }` string), syntax-highlights each side with the shared Shiki engine, and renders git-style add/remove gutters that follow the app theme. Supports unified and split (side-by-side) layouts."}}}},u=`export function greet(name: string): string {
  return "Hello, " + name;
}`,d='export function greet(name: string, excited = false): string {\n  const suffix = excited ? "!" : ".";\n  return `Hello, ${name}${suffix}`;\n}',f={args:{language:`typescript`,original:u,modified:d},play:async({canvasElement:e})=>{let t=c(e);await s(()=>{a(e.querySelectorAll(`[data-diff-line="add"]`).length).toBeGreaterThan(0)}),a(e.querySelectorAll(`[data-diff-line="remove"]`).length).toBeGreaterThan(0),a(t.getByText(`typescript`)).toBeInTheDocument(),await s(()=>{a(e.querySelectorAll(`code span[style]`).length).toBeGreaterThan(0)},{timeout:5e3})}},p={args:{language:`go`,original:`package main

import "fmt"

func main() {
    fmt.Println("Hello")
}`,modified:`package main

import "fmt"

func main() {
    name := "world"
    fmt.Printf("Hello, %s\\n", name)
}`}},m={args:{language:`python`,original:`def total(items):
    result = 0
    for item in items:
        result += item
    return result`,modified:`def total(items):
    return sum(items)`}},h={args:{language:`typescript`,view:`split`,original:u,modified:d}},g={args:{language:`sql`,view:`split`,originalLabel:`acme_dev`,modifiedLabel:`acme_qa`,original:`CREATE PROCEDURE dbo.Calculate AS SELECT 1;`,modified:`CREATE PROCEDURE dbo.Calculate AS SELECT 2;`},parameters:{docs:{description:{story:`Use originalLabel and modifiedLabel to name the compared sources. Split view aligns them over their respective columns; unified view identifies them with minus and plus markers. Labels are omitted in bare mode.`}}}},_={args:{language:`typescript`,unified:`@@ -1,3 +1,4 @@
 export function greet(name: string): string {
-  return "Hello, " + name;
+  const suffix = ".";
+  return \`Hello, \${name}\${suffix}\`;
 }`}},v={args:{language:`typescript`,unified:`diff --git a/src/greet.ts b/src/greet.ts
--- a/src/greet.ts
+++ b/src/greet.ts
@@ -1,2 +1,2 @@
 export function greet(name: string) {
-  return "Hi " + name;
+  return \`Hi \${name}\`;
 }
diff --git a/src/index.ts b/src/index.ts
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,2 +1,3 @@
 import { greet } from "./greet";
-console.log(greet("world"));
+const message = greet("world");
+console.log(message);`},parameters:{docs:{description:{story:"A diff that spans several files renders a path header before each file's hunks (parsed from the `diff --git`/`+++` headers)."}}}},y={args:{language:`go`,bare:!0,original:`x := 1`,modified:`x := 2`}},b={args:{language:`typescript`,original:u,modified:d},play:async({canvasElement:e})=>{let t=c(e);await s(()=>{a(e.querySelectorAll(`[data-diff-line]`).length).toBeGreaterThan(0)});let n=e.querySelectorAll(`[data-diff-line]`).length;await o.click(t.getByRole(`radio`,{name:/split/i})),await s(()=>{a(e.querySelectorAll(`[data-diff-line]`).length).toBeGreaterThan(n)}),await o.click(t.getByRole(`radio`,{name:/unified/i})),await s(()=>{a(e.querySelectorAll(`[data-diff-line]`).length).toBe(n)})}},x=`rounded-md border border-border bg-muted/40 p-2 text-xs`,S={args:{language:`typescript`,original:u,modified:d,onLineAction:()=>{},lineWidgets:[{key:`thread-1`,side:`old`,line:2,node:(0,i.jsx)(`div`,{className:x,children:`Why drop the string concatenation here?`})},{key:`thread-2`,side:`new`,line:2,node:(0,i.jsx)(`div`,{className:x,children:`Nit: extract the suffix into a constant.`})}]},play:async({canvasElement:e})=>{let t=c(e);await s(()=>{a(e.querySelectorAll(`[data-diff-widget]`).length).toBe(2)}),a(t.getByText(`Nit: extract the suffix into a constant.`)).toBeInTheDocument(),a(e.querySelectorAll(`[data-diff-line] button`).length).toBeGreaterThan(0)}},C={args:{...S.args,view:`split`}},w=`<Transaction>
  <Field name="AddRiderEffectiveDateCalculationOverrideForLegacyPlansAndSchemes" type="DATE" default="SystemDate" required="true"/>
  <MaxAge>70</MaxAge>
</Transaction>`,T=`<Transaction>
  <Field name="AddRiderEffectiveDateCalculationOverrideForLegacyPlansAndSchemes" type="DATE" default="PolicyEffectiveDate" required="true"/>
  <MaxAge>75</MaxAge>
</Transaction>`,E={args:{language:`xml`,view:`split`,original:w,modified:T},decorators:[e=>(0,i.jsx)(`div`,{style:{width:420},children:(0,i.jsx)(e,{})})],play:async({canvasElement:e})=>{await s(()=>{a(e.querySelectorAll(`[data-diff-line]`).length).toBeGreaterThan(0)});let t=[...e.querySelectorAll(`[data-diff-line]`)].map(e=>e.parentElement).filter((e,t,n)=>e!==null&&n.indexOf(e)===t);for(let e of t){let[t,n]=[...e.querySelectorAll(`[data-diff-line]`)];if(!t||!n)throw Error(`split row without two cells`);let r=t.querySelector(`code`);if(!r)throw Error(`split cell without code`);a(r.getBoundingClientRect().right).toBeLessThanOrEqual(n.getBoundingClientRect().left+.5),a(t.scrollWidth).toBeLessThanOrEqual(t.clientWidth),a(n.scrollWidth).toBeLessThanOrEqual(n.clientWidth)}}},D=[`TypeScript`,`Go`,`Python`,`Split`,`DatabaseDefinitions`,`FromUnifiedString`,`MultiFileUnified`,`Bare`,`ViewToggle`,`InlineComments`,`InlineCommentsSplit`,`SplitLongLinesNarrow`],f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    original: TS_BEFORE,
    modified: TS_AFTER
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // Structure renders synchronously; highlighting swaps in asynchronously.
    await waitFor(() => {
      expect(canvasElement.querySelectorAll('[data-diff-line="add"]').length).toBeGreaterThan(0);
    });
    expect(canvasElement.querySelectorAll('[data-diff-line="remove"]').length).toBeGreaterThan(0);
    // The shell header carries the language label.
    expect(canvas.getByText("typescript")).toBeInTheDocument();
    // Syntax highlighting eventually colors the tokens.
    await waitFor(() => {
      expect(canvasElement.querySelectorAll("code span[style]").length).toBeGreaterThan(0);
    }, {
      timeout: 5_000
    });
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    language: "go",
    original: \`package main

import "fmt"

func main() {
    fmt.Println("Hello")
}\`,
    modified: \`package main

import "fmt"

func main() {
    name := "world"
    fmt.Printf("Hello, %s\\\\n", name)
}\`
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    language: "python",
    original: \`def total(items):
    result = 0
    for item in items:
        result += item
    return result\`,
    modified: \`def total(items):
    return sum(items)\`
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    view: "split",
    original: TS_BEFORE,
    modified: TS_AFTER
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    language: "sql",
    view: "split",
    originalLabel: "acme_dev",
    modifiedLabel: "acme_qa",
    original: "CREATE PROCEDURE dbo.Calculate AS SELECT 1;",
    modified: "CREATE PROCEDURE dbo.Calculate AS SELECT 2;"
  },
  parameters: {
    docs: {
      description: {
        story: "Use originalLabel and modifiedLabel to name the compared sources. Split view aligns them over their respective columns; unified view identifies them with minus and plus markers. Labels are omitted in bare mode."
      }
    }
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    unified: \`@@ -1,3 +1,4 @@
 export function greet(name: string): string {
-  return "Hello, " + name;
+  const suffix = ".";
+  return \\\`Hello, \\\${name}\\\${suffix}\\\`;
 }\`
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    unified: \`diff --git a/src/greet.ts b/src/greet.ts
--- a/src/greet.ts
+++ b/src/greet.ts
@@ -1,2 +1,2 @@
 export function greet(name: string) {
-  return "Hi " + name;
+  return \\\`Hi \\\${name}\\\`;
 }
diff --git a/src/index.ts b/src/index.ts
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,2 +1,3 @@
 import { greet } from "./greet";
-console.log(greet("world"));
+const message = greet("world");
+console.log(message);\`
  },
  parameters: {
    docs: {
      description: {
        story: "A diff that spans several files renders a path header before each file's hunks (parsed from the \`diff --git\`/\`+++\` headers)."
      }
    }
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    language: "go",
    bare: true,
    original: \`x := 1\`,
    modified: \`x := 2\`
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    original: TS_BEFORE,
    modified: TS_AFTER
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelectorAll("[data-diff-line]").length).toBeGreaterThan(0);
    });
    const unifiedCells = canvasElement.querySelectorAll("[data-diff-line]").length;
    await userEvent.click(canvas.getByRole("radio", {
      name: /split/i
    }));
    await waitFor(() => {
      expect(canvasElement.querySelectorAll("[data-diff-line]").length).toBeGreaterThan(unifiedCells);
    });
    await userEvent.click(canvas.getByRole("radio", {
      name: /unified/i
    }));
    await waitFor(() => {
      expect(canvasElement.querySelectorAll("[data-diff-line]").length).toBe(unifiedCells);
    });
  }
}`,...b.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    original: TS_BEFORE,
    modified: TS_AFTER,
    onLineAction: () => {},
    lineWidgets: [{
      key: "thread-1",
      side: "old",
      line: 2,
      node: <div className={COMMENT_WIDGET_CLASS}>Why drop the string concatenation here?</div>
    }, {
      key: "thread-2",
      side: "new",
      line: 2,
      node: <div className={COMMENT_WIDGET_CLASS}>Nit: extract the suffix into a constant.</div>
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvasElement.querySelectorAll("[data-diff-widget]").length).toBe(2);
    });
    expect(canvas.getByText("Nit: extract the suffix into a constant.")).toBeInTheDocument();
    expect(canvasElement.querySelectorAll("[data-diff-line] button").length).toBeGreaterThan(0);
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    ...InlineComments.args,
    view: "split"
  }
}`,...C.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    language: "xml",
    view: "split",
    original: XML_BEFORE,
    modified: XML_AFTER
  },
  decorators: [Story => <div style={{
    width: 420
  }}><Story /></div>],
  play: async ({
    canvasElement
  }) => {
    await waitFor(() => {
      expect(canvasElement.querySelectorAll("[data-diff-line]").length).toBeGreaterThan(0);
    });
    const rows = [...canvasElement.querySelectorAll("[data-diff-line]")].map(cell => cell.parentElement).filter((row, index, all): row is HTMLElement => row !== null && all.indexOf(row) === index);
    for (const row of rows) {
      const [left, right] = [...row.querySelectorAll<HTMLElement>("[data-diff-line]")];
      if (!left || !right) throw new Error("split row without two cells");
      const leftCode = left.querySelector("code");
      if (!leftCode) throw new Error("split cell without code");
      expect(leftCode.getBoundingClientRect().right).toBeLessThanOrEqual(right.getBoundingClientRect().left + 0.5);
      expect(left.scrollWidth).toBeLessThanOrEqual(left.clientWidth);
      expect(right.scrollWidth).toBeLessThanOrEqual(right.clientWidth);
    }
  }
}`,...E.parameters?.docs?.source}}}})))()}O();export{y as Bare,g as DatabaseDefinitions,_ as FromUnifiedString,p as Go,S as InlineComments,C as InlineCommentsSplit,v as MultiFileUnified,m as Python,h as Split,E as SplitLongLinesNarrow,f as TypeScript,b as ViewToggle,D as __namedExportsOrder,l as default};