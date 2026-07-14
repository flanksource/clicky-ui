import{j as r}from"./iframe-Os6uNPQC.js";import{M as o}from"./Message-BkD3UNPH.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-BdQ0w_Fr.js";import"./utils-CR52uffu.js";import"./Icon-BfCTzQnw.js";import"./Markdown-BU9wdQXq.js";import"./ToolCall-BYB9-mdy.js";import"./button-x6drXcnT.js";import"./index-0zBpNI7D.js";import"./loading-Bqgzd3q4.js";import"./CodeBlock-isDmvjKL.js";import"./JsonView-BGpfwDDe.js";import"./code-highlight-cPmm7-8Z.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-CRMZqrEB.js";import"./UiCheck-CTFp6-nW.js";import"./UiClock-CKHFkIei.js";import"./UiCircleOutline-CTUW82oG.js";import"./UiWrench-rc7_qzGC.js";import"./UiChevronDown-GtYCoqnB.js";import"./MessageActions-CPj-AJBh.js";import"./UiCopy-Dj8AJxsR.js";import"./UiRefresh-BZX8FFVJ.js";import"./Reasoning-BwnZr21x.js";import"./UiBrain-BunuQ9fE.js";import"./UiFile-CgFW8yVf.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
