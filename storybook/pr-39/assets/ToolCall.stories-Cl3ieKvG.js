import{j as e}from"./iframe-C96xZIdp.js";import{T as t}from"./ToolCall-CVX4OL-d.js";import{S as c}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-Bg6xcDEu.js";import"./utils-CR52uffu.js";import"./button-CQ2Ni0n1.js";import"./index-0zBpNI7D.js";import"./loading-2G2O_q61.js";import"./Icon-DVJMtl2F.js";import"./CodeBlock-2bG6zm5g.js";import"./JsonView-BsucjRFS.js";import"./code-highlight-CQkTewJY.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-BtjbQfAi.js";import"./UiCheck-CIVB-pM_.js";import"./UiClock-QtT1Ez-g.js";import"./UiCircleOutline-DnuF5nWL.js";import"./UiWrench-CxvUyF1z.js";import"./UiChevronDown-C4iQdycK.js";const{fn:u}=__STORYBOOK_MODULE_TEST__;var s;const x=(s=c[1])==null?void 0:s.parts[0],P={title:"Chat/ToolCall",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, and the input args → output result. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls."}}},argTypes:{part:{control:!1},defaultOpen:{control:"boolean"},onApprove:{control:!1}},args:{part:x,defaultOpen:!1,onApprove:u()}},r={render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})},o={args:{defaultOpen:!0},render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})};var p,n,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <ToolCall {...args} />
    </div>
}`,...(l=(n=r.parameters)==null?void 0:n.docs)==null?void 0:l.source}}};var m,i,d;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    defaultOpen: true
  },
  render: args => <div className="max-w-2xl">
      <ToolCall {...args} />
    </div>
}`,...(d=(i=o.parameters)==null?void 0:i.docs)==null?void 0:d.source}}};const R=["Collapsed","Expanded"];export{r as Collapsed,o as Expanded,R as __namedExportsOrder,P as default};
