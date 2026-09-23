import{j as e}from"./iframe-Dm9WDfFk.js";import{P as o}from"./PromptInput-DX_Ilmo0.js";import"./preload-helper-C0z-shBz.js";import"./utils-DW-IJACk.js";import"./button-CENLUU5j.js";import"./index-CPURVhFy.js";import"./loading-CJ6V0nN9.js";import"./Icon-C0Xeje0M.js";import"./Attachment-B67KskgH.js";const{fn:s}=__STORYBOOK_MODULE_TEST__,v={title:"Chat/PromptInput",component:o,tags:["autodocs"],parameters:{docs:{description:{component:"The chat composer: an auto-growing textarea with a submit/stop button driven by `status`, optional attachment button + chips (`enableAttachments`), and a footer `toolbar` slot for model/effort selectors. Calls `onSubmit(text, files)` on send."}}},argTypes:{status:{control:"inline-radio",options:["ready","submitted","streaming","error"]},enableAttachments:{control:"boolean"},placeholder:{control:"text"},toolbar:{control:!1}},args:{onSubmit:s(),onStop:s(),status:"ready",enableAttachments:!0,placeholder:"Ask anything…"}},t={render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(o,{...a})})},r={args:{status:"streaming"},render:a=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(o,{...a})})};var n,m,i;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <PromptInput {...args} />
    </div>
}`,...(i=(m=t.parameters)==null?void 0:m.docs)==null?void 0:i.source}}};var c,p,l;r.parameters={...r.parameters,docs:{...(c=r.parameters)==null?void 0:c.docs,source:{originalSource:`{
  args: {
    status: "streaming"
  },
  render: args => <div className="max-w-2xl">
      <PromptInput {...args} />
    </div>
}`,...(l=(p=r.parameters)==null?void 0:p.docs)==null?void 0:l.source}}};const y=["Ready","Streaming"];export{t as Ready,r as Streaming,y as __namedExportsOrder,v as default};
