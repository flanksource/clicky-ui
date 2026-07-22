import{j as r}from"./iframe-Bv6gAHUq.js";import{M as o}from"./Message-BrBXrEIx.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-B0hK8ODC.js";import"./utils-CR52uffu.js";import"./Icon-CE_TMgWG.js";import"./Markdown-Cx5yiTgz.js";import"./CodeBlock-DgCqiVEU.js";import"./CodeDiff-CBoMXOST.js";import"./SegmentedControl-CpEjE6Dg.js";import"./code-highlight-DTvn2rNL.js";import"./JsonView-BmNa_f8t.js";import"./ToolCall-DCDz5XoF.js";import"./button-CsEq_IVC.js";import"./index-0zBpNI7D.js";import"./loading-B6_ukMCj.js";import"./types-B1SOX9si.js";import"./MessageActions-BDPdK8cm.js";import"./Reasoning-Bf9Dg3bM.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],L={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
