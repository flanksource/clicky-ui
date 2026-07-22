import{j as e,r as H}from"./iframe-BNCeWgcu.js";import{S as W}from"./SecretKeySelector-CEsSavSW.js";import"./preload-helper-bXXPlA_x.js";import"./index-7HP1Px-8.js";import"./utils-CR52uffu.js";import"./Combobox-CSVSwpKH.js";import"./index-BXGXqK8-.js";import"./index-CNjQCV-Z.js";import"./FilterPill-BobDGnvZ.js";import"./Icon-BG-3MSKK.js";import"./json-schema-form-size-DYVq0lph.js";import"./modalStack-ShjS88M0.js";import"./zIndex-CigQ76av.js";const I={secret:[{name:"db",keys:["host","port","username","password"]},{name:"elastic",keys:["url","apiKey"]}],configmap:[{name:"app",keys:["demo.web_url","demo.cycle_url"]}],helm:[{name:"mysql",keys:["auth.rootPassword","primary.service.port"]}]},J=[{name:"default"},{name:"readonly"},{name:"deployer"}],F={db:[{key:"host",value:"sql-••••.com"},{key:"port",value:"1433"},{key:"username",value:"sa"},{key:"password",value:"••••"}],elastic:[{key:"url",value:"http••••:9200"},{key:"apiKey",value:"••••"}],app:[{key:"demo.web_url",value:"http••••/PASJava"},{key:"demo.cycle_url",value:"http••••/Cycle"}],mysql:[{key:"auth.rootPassword",value:"••••"},{key:"primary.service.port",value:"3306"}]},z=s=>Promise.resolve(I[s]),B=(s,p)=>new Promise(m=>setTimeout(()=>m(F[p]??[]),200)),D=()=>Promise.resolve(J),u=["secret","configmap","helm","serviceaccount","onepassword","value"],ie={title:"Components/SecretKeySelector",component:W,parameters:{docs:{description:{component:"Picks how a credential is sourced via a searchable **Combobox** and lowers the choice into a single reference the consumer persists. Supports Kubernetes Secret / ConfigMap keys (with a mid-masked preview of each key's value), Helm release values (jsonpath key), a Service Account token (name only), a 1Password `op://vault/item/field` reference, and a static inline **Value**. The offered sources are controlled by `sources` (default Secret/ConfigMap/Value; `allowLiteral={false}` drops Value). Fetches nothing itself — the consumer supplies `loadResources` / `loadKeyPreview` / `loadServiceAccounts` getters."}}}};function r({initial:s,allowLiteral:p,sources:m}){const[y,N]=H.useState(s);return e.jsxs("div",{className:"w-[34rem] space-y-3",children:[e.jsx(W,{value:y,onChange:N,loadResources:z,loadKeyPreview:B,loadServiceAccounts:D,allowLiteral:p,sources:m}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(y)]})]})}const a={render:()=>e.jsx(r,{})},o={parameters:{docs:{description:{story:"A chosen secret shows masked previews as key labels."}}},render:()=>e.jsx(r,{initial:{kind:"secret",name:"db",key:"host"}})},n={render:()=>e.jsx(r,{initial:{kind:"configmap",name:"app",key:""}})},t={parameters:{docs:{description:{story:"The **Value** toggle (available by default) lets the operator type a static inline string instead of referencing a Secret/ConfigMap key. The emitted value is `{kind:'value', value}`."}}},render:()=>e.jsx(r,{initial:{kind:"value",value:"prod.example.com"}})},i={parameters:{docs:{description:{story:"Pass `allowLiteral={false}` to restrict the selector to Secret/ConfigMap references and hide the **Value** toggle."}}},render:()=>e.jsx(r,{allowLiteral:!1,initial:{kind:"secret",name:"db",key:"host"}})},c={parameters:{docs:{description:{story:"Pass `sources` to offer the full range: Kubernetes Secret / ConfigMap keys, Helm release values (jsonpath key), a Service Account token (name only), a 1Password `op://vault/item/field` reference, and a static Value. The source picker is a searchable **Combobox**."}}},render:()=>e.jsx(r,{sources:u,initial:{kind:"helm",name:"mysql",key:"auth.rootPassword"}})},l={render:()=>e.jsx(r,{sources:u,initial:{kind:"serviceaccount",name:"deployer"}})},d={render:()=>e.jsx(r,{sources:u,initial:{kind:"onepassword",ref:"op://prod/postgres/password"}})};var h,k,v;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <Playground />
}`,...(v=(k=a.parameters)==null?void 0:k.docs)==null?void 0:v.source}}};var f,g,S;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "A chosen secret shows masked previews as key labels."
      }
    }
  },
  render: () => <Playground initial={{
    kind: "secret",
    name: "db",
    key: "host"
  }} />
}`,...(S=(g=o.parameters)==null?void 0:g.docs)==null?void 0:S.source}}};var w,P,b;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <Playground initial={{
    kind: "configmap",
    name: "app",
    key: ""
  }} />
}`,...(b=(P=n.parameters)==null?void 0:P.docs)==null?void 0:b.source}}};var x,C,A;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "The **Value** toggle (available by default) lets the operator type a static inline string instead of referencing a Secret/ConfigMap key. The emitted value is \`{kind:'value', value}\`."
      }
    }
  },
  render: () => <Playground initial={{
    kind: "value",
    value: "prod.example.com"
  }} />
}`,...(A=(C=t.parameters)==null?void 0:C.docs)==null?void 0:A.source}}};var j,E,L;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Pass \`allowLiteral={false}\` to restrict the selector to Secret/ConfigMap references and hide the **Value** toggle."
      }
    }
  },
  render: () => <Playground allowLiteral={false} initial={{
    kind: "secret",
    name: "db",
    key: "host"
  }} />
}`,...(L=(E=i.parameters)==null?void 0:E.docs)==null?void 0:L.source}}};var V,R,O;c.parameters={...c.parameters,docs:{...(V=c.parameters)==null?void 0:V.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Pass \`sources\` to offer the full range: Kubernetes Secret / ConfigMap keys, Helm release values (jsonpath key), a Service Account token (name only), a 1Password \`op://vault/item/field\` reference, and a static Value. The source picker is a searchable **Combobox**."
      }
    }
  },
  render: () => <Playground sources={ALL_SOURCES} initial={{
    kind: "helm",
    name: "mysql",
    key: "auth.rootPassword"
  }} />
}`,...(O=(R=c.parameters)==null?void 0:R.docs)==null?void 0:O.source}}};var _,M,K;l.parameters={...l.parameters,docs:{...(_=l.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <Playground sources={ALL_SOURCES} initial={{
    kind: "serviceaccount",
    name: "deployer"
  }} />
}`,...(K=(M=l.parameters)==null?void 0:M.docs)==null?void 0:K.source}}};var T,U,q;d.parameters={...d.parameters,docs:{...(T=d.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <Playground sources={ALL_SOURCES} initial={{
    kind: "onepassword",
    ref: "op://prod/postgres/password"
  }} />
}`,...(q=(U=d.parameters)==null?void 0:U.docs)==null?void 0:q.source}}};const ce=["Empty","WithPreview","ConfigMap","WithLiteralValue","ReferenceOnly","AllSources","ServiceAccount","OnePassword"];export{c as AllSources,n as ConfigMap,a as Empty,d as OnePassword,i as ReferenceOnly,l as ServiceAccount,t as WithLiteralValue,o as WithPreview,ce as __namedExportsOrder,ie as default};
