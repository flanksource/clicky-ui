import{j as e}from"./iframe-C5-Xigqm.js";import{T as t}from"./ToolCall-BzPkwrlJ.js";import{S as c}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-BZuLNX-z.js";import"./utils-BLSKlp9E.js";import"./button-E1Q476uu.js";import"./index-1evVQkiP.js";import"./loading-DE8-iriR.js";import"./Icon-B_F1F--U.js";import"./CodeBlock-Cd9LD3As.js";import"./JsonView-DtztX9Wh.js";import"./code-highlight-COaL06cM.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-Caf0bw7c.js";import"./UiCheck-DqxKPHJi.js";import"./UiClock-DJwtIyMI.js";import"./UiCircleOutline-o54W2mFL.js";import"./UiWrench-D3Cw5pr5.js";import"./UiChevronDown-Ds2LfhvZ.js";const{fn:u}=__STORYBOOK_MODULE_TEST__;var s;const x=(s=c[1])==null?void 0:s.parts[0],P={title:"Chat/ToolCall",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, and the input args → output result. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls."}}},argTypes:{part:{control:!1},defaultOpen:{control:"boolean"},onApprove:{control:!1}},args:{part:x,defaultOpen:!1,onApprove:u()}},r={render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})},o={args:{defaultOpen:!0},render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(t,{...a})})};var p,n,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
