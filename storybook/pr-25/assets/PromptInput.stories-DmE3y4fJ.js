import{j as e}from"./iframe-Cbvd77G_.js";import{P as a}from"./PromptInput-C8bb3Vhr.js";import"./preload-helper-BqxgWdQg.js";import"./utils-BLSKlp9E.js";import"./button-BynkVuMx.js";import"./index-1evVQkiP.js";import"./loading-DWhMudIi.js";import"./Icon-BFW8T_Wy.js";import"./Attachment-Bx_qlLqo.js";import"./UiFile-RK-_DizX.js";import"./UiClose-hgToXACD.js";import"./UiAdd-CfrVGt2D.js";import"./UiStop-BL8Mtg2p.js";import"./UiArrowUp-DJUhEO2m.js";const{fn:s}=__STORYBOOK_MODULE_TEST__,P={title:"Chat/PromptInput",component:a,tags:["autodocs"],parameters:{docs:{description:{component:"The chat composer: an auto-growing textarea with a submit/stop button driven by `status`, optional attachment button + chips (`enableAttachments`), and a footer `toolbar` slot for model/effort selectors. Calls `onSubmit(text, files)` on send."}}},argTypes:{status:{control:"inline-radio",options:["ready","submitted","streaming","error"]},enableAttachments:{control:"boolean"},placeholder:{control:"text"},toolbar:{control:!1}},args:{onSubmit:s(),onStop:s(),status:"ready",enableAttachments:!0,placeholder:"Ask anything…"}},t={render:o=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(a,{...o})})},r={args:{status:"streaming"},render:o=>e.jsx("div",{className:"max-w-2xl",children:e.jsx(a,{...o})})};var n,m,i;t.parameters={...t.parameters,docs:{...(n=t.parameters)==null?void 0:n.docs,source:{originalSource:`{
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
