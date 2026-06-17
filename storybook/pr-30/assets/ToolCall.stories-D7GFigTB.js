import{j as e}from"./iframe-D5a9zzxb.js";import{T as t}from"./ToolCall-BY85Jygp.js";import{S as c}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-D5l2DbWZ.js";import"./utils-BLSKlp9E.js";import"./button-Bu96Zmyu.js";import"./index-1evVQkiP.js";import"./loading-C4NUXH3t.js";import"./Icon-BWpUElqS.js";import"./CodeBlock-DnoU1zci.js";import"./JsonView-DdbNt3SD.js";import"./code-highlight-DzzumZyi.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-CBRqvDCP.js";import"./UiCheck-DiisalZF.js";import"./UiClock-D9LoG9Lv.js";import"./UiCircleOutline-Cpjjp92h.js";import"./UiWrench-BCyhxJX6.js";import"./UiChevronDown-Bo5FXyFP.js";const{fn:u}=__STORYBOOK_MODULE_TEST__;var s;const x=(s=c[1])==null?void 0:s.parts[0],P={title:"Chat/ToolCall",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, and the input args → output result. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls."}}},argTypes:{part:{control:!1},defaultOpen:{control:"boolean"},onApprove:{control:!1}},args:{part:x,defaultOpen:!1,onApprove:u()}},r={render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})},o={args:{defaultOpen:!0},render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})};var p,n,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
