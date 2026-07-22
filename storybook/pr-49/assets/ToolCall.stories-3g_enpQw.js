import{j as o}from"./iframe-8a3mxbiL.js";import{T as s}from"./ToolCall-Cg2d74QU.js";import{S as c}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-BH-fM7Kg.js";import"./utils-CR52uffu.js";import"./button-DRmzN4zq.js";import"./index-0zBpNI7D.js";import"./loading-CTKxppdZ.js";import"./Icon-DoTJG9m4.js";import"./CodeBlock-CyYpw4im.js";import"./CodeDiff-DD54JYEE.js";import"./SegmentedControl-DdUmX-61.js";import"./code-highlight-BpkgIRXS.js";import"./JsonView-DI61V85f.js";import"./types-B1SOX9si.js";const{fn:u}=__STORYBOOK_MODULE_TEST__;var t;const x=(t=c[1])==null?void 0:t.parts[0],M={title:"Chat/ToolCall",component:s,tags:["autodocs"],parameters:{docs:{description:{component:"A collapsible panel for one assistant tool call (typed or dynamic): the tool name, a status chip, and the input args → output result. When the call is in `approval-requested` state, `onApprove` wires the approve/deny controls."}}},argTypes:{part:{control:!1},defaultOpen:{control:"boolean"},onApprove:{control:!1}},args:{part:x,defaultOpen:!1,onApprove:u()}},e={render:a=>o.jsx("div",{className:"max-w-2xl",children:o.jsx(s,{...a})})},r={args:{defaultOpen:!0},render:a=>o.jsx("div",{className:"max-w-2xl",children:o.jsx(s,{...a})})};var p,n,l;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
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
