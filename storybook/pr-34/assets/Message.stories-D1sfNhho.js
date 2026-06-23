import{j as r}from"./iframe-B-R1GM9F.js";import{M as o}from"./Message-BIU7mLDe.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-B4w--iqy.js";import"./utils-BLSKlp9E.js";import"./Icon-GOgSuK4c.js";import"./Markdown-C3_vaXhD.js";import"./ToolCall-D5OpxL1j.js";import"./button-BuoaacKd.js";import"./index-1evVQkiP.js";import"./loading-BCTdXuAj.js";import"./CodeBlock-DqZJwvDF.js";import"./JsonView-D1yOhbs5.js";import"./code-highlight-Bt3LUeeQ.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-DsSkyAex.js";import"./UiCheck-BThsfaV8.js";import"./UiClock-CyrGdT6i.js";import"./UiCircleOutline-CLUoU8BD.js";import"./UiWrench-suRC0RZ5.js";import"./UiChevronDown-7vVXchWm.js";import"./MessageActions-Dxxeng4f.js";import"./UiCopy-Byj5yeWV.js";import"./UiRefresh-BClarp0C.js";import"./Reasoning-rxnj38Jf.js";import"./UiBrain-DaSQhq_P.js";import"./UiFile-DGnnWyZ8.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
