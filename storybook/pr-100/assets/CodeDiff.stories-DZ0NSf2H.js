import{j as x}from"./iframe-DiGWdYeS.js";import{C as Q}from"./CodeDiff-KPQ8SLmO.js";import"./preload-helper-CLP1olNy.js";import"./utils-DW-IJACk.js";import"./SegmentedControl-Czoh7U1p.js";import"./Icon-CXYnH2qb.js";import"./HighlightedTokens-BbcRqCG6.js";const{expect:t,userEvent:S,waitFor:a,within:h}=__STORYBOOK_MODULE_TEST__,ie={title:"Data/CodeDiff",component:Q,tags:["autodocs"],parameters:{docs:{description:{component:"Language-aware diff viewer. Computes an LCS line diff from `{ original, modified }` (or parses a `{ unified }` string), syntax-highlights each side with the shared Shiki engine, and renders git-style add/remove gutters that follow the app theme. Supports unified and split (side-by-side) layouts."}}}},u=`export function greet(name: string): string {
  return "Hello, " + name;
}`,f='export function greet(name: string, excited = false): string {\n  const suffix = excited ? "!" : ".";\n  return `Hello, ${name}${suffix}`;\n}',i={args:{language:"typescript",original:u,modified:f},play:async({canvasElement:e})=>{const n=h(e);await a(()=>{t(e.querySelectorAll('[data-diff-line="add"]').length).toBeGreaterThan(0)}),t(e.querySelectorAll('[data-diff-line="remove"]').length).toBeGreaterThan(0),t(n.getByText("typescript")).toBeInTheDocument(),await a(()=>{t(e.querySelectorAll("code span[style]").length).toBeGreaterThan(0)},{timeout:5e3})}},s={args:{language:"go",original:`package main

import "fmt"

func main() {
    fmt.Println("Hello")
}`,modified:`package main

import "fmt"

func main() {
    name := "world"
    fmt.Printf("Hello, %s\\n", name)
}`}},o={args:{language:"python",original:`def total(items):
    result = 0
    for item in items:
        result += item
    return result`,modified:`def total(items):
    return sum(items)`}},l={args:{language:"typescript",view:"split",original:u,modified:f}},c={args:{language:"typescript",unified:`@@ -1,3 +1,4 @@
 export function greet(name: string): string {
-  return "Hello, " + name;
+  const suffix = ".";
+  return \`Hello, \${name}\${suffix}\`;
 }`}},d={args:{language:"typescript",unified:`diff --git a/src/greet.ts b/src/greet.ts
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
+console.log(message);`},parameters:{docs:{description:{story:"A diff that spans several files renders a path header before each file's hunks (parsed from the `diff --git`/`+++` headers)."}}}},g={args:{language:"go",bare:!0,original:"x := 1",modified:"x := 2"}},m={args:{language:"typescript",original:u,modified:f},play:async({canvasElement:e})=>{const n=h(e);await a(()=>{t(e.querySelectorAll("[data-diff-line]").length).toBeGreaterThan(0)});const y=e.querySelectorAll("[data-diff-line]").length;await S.click(n.getByRole("radio",{name:/split/i})),await a(()=>{t(e.querySelectorAll("[data-diff-line]").length).toBeGreaterThan(y)}),await S.click(n.getByRole("radio",{name:/unified/i})),await a(()=>{t(e.querySelectorAll("[data-diff-line]").length).toBe(y)})}},T="rounded-md border border-border bg-muted/40 p-2 text-xs",r={args:{language:"typescript",original:u,modified:f,onLineAction:()=>{},lineWidgets:[{key:"thread-1",side:"old",line:2,node:x.jsx("div",{className:T,children:"Why drop the string concatenation here?"})},{key:"thread-2",side:"new",line:2,node:x.jsx("div",{className:T,children:"Nit: extract the suffix into a constant."})}]},play:async({canvasElement:e})=>{const n=h(e);await a(()=>{t(e.querySelectorAll("[data-diff-widget]").length).toBe(2)}),t(n.getByText("Nit: extract the suffix into a constant.")).toBeInTheDocument(),t(e.querySelectorAll("[data-diff-line] button").length).toBeGreaterThan(0)}},p={args:{...r.args,view:"split"}};var w,v,B;i.parameters={...i.parameters,docs:{...(w=i.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(B=(v=i.parameters)==null?void 0:v.docs)==null?void 0:B.source}}};var E,A,_;s.parameters={...s.parameters,docs:{...(E=s.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(_=(A=s.parameters)==null?void 0:A.docs)==null?void 0:_.source}}};var F,b,C;o.parameters={...o.parameters,docs:{...(F=o.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(C=(b=o.parameters)==null?void 0:b.docs)==null?void 0:C.source}}};var q,G,k;l.parameters={...l.parameters,docs:{...(q=l.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    view: "split",
    original: TS_BEFORE,
    modified: TS_AFTER
  }
}`,...(k=(G=l.parameters)==null?void 0:G.docs)==null?void 0:k.source}}};var R,H,O;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    unified: \`@@ -1,3 +1,4 @@
 export function greet(name: string): string {
-  return "Hello, " + name;
+  const suffix = ".";
+  return \\\`Hello, \\\${name}\\\${suffix}\\\`;
 }\`
  }
}`,...(O=(H=c.parameters)==null?void 0:H.docs)==null?void 0:O.source}}};var I,D,N;d.parameters={...d.parameters,docs:{...(I=d.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...(N=(D=d.parameters)==null?void 0:D.docs)==null?void 0:N.source}}};var M,L,$;g.parameters={...g.parameters,docs:{...(M=g.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    language: "go",
    bare: true,
    original: \`x := 1\`,
    modified: \`x := 2\`
  }
}`,...($=(L=g.parameters)==null?void 0:L.docs)==null?void 0:$.source}}};var W,P,U;m.parameters={...m.parameters,docs:{...(W=m.parameters)==null?void 0:W.docs,source:{originalSource:`{
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
}`,...(U=(P=m.parameters)==null?void 0:P.docs)==null?void 0:U.source}}};var j,V,K;r.parameters={...r.parameters,docs:{...(j=r.parameters)==null?void 0:j.docs,source:{originalSource:`{
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
}`,...(K=(V=r.parameters)==null?void 0:V.docs)==null?void 0:K.source}}};var Y,z,J;p.parameters={...p.parameters,docs:{...(Y=p.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  args: {
    ...InlineComments.args,
    view: "split"
  }
}`,...(J=(z=p.parameters)==null?void 0:z.docs)==null?void 0:J.source}}};const se=["TypeScript","Go","Python","Split","FromUnifiedString","MultiFileUnified","Bare","ViewToggle","InlineComments","InlineCommentsSplit"];export{g as Bare,c as FromUnifiedString,s as Go,r as InlineComments,p as InlineCommentsSplit,d as MultiFileUnified,o as Python,l as Split,i as TypeScript,m as ViewToggle,se as __namedExportsOrder,ie as default};
