import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./utils-CEDXhWC6.js";import{n as a,t as o}from"./SecretKeySelector-7NEUiCY9.js";function s({initial:e,allowLiteral:t,sources:n,className:r=`w-[34rem]`}){let[a,s]=(0,c.useState)(e);return(0,l.jsxs)(`div`,{className:i(`space-y-3`,r),children:[(0,l.jsx)(o,{value:a,onChange:s,loadResources:p,loadKeyPreview:m,loadServiceAccounts:h,onePassword:g,allowLiteral:t,sources:n}),(0,l.jsxs)(`div`,{className:`rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs`,children:[`value=`,JSON.stringify(a)]})]})}var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{c=t(),r(),a(),l=n(),u={secret:[{name:`db`,keys:[`host`,`port`,`username`,`password`]},{name:`elastic`,keys:[`url`,`apiKey`]}],configmap:[{name:`app`,keys:[`demo.web_url`,`demo.cycle_url`]}],helm:[{name:`mysql`,keys:[`auth.rootPassword`,`primary.service.port`]}]},d=[{name:`default`},{name:`readonly`},{name:`deployer`}],f={db:[{key:`host`,value:`sql-••••.com`},{key:`port`,value:`1433`},{key:`username`,value:`sa`},{key:`password`,value:`••••`}],elastic:[{key:`url`,value:`http••••:9200`},{key:`apiKey`,value:`••••`}],app:[{key:`demo.web_url`,value:`http••••/PASJava`},{key:`demo.cycle_url`,value:`http••••/Cycle`}],mysql:[{key:`auth.rootPassword`,value:`••••`},{key:`primary.service.port`,value:`3306`}]},p=e=>Promise.resolve(u[e]),m=(e,t)=>new Promise(e=>setTimeout(()=>e(f[t]??[]),200)),h=()=>Promise.resolve(d),g={loadVaults:async()=>[{id:`vault-prod`,name:`prod`}],loadItems:async()=>[{id:`item-postgres`,name:`postgres`}],loadFields:async()=>[{id:`password`,label:`password`,reference:`op://prod/postgres/password`}]},_=[`secret`,`configmap`,`helm`,`serviceaccount`,`onepassword`,`value`],v={title:`Components/SecretKeySelector`,component:o,parameters:{docs:{description:{component:"Picks how a credential is sourced via a searchable **Combobox** and lowers the choice into a single reference the consumer persists. Supports Kubernetes Secret / ConfigMap keys (with a mid-masked preview of each key's value), Helm release values (jsonpath key), a Service Account token (name only), a 1Password `op://vault/item/field` reference, and a static inline **Value**. The offered sources are controlled by `sources` (default Secret/ConfigMap/Value; `allowLiteral={false}` drops Value). Fetches nothing itself — the consumer supplies `loadResources` / `loadKeyPreview` / `loadServiceAccounts` getters."}}}},y={render:()=>(0,l.jsx)(s,{})},b={parameters:{docs:{description:{story:`A chosen secret shows masked previews as key labels.`}}},render:()=>(0,l.jsx)(s,{initial:{kind:`secret`,name:`db`,key:`host`}})},x={render:()=>(0,l.jsx)(s,{initial:{kind:`configmap`,name:`app`,key:``}})},S={parameters:{docs:{description:{story:"The **Value** toggle (available by default) lets the operator type a static inline string instead of referencing a Secret/ConfigMap key. The emitted value is `{kind:'value', value}`."}}},render:()=>(0,l.jsx)(s,{initial:{kind:`value`,value:`prod.example.com`}})},C={parameters:{docs:{description:{story:"Pass `allowLiteral={false}` to restrict the selector to Secret/ConfigMap references and hide the **Value** toggle."}}},render:()=>(0,l.jsx)(s,{allowLiteral:!1,initial:{kind:`secret`,name:`db`,key:`host`}})},w={parameters:{docs:{description:{story:"Pass `sources` to offer the full range: Kubernetes Secret / ConfigMap keys, Helm release values (jsonpath key), a Service Account token (name only), a 1Password `op://vault/item/field` reference, and a static Value. The source picker is a searchable **Combobox**."}}},render:()=>(0,l.jsx)(s,{sources:_,initial:{kind:`helm`,name:`mysql`,key:`auth.rootPassword`}})},T={render:()=>(0,l.jsx)(s,{sources:_,initial:{kind:`serviceaccount`,name:`deployer`}})},E={render:()=>(0,l.jsx)(s,{sources:_,initial:{kind:`onepassword`,ref:`op://prod/postgres/password`}})},D={parameters:{docs:{description:{story:`Every field shrinks to fit its content while remaining bounded by the selector container. The source combobox collapses to an icon menu below 28rem.`}}},render:()=>(0,l.jsxs)(`div`,{className:`space-y-8`,children:[(0,l.jsxs)(`section`,{className:`space-y-2`,children:[(0,l.jsx)(`p`,{className:`text-sm font-medium`,children:`Wide reference — 34rem`}),(0,l.jsx)(`div`,{className:`w-[34rem] max-w-full`,"data-testid":`wide-reference`,children:(0,l.jsx)(s,{className:`w-full`,initial:{kind:`secret`,name:`db`,key:`password`}})})]}),(0,l.jsxs)(`section`,{className:`space-y-2`,children:[(0,l.jsx)(`p`,{className:`text-sm font-medium`,children:`Compact reference — 22rem`}),(0,l.jsx)(`div`,{className:`w-[22rem] max-w-full`,"data-testid":`compact-reference`,children:(0,l.jsx)(s,{className:`w-full`,initial:{kind:`secret`,name:`db`,key:`password`}})})]}),(0,l.jsxs)(`section`,{className:`space-y-2`,children:[(0,l.jsx)(`p`,{className:`text-sm font-medium`,children:`Compact literal — 22rem`}),(0,l.jsx)(`div`,{className:`w-[22rem] max-w-full`,"data-testid":`compact-literal`,children:(0,l.jsx)(s,{className:`w-full`,initial:{kind:`value`,value:`TENANT_X_SERVICE_QA`}})})]})]})},O=[`Empty`,`WithPreview`,`ConfigMap`,`WithLiteralValue`,`ReferenceOnly`,`AllSources`,`ServiceAccount`,`OnePassword`,`ResponsiveWidths`],y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => <Playground />
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <Playground initial={{
    kind: "configmap",
    name: "app",
    key: ""
  }} />
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
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
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
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
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
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
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <Playground sources={ALL_SOURCES} initial={{
    kind: "serviceaccount",
    name: "deployer"
  }} />
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  render: () => <Playground sources={ALL_SOURCES} initial={{
    kind: "onepassword",
    ref: "op://prod/postgres/password"
  }} />
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
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
}`,...D.parameters?.docs?.source}}}})))()}k();export{w as AllSources,x as ConfigMap,y as Empty,E as OnePassword,C as ReferenceOnly,D as ResponsiveWidths,T as ServiceAccount,S as WithLiteralValue,b as WithPreview,O as __namedExportsOrder,v as default};