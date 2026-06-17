import{j as r}from"./iframe-Cbvd77G_.js";import{M as o}from"./Message-4XGHzhWD.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-BqxgWdQg.js";import"./utils-BLSKlp9E.js";import"./Icon-BFW8T_Wy.js";import"./Markdown-Cf3i2e5Q.js";import"./ToolCall-DPo-J97l.js";import"./button-BynkVuMx.js";import"./index-1evVQkiP.js";import"./loading-DWhMudIi.js";import"./CodeBlock-BY1UFq8C.js";import"./JsonView-Be8vvopU.js";import"./code-highlight-Bv7t3kgs.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-BUCQXIRH.js";import"./UiCheck-SgeGLdYC.js";import"./UiClock-CvYqL_PX.js";import"./UiCircleOutline-xJpPXx6A.js";import"./UiWrench-DFbZYToV.js";import"./UiChevronDown-biMgqLPN.js";import"./MessageActions-D7q3Yy5S.js";import"./UiCopy-DnIsSnWN.js";import"./UiRefresh-kR4jRvRp.js";import"./Reasoning-B_15v6a6.js";import"./UiBrain-B47QcIP_.js";import"./UiFile-RK-_DizX.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
