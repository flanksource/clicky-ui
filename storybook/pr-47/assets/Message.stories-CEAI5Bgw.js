import{j as r}from"./iframe-Bgk3VXOW.js";import{M as o}from"./Message-SyuKsP6S.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-Bf5WtrwG.js";import"./utils-CR52uffu.js";import"./Icon-CrjeG2Lq.js";import"./Markdown-K_2Qx07r.js";import"./CodeBlock-SUrPfG3E.js";import"./CodeDiff-C-sUsV8G.js";import"./SegmentedControl-DeKftUCP.js";import"./code-highlight-CeGq7v9V.js";import"./JsonView-DyE7XmzB.js";import"./ToolCall-HNqenusO.js";import"./button-Do2TfxzH.js";import"./index-0zBpNI7D.js";import"./loading-Ca_u5eab.js";import"./types-B1SOX9si.js";import"./MessageActions-CARzTA1k.js";import"./Reasoning-DlIPlLuh.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],L={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    message: USER
  },
  render: args => <div className="max-w-2xl">
      <Message {...args} />
    </div>
}`,...(i=(m=e.parameters)==null?void 0:m.docs)==null?void 0:i.source}}};var p,c,g;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    message: ASSISTANT
  },
  render: args => <div className="max-w-2xl">
      <Message {...args} />
    </div>
}`,...(g=(c=s.parameters)==null?void 0:c.docs)==null?void 0:g.source}}};const y=["UserMessage","AssistantWithToolCall"];export{s as AssistantWithToolCall,e as UserMessage,y as __namedExportsOrder,L as default};
