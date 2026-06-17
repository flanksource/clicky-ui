import{j as r}from"./iframe-DIPFVygJ.js";import{M as o}from"./Message-9N1tgXtG.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-D5l2DbWZ.js";import"./utils-BLSKlp9E.js";import"./Icon-GGxX1w_8.js";import"./Markdown-D4sIZdcH.js";import"./ToolCall-fdeFyKnW.js";import"./button-CQO1VsE8.js";import"./index-1evVQkiP.js";import"./loading-CYQBqqDz.js";import"./CodeBlock-C1TiZVDe.js";import"./JsonView-D-9fHP5w.js";import"./code-highlight-DzzumZyi.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-DHYAqyYv.js";import"./UiCheck-b4szA2d9.js";import"./UiClock-Bc7eRqM8.js";import"./UiCircleOutline-CJdTFn4q.js";import"./UiWrench-CGtQDxPE.js";import"./UiChevronDown-DNTWC3NQ.js";import"./MessageActions-CMEjpBmS.js";import"./UiCopy-DoJr9st_.js";import"./UiRefresh-gX0xt3Lm.js";import"./Reasoning-B97tBAE7.js";import"./UiBrain-Dy3UoaqE.js";import"./UiFile-BnSC_TOm.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
