import{j as r}from"./iframe-C0Aur-Df.js";import{M as o}from"./Message-BncJnKvD.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-B4w--iqy.js";import"./utils-BLSKlp9E.js";import"./Icon-bcMubS04.js";import"./Markdown-D72P55Ca.js";import"./ToolCall-CtSRhwVc.js";import"./button-Csc3egge.js";import"./index-1evVQkiP.js";import"./loading-DvDd1lzh.js";import"./CodeBlock-DyxsHuia.js";import"./JsonView-VSXCfJiC.js";import"./code-highlight-Bt3LUeeQ.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-BxXYet1E.js";import"./UiCheck-DxBSpKg0.js";import"./UiClock-DKhw5zBE.js";import"./UiCircleOutline-C4-Zo97q.js";import"./UiWrench-aMaLpDD6.js";import"./UiChevronDown-CebnzLpn.js";import"./MessageActions-C-NEBd4r.js";import"./UiCopy-B5goT4eX.js";import"./UiRefresh-B33gLzzI.js";import"./Reasoning-eP9hxebR.js";import"./UiBrain-CwSqjJ_2.js";import"./UiFile-BS15cXKg.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
