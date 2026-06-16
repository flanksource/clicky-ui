import{j as r}from"./iframe-CgiBotGO.js";import{M as o}from"./Message-uNTp_ZAY.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-BZuLNX-z.js";import"./utils-BLSKlp9E.js";import"./Icon-rg52Hzgd.js";import"./Markdown-D3JumttO.js";import"./ToolCall-kdXpXDYM.js";import"./button-rIJ5OB24.js";import"./index-1evVQkiP.js";import"./loading-BR3T_nuk.js";import"./CodeBlock-Dv7R77F9.js";import"./JsonView-C6ld4qEF.js";import"./code-highlight-COaL06cM.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-92T45_k-.js";import"./UiCheck-BcPqyTZE.js";import"./UiClock-BC0zZDUm.js";import"./UiCircleOutline-A04BpNij.js";import"./UiWrench-oyeo3XOc.js";import"./UiChevronDown-DJekZ8Au.js";import"./MessageActions-BnljqV7M.js";import"./UiCopy-DSDLrxfQ.js";import"./UiRefresh-BmcmelNy.js";import"./Reasoning-CRb8IFSW.js";import"./UiBrain-DXaGvH90.js";import"./UiFile-CBulcNgF.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
