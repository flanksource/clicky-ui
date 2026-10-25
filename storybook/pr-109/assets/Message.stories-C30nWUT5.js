import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,r}from"./Chat.fixtures-Dz7Ke9Ag.js";import{n as i,t as a}from"./Message-a7OUoJWc.js";var o,s,c,l,u,d,f,p;function m(){return(m=e((()=>{i(),r(),o=t(),{fn:s}=__STORYBOOK_MODULE_TEST__,c=n[0],l=n[1],u={title:`Chat/Message`,component:a,tags:[`autodocs`],parameters:{docs:{description:{component:"Renders one chat `UIMessage`. User messages are right-aligned bubbles; assistant messages render text as markdown plus inline reasoning/tool/file parts and a hover action row (copy / regenerate)."}}},argTypes:{message:{control:!1},onRegenerate:{control:!1},onApprove:{control:!1}},args:{onRegenerate:s(),onApprove:s()}},d={args:{message:c},render:e=>(0,o.jsx)(`div`,{className:`max-w-2xl`,children:(0,o.jsx)(a,{...e})})},f={args:{message:l},render:e=>(0,o.jsx)(`div`,{className:`max-w-2xl`,children:(0,o.jsx)(a,{...e})})},p=[`UserMessage`,`AssistantWithToolCall`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    message: USER
  },
  render: args => <div className="max-w-2xl">
      <Message {...args} />
    </div>
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    message: ASSISTANT
  },
  render: args => <div className="max-w-2xl">
      <Message {...args} />
    </div>
}`,...f.parameters?.docs?.source}}}})))()}m();export{f as AssistantWithToolCall,d as UserMessage,p as __namedExportsOrder,u as default};