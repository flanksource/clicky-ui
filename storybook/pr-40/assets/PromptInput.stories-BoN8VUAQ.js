import{j as e}from"./iframe-BUI_RHnX.js";import{P as a}from"./PromptInput-BHqvDAlh.js";import"./preload-helper-DweeuSg3.js";import"./utils-CR52uffu.js";import"./button-COWLJ6pg.js";import"./index-0zBpNI7D.js";import"./loading-Do60Rp8m.js";import"./Icon-B3tLlLKZ.js";import"./Attachment-A8kkuudr.js";import"./UiFile-BLcOuruY.js";import"./UiClose-DUkoab9r.js";import"./UiAdd-B8Q38pu8.js";import"./UiStop-Dv9P1CR6.js";import"./UiArrowUp-C2F5LCPn.js";const{fn:s}=__STORYBOOK_MODULE_TEST__,P={title:"Chat/PromptInput",component:a,tags:["autodocs"],parameters:{docs:{description:{component:"The chat composer: an auto-growing textarea with a submit/stop button driven by `status`, optional attachment button + chips (`enableAttachments`), and a footer `toolbar` slot for model/effort selectors. Calls `onSubmit(text, files)` on send."}}},argTypes:{status:{control:"inline-radio",options:["ready","submitted","streaming","error"]},enableAttachments:{control:"boolean"},placeholder:{control:"text"},toolbar:{control:!1}},args:{onSubmit:s(),onStop:s(),status:"ready",enableAttachments:!0,placeholder:"Ask anything…"}},t={render:o=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(a,{...o})})},r={args:{status:"streaming"},render:o=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(a,{...o})})};var n,m,i;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`{
  render: args => <div className="max-w-2xl">
      <PromptInput {...args} />
    </div>
}`,...(i=(m=t.parameters)==null?void 0:m.docs)==null?void 0:i.source}}};var p,c,l;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    status: "streaming"
  },
  render: args => <div className="max-w-2xl">
      <PromptInput {...args} />
    </div>
}`,...(l=(c=r.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};const T=["Ready","Streaming"];export{t as Ready,r as Streaming,T as __namedExportsOrder,P as default};
