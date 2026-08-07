import{j as s}from"./iframe-DuxeFE6n.js";import{M as t}from"./Message-CB6JGmeB.js";import{S as l}from"./Chat.fixtures-CIS1TBJU.js";import"./preload-helper-DOqJbnTS.js";import"./utils-CR52uffu.js";import"./Icon-xkfjMf_e.js";import"./Markdown-DCam0GJ6.js";import"./CodeBlock-CozmWCQs.js";import"./CodeDiff-Bz4ANvib.js";import"./SegmentedControl-Cc5KEiB0.js";import"./code-highlight-Ccv-x-l0.js";import"./JsonView-DddqulwK.js";import"./ToolCall-CXrKIxd2.js";import"./button-DFfwSoCK.js";import"./index-0zBpNI7D.js";import"./loading-DDRbwKIs.js";import"./types-B1SOX9si.js";import"./KeyValueList-Bdoj9wlV.js";import"./DataTable-BkIvI7hy.js";import"./SortableHeader-BhsK1IKi.js";import"./Modal-sB55LhdE.js";import"./index-B9gwVplk.js";import"./index-D3frbI1a.js";import"./modalStack-CIISi3gp.js";import"./zIndex-BGbNBNA8.js";import"./FilterBar-CQ-m2fhr.js";import"./floating-ui.react-Ci4YBj6F.js";import"./FilterPill-CG8H2m7X.js";import"./Combobox-9g_A6MkL.js";import"./json-schema-form-size-DYVq0lph.js";import"./timestamp-format-CIXhO4AH.js";import"./DateTimePicker-DxXwFRzS.js";import"./MultiSelect-CkZbioWA.js";import"./RangeSlider-CFl0p9I5.js";import"./TimeRange-s1i7R8mc.js";import"./select-DTEylNDD.js";import"./Timestamp-NpNHq9Lp.js";import"./TagList-BsrG1RlY.js";import"./Badge-TRQq4Kin.js";import"./HoverCard-De6_pK-Q.js";import"./Properties-gm_XsF1U.js";import"./IconButton-_OyxH9XU.js";import"./DropdownMenu-C_LZD4ok.js";import"./DropdownMenuSubmenu-xv77J2eN.js";import"./StatusDot-CA2lF7iJ.js";import"./MessageActions-DvJVZwI8.js";import"./Reasoning-BMo4Ifu2.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,d=l[0],x=l[1],pr={title:"Chat/Message",component:t,tags:["autodocs"],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:a(),onApprove:a()}},r={args:{message:d},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})},e={args:{message:x},render:o=>s.jsx("div",{className:"max-w-2xl",children:s.jsx(t,{...o})})};var m,i,p;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
