import{j as s}from"./iframe-B_YORxVu.js";import{M as t}from"./Message-BPQEolPS.js";import{S as l}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-DOqJbnTS.js";import"./utils-CR52uffu.js";import"./Icon-DjLJbeXf.js";import"./Markdown-BGVZR5ZR.js";import"./CodeBlock-VZZhQhuK.js";import"./CodeDiff-ByzIf6rH.js";import"./SegmentedControl-z8ZDC1ID.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-CppafzCm.js";import"./ToolCall-D1KUHrtI.js";import"./button-D9BhcXI8.js";import"./index-0zBpNI7D.js";import"./loading-pMtHz37B.js";import"./types-B1SOX9si.js";import"./KeyValueList-BzWWoVCF.js";import"./DataTable-BDsHfnxq.js";import"./SortableHeader-CFXjVj_q.js";import"./Modal-B4OsKOmd.js";import"./index-CfE1U_s6.js";import"./index-BRenbefL.js";import"./modalStack-BJ_GGWUZ.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CIa5SyUw.js";import"./floating-ui.react-D-fTvToP.js";import"./FilterPill-qyCKSkER.js";import"./Combobox-C5z8LI3F.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BrMfJRCo.js";import"./MultiSelect-CJH1iNcX.js";import"./RangeSlider-BPoIjqNZ.js";import"./TimeRange-D_FelsTz.js";import"./select-BZpvsKD3.js";import"./Timestamp-D9jIvOD8.js";import"./TagList-DucigsZz.js";import"./Badge-Dxm4rhu4.js";import"./HoverCard-4dx96xWm.js";import"./Properties-i__Vk37o.js";import"./IconButton-CqoUdsEZ.js";import"./DropdownMenu-DUc74WUd.js";import"./DropdownMenuSubmenu-D4jsPGhx.js";import"./StatusDot-DWnztYc-.js";import"./MessageActions-C7lSKbrm.js";import"./Reasoning-CBS-GKKX.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],pr={title:"Chat/Message",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:a(),onApprove:a()}},r={args:{message:d},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})},e={args:{message:x},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})};var m,i,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
