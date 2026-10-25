import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,r}from"./Chat.fixtures-Dz7Ke9Ag.js";import{n as i,t as a}from"./Conversation--qe3ebbO.js";var o,s,c,l,u,d;function f(){return(f=e((()=>{i(),r(),o=t(),{fn:s}=__STORYBOOK_MODULE_TEST__,c={title:`Chat/Conversation`,component:a,tags:[`autodocs`],parameters:{docs:{description:{component:"A scrollable message log that auto-sticks to the bottom as content streams in — unless the user has scrolled up, when a jump-to-bottom button appears. Renders each `UIMessage` via `Message`."}}},argTypes:{messages:{control:!1},emptyState:{control:!1}},args:{messages:n,onRegenerate:s(),onApprove:s()}},l={render:e=>(0,o.jsx)(`div`,{className:`h-[420px] max-w-2xl rounded-md border border-border`,children:(0,o.jsx)(a,{...e})})},u={args:{messages:[],emptyState:(0,o.jsx)(`p`,{className:`text-sm text-muted-foreground`,children:`Ask anything to get started.`})},render:e=>(0,o.jsx)(`div`,{className:`h-[280px] max-w-2xl rounded-md border border-border`,children:(0,o.jsx)(a,{...e})})},d=[`Default`,`Empty`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: args => <div className="h-[420px] max-w-2xl rounded-md border border-border">
      <Conversation {...args} />
    </div>
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    messages: [],
    emptyState: <p className="text-sm text-muted-foreground">Ask anything to get started.</p>
  },
  render: args => <div className="h-[280px] max-w-2xl rounded-md border border-border">
      <Conversation {...args} />
    </div>
}`,...u.parameters?.docs?.source}}}})))()}f();export{l as Default,u as Empty,d as __namedExportsOrder,c as default};