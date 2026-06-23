import{j as e}from"./iframe-B-R1GM9F.js";import{E as a}from"./ExecutionTree-Crfu7LoI.js";import"./preload-helper-B4w--iqy.js";import"./Tree-CNR-aI_S.js";import"./utils-BLSKlp9E.js";import"./Icon-GOgSuK4c.js";import"./TreeNode-DILBuW5l.js";import"./UiChevronDown-7vVXchWm.js";import"./UiChevronRight-DlnTuw8_.js";import"./UiSearch-Dqhkv3lF.js";import"./UiClose-CK_Ztmv-.js";import"./UiExpandAll-B7qJCf5A.js";const x=[{id:"0",label:"processActivitySequence",className:"org.example.workflow.bll.tasks.ActivitySequenceTaskBll",lineNumber:136,cost:12.3,unit:"ms",times:1,status:"ok",children:[{id:"0.0",label:"processActivitySequenceEntity",className:"org.example.workflow.bll.tasks.ActivitySequenceTaskBll",lineNumber:161,cost:9.8,status:"ok",children:[{id:"0.0.0",label:"load",className:"org.example.workflow.dao.ActivitySequenceTaskDao",lineNumber:88,cost:3.4,times:2,status:"ok"},{id:"0.0.1",label:"validateResult",className:"org.example.workflow.bll.tasks.ActivitySequenceTaskBll",lineNumber:285,cost:1.2,times:1,status:"error",detail:{throwExp:"ActivitySequenceException"}}]}]}],D={title:"Data/Diagnostics/ExecutionTree",component:a,args:{roots:x,defaultOpenDepth:3},parameters:{docs:{description:{component:"Generic, type-agnostic call/execution tree. Any producer (an arthas trace, a span tree, an activity sequence) maps its data into ExecutionNode and gets per-node cost, status, invocation count, and a slow-path cost highlight. Delegates hierarchy to Tree."}}}},t={render:h=>e.jsx("div",{className:"w-[720px]",children:e.jsx(a,{...h})})},s={render:()=>e.jsx("div",{className:"w-[720px]",children:e.jsx(a,{roots:x,defaultOpenDepth:3,costThreshold:5})})},r={render:()=>e.jsx("div",{className:"w-[720px]",children:e.jsx(a,{roots:[{id:"q",label:"executeQuery",cost:142,unit:"count",status:"warning",detail:{rows:"142"}}]})})};var o,n,i;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
  render: args => <div className="w-[720px]">
      <ExecutionTree {...args} />
    </div>
}`,...(i=(n=t.parameters)==null?void 0:n.docs)==null?void 0:i.source}}};var c,l,d;s.parameters={...s.parameters,docs:{...(c=s.parameters)==null?void 0:c.docs,source:{originalSource:`{
  render: () => <div className="w-[720px]">
      <ExecutionTree roots={sampleCallTree} defaultOpenDepth={3} costThreshold={5} />
    </div>
}`,...(d=(l=s.parameters)==null?void 0:l.docs)==null?void 0:d.source}}};var p,m,u;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
}`,...(u=(m=r.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};const j=["Default","CostThreshold","CountUnit"];export{s as CostThreshold,r as CountUnit,t as Default,j as __namedExportsOrder,D as default};
