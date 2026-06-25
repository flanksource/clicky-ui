import{j as r}from"./iframe-BO3XiECZ.js";import{M as o}from"./Message-Dv05BmHl.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-B2wK-Kjy.js";import"./utils-BLSKlp9E.js";import"./Icon-GruNqjyl.js";import"./Markdown-CJqHE9j0.js";import"./ToolCall-BNlbtuCA.js";import"./button-D09c44qg.js";import"./index-1evVQkiP.js";import"./loading-DKpQqMGf.js";import"./CodeBlock-BHEAp_Sy.js";import"./JsonView-BjBUOmIJ.js";import"./code-highlight-BWXEN8UU.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-GIsHmrSF.js";import"./UiCheck-ODqHhldT.js";import"./UiClock-BaSWU1WN.js";import"./UiCircleOutline-C58hwlV-.js";import"./UiWrench-CdlSyWfZ.js";import"./UiChevronDown-CmLEZyD7.js";import"./MessageActions-BNziwP74.js";import"./UiCopy-CbLhyTSt.js";import"./UiRefresh-xkaxisuK.js";import"./Reasoning-Bm0oDVkY.js";import"./UiBrain-CLd81Szs.js";import"./UiFile-cnMbWtzA.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
