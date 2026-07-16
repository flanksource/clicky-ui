import{j as o}from"./iframe-Bgk3VXOW.js";import{T as s}from"./ToolCall-HNqenusO.js";import{S as c}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-Bf5WtrwG.js";import"./utils-CR52uffu.js";import"./button-Do2TfxzH.js";import"./index-0zBpNI7D.js";import"./loading-Ca_u5eab.js";import"./Icon-CrjeG2Lq.js";import"./CodeBlock-SUrPfG3E.js";import"./CodeDiff-C-sUsV8G.js";import"./SegmentedControl-DeKftUCP.js";import"./code-highlight-CeGq7v9V.js";import"./JsonView-DyE7XmzB.js";import"./types-B1SOX9si.js";const{fn:u}=__STORYBOOK_MODULE_TEST__;var t;const x=(t=c[1])==null?void 0:t.parts[0],M={title:"Chat/ToolCall",component:s,tags:["autodocs"],parameters:{docs:{description:{component:"A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, and the input args → output result. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls."}}},argTypes:{part:{control:!1},defaultOpen:{control:"boolean"},onApprove:{control:!1}},args:{part:x,defaultOpen:!1,onApprove:u()}},e={render:a=>o.jsx("div",{className:"max-w-2xl",children:o.jsx(s,{...a})})},r={args:{defaultOpen:!0},render:a=>o.jsx("div",{className:"max-w-2xl",children:o.jsx(s,{...a})})};var p,n,l;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <ToolCall {...args} />
    </div>
}`,...(l=(n=e.parameters)==null?void 0:n.docs)==null?void 0:l.source}}};var m,d,i;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    defaultOpen: true
  },
  render: args => <div className="max-w-2xl">
      <ToolCall {...args} />
    </div>
}`,...(i=(d=r.parameters)==null?void 0:d.docs)==null?void 0:i.source}}};const N=["Collapsed","Expanded"];export{e as Collapsed,r as Expanded,N as __namedExportsOrder,M as default};
