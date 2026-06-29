import{j as r}from"./iframe-C9yFQwwi.js";import{M as o}from"./Message-Bugp7Plm.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-C4wV90-x.js";import"./utils-CR52uffu.js";import"./Icon-CPfok5dB.js";import"./Markdown-CqeXD9m1.js";import"./ToolCall-CbDk1mQ6.js";import"./button-BUPOCWxe.js";import"./index-0zBpNI7D.js";import"./loading-D91fUsXC.js";import"./CodeBlock-Ln6x9UKe.js";import"./JsonView-BXR92lx8.js";import"./code-highlight-CpKg2tYe.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-s3phh0P6.js";import"./UiCheck-CqtlcYfS.js";import"./UiClock-DyDppmNG.js";import"./UiCircleOutline-ejiP5sf_.js";import"./UiWrench-B2Uq9wmq.js";import"./UiChevronDown-BF9Z2jpX.js";import"./MessageActions-DzMxgC3e.js";import"./UiCopy-CT3ZdT7z.js";import"./UiRefresh-DCQ9s8ix.js";import"./Reasoning-D0p0nGov.js";import"./UiBrain-B12IAqGz.js";import"./UiFile-BPMUUZbq.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
}`,...(g=(c=s.parameters)==null?void 0:c.docs)==null?void 0:g.source}}};const Y=["UserMessage","AssistantWithToolCall"];export{s as AssistantWithToolCall,e as UserMessage,Y as __namedExportsOrder,P as default};
