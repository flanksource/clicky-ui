import{j as e}from"./iframe-CCq80owj.js";import{T as t}from"./ToolCall-BrYHuenR.js";import{S as c}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-ByUaG9M2.js";import"./utils-BLSKlp9E.js";import"./button-CRz4am1-.js";import"./index-1evVQkiP.js";import"./loading-NPQ1cFHI.js";import"./Icon-Cl3hQAjl.js";import"./CodeBlock-BlXP2N0j.js";import"./JsonView-DYud3Ld4.js";import"./code-highlight-vj-DXbl2.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-BWDlcHAE.js";import"./UiCheck-CzE9SQC0.js";import"./UiClock-DzIGMt3w.js";import"./UiCircleOutline-D8XQmbVf.js";import"./UiWrench-q8a32Yt0.js";import"./UiChevronDown-_xEbLx9w.js";const{fn:u}=__STORYBOOK_MODULE_TEST__;var s;const x=(s=c[1])==null?void 0:s.parts[0],P={title:"Chat/ToolCall",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, and the input args → output result. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls."}}},argTypes:{part:{control:!1},defaultOpen:{control:"boolean"},onApprove:{control:!1}},args:{part:x,defaultOpen:!1,onApprove:u()}},r={render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})},o={args:{defaultOpen:!0},render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})};var p,n,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
