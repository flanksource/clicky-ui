import{j as e}from"./iframe-0bc176G1.js";import{T as t}from"./ToolCall-BcHPe3mU.js";import{S as c}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-D-2WW-AN.js";import"./utils-CR52uffu.js";import"./button-CYgJK2Rk.js";import"./index-0zBpNI7D.js";import"./loading-CJdteYdy.js";import"./Icon-LDnLk-Ec.js";import"./CodeBlock-CQO-eBku.js";import"./JsonView-aDtMPjPr.js";import"./code-highlight-xUBeaIqO.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-DNv1yPkW.js";import"./UiCheck-B-D4Byul.js";import"./UiClock-Ba4qI8wk.js";import"./UiCircleOutline-DGHilfTD.js";import"./UiWrench-CNwzm9L-.js";import"./UiChevronDown-BuIn1m3V.js";const{fn:u}=__STORYBOOK_MODULE_TEST__;var s;const x=(s=c[1])==null?void 0:s.parts[0],P={title:"Chat/ToolCall",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, and the input args → output result. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls."}}},argTypes:{part:{control:!1},defaultOpen:{control:"boolean"},onApprove:{control:!1}},args:{part:x,defaultOpen:!1,onApprove:u()}},r={render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})},o={args:{defaultOpen:!0},render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})};var p,n,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
