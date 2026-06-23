import{j as r}from"./iframe-Ch1BYoLl.js";import{M as o}from"./Message-CPZPhLwa.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-B4w--iqy.js";import"./utils-BLSKlp9E.js";import"./Icon-CajlMFHd.js";import"./Markdown-B5zuGtyt.js";import"./ToolCall-B68h9HXc.js";import"./button-C_7HN6uA.js";import"./index-1evVQkiP.js";import"./loading-D4VpgK2W.js";import"./CodeBlock-B7i8gWgP.js";import"./JsonView-X-8xFHxN.js";import"./code-highlight-Bt3LUeeQ.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-BP83AZFD.js";import"./UiCheck-D5P45Pjn.js";import"./UiClock-Cx0sPffy.js";import"./UiCircleOutline-DQwwza9M.js";import"./UiWrench-CE7vYdzh.js";import"./UiChevronDown-Cr-fH5xI.js";import"./MessageActions-f8lrXfpf.js";import"./UiCopy-BwK3a7DB.js";import"./UiRefresh-D6f_TnHG.js";import"./Reasoning-D9nnlvFM.js";import"./UiBrain-BtHN4JpL.js";import"./UiFile-DYHMMa2X.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
