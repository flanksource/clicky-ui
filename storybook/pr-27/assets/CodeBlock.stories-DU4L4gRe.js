import{C as j}from"./CodeBlock-Dv7R77F9.js";import"./iframe-CgiBotGO.js";import"./preload-helper-BZuLNX-z.js";import"./utils-BLSKlp9E.js";import"./JsonView-C6ld4qEF.js";import"./code-highlight-COaL06cM.js";const Y={title:"Data/CodeBlock",component:j,args:{language:"json",source:'{ "status": "ok" }',jsonDefaultOpenDepth:2},parameters:{docs:{description:{component:"Code renderer for Clicky payloads and diagnostics. It prefers trusted highlighted HTML, falls back to async Shiki highlighting, and renders JSON as an expandable tree."}}}},e={args:{language:"typescript",source:`type Service = {
  name: string;
  status: "healthy" | "degraded";
};

export function label(service: Service) {
  return \`\${service.name}: \${service.status}\`;
}`}},r={args:{language:"json",source:JSON.stringify({service:"api",status:"healthy",metrics:{requests:12492,errors:3,p95:"82ms"},labels:["prod","edge"]},null,2)}},a={args:{language:"xml",source:"<Activity><Math/></Activity>",highlightedHtml:'<pre class="chroma"><span class="nt">&lt;Activity&gt;</span><span class="nt">&lt;Math/&gt;</span><span class="nt">&lt;/Activity&gt;</span></pre>'}},s={args:{language:"java",source:`public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}`}},n={args:{language:"sql",source:`SELECT id, name, greeting
  FROM greetings
 WHERE name = 'world'
 ORDER BY id
 LIMIT 1;`}},t={args:{language:"go",source:`package main

import "fmt"

func main() {
    fmt.Println("Hello, world!")
}`}},o={args:{language:"bash",source:`#!/usr/bin/env bash
# Print a friendly greeting.
name="\${1:-world}"
echo "Hello, $name!"`}},c={args:{language:"yaml",source:`greeting:
  message: Hello, world!
  language: en
  audience:
    - developers
    - operators`}},l={args:{language:"python",source:`def greet(name: str = "world") -> str:
    return f"Hello, {name}!"


if __name__ == "__main__":
    print(greet())`}};var i,g,p;e.parameters={...e.parameters,docs:{...(i=e.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
}`,...(p=(g=e.parameters)==null?void 0:g.docs)==null?void 0:p.source}}};var m,u,d;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
}`,...(d=(u=r.parameters)==null?void 0:u.docs)==null?void 0:d.source}}};var h,y,v;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    language: "xml",
    source: "<Activity><Math/></Activity>",
    highlightedHtml: '<pre class="chroma"><span class="nt">&lt;Activity&gt;</span><span class="nt">&lt;Math/&gt;</span><span class="nt">&lt;/Activity&gt;</span></pre>'
  }
}`,...(v=(y=a.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var S,f,_;s.parameters={...s.parameters,docs:{...(S=s.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    language: "java",
    source: \`public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
    }
}\`
  }
}`,...(_=(f=s.parameters)==null?void 0:f.docs)==null?void 0:_.source}}};var H,b,w;n.parameters={...n.parameters,docs:{...(H=n.parameters)==null?void 0:H.docs,source:{originalSource:`{
  args: {
    language: "sql",
    source: \`SELECT id, name, greeting
  FROM greetings
 WHERE name = 'world'
 ORDER BY id
 LIMIT 1;\`
  }
}`,...(w=(b=n.parameters)==null?void 0:b.docs)==null?void 0:w.source}}};var E,C,M;t.parameters={...t.parameters,docs:{...(E=t.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    language: "go",
    source: \`package main

import "fmt"

func main() {
    fmt.Println("Hello, world!")
}\`
  }
}`,...(M=(C=t.parameters)==null?void 0:C.docs)==null?void 0:M.source}}};var O,k,A;o.parameters={...o.parameters,docs:{...(O=o.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    language: "bash",
    source: \`#!/usr/bin/env bash
# Print a friendly greeting.
name="\\\${1:-world}"
echo "Hello, $name!"\`
  }
}`,...(A=(k=o.parameters)==null?void 0:k.docs)==null?void 0:A.source}}};var R,$,x;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    language: "yaml",
    source: \`greeting:
  message: Hello, world!
  language: en
  audience:
    - developers
    - operators\`
  }
}`,...(x=($=c.parameters)==null?void 0:$.docs)==null?void 0:x.source}}};var I,J,T;l.parameters={...l.parameters,docs:{...(I=l.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    language: "python",
    source: \`def greet(name: str = "world") -> str:
    return f"Hello, {name}!"


if __name__ == "__main__":
    print(greet())\`
  }
}`,...(T=(J=l.parameters)==null?void 0:J.docs)==null?void 0:T.source}}};const N=["TypeScript","InteractiveJson","ChromaXml","Java","Sql","Go","Shell","Yaml","Python"];export{a as ChromaXml,t as Go,r as InteractiveJson,s as Java,l as Python,o as Shell,n as Sql,e as TypeScript,c as Yaml,N as __namedExportsOrder,Y as default};
