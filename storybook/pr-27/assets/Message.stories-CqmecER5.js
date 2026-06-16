import{j as r}from"./iframe-C5-Xigqm.js";import{M as o}from"./Message-6f1aSf0m.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-BZuLNX-z.js";import"./utils-BLSKlp9E.js";import"./Icon-B_F1F--U.js";import"./Markdown-CTEu5UTp.js";import"./ToolCall-BzPkwrlJ.js";import"./button-E1Q476uu.js";import"./index-1evVQkiP.js";import"./loading-DE8-iriR.js";import"./CodeBlock-Cd9LD3As.js";import"./JsonView-DtztX9Wh.js";import"./code-highlight-COaL06cM.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-Caf0bw7c.js";import"./UiCheck-DqxKPHJi.js";import"./UiClock-DJwtIyMI.js";import"./UiCircleOutline-o54W2mFL.js";import"./UiWrench-D3Cw5pr5.js";import"./UiChevronDown-Ds2LfhvZ.js";import"./MessageActions-Cen4XRdo.js";import"./UiCopy-FQ47u4mQ.js";import"./UiRefresh-0fC8G_LN.js";import"./Reasoning-B5e8u1z5.js";import"./UiBrain-Dav4OZbU.js";import"./UiFile-DsZToOYK.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
