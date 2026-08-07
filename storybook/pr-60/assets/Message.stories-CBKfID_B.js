import{j as s}from"./iframe-BMFBCv_6.js";import{M as t}from"./Message-DCEkmCXa.js";import{S as l}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-XHXHPdWU.js";import"./utils-CR52uffu.js";import"./Icon-rDmXslRI.js";import"./Markdown-CXDU8LwK.js";import"./CodeBlock-k5ldqZbG.js";import"./CodeDiff-Dks0ufUS.js";import"./SegmentedControl-CH9wcuGB.js";import"./code-highlight-C03wEi4q.js";import"./JsonView-BOKPq2ZA.js";import"./ToolCall-Dzvy4eqv.js";import"./button-DdAX4yWv.js";import"./index-0zBpNI7D.js";import"./loading-6hDWTPbr.js";import"./types-B1SOX9si.js";import"./KeyValueList-BK6OR3BZ.js";import"./DataTable-ytwYjHZi.js";import"./SortableHeader-WRdhtjCt.js";import"./Modal-C2tSaU6I.js";import"./index-Dbcmk1Ba.js";import"./index-C0LRYh99.js";import"./modalStack-vzTQsCJ3.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-BMIgwjCe.js";import"./floating-ui.react-iWwRdKWF.js";import"./FilterPill-Duw4fxQQ.js";import"./Combobox-D4JxQ_Ex.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-D9V9-0ug.js";import"./MultiSelect-g9tyQV7f.js";import"./RangeSlider-CfBgCZn9.js";import"./TimeRange-BLD6rnMy.js";import"./select-8Uwg0MuP.js";import"./Timestamp-DbQKcMwO.js";import"./TagList-WBMmhCQ4.js";import"./Badge--gSTK7-C.js";import"./HoverCard-CfIJkTvI.js";import"./Properties-CF2rtjsQ.js";import"./IconButton-c1QHMig1.js";import"./DropdownMenu-TalBA55R.js";import"./DropdownMenuSubmenu-YgknNbsv.js";import"./StatusDot-CsrJx1SH.js";import"./MessageActions-DkWjPmvU.js";import"./Reasoning-WkBz0xzn.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],pr={title:"Chat/Message",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:a(),onApprove:a()}},r={args:{message:d},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})},e={args:{message:x},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})};var m,i,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
