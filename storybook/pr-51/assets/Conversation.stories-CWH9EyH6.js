import{j as e}from"./iframe-BQHWjYXO.js";import{C as o}from"./Conversation-DVL7AozR.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-NECxGHhd.js";import"./utils-CR52uffu.js";import"./Icon-DqVmIZAK.js";import"./Message-JXXrCdGe.js";import"./Markdown-DPg3HBu6.js";import"./CodeBlock-DPyDzznt.js";import"./CodeDiff-CVr8sbI2.js";import"./SegmentedControl-DKiFPaCK.js";import"./code-highlight-Btxs0MAv.js";import"./JsonView-BsfgZLD9.js";import"./ToolCall-v6HCfMNC.js";import"./button-CAHLihQQ.js";import"./index-0zBpNI7D.js";import"./loading-CVssmfQF.js";import"./types-B1SOX9si.js";import"./MessageActions-C5izP_rL.js";import"./Reasoning-DYT9Tcl7.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,k={title:"Chat/Conversation",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"A scrollable message log that auto-sticks to the bottom as content streams in — unless the user has scrolled up, when a jump-to-bottom button appears. Renders each `UIMessage` via `Message`."}}},argTypes:{messages:{control:!1},emptyState:{control:!1}},args:{messages:l,onRegenerate:a(),onApprove:a()}},r={render:s=>e.jsx("div",{className:"h-[420px] max-w-2xl rounded-md border border-border",children:e.jsx(o,{...s})})},t={args:{messages:[],emptyState:e.jsx("p",{className:"text-sm text-muted-foreground",children:"Ask anything to get started."})},render:s=>e.jsx("div",{className:"h-[280px] max-w-2xl rounded-md border border-border",children:e.jsx(o,{...s})})};var m,n,d;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: args => <div className="h-[420px] max-w-2xl rounded-md border border-border">
      <Conversation {...args} />
    </div>
}`,...(d=(n=r.parameters)==null?void 0:n.docs)==null?void 0:d.source}}};var p,i,c;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    messages: [],
    emptyState: <p className="text-sm text-muted-foreground">Ask anything to get started.</p>
  },
  render: args => <div className="h-[280px] max-w-2xl rounded-md border border-border">
      <Conversation {...args} />
    </div>
}`,...(c=(i=t.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};const D=["Default","Empty"];export{r as Default,t as Empty,D as __namedExportsOrder,k as default};
