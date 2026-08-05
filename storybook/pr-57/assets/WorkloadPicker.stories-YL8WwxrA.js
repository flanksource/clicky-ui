import{j as e,r as q}from"./iframe-CE2JtCgn.js";import{W as O}from"./WorkloadPicker-CcxArIWV.js";import"./preload-helper-DOqJbnTS.js";import"./utils-CR52uffu.js";import"./Combobox-CaLzLYqA.js";import"./Icon-DjK-Ul0P.js";import"./modalStack-BL3nM1Er.js";import"./zIndex-CigQ76av.js";import"./json-schema-form-size-DYVq0lph.js";import"./index-CnTEniBU.js";import"./index-srCuUkvt.js";import"./FilterPill-DiI-02-u.js";import"./index-CsBgFP9O.js";const I={service:[{name:"demo-svc"},{name:"activemq-svc"}],ingress:[{name:"demo-ing",hosts:["demo.example.com"]}],deployment:[{name:"demo-web"},{name:"palette-web"}],statefulset:[{name:"demo-cycle"},{name:"sqlserver"}]};function o(c=300,m=I){return s=>new Promise(p=>setTimeout(()=>{const u={};for(const h of s)u[h]=m[h]??[];p(u)},c))}function r({initial:c="",...m}){const[s,p]=q.useState(c);return e.jsxs("div",{className:"w-80 space-y-3",children:[e.jsx(O,{value:s,onChange:p,...m}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(s)]})]})}const M={title:"Components/WorkloadPicker",component:O,parameters:{docs:{description:{component:"Selects a Kubernetes workload (Service / Ingress / Deployment / StatefulSet) for an endpoint. Options from every kind are merged into one Combobox, grouped by kind via Combobox group headers and labelled with the kind's icon. Fetches nothing itself — the consumer supplies the async `loadWorkloads` getter. An ingress emits its first host (the routable address) as the value, labelled with the ingress name for context; every other kind emits its name."}}}},a={render:()=>e.jsx(r,{loadWorkloads:o()})},n={parameters:{docs:{description:{story:"All four kinds load, producing four group headers (Service / Ingress / Deployment / StatefulSet) in the dropdown. Each option's value is a `kind/name` key (an ingress uses `ingress/<host>`), shown in the value panel; the dropdown label stays the human name."}}},render:()=>e.jsx(r,{initial:"service/demo-svc",loadWorkloads:o(0)})},t={parameters:{docs:{description:{story:"With a `namespace`, the emitted value is fully qualified as `namespace/kind/name` — pick a workload and watch the value panel."}}},render:()=>e.jsx(r,{namespace:"demo",loadWorkloads:o(0)})},d={parameters:{docs:{description:{story:"A slow loader keeps the spinner visible while options resolve."}}},render:()=>e.jsx(r,{loadWorkloads:o(1e5)})},i={parameters:{docs:{description:{story:"Restricting `kinds` to a subset offers a single group (no headers for absent kinds)."}}},render:()=>e.jsx(r,{loadWorkloads:o(0),kinds:["service"]})},l={parameters:{docs:{description:{story:"When the loader returns no workloads, the dropdown shows the Combobox's “No results” state."}}},render:()=>e.jsx(r,{loadWorkloads:o(0,{})})};var k,g,y;a.parameters={...a.parameters,docs:{...(k=a.parameters)==null?void 0:k.docs,source:{originalSource:`{
  render: () => <Playground loadWorkloads={makeLoader()} />
}`,...(y=(g=a.parameters)==null?void 0:g.docs)==null?void 0:y.source}}};var v,f,b;n.parameters={...n.parameters,docs:{...(v=n.parameters)==null?void 0:v.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "All four kinds load, producing four group headers (Service / Ingress / Deployment / StatefulSet) in the dropdown. Each option's value is a \`kind/name\` key (an ingress uses \`ingress/<host>\`), shown in the value panel; the dropdown label stays the human name."
      }
    }
  },
  render: () => <Playground initial="service/demo-svc" loadWorkloads={makeLoader(0)} />
}`,...(b=(f=n.parameters)==null?void 0:f.docs)==null?void 0:b.source}}};var w,x,S;t.parameters={...t.parameters,docs:{...(w=t.parameters)==null?void 0:w.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "With a \`namespace\`, the emitted value is fully qualified as \`namespace/kind/name\` — pick a workload and watch the value panel."
      }
    }
  },
  render: () => <Playground namespace="demo" loadWorkloads={makeLoader(0)} />
}`,...(S=(x=t.parameters)==null?void 0:x.docs)==null?void 0:S.source}}};var W,j,P;d.parameters={...d.parameters,docs:{...(W=d.parameters)==null?void 0:W.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "A slow loader keeps the spinner visible while options resolve."
      }
    }
  },
  render: () => <Playground loadWorkloads={makeLoader(100000)} />
}`,...(P=(j=d.parameters)==null?void 0:j.docs)==null?void 0:P.source}}};var L,E,N;i.parameters={...i.parameters,docs:{...(L=i.parameters)==null?void 0:L.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Restricting \`kinds\` to a subset offers a single group (no headers for absent kinds)."
      }
    }
  },
  render: () => <Playground loadWorkloads={makeLoader(0)} kinds={["service"]} />
}`,...(N=(E=i.parameters)==null?void 0:E.docs)==null?void 0:N.source}}};var C,A,D;l.parameters={...l.parameters,docs:{...(C=l.parameters)==null?void 0:C.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "When the loader returns no workloads, the dropdown shows the Combobox's “No results” state."
      }
    }
  },
  render: () => <Playground loadWorkloads={makeLoader(0, {})} />
}`,...(D=(A=l.parameters)==null?void 0:A.docs)==null?void 0:D.source}}};const Q=["Default","Grouped","Namespaced","Loading","ServicesOnly","Empty"];export{a as Default,l as Empty,n as Grouped,d as Loading,t as Namespaced,i as ServicesOnly,Q as __namedExportsOrder,M as default};
