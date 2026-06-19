import{j as r}from"./iframe-BiJjU2HO.js";import{M as o}from"./Message-BiGEGlbY.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-2oGg8WnX.js";import"./utils-BLSKlp9E.js";import"./Icon-DO6qyvlM.js";import"./Markdown-B0gyD_wL.js";import"./ToolCall-DxTtkoGs.js";import"./button-Bq6OtZ5-.js";import"./index-1evVQkiP.js";import"./loading-ZWjVqhnr.js";import"./CodeBlock-C392u-qc.js";import"./JsonView-DTE5YJH_.js";import"./code-highlight-CJaZvzKy.js";import"./types-CS5Tgc-R.js";import"./UiCircleX-CXSZp57M.js";import"./UiCheck-r0P984Kc.js";import"./UiClock-D7qs6oNM.js";import"./UiCircleOutline-BqkBqK-C.js";import"./UiWrench-BMu7cgEs.js";import"./UiChevronDown-e2uFe16b.js";import"./MessageActions-ohfzcqnW.js";import"./UiCopy-Bvb4O-IS.js";import"./UiRefresh-D-tlr_Hk.js";import"./Reasoning-DS2YVujB.js";import"./UiBrain-CoUn-U7b.js";import"./UiFile-DbwnLtK0.js";const{fn:t}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],P={title:"Chat/Message",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:t(),onApprove:t()}},e={args:{message:d},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})},s={args:{message:x},render:a=>r.jsx("div",{className:"max-w-2xl",children:r.jsx(o,{...a})})};var n,m,i;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
