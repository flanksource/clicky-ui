import{j as r}from"./iframe-tozGD2Qm.js";import{M as o}from"./Message-DVopChSg.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-DMBmwiZ1.js";import"./utils-BLSKlp9E.js";import"./Icon-DV6apHHG.js";import"./Markdown-B8BhzoRx.js";import"./ToolCall-B5x5oy36.js";import"./button-BYIHgtoG.js";import"./index-1evVQkiP.js";import"./loading-B_J6UqsB.js";import"./CodeBlock-_BSfZ0Fh.js";import"./JsonView-BdmDNAWj.js";import"./code-highlight-DOLUZiqQ.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-BjLC1iXL.js";import"./UiCheck-C56O4kNi.js";import"./UiClock-B9VNE47u.js";import"./UiCircleOutline-BTlFuWB4.js";import"./UiWrench-DFOyaFIr.js";import"./UiChevronDown-CG_aM3Ba.js";import"./MessageActions-Bh9gGkuf.js";import"./UiCopy-BRNqKBow.js";import"./UiRefresh-CXCDfVTl.js";import"./Reasoning-CemteaKk.js";import"./UiBrain-BNy3ZH-k.js";import"./UiFile-CZKuwhMX.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
