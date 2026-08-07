import{j as s}from"./iframe-D67R8bbl.js";import{M as t}from"./Message-B4HvrRB9.js";import{S as l}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-DOqJbnTS.js";import"./utils-CR52uffu.js";import"./Icon-00lqZtC6.js";import"./Markdown-DP57NP4W.js";import"./CodeBlock-CPSY-gS6.js";import"./CodeDiff-TZc5ReZ3.js";import"./SegmentedControl-CXLCk4s0.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-BbHOU84J.js";import"./ToolCall-BWSaXNv9.js";import"./button-B2bNDku0.js";import"./index-0zBpNI7D.js";import"./loading-DP1-eLX0.js";import"./types-B1SOX9si.js";import"./KeyValueList-DRwcurNS.js";import"./DataTable-CaeoLlDX.js";import"./SortableHeader-DxNelsAH.js";import"./Modal-1Le8WqYW.js";import"./index-C_dsp8ua.js";import"./index-oLIJbLP-.js";import"./modalStack-C9QH0czZ.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-Duk6_79F.js";import"./floating-ui.react-BtRXUcG_.js";import"./FilterPill-sHOUOS6w.js";import"./Combobox-CeAjpFOD.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-kTuYkj_o.js";import"./MultiSelect-KOsHntV-.js";import"./RangeSlider-D2ibsQzf.js";import"./TimeRange-Ab17F-yg.js";import"./select-CdiVheQc.js";import"./Timestamp-D-NcJsOp.js";import"./TagList-9QOGAv__.js";import"./Badge-CHwM5g8P.js";import"./HoverCard-CmT1a-0w.js";import"./Properties-CtT3PEHb.js";import"./IconButton-BuzR3ewI.js";import"./DropdownMenu-CDTUpdji.js";import"./DropdownMenuSubmenu-2o-p-5ar.js";import"./StatusDot-B10hZu0f.js";import"./MessageActions-bA9Mxdox.js";import"./Reasoning-C2zAAhwf.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],pr={title:"Chat/Message",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:a(),onApprove:a()}},r={args:{message:d},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})},e={args:{message:x},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})};var m,i,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
