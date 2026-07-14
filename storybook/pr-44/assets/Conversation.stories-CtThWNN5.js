import{j as e}from"./iframe-BK7fwFVO.js";import{C as o}from"./Conversation-B6y-0kw1.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-CLp6iKya.js";import"./utils-CR52uffu.js";import"./Icon-Cpi1U54P.js";import"./Message-BN4zuS4v.js";import"./Markdown-DN8P1a80.js";import"./CodeBlock-uBm2JK41.js";import"./CodeDiff-CVe5jhFr.js";import"./SegmentedControl-B4nMRczM.js";import"./code-highlight-DmoBPuv7.js";import"./JsonView-D2jKV3Rg.js";import"./ToolCall-D9KV13WC.js";import"./button-DS4U28PS.js";import"./index-0zBpNI7D.js";import"./loading-BztHiUUa.js";import"./types-B1SOX9si.js";import"./MessageActions-DX4sY8xS.js";import"./Reasoning-DtTiTf-Y.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,k={title:"Chat/Conversation",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"A scrollable message log that auto-sticks to the bottom as content streams in — unless the user has scrolled up, when a jump-to-bottom button appears. Renders each `UIMessage` via `Message`."}}},argTypes:{messages:{control:!1},emptyState:{control:!1}},args:{messages:l,onRegenerate:a(),onApprove:a()}},r={render:s=>e.jsx("div",{className:"h-[420px] max-w-2xl rounded-md border border-border",children:e.jsx(o,{...s})})},t={args:{messages:[],emptyState:e.jsx("p",{className:"text-sm text-muted-foreground",children:"Ask anything to get started."})},render:s=>e.jsx("div",{className:"h-[280px] max-w-2xl rounded-md border border-border",children:e.jsx(o,{...s})})};var m,n,d;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
