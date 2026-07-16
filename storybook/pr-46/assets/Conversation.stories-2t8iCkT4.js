import{j as e}from"./iframe-Brz7uG0w.js";import{C as o}from"./Conversation-CMs22uhU.js";import{S as l}from"./Chat.fixtures-BmVP6U6L.js";import"./preload-helper-CWjhL4mC.js";import"./utils-CR52uffu.js";import"./Icon-TBHX6vaP.js";import"./Message-CpkdJV0N.js";import"./Markdown-CsZL-v-y.js";import"./CodeBlock-CFfHgiK1.js";import"./CodeDiff-BvVewkuk.js";import"./SegmentedControl-CT7U2uw-.js";import"./code-highlight-BFJi_bUq.js";import"./JsonView-CHUUuX2x.js";import"./ToolCall-Bq5olyFf.js";import"./button-D7cFQgQy.js";import"./index-0zBpNI7D.js";import"./loading-BMlqM7sR.js";import"./types-B1SOX9si.js";import"./MessageActions-wyacR-9v.js";import"./Reasoning-CQTmA40u.js";const{fn:a}=__STORYBOOK_MODULE_TEST__,k={title:"Chat/Conversation",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"A scrollable message log that auto-sticks to the bottom as content streams in — unless the user has scrolled up, when a jump-to-bottom button appears. Renders each `UIMessage` via `Message`."}}},argTypes:{messages:{control:!1},emptyState:{control:!1}},args:{messages:l,onRegenerate:a(),onApprove:a()}},r={render:s=>e.jsx("div",{className:"h-[420px] max-w-2xl rounded-md border border-border",children:e.jsx(o,{...s})})},t={args:{messages:[],emptyState:e.jsx("p",{className:"text-sm text-muted-foreground",children:"Ask anything to get started."})},render:s=>e.jsx("div",{className:"h-[280px] max-w-2xl rounded-md border border-border",children:e.jsx(o,{...s})})};var m,n,d;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
