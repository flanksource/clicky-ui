import{j as e}from"./iframe-YETa_cG9.js";import{O as n}from"./ObjectGraph-B7b-KlFN.js";import"./preload-helper-BF_8wlrL.js";import"./utils-DW-IJACk.js";import"./Icon-Ca6PCkd-.js";import"./DropdownMenu-CiFq7tJJ.js";import"./floating-ui.react-5Xu4xio0.js";import"./index-OzyaF4V_.js";import"./index-CseixOkg.js";import"./button-wvsJ1tMU.js";import"./index-CPURVhFy.js";import"./loading-BAKLzrcW.js";import"./DropdownMenuSubmenu-CvY5YgBD.js";import"./modalStack-Dm7Q2W0x.js";import"./zIndex-BGbNBNA8.js";import"./Modal-B6frkNwF.js";import"./Tree-B468uYWs.js";import"./TreeNode-DI-9saRK.js";const x=[{id:"root",label:"value",type:"ActivitySequenceTaskDcl",kind:"object",children:[{id:"root.guid",label:"activityGuid",type:"String",value:"9BAB4AB2-…-1C95D53A9678",kind:"scalar"},{id:"root.status",label:"statusCode",type:"Integer",value:"02",kind:"scalar"},{id:"root.task",label:"taskType",type:"ActivitySequenceTaskType",kind:"object",children:[{id:"root.task.name",label:"name",type:"String",value:"INTAKERECORDACTIVITY",kind:"scalar"}]},{id:"root.params",label:"params",type:"HashMap",kind:"map",children:[{id:"root.params.a",label:"CommencementDate",type:"Date",value:"2026-06-01",kind:"scalar"},{id:"root.params.b",label:"Premium",type:"BigDecimal",value:"1200.00",kind:"scalar"}]},{id:"root.errors",label:"errors",type:"ArrayList",kind:"list",children:[{id:"root.errors.0",label:"[0]",type:"AsError",kind:"object",raw:"AsError@4f2c…"}]}]}],B={title:"Data/Diagnostics/ObjectGraph",component:n,args:{roots:x},parameters:{docs:{description:{component:"Generic, type-agnostic expandable object/value inspector. Any producer (an OGNL value capture, a domain object, a JSON tree) maps its data into ObjectGraphNode and gets the same tree, search, and lazy-expansion behaviour. Delegates hierarchy to Tree."}}}},r={render:a=>e.jsx("div",{className:"w-[640px]",children:e.jsx(n,{...a})})},t={render:()=>e.jsx("div",{className:"w-[640px]",children:e.jsx(n,{roots:[{id:"cache",label:"CYCLE cache",type:"NamedCache",kind:"map",expandable:!0}],loadChildren:async a=>[{id:`${a.id}.0`,label:"CycleProcess:Active",type:"String",value:"ABORT",kind:"scalar"},{id:`${a.id}.1`,label:"07",type:"String",value:"GUID-…",kind:"scalar"}]})})},s={render:()=>e.jsx("div",{className:"w-[640px]",children:e.jsx(n,{roots:x,renderLabel:a=>e.jsxs("span",{className:"font-mono text-xs",children:[e.jsx("span",{className:"text-blue-600",children:a.label}),a.value!=null&&e.jsxs("span",{className:"ml-2 text-foreground",children:["= ",String(a.value)]})]})})})};var o,i,l;r.parameters={...r.parameters,docs:{...(o=r.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: args => <div className="w-[640px]">
      <ObjectGraph {...args} />
    </div>
}`,...(l=(i=r.parameters)==null?void 0:i.docs)==null?void 0:l.source}}};var c,d,p;t.parameters={...t.parameters,docs:{...(c=t.parameters)==null?void 0:c.docs,source:{originalSource:`{
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
}`,...(p=(d=t.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};var m,u,b;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => <div className="w-[640px]">
      <ObjectGraph roots={sampleGraph} renderLabel={node => <span className="font-mono text-xs">
            <span className="text-blue-600">{node.label}</span>
            {node.value != null && <span className="ml-2 text-foreground">= {String(node.value)}</span>}
          </span>} />
    </div>
}`,...(b=(u=s.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};const I=["Default","LazyExpansion","CustomLabel"];export{s as CustomLabel,r as Default,t as LazyExpansion,I as __namedExportsOrder,B as default};
