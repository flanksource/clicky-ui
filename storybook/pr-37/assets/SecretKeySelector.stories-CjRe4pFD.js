import{r as i,j as t}from"./iframe-DQ9XXhpn.js";import{K as ne,a as oe}from"./index-BacHBBXq.js";import{c as C}from"./utils-BLSKlp9E.js";import{C as j}from"./Combobox-CzMrWpzE.js";import{U as ie}from"./UiEdit-DNI5Yo3u.js";import"./preload-helper-B2wK-Kjy.js";import"./index-BDYInp2-.js";import"./index-C6GOQB4V.js";import"./Icon-OSD6-FvK.js";import"./json-schema-form-size-DYVq0lph.js";import"./modalStack-BT1YNoec.js";import"./zIndex-CigQ76av.js";import"./UiClose-D-7AUFZ5.js";import"./UiChevronDown-B2K9Ka4v.js";import"./UiCheck-BSaE0h4R.js";function b({value:a,onChange:n,loadResources:s,loadKeyPreview:l,allowLiteral:m=!0,strict:r=!1,className:G}){const w=(a==null?void 0:a.kind)??"secret",f=w==="value",c=f?"secret":w,o=a&&a.kind!=="value"?a.name:"",u=a&&a.kind!=="value"?a.key:"",z=a&&a.kind==="value"?a.value:"",[g,D]=i.useState([]),[K,N]=i.useState(!1),[P,L]=i.useState([]),[H,V]=i.useState(!1);i.useEffect(()=>{if(f)return;let e=!1;return N(!0),s(c).then(p=>!e&&D(p)).finally(()=>!e&&N(!1)),()=>{e=!0}},[s,c,f]),i.useEffect(()=>{if(!o){L([]);return}let e=!1;return V(!0),l(c,o).then(p=>!e&&L(p)).catch(()=>!e&&L([])).finally(()=>!e&&V(!1)),()=>{e=!0}},[l,c,o]);const Q=i.useMemo(()=>g.map(e=>({value:e.name,label:e.name})),[g]),d=i.useMemo(()=>g.find(e=>e.name===o),[g,o]),X=i.useMemo(()=>de((d==null?void 0:d.keys)??[],P,u),[d,u,P]),Y=r&&!!o&&!K&&!d,Z=r&&!!u&&!!d&&!K&&!(d.keys??[]).includes(u),ee=e=>n(e==="value"?{kind:"value",value:""}:{kind:e,name:"",key:""}),ae=e=>n(e?{kind:c,name:e,key:u}:void 0),te=e=>o?n({kind:c,name:o,key:e}):void 0,re=e=>n({kind:"value",value:e}),se=m?["secret","configmap","value"]:["secret","configmap"];return t.jsxs("div",{className:C("flex items-center gap-2",G),children:[t.jsx("div",{className:"flex shrink-0 overflow-hidden rounded border border-border text-xs",children:se.map(e=>{const p=le[e];return t.jsxs("button",{type:"button",onClick:()=>ee(e),className:C("flex items-center gap-1 whitespace-nowrap px-2 py-1",w===e?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-accent"),children:[t.jsx(p,{className:"h-3.5 w-3.5"}),ce[e]]},e)})}),f?t.jsx("input",{type:"text",value:z,onChange:e=>re(e.target.value),placeholder:"Static value…",className:C("h-control-h min-w-0 flex-1 rounded border border-input bg-background px-control-px text-sm","outline-none focus-visible:ring-2 focus-visible:ring-ring")}):t.jsxs(t.Fragment,{children:[t.jsx("div",{className:"w-44 shrink-0",children:t.jsx(j,{options:Q,value:o,onChange:ae,allowCustomValue:!0,loading:K,invalid:Y,placeholder:`Select ${c}…`})}),t.jsx("div",{className:"min-w-0 flex-1",children:t.jsx(j,{options:X,value:u,onChange:te,allowCustomValue:!0,loading:H,invalid:Z,placeholder:o?"Key…":"—"})})]})]})}const le={secret:oe,configmap:ne,value:ie},ce={secret:"Secret",configmap:"ConfigMap",value:"Value"};function de(a,n,s){const l=new Map(n.map(r=>[r.key,r.value])),m=a.map(r=>({value:r,label:l.has(r)?`${r} — ${l.get(r)}`:r}));return s&&!m.some(r=>r.value===s)?[{value:s,label:s},...m]:m}try{b.displayName="SecretKeySelector",b.__docgenInfo={description:"",displayName:"SecretKeySelector",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/components/SecretKeySelector.tsx",methods:[],props:{value:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/SecretKeySelector.tsx",name:"TypeLiteral"}],description:"",name:"value",required:!0,tags:{},type:{name:"SecretKeyValue | undefined"}},onChange:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/SecretKeySelector.tsx",name:"TypeLiteral"}],description:"",name:"onChange",required:!0,tags:{},type:{name:"(next: SecretKeyValue | undefined) => void"}},loadResources:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/SecretKeySelector.tsx",name:"TypeLiteral"}],description:"Loads the named kind's resources (name + data key names).",name:"loadResources",required:!0,tags:{},type:{name:"(kind: SecretKind) => Promise<SecretResource[]>"}},loadKeyPreview:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/SecretKeySelector.tsx",name:"TypeLiteral"}],description:"Loads mid-masked previews for the named resource's keys.",name:"loadKeyPreview",required:!0,tags:{},type:{name:"(kind: SecretKind, name: string) => Promise<KeyPreview[]>"}},allowLiteral:{defaultValue:{value:"true"},declarations:[{fileName:"clicky-ui/packages/ui/src/components/SecretKeySelector.tsx",name:"TypeLiteral"}],description:'Offer a third "Value" toggle for typing a static inline literal. Enabled by\ndefault; pass `false` to restrict the selector to Secret/ConfigMap\nreferences only.',name:"allowLiteral",required:!1,tags:{},type:{name:"boolean"}},strict:{defaultValue:{value:"false"},declarations:[{fileName:"clicky-ui/packages/ui/src/components/SecretKeySelector.tsx",name:"TypeLiteral"}],description:`When true, a chosen secret/configmap name absent from the loaded resources,
or a key absent from the chosen resource's keys, is flagged invalid (once
the respective load settles). The reference doesn't exist in the namespace.
The literal "Value" mode is never strict-flagged.`,name:"strict",required:!1,tags:{},type:{name:"boolean"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/SecretKeySelector.tsx",name:"TypeLiteral"}],description:"",name:"className",required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const ue={secret:[{name:"db",keys:["host","port","username","password"]},{name:"elastic",keys:["url","apiKey"]}],configmap:[{name:"app",keys:["demo.web_url","demo.cycle_url"]}]},me={db:[{key:"host",value:"sql-••••.com"},{key:"port",value:"1433"},{key:"username",value:"sa"},{key:"password",value:"••••"}],elastic:[{key:"url",value:"http••••:9200"},{key:"apiKey",value:"••••"}],app:[{key:"demo.web_url",value:"http••••/PASJava"},{key:"demo.cycle_url",value:"http••••/Cycle"}]},pe=a=>Promise.resolve(ue[a]),ye=(a,n)=>new Promise(s=>setTimeout(()=>s(me[n]??[]),200)),je={title:"Components/SecretKeySelector",component:b,parameters:{docs:{description:{component:"Picks a Secret or ConfigMap and one of its keys, showing a mid-masked preview of each key's value so the operator can tell which key holds the host vs the db vs a password. A third **Value** toggle (on by default; opt out with `allowLiteral={false}`) lets the operator type a static inline literal instead. Fetches nothing itself — the consumer supplies `loadResources` / `loadKeyPreview` getters — and emits a `{kind,name,key}` reference or `{kind:'value', value}` literal."}}}};function y({initial:a,allowLiteral:n}){const[s,l]=i.useState(a);return t.jsxs("div",{className:"w-[34rem] space-y-3",children:[t.jsx(b,{value:s,onChange:l,loadResources:pe,loadKeyPreview:ye,allowLiteral:n}),t.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(s)]})]})}const h={render:()=>t.jsx(y,{})},k={parameters:{docs:{description:{story:"A chosen secret shows masked previews as key labels."}}},render:()=>t.jsx(y,{initial:{kind:"secret",name:"db",key:"host"}})},v={render:()=>t.jsx(y,{initial:{kind:"configmap",name:"app",key:""}})},S={parameters:{docs:{description:{story:"The **Value** toggle (available by default) lets the operator type a static inline string instead of referencing a Secret/ConfigMap key. The emitted value is `{kind:'value', value}`."}}},render:()=>t.jsx(y,{initial:{kind:"value",value:"prod.example.com"}})},x={parameters:{docs:{description:{story:"Pass `allowLiteral={false}` to restrict the selector to Secret/ConfigMap references and hide the **Value** toggle."}}},render:()=>t.jsx(y,{allowLiteral:!1,initial:{kind:"secret",name:"db",key:"host"}})};var _,E,T;h.parameters={...h.parameters,docs:{...(_=h.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => <Playground />
}`,...(T=(E=h.parameters)==null?void 0:E.docs)==null?void 0:T.source}}};var M,R,O;k.parameters={...k.parameters,docs:{...(M=k.parameters)==null?void 0:M.docs,source:{originalSource:`{
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
}`,...(O=(R=k.parameters)==null?void 0:R.docs)==null?void 0:O.source}}};var q,W,A;v.parameters={...v.parameters,docs:{...(q=v.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => <Playground initial={{
    kind: "configmap",
    name: "app",
    key: ""
  }} />
}`,...(A=(W=v.parameters)==null?void 0:W.docs)==null?void 0:A.source}}};var I,U,$;S.parameters={...S.parameters,docs:{...(I=S.parameters)==null?void 0:I.docs,source:{originalSource:`{
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
}`,...($=(U=S.parameters)==null?void 0:U.docs)==null?void 0:$.source}}};var F,J,B;x.parameters={...x.parameters,docs:{...(F=x.parameters)==null?void 0:F.docs,source:{originalSource:`{
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
}`,...(B=(J=x.parameters)==null?void 0:J.docs)==null?void 0:B.source}}};const _e=["Empty","WithPreview","ConfigMap","WithLiteralValue","ReferenceOnly"];export{v as ConfigMap,h as Empty,x as ReferenceOnly,S as WithLiteralValue,k as WithPreview,_e as __namedExportsOrder,je as default};
