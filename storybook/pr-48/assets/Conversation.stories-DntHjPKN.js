import{j as e}from"./iframe-DZjrDtfA.js";import{C as o}from"./Conversation-BPU30Yjt.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-Oo3FbLQe.js";import"./utils-CR52uffu.js";import"./Icon-Bsqx4eJf.js";import"./Message-C2eA4qps.js";import"./Markdown-CPF50UKv.js";import"./CodeBlock-DhO3O6GM.js";import"./CodeDiff-KiY1tsQP.js";import"./SegmentedControl-BPu017dM.js";import"./code-highlight-_bSslaKA.js";import"./JsonView-2jImuBaZ.js";import"./ToolCall-BlmHxrlk.js";import"./button-DQWpMsGM.js";import"./index-0zBpNI7D.js";import"./loading-a5_GCoqM.js";import"./types-B1SOX9si.js";import"./MessageActions-Cwnr-qXV.js";import"./Reasoning-DxqyjsgV.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,k={title:"Chat/Conversation",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"A scrollable message log that auto-sticks to the bottom as content streams in — unless the user has scrolled up, when a jump-to-bottom button appears. Renders each `UIMessage` via `Message`."}}},argTypes:{messages:{control:!1},emptyState:{control:!1}},args:{messages:l,onRegenerate:a(),onApprove:a()}},r={render:s=>e.jsx("div",{className:"h-[420px] max-w-2xl rounded-md border border-border",children:e.jsx(o,{...s})})},t={args:{messages:[],emptyState:e.jsx("p",{className:"text-sm text-muted-foreground",children:"Ask anything to get started."})},render:s=>e.jsx("div",{className:"h-[280px] max-w-2xl rounded-md border border-border",children:e.jsx(o,{...s})})};var m,n,d;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
