import{j as r}from"./iframe-0bc176G1.js";import{M as o}from"./Message-BOytTYOv.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-D-2WW-AN.js";import"./utils-CR52uffu.js";import"./Icon-LDnLk-Ec.js";import"./Markdown-Cr2z0TwY.js";import"./ToolCall-BcHPe3mU.js";import"./button-CYgJK2Rk.js";import"./index-0zBpNI7D.js";import"./loading-CJdteYdy.js";import"./CodeBlock-CQO-eBku.js";import"./JsonView-aDtMPjPr.js";import"./code-highlight-xUBeaIqO.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-DNv1yPkW.js";import"./UiCheck-B-D4Byul.js";import"./UiClock-Ba4qI8wk.js";import"./UiCircleOutline-DGHilfTD.js";import"./UiWrench-CNwzm9L-.js";import"./UiChevronDown-BuIn1m3V.js";import"./MessageActions-TRR836gZ.js";import"./UiCopy-bzWB7UWA.js";import"./UiRefresh-BFI9U_5W.js";import"./Reasoning-B8xwkqoo.js";import"./UiBrain-tQYsOu_F.js";import"./UiFile-DyRdd6Gk.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
