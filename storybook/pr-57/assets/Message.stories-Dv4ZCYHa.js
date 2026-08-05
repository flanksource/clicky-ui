import{j as s}from"./iframe-CE2JtCgn.js";import{M as t}from"./Message-Ux2Nyt4b.js";import{S as l}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-DOqJbnTS.js";import"./utils-CR52uffu.js";import"./Icon-DjK-Ul0P.js";import"./Markdown-DOEr-3Wi.js";import"./CodeBlock-CThbLAkF.js";import"./CodeDiff-Ln_4tNVx.js";import"./SegmentedControl-DjW1Xg5k.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-BCvz4_-8.js";import"./ToolCall-tpP6l3Gk.js";import"./button-BEhds32p.js";import"./index-0zBpNI7D.js";import"./loading-DaW8GI3d.js";import"./types-B1SOX9si.js";import"./KeyValueList-DeNsMDMZ.js";import"./DataTable-DQ4PMj40.js";import"./SortableHeader-C8pZ0Vo6.js";import"./Modal-CJiOxX6Q.js";import"./index-CnTEniBU.js";import"./index-srCuUkvt.js";import"./modalStack-BL3nM1Er.js";import"./zIndex-CigQ76av.js";import"./FilterBar-CAooZ0SJ.js";import"./floating-ui.react-ELsBZOw-.js";import"./FilterPill-DiI-02-u.js";import"./Combobox-CaLzLYqA.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-BHjZd-OU.js";import"./MultiSelect-CVJ_Jxdl.js";import"./RangeSlider-B7gA4X4U.js";import"./TimeRange-Clbh5IDG.js";import"./select-BZVoamS3.js";import"./Timestamp-BPFyRG9V.js";import"./TagList-B3vTTNhF.js";import"./Badge-B8O05GgR.js";import"./HoverCard-CbfDAnuQ.js";import"./Properties-DMRl3bQ3.js";import"./IconButton-Ah1g94v2.js";import"./DropdownMenu--w6T23IX.js";import"./DropdownMenuSubmenu-BK-eDIsx.js";import"./StatusDot-z-KLAj4n.js";import"./MessageActions-CW-5Z-_Q.js";import"./Reasoning-B8ERxxss.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],pr={title:"Chat/Message",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:a(),onApprove:a()}},r={args:{message:d},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})},e={args:{message:x},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})};var m,i,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
