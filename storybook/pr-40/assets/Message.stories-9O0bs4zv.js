import{j as r}from"./iframe-BUI_RHnX.js";import{M as o}from"./Message-B6rh6D3X.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-DweeuSg3.js";import"./utils-CR52uffu.js";import"./Icon-B3tLlLKZ.js";import"./Markdown-pTQ66PMU.js";import"./ToolCall-DlrmOVSb.js";import"./button-COWLJ6pg.js";import"./index-0zBpNI7D.js";import"./loading-Do60Rp8m.js";import"./CodeBlock-W1JQCshF.js";import"./JsonView-CO3Gb0aC.js";import"./code-highlight-Cpz0cZcy.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-CaCgZKxs.js";import"./UiCheck-DhYKpnrE.js";import"./UiClock-ByVqQxkd.js";import"./UiCircleOutline-35F7fNmB.js";import"./UiWrench-BcUL00-7.js";import"./UiChevronDown-BOFx2Z4i.js";import"./MessageActions-BhARHUE1.js";import"./UiCopy-eq0JaBN3.js";import"./UiRefresh-DylIaBgG.js";import"./Reasoning-B26y9TJx.js";import"./UiBrain-DrkT0lL3.js";import"./UiFile-BLcOuruY.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
