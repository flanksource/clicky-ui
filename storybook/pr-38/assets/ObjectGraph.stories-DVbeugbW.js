import{j as e}from"./iframe-BxLPOr6M.js";import{O as n}from"./ObjectGraph-DqCGPmR2.js";import"./preload-helper-C4wV90-x.js";import"./Tree-B8NLzSEo.js";import"./utils-CR52uffu.js";import"./Icon-DGql8Ler.js";import"./TreeNode-Cc5f5pT6.js";import"./UiChevronDown-BxzZdAmx.js";import"./UiChevronRight-DKNjap7a.js";import"./UiSearch-CjFq2-8_.js";import"./UiClose-BkgTCVec.js";import"./UiExpandAll-Qls7xI8d.js";const x=[{id:"root",label:"value",type:"ActivitySequenceTaskDcl",kind:"object",children:[{id:"root.guid",label:"activityGuid",type:"String",value:"9BAB4AB2-…-1C95D53A9678",kind:"scalar"},{id:"root.status",label:"statusCode",type:"Integer",value:"02",kind:"scalar"},{id:"root.task",label:"taskType",type:"ActivitySequenceTaskType",kind:"object",children:[{id:"root.task.name",label:"name",type:"String",value:"INTAKERECORDACTIVITY",kind:"scalar"}]},{id:"root.params",label:"params",type:"HashMap",kind:"map",children:[{id:"root.params.a",label:"CommencementDate",type:"Date",value:"2026-06-01",kind:"scalar"},{id:"root.params.b",label:"Premium",type:"BigDecimal",value:"1200.00",kind:"scalar"}]},{id:"root.errors",label:"errors",type:"ArrayList",kind:"list",children:[{id:"root.errors.0",label:"[0]",type:"AsError",kind:"object",raw:"AsError@4f2c…"}]}]}],O={title:"Data/Diagnostics/ObjectGraph",component:n,args:{roots:x},parameters:{docs:{description:{component:"Generic, type-agnostic expandable object/value inspector. Any producer (an OGNL value capture, a domain object, a JSON tree) maps its data into ObjectGraphNode and gets the same tree, search, and lazy-expansion behaviour. Delegates hierarchy to Tree."}}}},r={render:a=>e.jsx("div",{className:"w-[640px]",children:e.jsx(n,{...a})})},s={render:()=>e.jsx("div",{className:"w-[640px]",children:e.jsx(n,{roots:[{id:"cache",label:"CYCLE cache",type:"NamedCache",kind:"map",expandable:!0}],loadChildren:async a=>[{id:`${a.id}.0`,label:"CycleProcess:Active",type:"String",value:"ABORT",kind:"scalar"},{id:`${a.id}.1`,label:"07",type:"String",value:"GUID-…",kind:"scalar"}]})})},t={render:()=>e.jsx("div",{className:"w-[640px]",children:e.jsx(n,{roots:x,renderLabel:a=>e.jsxs("span",{className:"font-mono text-xs",children:[e.jsx("span",{className:"text-blue-600",children:a.label}),a.value!=null&&e.jsxs("span",{className:"ml-2 text-foreground",children:["= ",String(a.value)]})]})})})};var o,l,i;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: args => <div className="w-[640px]">
      <ObjectGraph {...args} />
    </div>
}`,...(i=(l=r.parameters)==null?void 0:l.docs)==null?void 0:i.source}}};var c,d,p;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <div className="w-[640px]">
      <ObjectGraph roots={[{
      id: "cache",
      label: "CYCLE cache",
      type: "NamedCache",
      kind: "map",
      expandable: true
    }]} loadChildren={async node => [{
      id: \`\${node.id}.0\`,
      label: "CycleProcess:Active",
      type: "String",
      value: "ABORT",
      kind: "scalar"
    }, {
      id: \`\${node.id}.1\`,
      label: "07",
      type: "String",
      value: "GUID-…",
      kind: "scalar"
    }]} />
    </div>
}`,...(p=(d=s.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var m,u,b;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <div className="w-[640px]">
      <ObjectGraph roots={sampleGraph} renderLabel={node => <span className="font-mono text-xs">
            <span className="text-blue-600">{node.label}</span>
            {node.value != null && <span className="ml-2 text-foreground">= {String(node.value)}</span>}
          </span>} />
    </div>
}`,...(b=(u=t.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};const f=["Default","LazyExpansion","CustomLabel"];export{t as CustomLabel,r as Default,s as LazyExpansion,f as __namedExportsOrder,O as default};
