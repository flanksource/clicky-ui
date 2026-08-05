import{j as s}from"./iframe-DBr7zNeS.js";import{M as t}from"./Message-CHGnicD6.js";import{S as l}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-DOqJbnTS.js";import"./utils-CR52uffu.js";import"./Icon-BJt4CZDw.js";import"./Markdown-D9lGajzA.js";import"./CodeBlock-CYMDJQRj.js";import"./CodeDiff-CU74KV1I.js";import"./SegmentedControl-BUfs-Zk7.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-abkuV3YG.js";import"./ToolCall-DmIpAkUt.js";import"./button--5fQhbPU.js";import"./index-0zBpNI7D.js";import"./loading-BPm7-hB-.js";import"./types-B1SOX9si.js";import"./KeyValueList-BBC0PQP5.js";import"./DataTable-B2m3n0es.js";import"./SortableHeader-DM8CAR9h.js";import"./Modal-BzNkJxbb.js";import"./index-DBE-7TL_.js";import"./index-C-JF4fJV.js";import"./modalStack-C6iTnFFa.js";import"./zIndex-CigQ76av.js";import"./FilterBar-BHnbvGY6.js";import"./floating-ui.react-BCE0IOJT.js";import"./FilterPill-WxwJ1QL9.js";import"./Combobox-DTB8HFTN.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-qAZFKFT2.js";import"./MultiSelect-ByU1bG3I.js";import"./RangeSlider-KloiZnQb.js";import"./TimeRange-gf_40WHB.js";import"./select-DAheWgSH.js";import"./Timestamp-B5T8MNEq.js";import"./TagList-CZ1MPPmD.js";import"./Badge-F5qv-XWB.js";import"./HoverCard-CZ0fVunH.js";import"./Properties-Bi0j1f_B.js";import"./IconButton-DlLMtFGc.js";import"./DropdownMenu-QeSunhD0.js";import"./DropdownMenuSubmenu-XC3IPjqo.js";import"./StatusDot-CM0lad9X.js";import"./MessageActions-BS5qLsdz.js";import"./Reasoning-28Os1Xj7.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],pr={title:"Chat/Message",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:a(),onApprove:a()}},r={args:{message:d},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})},e={args:{message:x},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})};var m,i,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
