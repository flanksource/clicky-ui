import{j as r}from"./iframe-D5a9zzxb.js";import{M as o}from"./Message-CoJQfkuO.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-D5l2DbWZ.js";import"./utils-BLSKlp9E.js";import"./Icon-BWpUElqS.js";import"./Markdown-3Wry0ckn.js";import"./ToolCall-BY85Jygp.js";import"./button-Bu96Zmyu.js";import"./index-1evVQkiP.js";import"./loading-C4NUXH3t.js";import"./CodeBlock-DnoU1zci.js";import"./JsonView-DdbNt3SD.js";import"./code-highlight-DzzumZyi.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-CBRqvDCP.js";import"./UiCheck-DiisalZF.js";import"./UiClock-D9LoG9Lv.js";import"./UiCircleOutline-Cpjjp92h.js";import"./UiWrench-BCyhxJX6.js";import"./UiChevronDown-Bo5FXyFP.js";import"./MessageActions-ClvbXeGK.js";import"./UiCopy-Cc1SFRqt.js";import"./UiRefresh-BnQQXBxv.js";import"./Reasoning-BQtd6rkT.js";import"./UiBrain-BnhEKL2N.js";import"./UiFile-DE04nOc5.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
