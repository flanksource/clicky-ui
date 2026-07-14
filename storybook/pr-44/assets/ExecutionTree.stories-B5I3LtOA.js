import{j as e}from"./iframe-QA7Jz26Z.js";import{E as r}from"./ExecutionTree-C9-j_QqC.js";import"./preload-helper-CLp6iKya.js";import"./Tree-yvBKqbyW.js";import"./utils-CR52uffu.js";import"./Icon-BlQl19kd.js";import"./TreeNode-DpsbWHL-.js";const x=[{id:"0",label:"processActivitySequence",className:"org.example.workflow.bll.tasks.ActivitySequenceTaskBll",lineNumber:136,cost:12.3,unit:"ms",times:1,status:"ok",children:[{id:"0.0",label:"processActivitySequenceEntity",className:"org.example.workflow.bll.tasks.ActivitySequenceTaskBll",lineNumber:161,cost:9.8,status:"ok",children:[{id:"0.0.0",label:"load",className:"org.example.workflow.dao.ActivitySequenceTaskDao",lineNumber:88,cost:3.4,times:2,status:"ok"},{id:"0.0.1",label:"validateResult",className:"org.example.workflow.bll.tasks.ActivitySequenceTaskBll",lineNumber:285,cost:1.2,times:1,status:"error",detail:{throwExp:"ActivitySequenceException"}}]}]}],b={title:"Data/Diagnostics/ExecutionTree",component:r,args:{roots:x,defaultOpenDepth:3},parameters:{docs:{description:{component:"Generic, type-agnostic call/execution tree. Any producer (an arthas trace, a span tree, an activity sequence) maps its data into ExecutionNode and gets per-node cost, status, invocation count, and a slow-path cost highlight. Delegates hierarchy to Tree."}}}},t={render:h=>e.jsx("div",{className:"w-[720px]",children:e.jsx(r,{...h})})},s={render:()=>e.jsx("div",{className:"w-[720px]",children:e.jsx(r,{roots:x,defaultOpenDepth:3,costThreshold:5})})},a={render:()=>e.jsx("div",{className:"w-[720px]",children:e.jsx(r,{roots:[{id:"q",label:"executeQuery",cost:142,unit:"count",status:"warning",detail:{rows:"142"}}]})})};var o,n,c;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: args => <div className="w-[720px]">
      <ExecutionTree {...args} />
    </div>
}`,...(c=(n=t.parameters)==null?void 0:n.docs)==null?void 0:c.source}}};var i,l,d;s.parameters={...s.parameters,docs:{...(i=s.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => <div className="w-[720px]">
      <ExecutionTree roots={sampleCallTree} defaultOpenDepth={3} costThreshold={5} />
    </div>
}`,...(d=(l=s.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var u,p,m;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
}`,...(m=(p=a.parameters)==null?void 0:p.docs)==null?void 0:m.source}}};const f=["Default","CostThreshold","CountUnit"];export{s as CostThreshold,a as CountUnit,t as Default,f as __namedExportsOrder,b as default};
