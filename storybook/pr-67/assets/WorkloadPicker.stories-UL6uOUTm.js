import{j as e,r as G}from"./iframe-3AGyK8hb.js";import{W as F}from"./WorkloadPicker-hkIkikYM.js";import"./preload-helper-BZ6gUoWu.js";import"./utils-DW-IJACk.js";import"./Combobox-DkXUqrJM.js";import"./Icon-CAsTbVJm.js";import"./modalStack-BmabxbPz.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-BOG8GCjc.js";import"./index-DRDyDoJZ.js";import"./index-WSCvljIm.js";import"./NamespacePicker-BKrOAaI2.js";import"./index-qZ6dogUk.js";const T={service:[{name:"demo-svc"},{name:"activemq-svc"}],ingress:[{name:"demo-ing",hosts:["demo.example.com"]}],pod:[{name:"demo-api-abc12"}],deployment:[{name:"demo-web"},{name:"palette-web"}],statefulset:[{name:"demo-cycle"},{name:"sqlserver"}],daemonset:[{name:"node-agent"}]};function o(l=300,p=T){return r=>new Promise(u=>setTimeout(()=>{const h={};for(const k of r)h[k]=p[k]??[];u(h)},l))}function s({initial:l="",...p}){const[r,u]=G.useState(l);return e.jsxs("div",{className:"w-80 space-y-3",children:[e.jsx(F,{value:r,onChange:u,...p}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(r)]})]})}const ee={title:"Components/WorkloadPicker",component:F,parameters:{docs:{description:{component:"Selects a Kubernetes workload for an endpoint or query. Options from every requested kind are merged into one Combobox, grouped by kind via Combobox group headers and labelled with the kind's icon. Fetches nothing itself — the consumer supplies the async `loadWorkloads` getter. An ingress emits its first host (the routable address) as the value, labelled with the ingress name for context; every other kind emits its name."}}}},a={render:()=>e.jsx(s,{loadWorkloads:o()})},n={parameters:{docs:{description:{story:"All four kinds load, producing four group headers (Service / Ingress / Deployment / StatefulSet) in the dropdown. Each option's value is a `kind/name` key (an ingress uses `ingress/<host>`), shown in the value panel; the dropdown label stays the human name."}}},render:()=>e.jsx(s,{initial:"service/demo-svc",loadWorkloads:o(0)})},t={parameters:{docs:{description:{story:"With a `namespace`, the emitted value is fully qualified as `namespace/kind/name` — pick a workload and watch the value panel."}}},render:()=>e.jsx(s,{namespace:"demo",loadWorkloads:o(0)})},d={parameters:{docs:{description:{story:"Opt-in namespace selection scopes workload discovery and emits a fully-qualified namespace/kind/name value."}}},render:()=>e.jsx(s,{namespace:"demo",loadWorkloads:o(0),allowNamespaceSelection:!0,loadNamespaces:()=>Promise.resolve(["demo","platform","search"])})},i={parameters:{docs:{description:{story:"A slow loader keeps the spinner visible while options resolve."}}},render:()=>e.jsx(s,{loadWorkloads:o(1e5)})},c={parameters:{docs:{description:{story:"Restricting `kinds` to a subset offers a single group (no headers for absent kinds)."}}},render:()=>e.jsx(s,{loadWorkloads:o(0),kinds:["service"]})},m={parameters:{docs:{description:{story:"When the loader returns no workloads, the dropdown shows the Combobox's “No results” state."}}},render:()=>e.jsx(s,{loadWorkloads:o(0,{})})};var g,y,v;a.parameters={...a.parameters,docs:{...(g=a.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => <Playground loadWorkloads={makeLoader()} />
}`,...(v=(y=a.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};var f,w,b;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "All four kinds load, producing four group headers (Service / Ingress / Deployment / StatefulSet) in the dropdown. Each option's value is a \`kind/name\` key (an ingress uses \`ingress/<host>\`), shown in the value panel; the dropdown label stays the human name."
      }
    }
  },
  render: () => <Playground initial="service/demo-svc" loadWorkloads={makeLoader(0)} />
}`,...(b=(w=n.parameters)==null?void 0:w.docs)==null?void 0:b.source}}};var x,S,W;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "With a \`namespace\`, the emitted value is fully qualified as \`namespace/kind/name\` — pick a workload and watch the value panel."
      }
    }
  },
  render: () => <Playground namespace="demo" loadWorkloads={makeLoader(0)} />
}`,...(W=(S=t.parameters)==null?void 0:S.docs)==null?void 0:W.source}}};var N,P,j;d.parameters={...d.parameters,docs:{...(N=d.parameters)==null?void 0:N.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Opt-in namespace selection scopes workload discovery and emits a fully-qualified namespace/kind/name value."
      }
    }
  },
  render: () => <Playground namespace="demo" loadWorkloads={makeLoader(0)} allowNamespaceSelection loadNamespaces={() => Promise.resolve(["demo", "platform", "search"])} />
}`,...(j=(P=d.parameters)==null?void 0:P.docs)==null?void 0:j.source}}};var L,q,E;i.parameters={...i.parameters,docs:{...(L=i.parameters)==null?void 0:L.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "A slow loader keeps the spinner visible while options resolve."
      }
    }
  },
  render: () => <Playground loadWorkloads={makeLoader(100000)} />
}`,...(E=(q=i.parameters)==null?void 0:q.docs)==null?void 0:E.source}}};var O,C,A;c.parameters={...c.parameters,docs:{...(O=c.parameters)==null?void 0:O.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Restricting \`kinds\` to a subset offers a single group (no headers for absent kinds)."
      }
    }
  },
  render: () => <Playground loadWorkloads={makeLoader(0)} kinds={["service"]} />
}`,...(A=(C=c.parameters)==null?void 0:C.docs)==null?void 0:A.source}}};var D,R,I;m.parameters={...m.parameters,docs:{...(D=m.parameters)==null?void 0:D.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "When the loader returns no workloads, the dropdown shows the Combobox's “No results” state."
      }
    }
  },
  render: () => <Playground loadWorkloads={makeLoader(0, {})} />
}`,...(I=(R=m.parameters)==null?void 0:R.docs)==null?void 0:I.source}}};const oe=["Default","Grouped","Namespaced","NamespaceSelection","Loading","ServicesOnly","Empty"];export{a as Default,m as Empty,n as Grouped,i as Loading,d as NamespaceSelection,t as Namespaced,c as ServicesOnly,oe as __namedExportsOrder,ee as default};
