import{j as r}from"./iframe-arejdGqO.js";import{M as o}from"./Message-tJPcc8Pa.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-D5l2DbWZ.js";import"./utils-BLSKlp9E.js";import"./Icon-C86pXtXX.js";import"./Markdown-RvoBtKa2.js";import"./ToolCall-B7sWvHnE.js";import"./button-DXx6_iX5.js";import"./index-1evVQkiP.js";import"./loading-mRDMzzrx.js";import"./CodeBlock-BeCs6kre.js";import"./JsonView-Bh8s5VUw.js";import"./code-highlight-DzzumZyi.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-Bej6OdpR.js";import"./UiCheck-DP4n0Dhh.js";import"./UiClock-C4tEjKyh.js";import"./UiCircleOutline-rZCz1oVI.js";import"./UiWrench-DlJwKgvC.js";import"./UiChevronDown-BB4_FLML.js";import"./MessageActions-AOWZl22X.js";import"./UiCopy-Duwy_KpN.js";import"./UiRefresh-BRTHPodx.js";import"./Reasoning-CdedjnAU.js";import"./UiBrain-BU4IEQbi.js";import"./UiFile-e0u5XToK.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
