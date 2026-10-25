import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./ObjectGraph-BGuk8pTe.js";var i,a,o,s,c,l,u;function d(){return(d=e((()=>{n(),i=t(),a=[{id:`root`,label:`value`,type:`ActivitySequenceTaskDcl`,kind:`object`,children:[{id:`root.guid`,label:`activityGuid`,type:`String`,value:`9BAB4AB2-…-1C95D53A9678`,kind:`scalar`},{id:`root.status`,label:`statusCode`,type:`Integer`,value:`02`,kind:`scalar`},{id:`root.task`,label:`taskType`,type:`ActivitySequenceTaskType`,kind:`object`,children:[{id:`root.task.name`,label:`name`,type:`String`,value:`INTAKERECORDACTIVITY`,kind:`scalar`}]},{id:`root.params`,label:`params`,type:`HashMap`,kind:`map`,children:[{id:`root.params.a`,label:`CommencementDate`,type:`Date`,value:`2026-06-01`,kind:`scalar`},{id:`root.params.b`,label:`Premium`,type:`BigDecimal`,value:`1200.00`,kind:`scalar`}]},{id:`root.errors`,label:`errors`,type:`ArrayList`,kind:`list`,children:[{id:`root.errors.0`,label:`[0]`,type:`AsError`,kind:`object`,raw:`AsError@4f2c…`}]}]}],o={title:`Data/Diagnostics/ObjectGraph`,component:r,args:{roots:a},parameters:{docs:{description:{component:`Generic, type-agnostic expandable object/value inspector. Any producer (an OGNL value capture, a domain object, a JSON tree) maps its data into ObjectGraphNode and gets the same tree, search, and lazy-expansion behaviour. Delegates hierarchy to Tree.`}}}},s={render:e=>(0,i.jsx)(`div`,{className:`w-[640px]`,children:(0,i.jsx)(r,{...e})})},c={render:()=>(0,i.jsx)(`div`,{className:`w-[640px]`,children:(0,i.jsx)(r,{roots:[{id:`cache`,label:`CYCLE cache`,type:`NamedCache`,kind:`map`,expandable:!0}],loadChildren:async e=>[{id:`${e.id}.0`,label:`CycleProcess:Active`,type:`String`,value:`ABORT`,kind:`scalar`},{id:`${e.id}.1`,label:`07`,type:`String`,value:`GUID-…`,kind:`scalar`}]})})},l={render:()=>(0,i.jsx)(`div`,{className:`w-[640px]`,children:(0,i.jsx)(r,{roots:a,renderLabel:e=>(0,i.jsxs)(`span`,{className:`font-mono text-xs`,children:[(0,i.jsx)(`span`,{className:`text-blue-600`,children:e.label}),e.value!=null&&(0,i.jsxs)(`span`,{className:`ml-2 text-foreground`,children:[`= `,String(e.value)]})]})})})},u=[`Default`,`LazyExpansion`,`CustomLabel`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => <div className="w-[640px]">
      <ObjectGraph {...args} />
    </div>
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[640px]">
      <ObjectGraph roots={sampleGraph} renderLabel={node => <span className="font-mono text-xs">
            <span className="text-blue-600">{node.label}</span>
            {node.value != null && <span className="ml-2 text-foreground">= {String(node.value)}</span>}
          </span>} />
    </div>
}`,...l.parameters?.docs?.source}}}})))()}d();export{l as CustomLabel,s as Default,c as LazyExpansion,u as __namedExportsOrder,o as default};