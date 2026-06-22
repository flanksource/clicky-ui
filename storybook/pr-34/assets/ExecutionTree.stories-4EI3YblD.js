import{j as e}from"./iframe-C0Aur-Df.js";import{E as a}from"./ExecutionTree-2WrbuIsH.js";import"./preload-helper-B4w--iqy.js";import"./Tree-BxhKnJIs.js";import"./utils-BLSKlp9E.js";import"./Icon-bcMubS04.js";import"./TreeNode-Crgj23i0.js";import"./UiChevronDown-CebnzLpn.js";import"./UiChevronRight-aprQ3K9G.js";import"./UiSearch-xNyNeqRZ.js";import"./UiClose-ooRL-WfY.js";import"./UiExpandAll-CBrwD4oL.js";const x=[{id:"0",label:"processActivitySequence",className:"org.example.workflow.bll.tasks.ActivitySequenceTaskBll",lineNumber:136,cost:12.3,unit:"ms",times:1,status:"ok",children:[{id:"0.0",label:"processActivitySequenceEntity",className:"org.example.workflow.bll.tasks.ActivitySequenceTaskBll",lineNumber:161,cost:9.8,status:"ok",children:[{id:"0.0.0",label:"load",className:"org.example.workflow.dao.ActivitySequenceTaskDao",lineNumber:88,cost:3.4,times:2,status:"ok"},{id:"0.0.1",label:"validateResult",className:"org.example.workflow.bll.tasks.ActivitySequenceTaskBll",lineNumber:285,cost:1.2,times:1,status:"error",detail:{throwExp:"ActivitySequenceException"}}]}]}],D={title:"Data/Diagnostics/ExecutionTree",component:a,args:{roots:x,defaultOpenDepth:3},parameters:{docs:{description:{component:"Generic, type-agnostic call/execution tree. Any producer (an arthas trace, a span tree, an activity sequence) maps its data into ExecutionNode and gets per-node cost, status, invocation count, and a slow-path cost highlight. Delegates hierarchy to Tree."}}}},t={render:h=>e.jsx("div",{className:"w-[720px]",children:e.jsx(a,{...h})})},s={render:()=>e.jsx("div",{className:"w-[720px]",children:e.jsx(a,{roots:x,defaultOpenDepth:3,costThreshold:5})})},r={render:()=>e.jsx("div",{className:"w-[720px]",children:e.jsx(a,{roots:[{id:"q",label:"executeQuery",cost:142,unit:"count",status:"warning",detail:{rows:"142"}}]})})};var o,n,i;t.parameters={...t.parameters,docs:{...(o=t.parameters)==null?void 0:o.docs,source:{originalSource:`{
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
