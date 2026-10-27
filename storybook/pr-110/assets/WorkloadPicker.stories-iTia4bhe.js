import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./react-pByjoP3I.js";import{t as n}from"./jsx-runtime-BG4KOiPz.js";import{n as r,t as i}from"./WorkloadPicker-CRqEllGz.js";function a(e=300,t=l){return n=>new Promise(r=>setTimeout(()=>{let e={};for(let r of n)e[r]=t[r]??[];r(e)},e))}function o({initial:e=``,...t}){let[n,r]=(0,s.useState)(e);return(0,c.jsxs)(`div`,{className:`w-80 space-y-3`,children:[(0,c.jsx)(i,{value:n,onChange:r,...t}),(0,c.jsxs)(`div`,{className:`rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs`,children:[`value=`,JSON.stringify(n)]})]})}var s,c,l,u,d,f,p,m,h,g,_,v;function y(){return(y=e((()=>{s=t(),r(),c=n(),l={service:[{name:`demo-svc`},{name:`activemq-svc`}],ingress:[{name:`demo-ing`,hosts:[`demo.example.com`]}],pod:[{name:`demo-api-abc12`}],deployment:[{name:`demo-web`},{name:`palette-web`}],statefulset:[{name:`demo-cycle`},{name:`sqlserver`}],daemonset:[{name:`node-agent`}]},u={title:`Components/WorkloadPicker`,component:i,parameters:{docs:{description:{component:"Selects a Kubernetes workload for an endpoint or query. Options from every requested kind are merged into one Combobox, grouped by kind via Combobox group headers and labelled with the kind's icon. Fetches nothing itself — the consumer supplies the async `loadWorkloads` getter. An ingress emits its first host (the routable address) as the value, labelled with the ingress name for context; every other kind emits its name."}}}},d={render:()=>(0,c.jsx)(o,{loadWorkloads:a()})},f={parameters:{docs:{description:{story:"All four kinds load, producing four group headers (Service / Ingress / Deployment / StatefulSet) in the dropdown. Each option's value is a `kind/name` key (an ingress uses `ingress/<host>`), shown in the value panel; the dropdown label stays the human name."}}},render:()=>(0,c.jsx)(o,{initial:`service/demo-svc`,loadWorkloads:a(0)})},p={parameters:{docs:{description:{story:"With a `namespace`, the emitted value is fully qualified as `namespace/kind/name` — pick a workload and watch the value panel."}}},render:()=>(0,c.jsx)(o,{namespace:`demo`,loadWorkloads:a(0)})},m={parameters:{docs:{description:{story:`Opt-in namespace selection scopes workload discovery and emits a fully-qualified namespace/kind/name value.`}}},render:()=>(0,c.jsx)(o,{namespace:`demo`,loadWorkloads:a(0),allowNamespaceSelection:!0,loadNamespaces:()=>Promise.resolve([`demo`,`platform`,`search`])})},h={parameters:{docs:{description:{story:`A slow loader keeps the spinner visible while options resolve.`}}},render:()=>(0,c.jsx)(o,{loadWorkloads:a(1e5)})},g={parameters:{docs:{description:{story:"Restricting `kinds` to a subset offers a single group (no headers for absent kinds)."}}},render:()=>(0,c.jsx)(o,{loadWorkloads:a(0),kinds:[`service`]})},_={parameters:{docs:{description:{story:`When the loader returns no workloads, the dropdown shows the Combobox's “No results” state.`}}},render:()=>(0,c.jsx)(o,{loadWorkloads:a(0,{})})},v=[`Default`,`Grouped`,`Namespaced`,`NamespaceSelection`,`Loading`,`ServicesOnly`,`Empty`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <Playground loadWorkloads={makeLoader()} />
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "All four kinds load, producing four group headers (Service / Ingress / Deployment / StatefulSet) in the dropdown. Each option's value is a \`kind/name\` key (an ingress uses \`ingress/<host>\`), shown in the value panel; the dropdown label stays the human name."
      }
    }
  },
  render: () => <Playground initial="service/demo-svc" loadWorkloads={makeLoader(0)} />
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "With a \`namespace\`, the emitted value is fully qualified as \`namespace/kind/name\` — pick a workload and watch the value panel."
      }
    }
  },
  render: () => <Playground namespace="demo" loadWorkloads={makeLoader(0)} />
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Opt-in namespace selection scopes workload discovery and emits a fully-qualified namespace/kind/name value."
      }
    }
  },
  render: () => <Playground namespace="demo" loadWorkloads={makeLoader(0)} allowNamespaceSelection loadNamespaces={() => Promise.resolve(["demo", "platform", "search"])} />
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "A slow loader keeps the spinner visible while options resolve."
      }
    }
  },
  render: () => <Playground loadWorkloads={makeLoader(100000)} />
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "Restricting \`kinds\` to a subset offers a single group (no headers for absent kinds)."
      }
    }
  },
  render: () => <Playground loadWorkloads={makeLoader(0)} kinds={["service"]} />
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  parameters: {
    docs: {
      description: {
        story: "When the loader returns no workloads, the dropdown shows the Combobox's “No results” state."
      }
    }
  },
  render: () => <Playground loadWorkloads={makeLoader(0, {})} />
}`,..._.parameters?.docs?.source}}}})))()}y();export{d as Default,_ as Empty,f as Grouped,h as Loading,m as NamespaceSelection,p as Namespaced,g as ServicesOnly,v as __namedExportsOrder,u as default};