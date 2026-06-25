import{j as e}from"./iframe-BO3XiECZ.js";import{P as a}from"./PromptInput-DGTsisk1.js";import"./preload-helper-B2wK-Kjy.js";import"./utils-BLSKlp9E.js";import"./button-D09c44qg.js";import"./index-1evVQkiP.js";import"./loading-DKpQqMGf.js";import"./Icon-GruNqjyl.js";import"./Attachment-CxQlENwM.js";import"./UiFile-cnMbWtzA.js";import"./UiClose-C-MNSUX4.js";import"./UiAdd-B6Pi1ncb.js";import"./UiStop-i0qH5iU5.js";import"./UiArrowUp-B4PHuTeq.js";const{fn:s}=__STORYBOOK_MODULE_TEST__,P={title:"Chat/PromptInput",component:a,tags:["autodocs"],parameters:{docs:{description:{component:"The chat composer: an auto-growing textarea with a submit/stop button driven by `status`, optional attachment button + chips (`enableAttachments`), and a footer `toolbar` slot for model/effort selectors. Calls `onSubmit(text, files)` on send."}}},argTypes:{status:{control:"inline-radio",options:["ready","submitted","streaming","error"]},enableAttachments:{control:"boolean"},placeholder:{control:"text"},toolbar:{control:!1}},args:{onSubmit:s(),onStop:s(),status:"ready",enableAttachments:!0,placeholder:"Ask anything…"}},t={render:o=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(a,{...o})})},r={args:{status:"streaming"},render:o=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(a,{...o})})};var n,m,i;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
