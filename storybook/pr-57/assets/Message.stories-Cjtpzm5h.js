import{j as s}from"./iframe-CE7GD-h8.js";import{M as t}from"./Message-DsbKF1YN.js";import{S as l}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-DOqJbnTS.js";import"./utils-CR52uffu.js";import"./Icon-BYgNnDJy.js";import"./Markdown-5TAITTBd.js";import"./CodeBlock-CN1wJteJ.js";import"./CodeDiff-g41cXhed.js";import"./SegmentedControl-48DH_reb.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-BK9Nf3kg.js";import"./ToolCall-BmQXZkiJ.js";import"./button-Dfg9Rs1O.js";import"./index-0zBpNI7D.js";import"./loading-15Hwt9WZ.js";import"./types-B1SOX9si.js";import"./KeyValueList-Td4ZQVy5.js";import"./DataTable-Bop9K-qg.js";import"./SortableHeader-BAB4U5Ui.js";import"./Modal-CZUbhf8B.js";import"./index-IGCOwme-.js";import"./index-6cRtMSMf.js";import"./modalStack-57EfdgD-.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Dd9EalVM.js";import"./floating-ui.react-gU3tFPBH.js";import"./FilterPill-7Y-DWDmD.js";import"./Combobox-BjvKe1Jd.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DdTkh6kd.js";import"./MultiSelect-BLPs6sS7.js";import"./RangeSlider-lhOTECAK.js";import"./TimeRange-C_7NCR-V.js";import"./select-CNGRSNZC.js";import"./Timestamp-DyyiwMnA.js";import"./TagList-BgZW4-NK.js";import"./Badge-BHcCCgJC.js";import"./HoverCard-D3qpovMQ.js";import"./Properties-LS7Ju88c.js";import"./IconButton-CABk5ATW.js";import"./DropdownMenu-C35R8nCF.js";import"./DropdownMenuSubmenu-tQ6OzFem.js";import"./StatusDot-BmMmkvnL.js";import"./MessageActions-BYCpTkX0.js";import"./Reasoning-beySATcm.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],pr={title:"Chat/Message",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:a(),onApprove:a()}},r={args:{message:d},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})},e={args:{message:x},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})};var m,i,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    message: USER
  },
  render: args => <div className="max-w-2xl">
      <Message {...args} />
    </div>
}`,...(p=(i=r.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};var n,c,g;e.parameters={...e.parameters,docs:{...(n=e.parameters)==null?void 0:n.docs,source:{originalSource:`{
  args: {
    message: ASSISTANT
  },
  render: args => <div className="max-w-2xl">
      <Message {...args} />
    </div>
}`,...(g=(c=e.parameters)==null?void 0:c.docs)==null?void 0:g.source}}};const nr=["UserMessage","AssistantWithToolCall"];export{e as AssistantWithToolCall,r as UserMessage,nr as __namedExportsOrder,pr as default};
