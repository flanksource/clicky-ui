import{j as e}from"./iframe-BxLPOr6M.js";import{T as t}from"./ToolCall-BUSuRhzJ.js";import{S as c}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-C4wV90-x.js";import"./utils-CR52uffu.js";import"./button-CcdgmEp6.js";import"./index-0zBpNI7D.js";import"./loading-C28S_Ccf.js";import"./Icon-DGql8Ler.js";import"./CodeBlock-DuyIK4wF.js";import"./JsonView-DFRIAMDC.js";import"./code-highlight-CpKg2tYe.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-BKoHmyGU.js";import"./UiCheck-DcO0ZANr.js";import"./UiClock-DhXPh8Di.js";import"./UiCircleOutline-6qOjEOE4.js";import"./UiWrench-C4ZkzXrC.js";import"./UiChevronDown-BxzZdAmx.js";const{fn:u}=__STORYBOOK_MODULE_TEST__;var s;const x=(s=c[1])==null?void 0:s.parts[0],P={title:"Chat/ToolCall",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, and the input args → output result. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls."}}},argTypes:{part:{control:!1},defaultOpen:{control:"boolean"},onApprove:{control:!1}},args:{part:x,defaultOpen:!1,onApprove:u()}},r={render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})},o={args:{defaultOpen:!0},render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})};var p,n,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
