import{j as r}from"./iframe-QA7Jz26Z.js";import{M as o}from"./Message-DWM6mD6w.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-CLp6iKya.js";import"./utils-CR52uffu.js";import"./Icon-BlQl19kd.js";import"./Markdown-EpPh8LTy.js";import"./CodeBlock-BxM9OG9H.js";import"./CodeDiff-1HW7T_KG.js";import"./SegmentedControl-DE5sxb3k.js";import"./code-highlight-DmoBPuv7.js";import"./JsonView-BgGtl1T4.js";import"./ToolCall-DN7vGpWO.js";import"./button-DWVdGjlr.js";import"./index-0zBpNI7D.js";import"./loading-B2I4S6H9.js";import"./types-B1SOX9si.js";import"./MessageActions-ClAKMHAW.js";import"./Reasoning-NeVQaOLu.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],L={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
