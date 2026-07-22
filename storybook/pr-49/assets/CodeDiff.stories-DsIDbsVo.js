import{C as M}from"./CodeDiff-DD54JYEE.js";import"./iframe-8a3mxbiL.js";import"./preload-helper-BH-fM7Kg.js";import"./utils-CR52uffu.js";import"./SegmentedControl-DdUmX-61.js";import"./Icon-DoTJG9m4.js";import"./code-highlight-BpkgIRXS.js";const{expect:t,userEvent:u,waitFor:n,within:L}=__STORYBOOK_MODULE_TEST__,N={title:"Data/CodeDiff",component:M,tags:["autodocs"],parameters:{docs:{description:{component:"Language-aware diff viewer. Computes an LCS line diff from `{ original, modified }` (or parses a `{ unified }` string), syntax-highlights each side with the shared Shiki engine, and renders git-style add/remove gutters that follow the app theme. Supports unified and split (side-by-side) layouts."}}}},m=`export function greet(name: string): string {
  return "Hello, " + name;
}`,f='export function greet(name: string, excited = false): string {\n  const suffix = excited ? "!" : ".";\n  return `Hello, ${name}${suffix}`;\n}',a={args:{language:"typescript",original:m,modified:f},play:async({canvasElement:e})=>{const r=L(e);await n(()=>{t(e.querySelectorAll('[data-diff-line="add"]').length).toBeGreaterThan(0)}),t(e.querySelectorAll('[data-diff-line="remove"]').length).toBeGreaterThan(0),t(r.getByText("typescript")).toBeInTheDocument(),await n(()=>{t(e.querySelectorAll("code span[style]").length).toBeGreaterThan(0)})}},i={args:{language:"go",original:`package main

import "fmt"

func main() {
    fmt.Println("Hello")
}`,modified:`package main

import "fmt"

func main() {
    name := "world"
    fmt.Printf("Hello, %s\\n", name)
}`}},s={args:{language:"python",original:`def total(items):
    result = 0
    for item in items:
        result += item
    return result`,modified:`def total(items):
    return sum(items)`}},o={args:{language:"typescript",view:"split",original:m,modified:f}},l={args:{language:"typescript",unified:`@@ -1,3 +1,4 @@
 export function greet(name: string): string {
-  return "Hello, " + name;
+  const suffix = ".";
+  return \`Hello, \${name}\${suffix}\`;
 }`}},c={args:{language:"typescript",unified:`diff --git a/src/greet.ts b/src/greet.ts
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
+console.log(message);`},parameters:{docs:{description:{story:"A diff that spans several files renders a path header before each file's hunks (parsed from the `diff --git`/`+++` headers)."}}}},g={args:{language:"go",bare:!0,original:"x := 1",modified:"x := 2"}},d={args:{language:"typescript",original:m,modified:f},play:async({canvasElement:e})=>{const r=L(e);await n(()=>{t(e.querySelectorAll("[data-diff-line]").length).toBeGreaterThan(0)});const p=e.querySelectorAll("[data-diff-line]").length;await u.click(r.getByRole("radio",{name:/split/i})),await n(()=>{t(e.querySelectorAll("[data-diff-line]").length).toBeGreaterThan(p)}),await u.click(r.getByRole("radio",{name:/unified/i})),await n(()=>{t(e.querySelectorAll("[data-diff-line]").length).toBe(p)})}};var h,y,S;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
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
    });
  }
}`,...(S=(y=a.parameters)==null?void 0:y.docs)==null?void 0:S.source}}};var x,w,T;i.parameters={...i.parameters,docs:{...(x=i.parameters)==null?void 0:x.docs,source:{originalSource:`{
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
}`,...(T=(w=i.parameters)==null?void 0:w.docs)==null?void 0:T.source}}};var B,v,E;s.parameters={...s.parameters,docs:{...(B=s.parameters)==null?void 0:B.docs,source:{originalSource:`{
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
}`,...(E=(v=s.parameters)==null?void 0:v.docs)==null?void 0:E.source}}};var A,F,_;o.parameters={...o.parameters,docs:{...(A=o.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    view: "split",
    original: TS_BEFORE,
    modified: TS_AFTER
  }
}`,...(_=(F=o.parameters)==null?void 0:F.docs)==null?void 0:_.source}}};var b,q,H;l.parameters={...l.parameters,docs:{...(b=l.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    unified: \`@@ -1,3 +1,4 @@
 export function greet(name: string): string {
-  return "Hello, " + name;
+  const suffix = ".";
+  return \\\`Hello, \\\${name}\\\${suffix}\\\`;
 }\`
  }
}`,...(H=(q=l.parameters)==null?void 0:q.docs)==null?void 0:H.source}}};var R,k,G;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(G=(k=c.parameters)==null?void 0:k.docs)==null?void 0:G.source}}};var C,O,$;g.parameters={...g.parameters,docs:{...(C=g.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    language: "go",
    bare: true,
    original: \`x := 1\`,
    modified: \`x := 2\`
  }
}`,...($=(O=g.parameters)==null?void 0:O.docs)==null?void 0:$.source}}};var D,P,U;d.parameters={...d.parameters,docs:{...(D=d.parameters)==null?void 0:D.docs,source:{originalSource:`{
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
}`,...(U=(P=d.parameters)==null?void 0:P.docs)==null?void 0:U.source}}};const Q=["TypeScript","Go","Python","Split","FromUnifiedString","MultiFileUnified","Bare","ViewToggle"];export{g as Bare,l as FromUnifiedString,i as Go,c as MultiFileUnified,s as Python,o as Split,a as TypeScript,d as ViewToggle,Q as __namedExportsOrder,N as default};
