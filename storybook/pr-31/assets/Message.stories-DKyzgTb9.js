import{j as r}from"./iframe-CmW1bXIL.js";import{M as o}from"./Message-D74MLhnx.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-ByUaG9M2.js";import"./utils-BLSKlp9E.js";import"./Icon-DgKWNfUH.js";import"./Markdown-CGWbiHNh.js";import"./ToolCall-C2Gy13TL.js";import"./button-Cbf2D1Lj.js";import"./index-1evVQkiP.js";import"./loading-BzXaTpRU.js";import"./CodeBlock-BfTp8hI-.js";import"./JsonView-1BfW0HLV.js";import"./code-highlight-vj-DXbl2.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-Bz0-Ri6c.js";import"./UiCheck-D6M7xpTV.js";import"./UiClock-BevTmcr1.js";import"./UiCircleOutline-JwmEzgTF.js";import"./UiWrench-B_ESgGc-.js";import"./UiChevronDown-DNI0luU1.js";import"./MessageActions-C-mOp5JW.js";import"./UiCopy-52ldaFhT.js";import"./UiRefresh-BE0EMPXO.js";import"./Reasoning-CwgGWG2o.js";import"./UiBrain-B9R9993g.js";import"./UiFile-C9Ja6r-b.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
