import{j as r}from"./iframe-DZjrDtfA.js";import{M as o}from"./Message-C2eA4qps.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-Oo3FbLQe.js";import"./utils-CR52uffu.js";import"./Icon-Bsqx4eJf.js";import"./Markdown-CPF50UKv.js";import"./CodeBlock-DhO3O6GM.js";import"./CodeDiff-KiY1tsQP.js";import"./SegmentedControl-BPu017dM.js";import"./code-highlight-_bSslaKA.js";import"./JsonView-2jImuBaZ.js";import"./ToolCall-BlmHxrlk.js";import"./button-DQWpMsGM.js";import"./index-0zBpNI7D.js";import"./loading-a5_GCoqM.js";import"./types-B1SOX9si.js";import"./MessageActions-Cwnr-qXV.js";import"./Reasoning-DxqyjsgV.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],L={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
