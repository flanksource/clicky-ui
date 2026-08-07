import{j as e,r as F}from"./iframe-BMFBCv_6.js";import{c as z}from"./utils-CR52uffu.js";import{S as J}from"./SecretKeySelector-D4ey7cjL.js";import"./preload-helper-XHXHPdWU.js";import"./index-Cf-LVBtW.js";import"./Combobox-D4JxQ_Ex.js";import"./Icon-rDmXslRI.js";import"./modalStack-vzTQsCJ3.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-DYVq0lph.js";import"./index-Dbcmk1Ba.js";import"./index-C0LRYh99.js";import"./FilterPill-Duw4fxQQ.js";import"./icon-menu-picker-CA9q0Pot.js";import"./floating-ui.react-iWwRdKWF.js";import"./button-DdAX4yWv.js";import"./index-0zBpNI7D.js";import"./loading-6hDWTPbr.js";import"./IconButton-c1QHMig1.js";const B={secret:[{name:"db",keys:["host","port","username","password"]},{name:"elastic",keys:["url","apiKey"]}],configmap:[{name:"app",keys:["demo.web_url","demo.cycle_url"]}],helm:[{name:"mysql",keys:["auth.rootPassword","primary.service.port"]}]},D=[{name:"default"},{name:"readonly"},{name:"deployer"}],G={db:[{key:"host",value:"sql-••••.com"},{key:"port",value:"1433"},{key:"username",value:"sa"},{key:"password",value:"••••"}],elastic:[{key:"url",value:"http••••:9200"},{key:"apiKey",value:"••••"}],app:[{key:"demo.web_url",value:"http••••/PASJava"},{key:"demo.cycle_url",value:"http••••/Cycle"}],mysql:[{key:"auth.rootPassword",value:"••••"},{key:"primary.service.port",value:"3306"}]},Y=r=>Promise.resolve(B[r]),Z=(r,p)=>new Promise(u=>setTimeout(()=>u(G[p]??[]),200)),$=()=>Promise.resolve(D),y=["secret","configmap","helm","serviceaccount","onepassword","value"],we={title:"Components/SecretKeySelector",component:J,parameters:{docs:{description:{component:"Picks how a credential is sourced via a searchable **Combobox** and lowers the choice into a single reference the consumer persists. Supports Kubernetes Secret / ConfigMap keys (with a mid-masked preview of each key's value), Helm release values (jsonpath key), a Service Account token (name only), a 1Password `op://vault/item/field` reference, and a static inline **Value**. The offered sources are controlled by `sources` (default Secret/ConfigMap/Value; `allowLiteral={false}` drops Value). Fetches nothing itself — the consumer supplies `loadResources` / `loadKeyPreview` / `loadServiceAccounts` getters."}}}};function s({initial:r,allowLiteral:p,sources:u,className:Q="w-[34rem]"}){const[f,X]=F.useState(r);return e.jsxs("div",{className:z("space-y-3",Q),children:[e.jsx(J,{value:f,onChange:X,loadResources:Y,loadKeyPreview:Z,loadServiceAccounts:$,allowLiteral:p,sources:u}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(f)]})]})}const a={render:()=>e.jsx(s,{})},n={parameters:{docs:{description:{story:"A chosen secret shows masked previews as key labels."}}},render:()=>e.jsx(s,{initial:{kind:"secret",name:"db",key:"host"}})},o={render:()=>e.jsx(s,{initial:{kind:"configmap",name:"app",key:""}})},t={parameters:{docs:{description:{story:"The **Value** toggle (available by default) lets the operator type a static inline string instead of referencing a Secret/ConfigMap key. The emitted value is `{kind:'value', value}`."}}},render:()=>e.jsx(s,{initial:{kind:"value",value:"prod.example.com"}})},i={parameters:{docs:{description:{story:"Pass `allowLiteral={false}` to restrict the selector to Secret/ConfigMap references and hide the **Value** toggle."}}},render:()=>e.jsx(s,{allowLiteral:!1,initial:{kind:"secret",name:"db",key:"host"}})},c={parameters:{docs:{description:{story:"Pass `sources` to offer the full range: Kubernetes Secret / ConfigMap keys, Helm release values (jsonpath key), a Service Account token (name only), a 1Password `op://vault/item/field` reference, and a static Value. The source picker is a searchable **Combobox**."}}},render:()=>e.jsx(s,{sources:y,initial:{kind:"helm",name:"mysql",key:"auth.rootPassword"}})},l={render:()=>e.jsx(s,{sources:y,initial:{kind:"serviceaccount",name:"deployer"}})},d={render:()=>e.jsx(s,{sources:y,initial:{kind:"onepassword",ref:"op://prod/postgres/password"}})},m={parameters:{docs:{description:{story:"Every field shrinks to fit its content while remaining bounded by the selector container. The source combobox collapses to an icon menu below 28rem."}}},render:()=>e.jsxs("div",{className:"space-y-8",children:[e.jsxs("section",{className:"space-y-2",children:[e.jsx("p",{className:"text-sm font-medium",children:"Wide reference — 34rem"}),e.jsx("div",{className:"w-[34rem] max-w-full","data-testid":"wide-reference",children:e.jsx(s,{className:"w-full",initial:{kind:"secret",name:"db",key:"password"}})})]}),e.jsxs("section",{className:"space-y-2",children:[e.jsx("p",{className:"text-sm font-medium",children:"Compact reference — 22rem"}),e.jsx("div",{className:"w-[22rem] max-w-full","data-testid":"compact-reference",children:e.jsx(s,{className:"w-full",initial:{kind:"secret",name:"db",key:"password"}})})]}),e.jsxs("section",{className:"space-y-2",children:[e.jsx("p",{className:"text-sm font-medium",children:"Compact literal — 22rem"}),e.jsx("div",{className:"w-[22rem] max-w-full","data-testid":"compact-literal",children:e.jsx(s,{className:"w-full",initial:{kind:"value",value:"TENANT_X_SERVICE_QA"}})})]})]})};var h,v,k;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <Playground />
}`,...(k=(v=a.parameters)==null?void 0:v.docs)==null?void 0:k.source}}};var w,g,x;n.parameters={...n.parameters,docs:{...(w=n.parameters)==null?void 0:w.docs,source:{originalSource:`{
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
}`,...(x=(g=n.parameters)==null?void 0:g.docs)==null?void 0:x.source}}};var S,b,P;o.parameters={...o.parameters,docs:{...(S=o.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => <Playground initial={{
    kind: "configmap",
    name: "app",
    key: ""
  }} />
}`,...(P=(b=o.parameters)==null?void 0:b.docs)==null?void 0:P.source}}};var N,C,j;t.parameters={...t.parameters,docs:{...(N=t.parameters)==null?void 0:N.docs,source:{originalSource:`{
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
}`,...(j=(C=t.parameters)==null?void 0:C.docs)==null?void 0:j.source}}};var E,A,_;i.parameters={...i.parameters,docs:{...(E=i.parameters)==null?void 0:E.docs,source:{originalSource:`{
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
}`,...(_=(A=i.parameters)==null?void 0:A.docs)==null?void 0:_.source}}};var R,V,L;c.parameters={...c.parameters,docs:{...(R=c.parameters)==null?void 0:R.docs,source:{originalSource:`{
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
}`,...(L=(V=c.parameters)==null?void 0:V.docs)==null?void 0:L.source}}};var T,O,M;l.parameters={...l.parameters,docs:{...(T=l.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: () => <Playground sources={ALL_SOURCES} initial={{
    kind: "serviceaccount",
    name: "deployer"
  }} />
}`,...(M=(O=l.parameters)==null?void 0:O.docs)==null?void 0:M.source}}};var K,W,U;d.parameters={...d.parameters,docs:{...(K=d.parameters)==null?void 0:K.docs,source:{originalSource:`{
  render: () => <Playground sources={ALL_SOURCES} initial={{
    kind: "onepassword",
    ref: "op://prod/postgres/password"
  }} />
}`,...(U=(W=d.parameters)==null?void 0:W.docs)==null?void 0:U.source}}};var q,I,H;m.parameters={...m.parameters,docs:{...(q=m.parameters)==null?void 0:q.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Every field shrinks to fit its content while remaining bounded by the selector container. The source combobox collapses to an icon menu below 28rem."
      }
    }
  },
  render: () => <div className="space-y-8">
      <section className="space-y-2">
        <p className="text-sm font-medium">Wide reference — 34rem</p>
        <div className="w-[34rem] max-w-full" data-testid="wide-reference">
          <Playground className="w-full" initial={{
          kind: "secret",
          name: "db",
          key: "password"
        }} />
        </div>
      </section>
      <section className="space-y-2">
        <p className="text-sm font-medium">Compact reference — 22rem</p>
        <div className="w-[22rem] max-w-full" data-testid="compact-reference">
          <Playground className="w-full" initial={{
          kind: "secret",
          name: "db",
          key: "password"
        }} />
        </div>
      </section>
      <section className="space-y-2">
        <p className="text-sm font-medium">Compact literal — 22rem</p>
        <div className="w-[22rem] max-w-full" data-testid="compact-literal">
          <Playground className="w-full" initial={{
          kind: "value",
          value: "TENANT_X_SERVICE_QA"
        }} />
        </div>
      </section>
    </div>
}`,...(H=(I=m.parameters)==null?void 0:I.docs)==null?void 0:H.source}}};const ge=["Empty","WithPreview","ConfigMap","WithLiteralValue","ReferenceOnly","AllSources","ServiceAccount","OnePassword","ResponsiveWidths"];export{c as AllSources,o as ConfigMap,a as Empty,d as OnePassword,i as ReferenceOnly,m as ResponsiveWidths,l as ServiceAccount,t as WithLiteralValue,n as WithPreview,ge as __namedExportsOrder,we as default};
