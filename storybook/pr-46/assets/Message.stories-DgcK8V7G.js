import{j as r}from"./iframe-Brz7uG0w.js";import{M as o}from"./Message-CpkdJV0N.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-CWjhL4mC.js";import"./utils-CR52uffu.js";import"./Icon-TBHX6vaP.js";import"./Markdown-CsZL-v-y.js";import"./CodeBlock-CFfHgiK1.js";import"./CodeDiff-BvVewkuk.js";import"./SegmentedControl-CT7U2uw-.js";import"./code-highlight-BFJi_bUq.js";import"./JsonView-CHUUuX2x.js";import"./ToolCall-Bq5olyFf.js";import"./button-D7cFQgQy.js";import"./index-0zBpNI7D.js";import"./loading-BMlqM7sR.js";import"./types-B1SOX9si.js";import"./MessageActions-wyacR-9v.js";import"./Reasoning-CQTmA40u.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],L={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
