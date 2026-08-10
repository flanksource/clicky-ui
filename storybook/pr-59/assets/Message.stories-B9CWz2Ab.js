import{j as s}from"./iframe-Dd752MYf.js";import{M as t}from"./Message-BodnwYdR.js";import{S as l}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-B2LPdJL4.js";import"./utils-CR52uffu.js";import"./Icon-9CMiNgil.js";import"./Markdown-BnV_nlGW.js";import"./CodeBlock-DJn6wlWo.js";import"./CodeDiff-uian-6aN.js";import"./SegmentedControl-BKbAH4_-.js";import"./code-highlight-Dq2IweCb.js";import"./JsonView-DIJ3Gg6E.js";import"./ToolCall-Dyf9Mpaw.js";import"./button-oBk_H1Zb.js";import"./index-0zBpNI7D.js";import"./loading-Cf-BAp-_.js";import"./types-B1SOX9si.js";import"./KeyValueList-CZweGGiT.js";import"./DataTable-BZKk4EL7.js";import"./SortableHeader-gr8hzJGg.js";import"./Modal-BSuZsloP.js";import"./index-DIEIIbJ9.js";import"./index-DUsaV9HH.js";import"./modalStack-Bx1u-msU.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-fOx97ty3.js";import"./floating-ui.react-BkDfFHxo.js";import"./FilterPill-BW2EVU2l.js";import"./Combobox-DkmILrX4.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-69bNTbeH.js";import"./MultiSelect-DnpVH0A0.js";import"./RangeSlider-D_8GqZjC.js";import"./TimeRange-ChFkp1Al.js";import"./select-Ddx3qY70.js";import"./Timestamp-CcW3ak_D.js";import"./TagList-D3gW21JY.js";import"./Badge-B3qsnIIF.js";import"./HoverCard-Crti9dY4.js";import"./Properties-BDD0BLQa.js";import"./IconButton-C1pNAZbT.js";import"./DropdownMenu-ERsj2HNy.js";import"./DropdownMenuSubmenu-U-7b-fg3.js";import"./StatusDot-CcgQ-eNO.js";import"./MessageActions-DGiO_CBx.js";import"./Reasoning-DkOwsQ3R.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],pr={title:"Chat/Message",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:a(),onApprove:a()}},r={args:{message:d},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})},e={args:{message:x},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})};var m,i,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
