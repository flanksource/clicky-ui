import{j as s}from"./iframe-BW12FETW.js";import{M as t}from"./Message-BP9ci6Hn.js";import{S as l}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-B2LPdJL4.js";import"./utils-CR52uffu.js";import"./Icon-hksqPAe3.js";import"./Markdown-CqbfJMQ0.js";import"./CodeBlock-CADMdYrZ.js";import"./CodeDiff-CBLDd1IQ.js";import"./SegmentedControl-BbV1j_MF.js";import"./code-highlight-Dq2IweCb.js";import"./JsonView-BsWn6jlo.js";import"./ToolCall-1X0HSsFv.js";import"./button-C1MH17Zc.js";import"./index-0zBpNI7D.js";import"./loading-Dbw8cjcb.js";import"./types-B1SOX9si.js";import"./KeyValueList-DaUK5Xnn.js";import"./DataTable-BIyKT2jy.js";import"./SortableHeader-B-Dlosao.js";import"./Modal-wCkM4yzI.js";import"./index-D-nQD73E.js";import"./index-9NU1mlqD.js";import"./modalStack-M98G4Zz7.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-bG1WS0u1.js";import"./floating-ui.react-DmmqB0te.js";import"./FilterPill-Dv7xoXaX.js";import"./Combobox-ZYnGyNSg.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DajyfDhj.js";import"./MultiSelect-DKILBgj5.js";import"./RangeSlider-DXo4a9IS.js";import"./TimeRange-UGOJtU8h.js";import"./select-Dq3oow6c.js";import"./Timestamp-CMbIlKnE.js";import"./TagList-Grm9sVQM.js";import"./Badge-CvknhbZU.js";import"./HoverCard-1h0LYB4r.js";import"./Properties-Bq7G0PgT.js";import"./IconButton-DO-nC4dq.js";import"./DropdownMenu-CPl8kDYM.js";import"./DropdownMenuSubmenu-B6JHjlBN.js";import"./StatusDot-BWRIHMXy.js";import"./MessageActions-BfFHLjyX.js";import"./Reasoning-ClBMmxXx.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],pr={title:"Chat/Message",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:a(),onApprove:a()}},r={args:{message:d},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})},e={args:{message:x},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})};var m,i,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
