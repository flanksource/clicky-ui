import{j as r}from"./iframe-BNCeWgcu.js";import{M as o}from"./Message-BVEFECqS.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-bXXPlA_x.js";import"./utils-CR52uffu.js";import"./Icon-BG-3MSKK.js";import"./Markdown-Boy8cDlS.js";import"./CodeBlock-DqUnA8Xg.js";import"./CodeDiff-CfCsFqZz.js";import"./SegmentedControl-CtpPh8Tw.js";import"./code-highlight-CMJcRcOY.js";import"./JsonView-B1OjRm7w.js";import"./ToolCall-Cu_6Qe4f.js";import"./button-D5bd58An.js";import"./index-0zBpNI7D.js";import"./loading-rjHsK5dJ.js";import"./types-B1SOX9si.js";import"./MessageActions-vla5LVeP.js";import"./Reasoning-tEgZH3gE.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],L={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
