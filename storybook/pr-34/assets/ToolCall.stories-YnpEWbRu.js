import{j as e}from"./iframe-C0Aur-Df.js";import{T as t}from"./ToolCall-CtSRhwVc.js";import{S as c}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-B4w--iqy.js";import"./utils-BLSKlp9E.js";import"./button-Csc3egge.js";import"./index-1evVQkiP.js";import"./loading-DvDd1lzh.js";import"./Icon-bcMubS04.js";import"./CodeBlock-DyxsHuia.js";import"./JsonView-VSXCfJiC.js";import"./code-highlight-Bt3LUeeQ.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-BxXYet1E.js";import"./UiCheck-DxBSpKg0.js";import"./UiClock-DKhw5zBE.js";import"./UiCircleOutline-C4-Zo97q.js";import"./UiWrench-aMaLpDD6.js";import"./UiChevronDown-CebnzLpn.js";const{fn:u}=__STORYBOOK_MODULE_TEST__;var s;const x=(s=c[1])==null?void 0:s.parts[0],P={title:"Chat/ToolCall",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, and the input args → output result. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls."}}},argTypes:{part:{control:!1},defaultOpen:{control:"boolean"},onApprove:{control:!1}},args:{part:x,defaultOpen:!1,onApprove:u()}},r={render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})},o={args:{defaultOpen:!0},render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})};var p,n,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
