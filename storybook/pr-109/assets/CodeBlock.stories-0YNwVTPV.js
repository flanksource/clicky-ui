import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,t as n}from"./CodeBlock-wMBokoU2.js";var r,i,a,o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{t(),r={title:`Data/CodeBlock`,component:n,args:{language:`json`,source:`{ "status": "ok" }`,jsonDefaultOpenDepth:2},parameters:{docs:{description:{component:`Code renderer for Clicky payloads and diagnostics. It prefers trusted highlighted HTML, falls back to async Shiki highlighting, and renders JSON as an expandable tree.`}}}},i={args:{language:`typescript`,source:`type Service = {
  name: string;
  status: "healthy" | "degraded";
};

export function label(service: Service) {
  return \`\${service.name}: \${service.status}\`;
}`}},a={args:{language:`json`,source:JSON.stringify({service:`api`,status:`healthy`,metrics:{requests:12492,errors:3,p95:`82ms`},labels:[`prod`,`edge`]},null,2)}},o={args:{language:`xml`,source:`<Activity><Math/></Activity>`,highlightedHtml:`<pre class="chroma"><span class="nt">&lt;Activity&gt;</span><span class="nt">&lt;Math/&gt;</span><span class="nt">&lt;/Activity&gt;</span></pre>`}},s={args:{language:`java`,source:`public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}`}},c={args:{language:`sql`,source:`SELECT id, name, greeting
  FROM greetings
 WHERE name = 'world'
 ORDER BY id
 LIMIT 1;`}},l={args:{language:`go`,source:`package main

import "fmt"

func main() {
    fmt.Println("Hello, world!")
}`}},u={args:{language:`bash`,source:`#!/usr/bin/env bash
# Print a friendly greeting.
name="\${1:-world}"
echo "Hello, $name!"`}},d={args:{language:`yaml`,source:`greeting:
  message: Hello, world!
  language: en
  audience:
    - developers
    - operators`}},f={args:{language:`python`,source:`def greet(name: str = "world") -> str:
    return f"Hello, {name}!"


if __name__ == "__main__":
    print(greet())`}},p=[`TypeScript`,`InteractiveJson`,`ChromaXml`,`Java`,`Sql`,`Go`,`Shell`,`Yaml`,`Python`],i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    language: "typescript",
    source: \`type Service = {
  name: string;
  status: "healthy" | "degraded";
};

export function label(service: Service) {
  return \\\`\\\${service.name}: \\\${service.status}\\\`;
}\`
  }
}`,...i.parameters?.docs?.source}}},a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    language: "json",
    source: JSON.stringify({
      service: "api",
      status: "healthy",
      metrics: {
        requests: 12492,
        errors: 3,
        p95: "82ms"
      },
      labels: ["prod", "edge"]
    }, null, 2)
  }
}`,...a.parameters?.docs?.source}}},o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    language: "xml",
    source: "<Activity><Math/></Activity>",
    highlightedHtml: '<pre class="chroma"><span class="nt">&lt;Activity&gt;</span><span class="nt">&lt;Math/&gt;</span><span class="nt">&lt;/Activity&gt;</span></pre>'
  }
}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    language: "java",
    source: \`public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}\`
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    language: "sql",
    source: \`SELECT id, name, greeting
  FROM greetings
 WHERE name = 'world'
 ORDER BY id
 LIMIT 1;\`
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    language: "go",
    source: \`package main

import "fmt"

func main() {
    fmt.Println("Hello, world!")
}\`
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    language: "bash",
    source: \`#!/usr/bin/env bash
# Print a friendly greeting.
name="\\\${1:-world}"
echo "Hello, $name!"\`
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    language: "yaml",
    source: \`greeting:
  message: Hello, world!
  language: en
  audience:
    - developers
    - operators\`
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    language: "python",
    source: \`def greet(name: str = "world") -> str:
    return f"Hello, {name}!"


if __name__ == "__main__":
    print(greet())\`
  }
}`,...f.parameters?.docs?.source}}}})))()}m();export{o as ChromaXml,l as Go,a as InteractiveJson,s as Java,f as Python,u as Shell,c as Sql,i as TypeScript,d as Yaml,p as __namedExportsOrder,r as default};