import{j as r}from"./iframe-BxLPOr6M.js";import{M as o}from"./Message-cf2Isxk8.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-C4wV90-x.js";import"./utils-CR52uffu.js";import"./Icon-DGql8Ler.js";import"./Markdown-pQUSvybH.js";import"./ToolCall-BUSuRhzJ.js";import"./button-CcdgmEp6.js";import"./index-0zBpNI7D.js";import"./loading-C28S_Ccf.js";import"./CodeBlock-DuyIK4wF.js";import"./JsonView-DFRIAMDC.js";import"./code-highlight-CpKg2tYe.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-BKoHmyGU.js";import"./UiCheck-DcO0ZANr.js";import"./UiClock-DhXPh8Di.js";import"./UiCircleOutline-6qOjEOE4.js";import"./UiWrench-C4ZkzXrC.js";import"./UiChevronDown-BxzZdAmx.js";import"./MessageActions-Bft1hU3_.js";import"./UiCopy-DlhnPK4p.js";import"./UiRefresh-DNfh6sZR.js";import"./Reasoning-YJGJp5RY.js";import"./UiBrain-DpO7vBSR.js";import"./UiFile-6iLovC-E.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
