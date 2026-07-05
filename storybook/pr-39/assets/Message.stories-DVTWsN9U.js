import{j as r}from"./iframe-C96xZIdp.js";import{M as o}from"./Message-DBcby3cD.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-Bg6xcDEu.js";import"./utils-CR52uffu.js";import"./Icon-DVJMtl2F.js";import"./Markdown-Ddv4o94c.js";import"./ToolCall-CVX4OL-d.js";import"./button-CQ2Ni0n1.js";import"./index-0zBpNI7D.js";import"./loading-2G2O_q61.js";import"./CodeBlock-2bG6zm5g.js";import"./JsonView-BsucjRFS.js";import"./code-highlight-CQkTewJY.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-BtjbQfAi.js";import"./UiCheck-CIVB-pM_.js";import"./UiClock-QtT1Ez-g.js";import"./UiCircleOutline-DnuF5nWL.js";import"./UiWrench-CxvUyF1z.js";import"./UiChevronDown-C4iQdycK.js";import"./MessageActions-D4i8nOS4.js";import"./UiCopy-BkUycqZA.js";import"./UiRefresh-CO48Rb5l.js";import"./Reasoning-DWV02zgc.js";import"./UiBrain-DfozCQTy.js";import"./UiFile-BfJOCzm8.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
