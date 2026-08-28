import{j as e,r as b}from"./iframe-CIC35eeX.js";import{N as w}from"./NamespacePicker-DItY5PNm.js";import"./preload-helper-CrzHa85r.js";import"./Combobox-l6NoX43q.js";import"./utils-DW-IJACk.js";import"./Icon-BApSHLDT.js";import"./modalStack-CfG6hB1c.js";import"./zIndex-BGbNBNA8.js";import"./json-schema-form-size-E77C3uZS.js";import"./FilterPill-DKv4DvZD.js";import"./index-DwO5TgZY.js";import"./index-C6gbLGVc.js";const j=["default","kube-system","prod","staging"];function n(d=300,c=j){return()=>new Promise(r=>setTimeout(()=>r(c),d))}function i({initial:d="",...c}){const[r,P]=b.useState(d);return e.jsxs("div",{className:"w-80 space-y-3",children:[e.jsx(w,{value:r,onChange:P,...c}),e.jsxs("div",{className:"rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs",children:["value=",JSON.stringify(r)]})]})}const F={title:"Components/NamespacePicker",component:w,parameters:{docs:{description:{component:"Selects a Kubernetes namespace. Presentational — the consumer supplies the async `loadNamespaces` getter. The selected namespace is the value other form widgets (secret / workload pickers) read to scope their own lookups."}}}},s={render:()=>e.jsx(i,{loadNamespaces:n(0)})},a={render:()=>e.jsx(i,{initial:"prod",loadNamespaces:n(0)})},o={parameters:{docs:{description:{story:"A slow loader keeps the spinner visible while namespaces resolve."}}},render:()=>e.jsx(i,{loadNamespaces:n(1e5)})},t={parameters:{docs:{description:{story:"In strict mode a value absent from the loaded set is flagged invalid (still shown, pinned first)."}}},render:()=>e.jsx(i,{initial:"ghost",strict:!0,loadNamespaces:n(0)})};var p,m,l;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => <Playground loadNamespaces={makeLoader(0)} />
}`,...(l=(m=s.parameters)==null?void 0:m.docs)==null?void 0:l.source}}};var u,g,h;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => <Playground initial="prod" loadNamespaces={makeLoader(0)} />
}`,...(h=(g=a.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var f,k,x;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "A slow loader keeps the spinner visible while namespaces resolve."
      }
    }
  },
  render: () => <Playground loadNamespaces={makeLoader(100000)} />
}`,...(x=(k=o.parameters)==null?void 0:k.docs)==null?void 0:x.source}}};var N,y,v;t.parameters={...t.parameters,docs:{...(N=t.parameters)==null?void 0:N.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "In strict mode a value absent from the loaded set is flagged invalid (still shown, pinned first)."
      }
    }
  },
  render: () => <Playground initial="ghost" strict loadNamespaces={makeLoader(0)} />
}`,...(v=(y=t.parameters)==null?void 0:y.docs)==null?void 0:v.source}}};const J=["Default","Preselected","Loading","StrictUnknown"];export{s as Default,o as Loading,a as Preselected,t as StrictUnknown,J as __namedExportsOrder,F as default};
