import{j as s}from"./iframe-B4Jlte7j.js";import{M as t}from"./Message-DpOSjQ-W.js";import{S as l}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-DEXbRKRX.js";import"./utils-CR52uffu.js";import"./Icon-CmsFmOUo.js";import"./Markdown-BtfsVzNE.js";import"./CodeBlock-DckRFgZF.js";import"./CodeDiff-BMTxEEVV.js";import"./SegmentedControl-DJgeaIPA.js";import"./code-highlight--PIzQ-Ck.js";import"./JsonView-ClRMHfyU.js";import"./ToolCall-CNiuTaLh.js";import"./button-Cz-uT3Xg.js";import"./index-0zBpNI7D.js";import"./loading-DeD_1Din.js";import"./types-B1SOX9si.js";import"./KeyValueList-CasJl2U3.js";import"./DataTable-DHtOPi1X.js";import"./SortableHeader-DK25xte0.js";import"./Modal-DmjECvH_.js";import"./index-pMrG7UvS.js";import"./index-DVtcdygO.js";import"./modalStack-rtvhmXFS.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CvtXpTid.js";import"./floating-ui.react-C3GZwCXD.js";import"./FilterPill-xBbW0bsO.js";import"./Combobox-s1oGg2-B.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-KbMxgN18.js";import"./MultiSelect-C-DTaW6u.js";import"./RangeSlider-Ck23kCpB.js";import"./TimeRange-BQLekFm7.js";import"./select-BsZV6TxH.js";import"./Timestamp-B6AsSf9u.js";import"./TagList-CGntswbT.js";import"./Badge-BOuo3IQR.js";import"./HoverCard-zOCC4a_e.js";import"./Properties-CNxCP6uX.js";import"./IconButton-MSIQ6k2l.js";import"./DropdownMenu-Bq1HhKbq.js";import"./DropdownMenuSubmenu-B3adKdY1.js";import"./StatusDot-BWFmgJm9.js";import"./MessageActions-Cnpm2EB6.js";import"./Reasoning-CjswrW8a.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],pr={title:"Chat/Message",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:a(),onApprove:a()}},r={args:{message:d},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})},e={args:{message:x},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})};var m,i,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
