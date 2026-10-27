import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./NamespacePicker-Cc4-Wc1f.js";function a(e=300,t=l){return()=>new Promise(n=>setTimeout(()=>n(t),e))}function o({initial:e=``,...t}){let[n,r]=(0,s.useState)(e);return(0,c.jsxs)(`div`,{className:`w-80 space-y-3`,children:[(0,c.jsx)(i,{value:n,onChange:r,...t}),(0,c.jsxs)(`div`,{className:`rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs`,children:[`value=`,JSON.stringify(n)]})]})}var s,c,l,u,d,f,p,m,h;function g(){return(g=e((()=>{s=t(),r(),c=n(),l=[`default`,`kube-system`,`prod`,`staging`],u={title:`Components/NamespacePicker`,component:i,parameters:{docs:{description:{component:"Selects a Kubernetes namespace. Presentational — the consumer supplies the async `loadNamespaces` getter. The selected namespace is the value other form widgets (secret / workload pickers) read to scope their own lookups."}}}},d={render:()=>(0,c.jsx)(o,{loadNamespaces:a(0)})},f={render:()=>(0,c.jsx)(o,{initial:`prod`,loadNamespaces:a(0)})},p={parameters:{docs:{description:{story:`A slow loader keeps the spinner visible while namespaces resolve.`}}},render:()=>(0,c.jsx)(o,{loadNamespaces:a(1e5)})},m={parameters:{docs:{description:{story:`In strict mode a value absent from the loaded set is flagged invalid (still shown, pinned first).`}}},render:()=>(0,c.jsx)(o,{initial:`ghost`,strict:!0,loadNamespaces:a(0)})},h=[`Default`,`Preselected`,`Loading`,`StrictUnknown`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Playground loadNamespaces={makeLoader(0)} />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <Playground initial="prod" loadNamespaces={makeLoader(0)} />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "A slow loader keeps the spinner visible while namespaces resolve."
      }
    }
  },
  render: () => <Playground loadNamespaces={makeLoader(100000)} />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "In strict mode a value absent from the loaded set is flagged invalid (still shown, pinned first)."
      }
    }
  },
  render: () => <Playground initial="ghost" strict loadNamespaces={makeLoader(0)} />
}`,...m.parameters?.docs?.source}}}})))()}g();export{d as Default,p as Loading,f as Preselected,m as StrictUnknown,h as __namedExportsOrder,u as default};