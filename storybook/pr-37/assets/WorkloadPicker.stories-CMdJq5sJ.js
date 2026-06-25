import{j as t,r as d}from"./iframe-BO3XiECZ.js";import{c as ee}from"./utils-BLSKlp9E.js";import{C as se}from"./Combobox-BqRY8y8h.js";import{c as oe,d as ae,e as re,f as ne}from"./index-Ch4PikV3.js";import"./preload-helper-B2wK-Kjy.js";import"./index-D_v1HQsH.js";import"./index-OHfE5VLg.js";import"./Icon-GruNqjyl.js";import"./json-schema-form-size-DYVq0lph.js";import"./modalStack-yDe9UqJq.js";import"./zIndex-CigQ76av.js";import"./UiClose-C-MNSUX4.js";import"./UiChevronDown-CmLEZyD7.js";import"./UiCheck-ODqHhldT.js";const K={service:{label:"Service",Icon:ne},ingress:{label:"Ingress",Icon:re},deployment:{label:"Deployment",Icon:ae},statefulset:{label:"StatefulSet",Icon:oe}},te=["service","ingress","deployment","statefulset"];function H(e,s){var r;return e==="ingress"?(r=s.hosts)==null?void 0:r[0]:void 0}function J(e,s){return H(e,s)??s.name}const ie=new Set(["service","ingress","deployment","statefulset"]);function U(e,s,r){const o=J(s,r);return e?`${e}/${s}/${o}`:`${s}/${o}`}function w(e){const s=e.split("/"),r=s.at(-1),o=s.at(-2);if(r!=null&&o!=null&&ie.has(o)){const n=s.slice(0,-2).join("/"),a={kind:o,name:r};return n&&(a.namespace=n),a}return{name:e}}function le(e,s,r){const o=new Set,n=new Set;for(const a of r)for(const i of s[a]??[])o.add(U(e,a,i)),n.add(J(a,i));return{keys:o,names:n}}function de(e,s){return(s?w(s).kind:void 0)??e[0]??"service"}function ce(e,s,r,o){const n=[];for(const a of r){const i=K[a],W=i.Icon;for(const l of s[a]??[]){const u=H(a,l);n.push({value:U(e,a,l),label:u?`${u} (${l.name})`:l.name,group:i.label,icon:t.jsx(W,{className:"h-4 w-4"})})}}if(o&&!n.some(a=>a.value===o)){const a=w(o),i=K[a.kind??r[0]??"service"].Icon;return[{value:o,label:a.name,icon:t.jsx(i,{className:"h-4 w-4"})},...n]}return n}try{w.displayName="parseWorkloadKey",w.__docgenInfo={description:"",displayName:"parseWorkloadKey",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/components/workload-picker-utils.tsx",methods:[],props:{},tags:{}}}catch{}function x({value:e,onChange:s,loadWorkloads:r,namespace:o,kinds:n=te,strict:a=!1,placeholder:i="Select workload / service…",className:W}){const[l,u]=d.useState({}),[b,P]=d.useState(!1),X=n.join(",");d.useEffect(()=>{let p=!1;return P(!0),r(n).then(N=>{p||u(N)}).finally(()=>{p||P(!1)}),()=>{p=!0}},[r,X]);const z=d.useMemo(()=>ce(o,l,n,e),[o,l,n,e]),Q=d.useMemo(()=>{if(!a||!e||b)return!1;const{keys:p,names:N}=le(o,l,n);return!p.has(e)&&!N.has(e)},[a,e,b,o,l,n]),Y=de(n,e),S=K[Y],Z=S.Icon;return t.jsxs("div",{className:ee("flex items-center gap-2",W),children:[t.jsx(Z,{className:"h-4 w-4 shrink-0 text-muted-foreground",title:S.label,"aria-label":S.label}),t.jsx("div",{className:"min-w-0 flex-1",children:t.jsx(se,{options:z,value:e,onChange:s,allowCustomValue:!0,loading:b,invalid:Q,placeholder:i})})]})}try{x.displayName="WorkloadPicker",x.__docgenInfo={description:"",displayName:"WorkloadPicker",filePath:"/home/runner/work/clicky-ui/clicky-ui/packages/ui/src/components/WorkloadPicker.tsx",methods:[],props:{value:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/WorkloadPicker.tsx",name:"TypeLiteral"}],description:"Controlled selected value — a `[namespace/]kind/name` key (see\n{@link workloadKey } / {@link parseWorkloadKey }).",name:"value",required:!0,tags:{},type:{name:"string"}},onChange:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/WorkloadPicker.tsx",name:"TypeLiteral"}],description:'Called with the chosen `[namespace/]kind/name` key (or "" when cleared).',name:"onChange",required:!0,tags:{},type:{name:"(value: string) => void"}},loadWorkloads:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/WorkloadPicker.tsx",name:"TypeLiteral"}],description:`Async getter the component calls to load the requested kinds' workloads.
Returns a map keyed by kind. The consumer owns fetching/caching.`,name:"loadWorkloads",required:!0,tags:{},type:{name:"(kinds: WorkloadKind[]) => Promise<Record<WorkloadKind, WorkloadResource[]>>"}},namespace:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/WorkloadPicker.tsx",name:"TypeLiteral"}],description:"Namespace the workloads live in. When set it prefixes the emitted key\n(`namespace/kind/name`), so values stay distinct across namespaces.",name:"namespace",required:!1,tags:{},type:{name:"string"}},kinds:{defaultValue:{value:`[
  "service",
  "ingress",
  "deployment",
  "statefulset",
]`},declarations:[{fileName:"clicky-ui/packages/ui/src/components/WorkloadPicker.tsx",name:"TypeLiteral"}],description:"Kinds to offer, in display order. Defaults to all four.",name:"kinds",required:!1,tags:{},type:{name:"WorkloadKind[]"}},strict:{defaultValue:{value:"false"},declarations:[{fileName:"clicky-ui/packages/ui/src/components/WorkloadPicker.tsx",name:"TypeLiteral"}],description:`When true, a non-empty value that does not match any loaded workload (once
loading settles) is flagged invalid — the picked workload doesn't exist in
the namespace. The value is still shown (pinned) so the user can see and
fix it; freeform entry is not rejected, only marked.`,name:"strict",required:!1,tags:{},type:{name:"boolean"}},placeholder:{defaultValue:{value:"Select workload / service…"},declarations:[{fileName:"clicky-ui/packages/ui/src/components/WorkloadPicker.tsx",name:"TypeLiteral"}],description:"",name:"placeholder",required:!1,tags:{},type:{name:"string"}},className:{defaultValue:null,declarations:[{fileName:"clicky-ui/packages/ui/src/components/WorkloadPicker.tsx",name:"TypeLiteral"}],description:"",name:"className",required:!1,tags:{},type:{name:"string"}}},tags:{}}}catch{}const me={service:[{name:"demo-svc"},{name:"activemq-svc"}],ingress:[{name:"demo-ing",hosts:["demo.example.com"]}],deployment:[{name:"demo-web"},{name:"palette-web"}],statefulset:[{name:"demo-cycle"},{name:"sqlserver"}]};function c(e=300,s=me){return r=>new Promise(o=>setTimeout(()=>{const n={};for(const a of r)n[a]=s[a]??[];o(n)},e))}function m({initial:e="",...s}){const[r,o]=d.useState(e);return t.jsxs("div",{className:"w-80 space-y-3",children:[t.jsx(x,{value:r,onChange:o,...s}),t.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(r)]})]})}const Ke={title:"Components/WorkloadPicker",component:x,parameters:{docs:{description:{component:"Selects a Kubernetes workload (Service / Ingress / Deployment / StatefulSet) for an endpoint. Options from every kind are merged into one Combobox, grouped by kind via Combobox group headers and labelled with the kind's icon. Fetches nothing itself — the consumer supplies the async `loadWorkloads` getter. An ingress emits its first host (the routable address) as the value, labelled with the ingress name for context; every other kind emits its name."}}}},k={render:()=>t.jsx(m,{loadWorkloads:c()})},f={parameters:{docs:{description:{story:"All four kinds load, producing four group headers (Service / Ingress / Deployment / StatefulSet) in the dropdown. Each option's value is a `kind/name` key (an ingress uses `ingress/<host>`), shown in the value panel; the dropdown label stays the human name."}}},render:()=>t.jsx(m,{initial:"service/demo-svc",loadWorkloads:c(0)})},y={parameters:{docs:{description:{story:"With a `namespace`, the emitted value is fully qualified as `namespace/kind/name` — pick a workload and watch the value panel."}}},render:()=>t.jsx(m,{namespace:"demo",loadWorkloads:c(0)})},h={parameters:{docs:{description:{story:"A slow loader keeps the spinner visible while options resolve."}}},render:()=>t.jsx(m,{loadWorkloads:c(1e5)})},g={parameters:{docs:{description:{story:"Restricting `kinds` to a subset offers a single group (no headers for absent kinds)."}}},render:()=>t.jsx(m,{loadWorkloads:c(0),kinds:["service"]})},v={parameters:{docs:{description:{story:"When the loader returns no workloads, the dropdown shows the Combobox's “No results” state."}}},render:()=>t.jsx(m,{loadWorkloads:c(0,{})})};var L,_,j;k.parameters={...k.parameters,docs:{...(L=k.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => <Playground loadWorkloads={makeLoader()} />
}`,...(j=(_=k.parameters)==null?void 0:_.docs)==null?void 0:j.source}}};var I,q,C;f.parameters={...f.parameters,docs:{...(I=f.parameters)==null?void 0:I.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "All four kinds load, producing four group headers (Service / Ingress / Deployment / StatefulSet) in the dropdown. Each option's value is a \`kind/name\` key (an ingress uses \`ingress/<host>\`), shown in the value panel; the dropdown label stays the human name."
      }
    }
  },
  render: () => <Playground initial="service/demo-svc" loadWorkloads={makeLoader(0)} />
}`,...(C=(q=f.parameters)==null?void 0:q.docs)==null?void 0:C.source}}};var T,D,O;y.parameters={...y.parameters,docs:{...(T=y.parameters)==null?void 0:T.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "With a \`namespace\`, the emitted value is fully qualified as \`namespace/kind/name\` — pick a workload and watch the value panel."
      }
    }
  },
  render: () => <Playground namespace="demo" loadWorkloads={makeLoader(0)} />
}`,...(O=(D=y.parameters)==null?void 0:D.docs)==null?void 0:O.source}}};var V,A,E;h.parameters={...h.parameters,docs:{...(V=h.parameters)==null?void 0:V.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "A slow loader keeps the spinner visible while options resolve."
      }
    }
  },
  render: () => <Playground loadWorkloads={makeLoader(100000)} />
}`,...(E=(A=h.parameters)==null?void 0:A.docs)==null?void 0:E.source}}};var R,$,M;g.parameters={...g.parameters,docs:{...(R=g.parameters)==null?void 0:R.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Restricting \`kinds\` to a subset offers a single group (no headers for absent kinds)."
      }
    }
  },
  render: () => <Playground loadWorkloads={makeLoader(0)} kinds={["service"]} />
}`,...(M=($=g.parameters)==null?void 0:$.docs)==null?void 0:M.source}}};var F,G,B;v.parameters={...v.parameters,docs:{...(F=v.parameters)==null?void 0:F.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "When the loader returns no workloads, the dropdown shows the Combobox's “No results” state."
      }
    }
  },
  render: () => <Playground loadWorkloads={makeLoader(0, {})} />
}`,...(B=(G=v.parameters)==null?void 0:G.docs)==null?void 0:B.source}}};const Pe=["Default","Grouped","Namespaced","Loading","ServicesOnly","Empty"];export{k as Default,v as Empty,f as Grouped,h as Loading,y as Namespaced,g as ServicesOnly,Pe as __namedExportsOrder,Ke as default};
