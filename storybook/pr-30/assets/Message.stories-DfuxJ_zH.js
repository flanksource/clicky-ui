import{j as r}from"./iframe-DLWo_D3a.js";import{M as o}from"./Message-DzdPvs-A.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-D5l2DbWZ.js";import"./utils-BLSKlp9E.js";import"./Icon-DgfT7ULk.js";import"./Markdown-DCFUl30H.js";import"./ToolCall-BSWQme2Q.js";import"./button-lAmiuTiA.js";import"./index-1evVQkiP.js";import"./loading-Cddz8UD2.js";import"./CodeBlock-18ws4pr5.js";import"./JsonView-C6cEe_kH.js";import"./code-highlight-DzzumZyi.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-unxmaLxG.js";import"./UiCheck-BqyrKFDU.js";import"./UiClock-CF_AVV7E.js";import"./UiCircleOutline-DHVOq02n.js";import"./UiWrench-CrMlTAH4.js";import"./UiChevronDown-DxkvxAMd.js";import"./MessageActions-eMOfXEB7.js";import"./UiCopy-DWsnM1bJ.js";import"./UiRefresh-Br1KLBtS.js";import"./Reasoning-DWMTl4OT.js";import"./UiBrain-C1ViSTLk.js";import"./UiFile-BuxIFsWM.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
