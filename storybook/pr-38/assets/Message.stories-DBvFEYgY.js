import{j as r}from"./iframe-Ck5OBNy_.js";import{M as o}from"./Message-sb3DwQgh.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-C4wV90-x.js";import"./utils-CR52uffu.js";import"./Icon-BzT4mhZP.js";import"./Markdown-DrnMZKd-.js";import"./ToolCall-BkWrdN-5.js";import"./button-xP_Jm0t5.js";import"./index-0zBpNI7D.js";import"./loading-D5ySMDtv.js";import"./CodeBlock-B9RVAECS.js";import"./JsonView-DZJum6Nw.js";import"./code-highlight-CpKg2tYe.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-CUbotgfP.js";import"./UiCheck-Dr2gRPmf.js";import"./UiClock-DFt1ahRw.js";import"./UiCircleOutline-CKAFI-7S.js";import"./UiWrench-HvB_6Hbw.js";import"./UiChevronDown-CirG0okf.js";import"./MessageActions-m5rvUfgs.js";import"./UiCopy-BJfpAmAI.js";import"./UiRefresh-BxHME_R-.js";import"./Reasoning-DPp7Xytr.js";import"./UiBrain-CLDpnGZT.js";import"./UiFile-jqh1E0Ey.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
