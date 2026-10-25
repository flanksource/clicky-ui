import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{t}from"./jsx-runtime-BG4KOiPz.js";import{n,t as r}from"./PromptInput-o9kGRZyy.js";var i,a,o,s,c,l;function u(){return(u=e((()=>{n(),i=t(),{fn:a}=__STORYBOOK_MODULE_TEST__,o={title:`Chat/PromptInput`,component:r,tags:[`autodocs`],parameters:{docs:{description:{component:"The chat composer: an auto-growing textarea with a submit/stop button driven by `status`, optional attachment button + chips (`enableAttachments`), and a footer `toolbar` slot for model/effort selectors. Calls `onSubmit(text, files)` on send."}}},argTypes:{status:{control:`inline-radio`,options:[`ready`,`submitted`,`streaming`,`error`]},enableAttachments:{control:`boolean`},placeholder:{control:`text`},toolbar:{control:!1}},args:{onSubmit:a(),onStop:a(),status:`ready`,enableAttachments:!0,placeholder:`Ask anything…`}},s={render:e=>(0,i.jsx)(`div`,{className:`max-w-2xl`,children:(0,i.jsx)(r,{...e})})},c={args:{status:`streaming`},render:e=>(0,i.jsx)(`div`,{className:`max-w-2xl`,children:(0,i.jsx)(r,{...e})})},l=[`Ready`,`Streaming`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <PromptInput {...args} />
    </div>
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    status: "streaming"
  },
  render: args => <div className="max-w-2xl">
      <PromptInput {...args} />
    </div>
}`,...c.parameters?.docs?.source}}}})))()}u();export{s as Ready,c as Streaming,l as __namedExportsOrder,o as default};