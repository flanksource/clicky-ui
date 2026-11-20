import{n as e}from"./rolldown-runtime-BCiCTKAo.js";import{t}from"./react-BcdEFcws.js";import{t as n}from"./jsx-runtime-DKU1u6-r.js";import{n as r,t as i}from"./CodeDiff-GVXM0CuT.js";function a({view:e,disabled:t}){let[n,r]=(0,o.useState)(()=>new Set);return(0,s.jsx)(i,{language:`typescript`,view:e,unified:A,lineSelection:{isSelected:e=>n.has(j(e)),onChange:(e,t)=>r(n=>{let r=new Set(n);for(let n of e)t?r.add(j(n)):r.delete(j(n));return r}),label:(e,t)=>`${t?`Unselect`:`Select`} ${e.side} line ${e.line}`,hunkLabel:(e,t)=>`${t?`Unselect`:`Select`} hunk ${e}`,...t?{disabled:t}:{}}})}var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F;function I(){return(I=e((()=>{o=t(),r(),s=n(),{expect:c,userEvent:l,waitFor:u,within:d}=__STORYBOOK_MODULE_TEST__,f={title:`Git/CodeDiff`,component:i,tags:[`autodocs`],parameters:{docs:{description:{component:"Language-aware diff viewer. Computes an LCS line diff from `{ original, modified }` (or parses a `{ unified }` string), syntax-highlights each side with the shared Shiki engine, and renders git-style add/remove gutters that follow the app theme. Supports unified and split (side-by-side) layouts."}}}},p=`export function greet(name: string): string {
  return "Hello, " + name;
}`,m='export function greet(name: string, excited = false): string {\n  const suffix = excited ? "!" : ".";\n  return `Hello, ${name}${suffix}`;\n}',h={args:{language:`typescript`,original:p,modified:m},play:async({canvasElement:e})=>{let t=d(e);await u(()=>{c(e.querySelectorAll(`[data-diff-line="add"]`).length).toBeGreaterThan(0)}),c(e.querySelectorAll(`[data-diff-line="remove"]`).length).toBeGreaterThan(0),c(t.getByText(`typescript`)).toBeInTheDocument(),await u(()=>{c(e.querySelectorAll(`code span[style]`).length).toBeGreaterThan(0)},{timeout:5e3})}},g={args:{language:`go`,original:`package main

import "fmt"

func main() {
    fmt.Println("Hello")
}`,modified:`package main

import "fmt"

func main() {
    name := "world"
    fmt.Printf("Hello, %s\\n", name)
}`}},_={args:{language:`python`,original:`def total(items):
    result = 0
    for item in items:
        result += item
    return result`,modified:`def total(items):
    return sum(items)`}},v={args:{language:`typescript`,view:`split`,original:p,modified:m}},y={args:{language:`sql`,view:`split`,originalLabel:`acme_dev`,modifiedLabel:`acme_qa`,original:`CREATE PROCEDURE dbo.Calculate AS SELECT 1;`,modified:`CREATE PROCEDURE dbo.Calculate AS SELECT 2;`},parameters:{docs:{description:{story:`Use originalLabel and modifiedLabel to name the compared sources. Split view aligns them over their respective columns; unified view identifies them with minus and plus markers. Labels are omitted in bare mode.`}}}},b={args:{language:`typescript`,unified:`@@ -1,3 +1,4 @@
 export function greet(name: string): string {
-  return "Hello, " + name;
+  const suffix = ".";
+  return \`Hello, \${name}\${suffix}\`;
 }`}},x={args:{language:`typescript`,unified:`diff --git a/src/greet.ts b/src/greet.ts
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
+console.log(message);`},parameters:{docs:{description:{story:"A diff that spans several files renders a path header before each file's hunks (parsed from the `diff --git`/`+++` headers)."}}}},S={args:{language:`go`,bare:!0,original:`x := 1`,modified:`x := 2`}},C={args:{language:`typescript`,original:p,modified:m},play:async({canvasElement:e})=>{let t=d(e);await u(()=>{c(e.querySelectorAll(`[data-diff-line]`).length).toBeGreaterThan(0)});let n=e.querySelectorAll(`[data-diff-line]`).length;await l.click(t.getByRole(`radio`,{name:/split/i})),await u(()=>{c(e.querySelectorAll(`[data-diff-line]`).length).toBeGreaterThan(n)}),await l.click(t.getByRole(`radio`,{name:/unified/i})),await u(()=>{c(e.querySelectorAll(`[data-diff-line]`).length).toBe(n)})}},w=`rounded-md border border-border bg-muted/40 p-2 text-xs`,T={args:{language:`typescript`,original:p,modified:m,onLineAction:()=>{},lineWidgets:[{key:`thread-1`,side:`old`,line:2,node:(0,s.jsx)(`div`,{className:w,children:`Why drop the string concatenation here?`})},{key:`thread-2`,side:`new`,line:2,node:(0,s.jsx)(`div`,{className:w,children:`Nit: extract the suffix into a constant.`})}]},play:async({canvasElement:e})=>{let t=d(e);await u(()=>{c(e.querySelectorAll(`[data-diff-widget]`).length).toBe(2)}),c(t.getByText(`Nit: extract the suffix into a constant.`)).toBeInTheDocument(),c(e.querySelectorAll(`[data-diff-line] button`).length).toBeGreaterThan(0)}},E={args:{...T.args,view:`split`}},D=`<Transaction>
  <Field name="AddRiderEffectiveDateCalculationOverrideForLegacyPlansAndSchemes" type="DATE" default="SystemDate" required="true"/>
  <MaxAge>70</MaxAge>
</Transaction>`,O=`<Transaction>
  <Field name="AddRiderEffectiveDateCalculationOverrideForLegacyPlansAndSchemes" type="DATE" default="PolicyEffectiveDate" required="true"/>
  <MaxAge>75</MaxAge>
</Transaction>`,k={args:{language:`xml`,view:`split`,original:D,modified:O},decorators:[e=>(0,s.jsx)(`div`,{style:{width:420},children:(0,s.jsx)(e,{})})],play:async({canvasElement:e})=>{await u(()=>{c(e.querySelectorAll(`[data-diff-line]`).length).toBeGreaterThan(0)});let t=[...e.querySelectorAll(`[data-diff-line]`)].map(e=>e.parentElement).filter((e,t,n)=>e!==null&&n.indexOf(e)===t);for(let e of t){let[t,n]=[...e.querySelectorAll(`[data-diff-line]`)];if(!t||!n)throw Error(`split row without two cells`);let r=t.querySelector(`code`);if(!r)throw Error(`split cell without code`);c(r.getBoundingClientRect().right).toBeLessThanOrEqual(n.getBoundingClientRect().left+.5),c(t.scrollWidth).toBeLessThanOrEqual(t.clientWidth),c(n.scrollWidth).toBeLessThanOrEqual(n.clientWidth)}}},A=`@@ -1,5 +1,5 @@
 export function greet(name: string) {
-  const a = "Hi";
-  const b = name;
+  const greeting = "Hello";
+  const target = name.trim();
   return greeting + target;
 }
@@ -10,2 +10,2 @@
 export const VERSION = 1;
-export const NAME = "old";
+export const NAME = "new";`,j=e=>`${e.side}:${e.line}`,M={render:()=>(0,s.jsx)(a,{view:`unified`}),play:async({canvasElement:e})=>{let t=d(e),n=l.setup();await u(()=>c(t.getAllByRole(`checkbox`).length).toBe(8));let r=t.getByRole(`checkbox`,{name:`Select hunk 1`});c(r).toHaveAttribute(`aria-checked`,`false`),await n.click(t.getByRole(`checkbox`,{name:`Select old line 2`})),c(t.getByRole(`checkbox`,{name:`Select hunk 1`})).toHaveAttribute(`aria-checked`,`mixed`),await n.keyboard(`{Shift>}`),await n.click(t.getByRole(`checkbox`,{name:`Select new line 3`})),await n.keyboard(`{/Shift}`),c(t.getByRole(`checkbox`,{name:`Unselect hunk 1`})).toHaveAttribute(`aria-checked`,`true`),await n.click(t.getByRole(`checkbox`,{name:`Unselect hunk 1`})),c(t.getByRole(`checkbox`,{name:`Select hunk 1`})).toHaveAttribute(`aria-checked`,`false`)}},N={render:()=>(0,s.jsx)(a,{view:`split`})},P={render:()=>(0,s.jsx)(a,{view:`unified`,disabled:!0}),play:async({canvasElement:e})=>{let t=d(e).getAllByRole(`checkbox`);c(t.every(e=>e.disabled)).toBe(!0)}},F=[`TypeScript`,`Go`,`Python`,`Split`,`DatabaseDefinitions`,`FromUnifiedString`,`MultiFileUnified`,`Bare`,`ViewToggle`,`InlineComments`,`InlineCommentsSplit`,`SplitLongLinesNarrow`,`LineSelection`,`LineSelectionSplit`,`LineSelectionDisabled`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    view: "split",
    original: TS_BEFORE,
    modified: TS_AFTER
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    unified: \`@@ -1,3 +1,4 @@
 export function greet(name: string): string {
-  return "Hello, " + name;
+  const suffix = ".";
+  return \\\`Hello, \\\${name}\\\${suffix}\\\`;
 }\`
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
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
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    language: "go",
    bare: true,
    original: \`x := 1\`,
    modified: \`x := 2\`
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
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
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    ...InlineComments.args,
    view: "split"
  }
}`,...E.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  render: () => <SelectionDiff view="unified" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    // The direct userEvent APIs each start a fresh session, so a held Shift would not reach the next click; one setup() session keeps it.
    const user = userEvent.setup();
    await waitFor(() => expect(canvas.getAllByRole("checkbox").length).toBe(8));
    const hunk = canvas.getByRole("checkbox", {
      name: "Select hunk 1"
    });
    expect(hunk).toHaveAttribute("aria-checked", "false");
    await user.click(canvas.getByRole("checkbox", {
      name: "Select old line 2"
    }));
    expect(canvas.getByRole("checkbox", {
      name: "Select hunk 1"
    })).toHaveAttribute("aria-checked", "mixed");
    await user.keyboard("{Shift>}");
    await user.click(canvas.getByRole("checkbox", {
      name: "Select new line 3"
    }));
    await user.keyboard("{/Shift}");
    expect(canvas.getByRole("checkbox", {
      name: "Unselect hunk 1"
    })).toHaveAttribute("aria-checked", "true");
    await user.click(canvas.getByRole("checkbox", {
      name: "Unselect hunk 1"
    }));
    expect(canvas.getByRole("checkbox", {
      name: "Select hunk 1"
    })).toHaveAttribute("aria-checked", "false");
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <SelectionDiff view="split" />
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <SelectionDiff view="unified" disabled />,
  play: async ({
    canvasElement
  }) => {
    const boxes = within(canvasElement).getAllByRole("checkbox");
    expect(boxes.every(box => (box as HTMLButtonElement).disabled)).toBe(true);
  }
}`,...P.parameters?.docs?.source}}}})))()}I();export{S as Bare,y as DatabaseDefinitions,b as FromUnifiedString,g as Go,T as InlineComments,E as InlineCommentsSplit,M as LineSelection,P as LineSelectionDisabled,N as LineSelectionSplit,x as MultiFileUnified,_ as Python,v as Split,k as SplitLongLinesNarrow,h as TypeScript,C as ViewToggle,F as __namedExportsOrder,f as default};