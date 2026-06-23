import{j as r}from"./iframe-BbITQAD0.js";import{M as o}from"./Message-BgswOutc.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-C67fKNjI.js";import"./utils-BLSKlp9E.js";import"./Icon-BV_HrUof.js";import"./Markdown-Df2JVs4E.js";import"./ToolCall-MdjGD9tk.js";import"./button-Tq_nwknb.js";import"./index-1evVQkiP.js";import"./loading-3eAvRO6U.js";import"./CodeBlock-CjXJ674M.js";import"./JsonView-Bc4K0aEo.js";import"./code-highlight-gMz6DzC7.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-C75o46yZ.js";import"./UiCheck-Dc-rEWul.js";import"./UiClock-GFdiqaaY.js";import"./UiCircleOutline-Dv394kG0.js";import"./UiWrench-BMZRXoki.js";import"./UiChevronDown-B6dH09FW.js";import"./MessageActions-lmxaxFiB.js";import"./UiCopy-B4oai1-v.js";import"./UiRefresh-DT0eMwWf.js";import"./Reasoning-B6DWZnkV.js";import"./UiBrain-CqKXNYTT.js";import"./UiFile-B1KsZGgV.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
