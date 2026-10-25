import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./ExecutionTree-BLb8nkyW.js";var i,a,o,s,c,l,u;function d(){return(d=e((()=>{n(),i=t(),a=[{id:`0`,label:`processActivitySequence`,className:`org.example.workflow.bll.tasks.ActivitySequenceTaskBll`,lineNumber:136,cost:12.3,unit:`ms`,times:1,status:`ok`,children:[{id:`0.0`,label:`processActivitySequenceEntity`,className:`org.example.workflow.bll.tasks.ActivitySequenceTaskBll`,lineNumber:161,cost:9.8,status:`ok`,children:[{id:`0.0.0`,label:`load`,className:`org.example.workflow.dao.ActivitySequenceTaskDao`,lineNumber:88,cost:3.4,times:2,status:`ok`},{id:`0.0.1`,label:`validateResult`,className:`org.example.workflow.bll.tasks.ActivitySequenceTaskBll`,lineNumber:285,cost:1.2,times:1,status:`error`,detail:{throwExp:`ActivitySequenceException`}}]}]}],o={title:`Data/Diagnostics/ExecutionTree`,component:r,args:{roots:a,defaultOpenDepth:3},parameters:{docs:{description:{component:`Generic, type-agnostic call/execution tree. Any producer (an arthas trace, a span tree, an activity sequence) maps its data into ExecutionNode and gets per-node cost, status, invocation count, and a slow-path cost highlight. Delegates hierarchy to Tree.`}}}},s={render:e=>(0,i.jsx)(`div`,{className:`w-[720px]`,children:(0,i.jsx)(r,{...e})})},c={render:()=>(0,i.jsx)(`div`,{className:`w-[720px]`,children:(0,i.jsx)(r,{roots:a,defaultOpenDepth:3,costThreshold:5})})},l={render:()=>(0,i.jsx)(`div`,{className:`w-[720px]`,children:(0,i.jsx)(r,{roots:[{id:`q`,label:`executeQuery`,cost:142,unit:`count`,status:`warning`,detail:{rows:`142`}}]})})},u=[`Default`,`CostThreshold`,`CountUnit`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => <div className="w-[720px]">
      <ExecutionTree {...args} />
    </div>
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[720px]">
      <ExecutionTree roots={sampleCallTree} defaultOpenDepth={3} costThreshold={5} />
    </div>
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[720px]">
      <ExecutionTree roots={[{
      id: "q",
      label: "executeQuery",
      cost: 142,
      unit: "count",
      status: "warning",
      detail: {
        rows: "142"
      }
    }]} />
    </div>
}`,...l.parameters?.docs?.source}}}})))()}d();export{c as CostThreshold,l as CountUnit,s as Default,u as __namedExportsOrder,o as default};