import{j as r}from"./iframe-BQHWjYXO.js";import{M as o}from"./Message-JXXrCdGe.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-NECxGHhd.js";import"./utils-CR52uffu.js";import"./Icon-DqVmIZAK.js";import"./Markdown-DPg3HBu6.js";import"./CodeBlock-DPyDzznt.js";import"./CodeDiff-CVr8sbI2.js";import"./SegmentedControl-DKiFPaCK.js";import"./code-highlight-Btxs0MAv.js";import"./JsonView-BsfgZLD9.js";import"./ToolCall-v6HCfMNC.js";import"./button-CAHLihQQ.js";import"./index-0zBpNI7D.js";import"./loading-CVssmfQF.js";import"./types-B1SOX9si.js";import"./MessageActions-C5izP_rL.js";import"./Reasoning-DYT9Tcl7.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],L={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
